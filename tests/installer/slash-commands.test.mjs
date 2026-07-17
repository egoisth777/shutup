import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { stripFrontmatter } = require('../../bin/install.js');

test('frontmatter is stripped from copied commands', () => {
  assert.equal(stripFrontmatter('---\nargument-hint: x\n---\nBody\n'), 'Body\n');
  assert.equal(stripFrontmatter('Body\n'), 'Body\n');
});
