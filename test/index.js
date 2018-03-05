const {parsers, printers} = require("webassembly-interpreter/lib/tools");
const chai = require("chai");
const glob = require("glob");
const {readFileSync, writeFileSync} = require("fs");
const path = require("path");

const loader = require("../src/index");
const getUsedExports = require("../src/used-exports");

describe("Eliminate unused", () => {
  const testSuites = glob.sync(
    "test/fixtures/**/actual.wast"
  );

  testSuites.forEach(suite => {
    it(suite, () => {
      const wastModule = readFileSync(suite, "utf8");

      const userFile = path.join(path.dirname(suite), "user.js");
      const expectedFile = path.join(path.dirname(suite), "expected.wast");

      const usedExportsByModuleName = getUsedExports(readFileSync(userFile, "utf8"));

      // Just take the first module we found (since it's just the tests)
      const usedExportsByModuleNameKeys = Object.keys(usedExportsByModuleName);
      const usedExports = usedExportsByModuleName[usedExportsByModuleNameKeys[0]] || [];

      const actualBuff = loader(wastModule, usedExports);
      const actualWast = printers.printWAST(parsers.parseWASM(actualBuff));

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
