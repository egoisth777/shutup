'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

require('./test_safe_write.js');

const installerDir = path.join(__dirname, 'installer');
Promise.all(
  fs.readdirSync(installerDir)
    .filter(name => name.endsWith('.test.mjs'))
    .map(name => import(pathToFileURL(path.join(installerDir, name)).href))
).catch(error => {
  process.nextTick(() => { throw error; });
});
