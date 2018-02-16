const {traverse} = require("webassembly-interpreter/lib/tools");

const countRefByName = require('./reference-couting');
const indices = require('./indices');

function getCallInstructionsInBody(func) {
  const calls = [];

  traverse(func, {

    CallInstruction({node}) {
      calls.push(node.index);
    }

  });

  return calls;
}

function replaceWithEmptyFunc(func) {
  const emptyFunc = {
    type: 'Func',
    params: [],
    result: [],
    body: [],
    name: null,
  };

  Object.assign(func, emptyFunc);
}
function removeFuncByName(funcName, ast) {
  const funcIndex = indices.createFuncIndex(ast);

  traverse(ast, {

    Func(path) {
      if (path.node.name == null) {
        return;
      }

      if (path.node.name.value === funcName) {
        const calls = getCallInstructionsInBody(path.node);

        replaceWithEmptyFunc(path.node);

        calls.forEach(call => {
          const calledFn = funcIndex.getByIndex(call);

          // if (typeof calledFn 
          const name = calledFn.name.value;
          const refs = countRefByName(name);

          if (refs < 2) {
            console.log('\t\t> remove child func ' + name + ' (found ' + refs + ' refs)');
            removeFuncByName(name, ast);
          }
        });

        console.log('\t> remove func ' + funcName);
      }
    }

  });
}

function removeExportByName(name, ast) {
  traverse(ast, {

    ModuleExport(path) {
      if (path.node.name === name) {
        // FIXME(sven): here's a hack to hide the node, since this type is not
        // printable
        path.node.type = 'deleted';
        console.log('\t> remove export');
      }
    }
  });
}

module.exports = {
  removeExportByName,
  removeFuncByName,
};
