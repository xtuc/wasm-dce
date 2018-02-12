const {parse} = require("babylon");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");

function parseSource(source) {
  return parse(source, {
    sourceType: "module",

    plugins: [
      "jsx",
    ]
  });
}

/**
 * We found a local binding from the wasm binary.
 *
 * `import x from 'module.wasm'`
 *         ^
 */
function onLocalModuleBinding(ident, ast) {

  traverse(ast, {

    CallExpression({node: callExpression}) {

      // left must be a member expression
      if (t.isMemberExpression(callExpression.callee) === false) {
        return;
      }

      const memberExpression = callExpression.callee;

      /**
       * Search for `makeX().then(...)`
       */
      if (
        t.isCallExpression(memberExpression.object)
        && memberExpression.object.callee.name === ident.name
        && memberExpression.property.name === "then"
      ) {
        const [thenFnBody] = callExpression.arguments;

        if (typeof thenFnBody === "undefined") {
          return;
        }

        onInstanceThenFn(thenFnBody);
      }
    }

  });
}

/**
 * We found the function handling the module instance
 *
 * `makeX().then(...)`
 *               ^^^
 *
 */
function onInstanceThenFn(fn) {
  if (t.isArrowFunctionExpression(fn) === false) {
    throw new Error("Unsupported function type: " + fn.type);
  }

  const [localIdent] = fn.params;

  traverse(fn.body, {
    noScope: true,

    Identifier({node}) {
      console.log(node);
    }

  });
}

module.exports = function (source) {
  const ast = parseSource(source);

  traverse(ast, {

    ImportDeclaration(path) {
      const [specifier] = path.node.specifiers;

      if (t.isImportDefaultSpecifier(specifier)) {
        onLocalModuleBinding(specifier.local, ast);
        path.stop();
      }

    }

  });

  return [];
};
