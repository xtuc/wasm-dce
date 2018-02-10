# wasm-dce

> Drop unused functions in your WASM binary.

## Example

```diff
(module
-   (func $func_1 (param i32) (param i32) (result i32)
-     (get_local 0)
-     (get_local 1)
-     (i32.add)
-   )
-   (export "add" (func $func_1))
+   (func)
)

```

## FAQ

### Why not use binaryen?

First you can see the JavaScript API is specified here https://github.com/WebAssembly/binaryen/wiki/binaryen.js-API.

I tried but:
- Function can't be removed (they are just renamed).
- It has to reparse the WASM in its own format.
