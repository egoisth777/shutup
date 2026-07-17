#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ADAPTERS, detectTargets, resolveAdapter } = require('./lib/adapters');
const fenced = require('./lib/fenced-block');

const ROOT = path.resolve(__dirname, '..');
const FALLBACK_RULES = 'Answer first. Cut filler. Keep normal grammar. Skip preamble, narration, and closing recap.';

function usage() {
  return `USAGE
  shutup [claude|codex|agy|pi|oh-my-pi ...] [options]

OPTIONS
  --all        Select every target
  --list       List targets and path verification state
  --dry-run    Print changes without writing
  --uninstall  Remove shutup rules and prompts
  --yes        Accept detected targets without prompting
  --strict     Treat skipped targets as failures
  --version    Print version
  --help       Print help
`;
}

function parseArgs(argv) {
  const options = { targets: [], all: false, list: false, dryRun: false, uninstall: false, yes: false, strict: false };
  const flags = new Map([
    ['--all', 'all'], ['--list', 'list'], ['--dry-run', 'dryRun'], ['--uninstall', 'uninstall'],
    ['--yes', 'yes'], ['--strict', 'strict'], ['--version', 'version'], ['--help', 'help'],
  ]);
  for (const arg of argv) {
    if (arg === '--') continue;
    if (arg.startsWith('-')) {
      const key = flags.get(arg);
      if (!key) throw new Error(`unknown flag: ${arg}`);
      options[key] = true;
    } else {
      if (!ADAPTERS[arg]) throw new Error(`unknown target: ${arg}`);
      if (!options.targets.includes(arg)) options.targets.push(arg);
    }
  }
  if (options.all && options.targets.length) throw new Error('--all cannot be combined with explicit targets');
  return options;
}

function rules() {
  try {
    const hook = require(path.join(ROOT, 'plugin', 'hooks', 'shutup-activate.js'));
    return `${hook.FULL_RULES}\n\nUltra mode: set SHUTUP_ULTRA=1.\n${hook.ULTRA_RULES || ''}`.trim();
  } catch (_) {
    return `${FALLBACK_RULES}\n\nUltra mode: set SHUTUP_ULTRA=1.`;
  }
}

function stripFrontmatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function promptSources() {
  const dir = path.join(ROOT, 'plugin', 'commands');
  try { return fs.readdirSync(dir).filter(n => /^shutup.*\.md$/.test(n)).map(n => path.join(dir, n)); }
  catch (_) { return []; }
}

function installPrompts(adapter, options, output) {
  if (!adapter.promptsPath) return;
  const destination = adapter.promptsPath();
  for (const source of promptSources()) {
    const target = path.join(destination, path.basename(source));
    output.push(`${options.dryRun ? 'would write' : 'wrote'} ${target}`);
    if (!options.dryRun) {
      fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
      fenced.atomicWrite(target, stripFrontmatter(fs.readFileSync(source, 'utf8')));
    }
  }
}

function removePrompts(adapter, options, output) {
  if (!adapter.promptsPath) return;
  const destination = adapter.promptsPath();
  let names = [];
  try { names = fs.readdirSync(destination).filter(n => /^shutup.*\.md$/.test(n)); } catch (_) {}
  for (const name of names) {
    const target = path.join(destination, name);
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) throw new Error(`refusing symlink target: ${target}`);
    output.push(`${options.dryRun ? 'would remove' : 'removed'} ${target}`);
    if (!options.dryRun) fs.unlinkSync(target);
  }
}

function runTarget(id, options) {
  const adapter = resolveAdapter(id);
  const output = [];
  if (!adapter.available) return { id, status: 'skipped', message: adapter.reason, output };
  if (id === 'claude') {
    if (options.uninstall) output.push('Uninstall with: claude plugin uninstall shutup@shutup');
    else {
      output.push('Install with: claude plugin marketplace add <repository>');
      output.push('Then: claude plugin install shutup@shutup');
    }
    return { id, status: 'ok', message: 'marketplace instructions shown; no files written', output };
  }
  try {
    const target = adapter.rulesPath();
    const action = options.uninstall ? fenced.remove(target, options) : fenced.upsert(target, rules(), options);
    output.push(`${options.dryRun ? 'would update' : action.changed ? 'updated' : 'unchanged'} ${target}`);
    if (options.uninstall) removePrompts(adapter, options, output);
    else installPrompts(adapter, options, output);
    return { id, status: 'ok', message: options.uninstall ? 'uninstalled' : 'installed', output };
  } catch (error) {
    return { id, status: 'failed', message: error.message, output };
  }
}

function list() {
  for (const id of Object.keys(ADAPTERS)) {
    const adapter = resolveAdapter(id);
    const state = adapter.available ? adapter.kind : `unverified: ${adapter.reason}`;
    process.stdout.write(`${id.padEnd(10)} ${state}\n`);
  }
}

function main(argv = process.argv.slice(2)) {
  let options;
  try { options = parseArgs(argv); }
  catch (error) { process.stderr.write(`shutup: ${error.message}\n`); return 2; }
  if (options.help) { process.stdout.write(usage()); return 0; }
  if (options.version) {
    let version = '1.0.0';
    try { version = require(path.join(ROOT, 'package.json')).version; } catch (_) {}
    process.stdout.write(`${version}\n`); return 0;
  }
  if (options.list) { list(); return 0; }
  let ids = options.all ? Object.keys(ADAPTERS) : options.targets;
  if (!ids.length) ids = detectTargets().map(a => a.id);
  if (!ids.length) { process.stdout.write('No supported targets detected. Use --list or name a target.\n'); return 0; }
  const results = ids.map(id => runTarget(id, options));
  for (const result of results) for (const line of result.output) process.stdout.write(`[${result.id}] ${line}\n`);
  process.stdout.write('\nSummary\n');
  for (const result of results) process.stdout.write(`${result.id}: ${result.status} (${result.message})\n`);
  const failed = results.some(r => r.status === 'failed');
  const skipped = results.some(r => r.status === 'skipped');
  return failed || (options.strict && skipped) ? 1 : 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { parseArgs, main, runTarget, stripFrontmatter };
