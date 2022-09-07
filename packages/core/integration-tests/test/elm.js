const assert = require('assert');
const fs = require('@parcel/fs');
const {bundle, assertBundleTree, run} = require('@parcel/test-utils');

describe('elm', function() {
  it('should produce a basic Elm bundle', async function() {
    let b = await bundle(__dirname + '/integration/elm/index.js');

    await assertBundleTree(b, {
      type: 'js',
      assets: ['Main.elm', 'index.js']
    });

    let output = await run(b);
    assert.equal(typeof output().Elm.Main.init, 'function');
  });
  it('should produce a elm bundle with debugger', async function() {
    let b = await bundle(__dirname + '/integration/elm/index.js');

    await run(b);
    let js = await fs.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(js.includes('elm$browser$Debugger'));
  });

  it('should apply elm-hot if HMR is enabled', async function() {
    let b = await bundle(__dirname + '/integration/elm/index.js', {
      hmr: true
    });

    await assertBundleTree(b, {
      type: 'js',
      assets: ['Main.elm', 'hmr-runtime.js', 'index.js']
    });

    let js = await fs.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(js.includes('[elm-hot]'));
  });

  it('should remove debugger in production', async function() {
    let b = await bundle(__dirname + '/integration/elm/index.js', {
      production: true
    });

    await run(b);
    let js = await fs.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(!js.includes('elm$browser$Debugger'));
  });

  it('should minify Elm in production mode', async function() {
    let b = await bundle(__dirname + '/integration/elm/index.js', {
      production: true
    });

    let output = await run(b);
    assert.equal(typeof output().Elm.Main.init, 'function');

    let js = await fs.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(!js.includes('elm$core'));
  });
});
