declare module "*.wasm" {
  // type WASMModule = () => any

  const wasmLoader: <T>(importObject: T) => WebAssembly.Instance;
  export default wasmLoader;
}
