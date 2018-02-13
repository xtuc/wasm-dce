const {traverse, parsers, printers} = require("webassembly-interpreter/lib/tools");

const libwabt = require('./libwabt');
const removeFunc = require('./removal');
const countRefByName = require('./reference-couting');

module.exports = function (buff, usedExports) {

  function isUnused(moduleExport) {
    return usedExports.indexOf(moduleExport.name) === -1;
  }

  function canRemove(moduleExport) {
    const funcName = moduleExport.descr.id.value;

    // Check if it's not referenced elsewhere.
    const refCount = countRefByName(ast, funcName);

    if (refCount > 1) {
      return false;
    } else {
      return true;
    }
  }

  function getModuleExports(ast) {
    const moduleExports = [];

    traverse(ast, {

      ModuleExport({node}) {
        moduleExports.push(node);
      },

    });

    return moduleExports;
  }

  let ast;

  if (typeof buff === "string") {
    ast = parsers.parseWATF(buff);
  } else {
    ast = parsers.parseWASM(buff);
  }

  // Before
  // console.log(printers.printWAST(ast));

  getModuleExports(ast)
    .filter(isUnused)
    .filter(canRemove)
    .forEach(e => removeFunc(e, ast));

  const wast = printers.printWAST(ast);

  // To wasm
  const m = libwabt.parseWat('out.wast', wast);
  m.resolveNames();
  m.validate();

  const {buffer} = m.toBinary({log: true, write_debug_names:true});

  // After
  // console.log(printers.printWAST(parsers.parseWASM(buffer)));

  return buffer;
};
