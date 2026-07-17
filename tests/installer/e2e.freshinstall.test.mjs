import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const installer = path.resolve('bin/install.js');

test('codex install/uninstall round-trip preserves user file byte-for-byte', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'shutup-fresh-'));
  const config = path.join(home, '.codex');
  const agents = path.join(config, 'AGENTS.md');
  fs.mkdirSync(config);
  const before = '# Mine\r\n\r\nKeep this.\r\n';
  fs.writeFileSync(agents, before);
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  const install = spawnSync(process.execPath, [installer, 'codex', '--yes'], { encoding: 'utf8', env });
  assert.equal(install.status, 0, install.stderr);
  assert.match(fs.readFileSync(agents, 'utf8'), /<!-- shutup-begin -->/);
  const uninstall = spawnSync(process.execPath, [installer, 'codex', '--uninstall', '--yes'], { encoding: 'utf8', env });
  assert.equal(uninstall.status, 0, uninstall.stderr);
  assert.equal(fs.readFileSync(agents, 'utf8'), before);
});
