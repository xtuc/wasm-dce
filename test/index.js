const {parsers, printers} = require("webassembly-interpreter/lib/tools");
const loader = require("../index");
const chai = require("chai");
const glob = require("glob");
const {readFileSync, writeFileSync} = require("fs");
const path = require("path");

describe("Eliminate unused", () => {
  const testSuites = glob.sync(
    "test/fixtures/**/actual.wast"
  );

  testSuites.forEach(suite => {
    it(suite, () => {
      const wastModule = readFileSync(suite, "utf8");

      // TODO(sven): configure this via staticly analysing a fake user code
      const usedExports = [];

      const actualBuff = loader(wastModule, usedExports);
      const actualWast = printers.printWAST(parsers.parseWASM(actualBuff));

      const expectedFile = path.join(path.dirname(suite), "expected.wast");

      let expected;
      try {
        expected = readFileSync(expectedFile, "utf8");
      } catch (e) {
        expected = actualWast;

        writeFileSync(expectedFile, actualWast);

        console.log("Write expected file", expectedFile);
      }

      chai.expect(actualWast).to.be.equal(expected);
    });
  });

});
