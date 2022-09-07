module.exports = function loadWASMBundle(bundle) {
  return Promise.resolve(function (importObject) {
    return fetch(bundle)
      .then(function (res) {
        if (WebAssembly.instantiateStreaming) {
          return WebAssembly.instantiateStreaming(res, importObject);
        } else {
          return res.arrayBuffer()
            .then(function (data) {
              return WebAssembly.instantiate(data, importObject);
            });
        }
      })
      .then(function (wasmModule) {
        return wasmModule.instance.exports;
      });
  })
};
