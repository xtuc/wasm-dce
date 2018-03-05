#!/usr/bin/env node

const path = require('path');
const {readFileSync, writeFileSync} = require('fs');
const glob = require("glob");
const dirname = process.argv[2];

const wasmdce = require('./index');
const getUsedExports = require('./used-exports');

const jsFiles = glob.sync(
  path.join(dirname, "./**/*.js")
);

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}


jsFiles.forEach((file) => {
  const content = readFileSync(file, "utf8");
  const usedExports = getUsedExports(content);

  const wasmFiles = Object.keys(usedExports);

  console.log('checking file', file);

  wasmFiles.forEach((wasmFilename) => {

    // Read the binary
    const fqfilename = path.join(dirname, wasmFilename);
    const buff = toArrayBuffer(readFileSync(fqfilename, null));

    // Run DCE on it
    const newBuff = wasmdce(buff, usedExports[wasmFilename]);

    // Emit new binary
    writeFileSync(fqfilename + '.new', new Buffer(newBuff));
  });
});
