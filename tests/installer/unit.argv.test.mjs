import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { parseArgs } = require('../../bin/install.js');

test('new flags parse', () => {
  const args = parseArgs(['codex', '--yes', '--dry-run', '--uninstall', '--strict']);
  assert.deepEqual(args.targets, ['codex']);
  assert.equal(args.yes, true);
  assert.equal(args.dryRun, true);
  assert.equal(args.uninstall, true);
  assert.equal(args.strict, true);
});

test('unknown flags and targets fail', () => {
  assert.throws(() => parseArgs(['--bogus']), /unknown flag/);
  assert.throws(() => parseArgs(['opencode']), /unknown target/);
});
