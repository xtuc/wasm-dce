const {traverse} = require("webassembly-interpreter/lib/tools");

module.exports = function countRefByName(ast, name) {
  let refCount = 0;

  traverse(ast, {

    Identifier({node}) {
      if (node.value === name) {
        refCount++;
      }
    },
  });

  return refCount;
}
