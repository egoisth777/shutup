'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BEGIN = '<!-- shutup-begin -->';
const END = '<!-- shutup-end -->';

function newlineOf(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function block(content, newline) {
  const body = String(content).replace(/\r?\n/g, newline).replace(/(?:\r?\n)+$/, '');
  return `${BEGIN}${newline}${body}${newline}${END}`;
}

function replaceText(original, content) {
  const newline = newlineOf(original);
  const nextBlock = block(content, newline);
  const start = original.indexOf(BEGIN);
  const finish = start < 0 ? -1 : original.indexOf(END, start + BEGIN.length);
  if (start >= 0 && finish >= 0) {
    return original.slice(0, start) + nextBlock + original.slice(finish + END.length);
  }
  const prefix = original.length ? newline : '';
  return original + prefix + nextBlock + newline;
}

function removeText(original) {
  let text = original;
  let changed = false;
  for (;;) {
    const start = text.indexOf(BEGIN);
    if (start < 0) break;
    const finish = text.indexOf(END, start + BEGIN.length);
    if (finish < 0) break;
    let cutStart = start;
    if (cutStart >= 2 && text.slice(cutStart - 2, cutStart) === '\r\n') cutStart -= 2;
    else if (cutStart >= 1 && text[cutStart - 1] === '\n') cutStart -= 1;
    let end = finish + END.length;
    if (text.slice(end, end + 2) === '\r\n') end += 2;
    else if (text[end] === '\n') end += 1;
    text = text.slice(0, cutStart) + text.slice(end);
    changed = true;
  }
  return text;
}

function refuseSymlink(target) {
  try {
    if (fs.lstatSync(target).isSymbolicLink()) throw new Error(`refusing symlink target: ${target}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function atomicWrite(target, contents) {
  const dir = path.dirname(target);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  refuseSymlink(target);
  const tmp = path.join(dir, `.${path.basename(target)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`);
  let fd;
  try {
    const noFollow = typeof fs.constants.O_NOFOLLOW === 'number' ? fs.constants.O_NOFOLLOW : 0;
    fd = fs.openSync(tmp, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | noFollow, 0o600);
    fs.writeFileSync(fd, contents, 'utf8');
    try { fs.fchmodSync(fd, 0o600); } catch (_) { /* Windows */ }
    fs.closeSync(fd);
    fd = undefined;
    refuseSymlink(target);
    fs.renameSync(tmp, target);
    try { fs.chmodSync(target, 0o600); } catch (_) { /* Windows */ }
  } catch (error) {
    if (fd !== undefined) fs.closeSync(fd);
    try { fs.unlinkSync(tmp); } catch (_) {}
    throw error;
  }
}

function readFile(target) {
  refuseSymlink(target);
  try { return fs.readFileSync(target, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return ''; throw error; }
}

function upsert(target, content, options = {}) {
  const original = readFile(target);
  const next = replaceText(original, content);
  const changed = next !== original;
  if (changed && !options.dryRun) atomicWrite(target, next);
  return { changed, text: next };
}

function remove(target, options = {}) {
  const original = readFile(target);
  const next = removeText(original);
  const changed = next !== original;
  if (changed && !options.dryRun) atomicWrite(target, next);
  return { changed, text: next };
}

module.exports = { BEGIN, END, atomicWrite, upsert, remove, replaceText, removeText };
