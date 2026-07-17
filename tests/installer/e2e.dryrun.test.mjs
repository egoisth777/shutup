import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const installer = path.resolve('bin/install.js');

test('codex dry-run writes nothing', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'shutup-dry-'));
  const result = spawnSync(process.execPath, [installer, 'codex', '--dry-run', '--yes'], {
    encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /would update/);
  assert.equal(fs.existsSync(path.join(home, '.codex')), false);
});

test('--all skips unverified targets; --strict fails', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'shutup-all-'));
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  const normal = spawnSync(process.execPath, [installer, '--all', '--dry-run'], { encoding: 'utf8', env });
  const strict = spawnSync(process.execPath, [installer, '--all', '--dry-run', '--strict'], { encoding: 'utf8', env });
  assert.equal(normal.status, 0);
  assert.equal(strict.status, 1);
  assert.match(normal.stdout, /agy: skipped/);
});
