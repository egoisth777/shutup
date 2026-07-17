'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const fenced = require('../bin/lib/fenced-block');

test('fenced write refuses a symlink target', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shutup-safe-'));
  const victim = path.join(dir, 'victim');
  const target = path.join(dir, 'AGENTS.md');
  fs.mkdirSync(victim);
  fs.symlinkSync(victim, target, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => fenced.upsert(target, 'rules'), /refusing symlink/);
  assert.deepEqual(fs.readdirSync(victim), []);
});

test('fenced write is atomic and mode 0600', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shutup-safe-'));
  const target = path.join(dir, 'nested', 'AGENTS.md');
  fenced.upsert(target, 'Answer first. Cut filler.');
  assert.match(fs.readFileSync(target, 'utf8'), /shutup-begin/);
  assert.deepEqual(fs.readdirSync(path.dirname(target)), ['AGENTS.md']);
  if (process.platform !== 'win32') assert.equal(fs.statSync(target).mode & 0o777, 0o600);
});
