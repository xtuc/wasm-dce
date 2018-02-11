const {traverse, parsers, printers} = require("webassembly-interpreter/lib/tools");
const libwabt = require('./libwabt');

function debug(msg) {
  console.log(msg);
}

function removeFuncAndExport(moduleExport, ast) {
  const exportName = moduleExport.name;

  // TODO(sven): test if we actually want to delete a func
  const funcName = moduleExport.descr.id.value;

  debug(`Remove unused "${exportName}"`);

  // Count reference to the func first
  let refCount = 0;

  traverse(ast, {

    Identifier({node}) {
      if (node.value === funcName) {
        refCount++;
      }
    },
  });

  traverse(ast, {

    Func(path) {

      // Can not remove this function, it's referenced elsewhere.
      if (refCount > 1) {
        return;
      }

      const emptyFunc = {
        type: 'Func',
        params: [],
        result: [],
        body: [],
        name: null,
      };

      if (path.node.name.value === funcName) {
        Object.assign(path.node, emptyFunc);
        debug('\t> remove func');
      }
    },

    ModuleExport(path) {
      if (path.node.name === exportName) {
        // FIXME(sven): here's a hack to hide the node, since this type is not
        // printable
        path.node.type = 'deleted';
        debug('\t> remove export');
      }
    },
  });
}


module.exports = function (buff, usedExports) {

  function getUnusedModuleExports(ast) {
    const usedModuleExports = [];

    traverse(ast, {

      ModuleExport({node}) {
        if (usedExports.indexOf(node.name) === -1) {
          usedModuleExports.push(node);
        }
      },

    });

    return usedModuleExports;
  }

  let ast;

  if (typeof buff === "string") {
    ast = parsers.parseWATF(buff);
  } else {
    ast = parsers.parseWASM(buff);
  }

  // Before
  // console.log(printers.printWAST(ast));

  getUnusedModuleExports(ast)
    .forEach(e => removeFuncAndExport(e, ast));

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
