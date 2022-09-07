const assert = require('assert');
const fs = require('@parcel/fs');
const path = require('path');
const {
  bundler,
  run,
  rimraf,
  ncp,
  prepareBrowserContext
} = require('@parcel/test-utils');
const vm = require('vm');
const {sleep} = require('@parcel/test-utils');
const WebSocket = require('ws');
const json5 = require('json5');
const sinon = require('sinon');

describe('hmr', function() {
  let b, ws, stub;
  beforeEach(async function() {
    stub = sinon.stub(console, 'clear');
    await rimraf(path.join(__dirname, '/input'));
  });

  afterEach(async function() {
    stub.restore();
    let finalise = async () => {
      if (b) {
        await b.stop();
        b = null;
      }
    };

    if (ws) {
      ws.close();
      await new Promise(resolve => {
        ws.onclose = resolve;
      });
      ws = null;
    }

    await finalise();
  });

  function nextEvent(emitter, event) {
    return new Promise(resolve => {
      emitter.once(event, resolve);
    });
  }

  it('should emit an HMR update for the file that changed', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    await b.bundle();

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);

    const buildEnd = nextEvent(b, 'buildEnd');
    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5;\nexports.b = 5;'
    );

    let msg = json5.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'update');
    assert.equal(msg.assets.length, 1);
    assert.equal(msg.assets[0].generated.js, 'exports.a = 5;\nexports.b = 5;');
    assert.deepEqual(msg.assets[0].deps, {});

    await buildEnd;
  });

  it('should not enable HMR for --target=node', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true,
      target: 'node'
    });
    await b.bundle();

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);

    let err = await nextEvent(ws, 'error');
    assert(err);
    ws = null;
  });

  it('should enable HMR for --target=electron', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true,
      target: 'electron'
    });
    await b.bundle();

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);

    const buildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5; exports.b = 5;'
    );

    let msg = json5.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'update');
    assert.equal(msg.assets.length, 1);
    assert.equal(msg.assets[0].generated.js, 'exports.a = 5; exports.b = 5;');
    assert.deepEqual(msg.assets[0].deps, {});

    await buildEnd;
  });

  it('should emit an HMR update for all new dependencies along with the changed file', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    await b.bundle();

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);

    const buildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"); exports.a = 5; exports.b = 5;'
    );

    let msg = json5.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'update');
    assert.equal(msg.assets.length, 2);

    await buildEnd;
  });

  it('should emit an HMR error on bundle failure', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    await b.bundle();

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);

    const buildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"; exports.a = 5; exports.b = 5;'
    );

    let msg = JSON.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'error');
    assert.equal(
      msg.error.message,
      `${path.join(
        __dirname,
        '/input/local.js'
      )}:1:12: Unexpected token, expected "," (1:12)`
    );
    assert.equal(
      msg.error.stack,
      '> 1 | require("fs"; exports.a = 5; exports.b = 5;\n    |            ^'
    );

    await buildEnd;
  });

  it('should emit an HMR error to new connections after a bundle failure', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    await b.bundle();

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"; exports.a = 5; exports.b = 5;'
    );
    await nextEvent(b, 'buildEnd');
    await sleep(50);

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);
    let msg = JSON.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'error');
  });

  it('should emit an HMR error-resolved on build after error', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    await b.bundle();

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);

    const firstBuildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"; exports.a = 5; exports.b = 5;'
    );

    let msg = JSON.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'error');

    await firstBuildEnd;

    const secondBuildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"); exports.a = 5; exports.b = 5;'
    );

    let msg2 = JSON.parse(await nextEvent(ws, 'message'));
    assert.equal(msg2.type, 'error-resolved');

    await secondBuildEnd;
  });

  it('should accept HMR updates in the runtime', async function() {
    await ncp(
      path.join(__dirname, '/integration/hmr'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();
    let outputs = [];

    await run(bundle, {
      output(o) {
        outputs.push(o);
      }
    });

    assert.deepEqual(outputs, [3]);

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5; exports.b = 5;'
    );

    await nextEvent(b, 'bundled');
    assert.deepEqual(outputs, [3, 10]);
  });

  it('should work with circular dependencies', async function() {
    await ncp(
      path.join(__dirname, '/integration/hmr-circular'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();
    let outputs = [];

    await run(bundle, {
      output(o) {
        outputs.push(o);
      }
    });

    assert.deepEqual(outputs, [3]);

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      "var other = require('./index.js'); exports.a = 5; exports.b = 5;"
    );

    await nextEvent(b, 'bundled');
    assert.deepEqual(outputs, [3, 10]);
  });

  it('should accept HMR updates in the runtime after an initial error', async function() {
    await fs.mkdirp(path.join(__dirname, '/input'));
    fs.writeFile(
      path.join(__dirname, '/input/index.js'),
      'module.hot.accept();throw new Error("Something");\noutput(123);'
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();

    let outputs = [];
    let errors = [];

    var ctx = prepareBrowserContext(bundle, {
      output(o) {
        outputs.push(o);
      },
      error(e) {
        errors.push(e);
      }
    });
    vm.createContext(ctx);
    vm.runInContext(
      `try {
        ${(await fs.readFile(bundle.name)).toString()}
      } catch(e) {
        error(e);
      }`,
      ctx
    );

    assert.deepEqual(outputs, []);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].message, 'Something');

    await sleep(100);
    fs.writeFile(path.join(__dirname, '/input/index.js'), 'output(123);');

    await nextEvent(b, 'bundled');
    assert.deepEqual(outputs, [123]);
    assert.equal(errors.length, 1);
  });

  it('should call dispose and accept callbacks', async function() {
    await ncp(
      path.join(__dirname, '/integration/hmr-callbacks'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();
    let outputs = [];
    let moduleId = '';

    await run(bundle, {
      reportModuleId(id) {
        moduleId = id;
      },
      output(o) {
        outputs.push(o);
      }
    });

    assert.deepEqual(outputs, [3]);

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5; exports.b = 5;'
    );

    await nextEvent(b, 'bundled');
    assert.notEqual(moduleId, undefined);
    assert.deepEqual(outputs, [
      3,
      'dispose-' + moduleId,
      10,
      'accept-' + moduleId
    ]);
  });

  it('should work across bundles', async function() {
    await ncp(
      path.join(__dirname, '/integration/hmr-dynamic'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();
    let outputs = [];

    await run(bundle, {
      output(o) {
        outputs.push(o);
      }
    });

    await sleep(50);
    assert.deepEqual(outputs, [3]);

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5; exports.b = 5;'
    );

    await nextEvent(b, 'bundled');
    await sleep(50);
    assert.deepEqual(outputs, [3, 10]);
  });

  it('should bubble up HMR events to a page reload', async function() {
    await ncp(
      path.join(__dirname, '/integration/hmr-reload'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();

    let outputs = [];
    let ctx = await run(
      bundle,
      {
        output(o) {
          outputs.push(o);
        }
      },
      {require: false}
    );
    let spy = sinon.spy(ctx.location, 'reload');

    await sleep(50);
    assert.deepEqual(outputs, [3]);
    assert(spy.notCalled);

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5; exports.b = 5;'
    );

    await nextEvent(b, 'bundled');
    assert.deepEqual(outputs, [3]);
    assert(spy.calledOnce);
  });

  it('should trigger a page reload when a new bundle is created', async function() {
    await ncp(
      path.join(__dirname, '/integration/hmr-new-bundle'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.html'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();

    let ctx = await run([...bundle.childBundles][0], {}, {require: false});
    let spy = sinon.spy(ctx.location, 'reload');

    await sleep(50);
    assert(spy.notCalled);

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/index.js'),
      'import "./index.css"'
    );

    await nextEvent(b, 'bundled');
    assert(spy.calledOnce);

    let contents = await fs.readFile(
      path.join(__dirname, '/dist/index.html'),
      'utf8'
    );
    assert(contents.includes('.css'));
  });

  it('should log emitted errors and show an error overlay', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();

    let logs = [];
    let ctx = await run(
      bundle,
      {
        console: {
          error(msg) {
            logs.push(msg);
          },
          clear() {}
        }
      },
      {require: false}
    );

    let spy = sinon.spy(ctx.document.body, 'appendChild');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"; exports.a = 5; exports.b = 5;'
    );
    await nextEvent(b, 'buildEnd');
    await sleep(50);

    assert.equal(logs.length, 1);
    assert(logs[0].trim().startsWith('[parcel] 🚨'));
    assert(spy.calledOnce);
  });

  it('should log when errors resolve', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    let bundle = await b.bundle();

    let logs = [];
    let ctx = await run(
      bundle,
      {
        console: {
          error(msg) {
            logs.push(msg);
          },
          log(msg) {
            logs.push(msg);
          },
          clear() {}
        }
      },
      {require: false}
    );

    let appendSpy = sinon.spy(ctx.document.body, 'appendChild');
    let removeSpy = sinon.spy(ctx.document.getElementById('tmp'), 'remove');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"; exports.a = 5; exports.b = 5;'
    );
    await nextEvent(b, 'buildEnd');
    await sleep(50);

    assert(appendSpy.called);

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'require("fs"); exports.a = 5; exports.b = 5;'
    );
    await nextEvent(b, 'buildEnd');
    await sleep(50);

    assert(removeSpy.called);

    assert.equal(logs.length, 2);
    assert(logs[0].trim().startsWith('[parcel] 🚨'));
    assert(logs[1].trim().startsWith('[parcel] ✨'));
  });

  it('should make a secure connection', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true,
      https: true
    });
    await b.bundle();

    ws = new WebSocket('wss://localhost:' + b.options.hmrPort, {
      rejectUnauthorized: false
    });

    const buildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5;\nexports.b = 5;'
    );

    let msg = json5.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'update');
    assert.equal(msg.assets.length, 1);
    assert.equal(msg.assets[0].generated.js, 'exports.a = 5;\nexports.b = 5;');
    assert.deepEqual(msg.assets[0].deps, {});

    await buildEnd;
  });

  it('should make a secure connection with custom certificate', async function() {
    await ncp(
      path.join(__dirname, '/integration/commonjs'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true,
      https: {
        key: path.join(__dirname, '/integration/https/private.pem'),
        cert: path.join(__dirname, '/integration/https/primary.crt')
      }
    });
    await b.bundle();

    ws = new WebSocket('wss://localhost:' + b.options.hmrPort, {
      rejectUnauthorized: false
    });

    const buildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/local.js'),
      'exports.a = 5;\nexports.b = 5;'
    );

    let msg = json5.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'update');
    assert.equal(msg.assets.length, 1);
    assert.equal(msg.assets[0].generated.js, 'exports.a = 5;\nexports.b = 5;');
    assert.deepEqual(msg.assets[0].deps, {});

    await buildEnd;
  });

  it('should watch new dependencies that cause errors', async function() {
    await ncp(
      path.join(__dirname, '/integration/elm-dep-error'),
      path.join(__dirname, '/input')
    );

    b = bundler(path.join(__dirname, '/input/index.js'), {
      watch: true,
      hmr: true
    });
    await b.bundle();

    ws = new WebSocket('ws://localhost:' + b.options.hmrPort);

    const buildEnd = nextEvent(b, 'buildEnd');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/src/Main.elm'),
      `
module Main exposing (main)

import BrokenDep
import Html

main =
    Html.text "Hello, world!"
    `
    );

    let msg = JSON.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'error');

    await sleep(100);
    fs.writeFile(
      path.join(__dirname, '/input/src/BrokenDep.elm'),
      `
module BrokenDep exposing (anError)


anError : String
anError =
    "fixed"
      `
    );

    msg = JSON.parse(await nextEvent(ws, 'message'));
    assert.equal(msg.type, 'error-resolved');

    await buildEnd;
  });
});
