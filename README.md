# wasm-dce

> Drop unused functions in your WASM binary.

## FAQ

### Why not use binaryen?

First you can see the JavaScript API is specified here https://github.com/WebAssembly/binaryen/wiki/binaryen.js-API.

I tried but:
- Function can't be removed (they are just renamed).
- It has to reparse the WASM in its own format.
