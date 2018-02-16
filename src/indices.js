const {traverse} = require("webassembly-interpreter/lib/tools");

function createFuncIndex(ast) {
  const cacheByNumber = [];
  const cacheByName = {};

  traverse(ast, {
    Func({node}) {
      cacheByNumber.push(node);

      if (node.name != null) {
        cacheByName[node.name.value] = node;
      }
    }
  });

  function getByIndex(n) {
    if (n.type === "NumberLiteral") {
      return cacheByNumber[n.value];
    }

    if (n.type === "Identifier") {
      return cacheByName[n.value];
    }

    throw new Error('Argument must be an index');
  }

  return {
    getByIndex,
  };
}

module.exports = {
  createFuncIndex,
}
