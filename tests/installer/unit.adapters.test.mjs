import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ADAPTERS, resolveAdapter } = require('../../bin/lib/adapters.js');

test('adapter matrix contains exactly approved targets', () => {
  assert.deepEqual(Object.keys(ADAPTERS), ['claude', 'codex', 'agy', 'pi', 'oh-my-pi']);
});

test('unverified adapters skip instead of guessing paths', () => {
  for (const id of ['agy', 'pi', 'oh-my-pi']) {
    assert.equal(resolveAdapter(id).available, false);
    assert.match(resolveAdapter(id).reason, /not verified/);
  }
});
