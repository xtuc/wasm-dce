const {traverse, parsers, printers} = require("webassembly-interpreter/lib/tools");
const {readFileSync} = require("fs");
const libwabt = require('./libwabt');

const usedExports = ["oo"];
const filename = process.argv[2];

const emptyFunc = {
  type: 'Func',
  params: [],
  result: [],
  body: [],
  name: null,
};

function debug(msg) {
  console.log(msg);
}

function removeFuncAndExport(moduleExport, ast) {
  const exportName = moduleExport.name;

  // TODO(sven): test if we actually want to delete a func
  const funcName = moduleExport.descr.id.value;

  debug(`Remove unused "${exportName}"`);

  traverse(ast, {
    Func(path) {

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

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

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

const buff = toArrayBuffer(readFileSync(filename, null));

parsers.parseWASM(buff, (ast) => {
  // Before
  // console.log(printers.printWAST(ast));

  getUnusedModuleExports(ast)
    .forEach(e => removeFuncAndExport(e, ast));

  const wast = printers.printWAST(ast);

  // To wasm
  const m = libwabt.parseWat(filename, wast);
  m.resolveNames();
  m.validate();

  const {buffer} = m.toBinary({log: true, write_debug_names:true});

  console.log(buffer);

  // After
  // console.log(printers.printWAST(ast));
});
