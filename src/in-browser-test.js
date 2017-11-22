const ChromeRemoteInterface = require('chrome-remote-interface');
const ChromeLauncher = require('chrome-launcher');
const { MultiplexServer } = require('chrome-remote-multiplex');

const fs = require('fs');
const isCI = require('is-ci');
const path = require('path');

async function injectScript(Runtime, script, options) {

  const runtimeOptions = Object.assign({ expression: script }, options);
  return Runtime.evaluate(runtimeOptions);

}

async function openDevTools(chromePort, multiplexerPort) {

  const targets = await ChromeRemoteInterface.List({ port: multiplexerPort });
  const targetUnderTest = targets[targets.length - 1];

  const debuggerTarget = await ChromeRemoteInterface.New({ port: multiplexerPort });
  const debuggerInterface = await ChromeRemoteInterface({ target: debuggerTarget });

  const { Page } = debuggerInterface;
  await Page.navigate({ url: `http://localhost:${chromePort}${targetUnderTest.devtoolsFrontendUrl}` });

  debuggerInterface.close();

}

async function injectScriptsFromPaths(Runtime, paths) {

  for (let i = 0; i < paths.length; i++) {

    const resolvedPath = path.resolve(paths[i]);
    const script = fs.readFileSync(resolvedPath, 'utf-8');

    await injectScript(Runtime, script); // eslint-disable-line no-await-in-loop

  }

}

async function inBrowserTest(options, test) {

  const isDebugging = test.toString().indexOf('debugger') !== -1;
  let server;

  if (typeof options.server === 'function') {

    server = await options.server();

  }

  // Launch Chrome
  const chromeOptions = options.browser || {};

  if (isCI) {

    chromeOptions.chromeFlags = chromeOptions.chromeFlags || [];
    chromeOptions.chromeFlags.push('--headless', '--disable-gpu');

  }

  const chrome = await ChromeLauncher.launch(chromeOptions);

  // Setup multiplexer for connecting the remote interface and devtools
  const multiplexer = new MultiplexServer({
    remoteClient: `localhost:${chrome.port}`,
    listenPort: chrome.port + 1,
  });
  await multiplexer.listen();

  const chromeInterface = await ChromeRemoteInterface({
    port: multiplexer.options.listenPort,
  });

  if (isDebugging) {

    await openDevTools(chrome.port, multiplexer.options.listenPort);

  }

  const {
    Page,
    Runtime,
  } = chromeInterface;

  await Page.enable();
  await Page.navigate({ url: options.url });
  await Page.loadEventFired();

  // Construct test scripts to inject into page
  const qunitConfig = `
    QUnit = {
      config: {
        autostart: false
      }
    };
  `;
  const qunitPath = require.resolve('qunit');
  const qunit = fs.readFileSync(qunitPath, 'utf-8');
  const testScript = fs.readFileSync(path.resolve(__dirname, './injections/test-script.js'), 'utf-8').replace('TEST_FUNCTION', test.toString());

  // Evaluate test scripts in page
  await injectScript(Runtime, qunitConfig);
  await injectScript(Runtime, qunit);

  const { injections } = options;
  if (injections) {

    await injectScriptsFromPaths(Runtime, injections);

  }

  const testResult = await injectScript(Runtime, testScript, { awaitPromise: true });
  const testData = JSON.parse(testResult.result.value);

  chromeInterface.close();
  multiplexer.close();
  chrome.kill();

  if (server) {

    server.close();

  }

  return testData;

}

module.exports = inBrowserTest;
