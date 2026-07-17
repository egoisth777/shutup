import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const fenced = require('../../bin/lib/fenced-block.js');

for (const newline of ['\n', '\r\n']) {
  test(`upsert/remove is idempotent and preserves ${JSON.stringify(newline)}`, () => {
    const before = `# User rules${newline}${newline}Keep this.${newline}`;
    const first = fenced.replaceText(before, 'Answer first.\nCut filler.');
    assert.equal(fenced.replaceText(first, 'Answer first.\nCut filler.'), first);
    assert.ok(first.includes(`${fenced.BEGIN}${newline}`));
    assert.equal(fenced.removeText(first), before);
  });
}

test('upsert creates missing parent directories', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shutup-fence-'));
  const target = path.join(dir, 'a', 'b', 'AGENTS.md');
  fenced.upsert(target, 'rules');
  assert.ok(fs.existsSync(target));
});
