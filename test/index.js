const {parsers, printers} = require("webassembly-interpreter/lib/tools");
const watfparsing = require("webassembly-interpreter/lib/compiler/parsing/watf/grammar");
const chai = require("chai");
const glob = require("glob");
const {readFileSync, writeFileSync} = require("fs");
const path = require("path");

const loader = require("../src/index");
const getUsedExports = require("../src/usedExports");

describe("Eliminate unused", () => {
  const testSuites = glob.sync(
    "test/fixtures/**/actual.wast"
  );

  /**
   * The watf parsing is stateful, we can reset its state manually for now
   */
  afterEach(() => watfparsing.resetUniqueNameGenerator());

  testSuites.forEach(suite => {
    it(suite, () => {
      const wastModule = readFileSync(suite, "utf8");

      const userFile = path.join(path.dirname(suite), "user.js");
      const expectedFile = path.join(path.dirname(suite), "expected.wast");

      const usedExports = getUsedExports(readFileSync(userFile, "utf8"));

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
