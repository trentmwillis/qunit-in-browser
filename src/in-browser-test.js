const ChromeRemoteInterface = require('chrome-remote-interface');
const ChromeLauncher = require('chrome-launcher');
var MultiplexServer = require('chrome-remote-multiplex').MultiplexServer;
const fs = require('fs');
const path = require('path');

async function injectScript(Runtime, script, options) {
  const runtimeOptions = Object.assign({ expression: script }, options);
  return await Runtime.evaluate(runtimeOptions);
}

async function openDevTools(chromePort, multiplexerPort) {

  const targets = await ChromeRemoteInterface.List({ port: multiplexerPort });
  const targetUnderTest = targets[targets.length - 1];

  const debuggerTarget = await ChromeRemoteInterface.New({ port: multiplexerPort });
  const debuggerInterface = await ChromeRemoteInterface({ target: debuggerTarget });

  const { Page } = debuggerInterface;
  await Page.navigate({ url: `http://localhost:${chromePort}${targetUnderTest.devtoolsFrontendUrl}` });

}

async function inBrowserTest(url, test) {
  const isDebugging = test.toString().indexOf('debugger') !== -1;

  // Launch Chrome
  const chrome = await ChromeLauncher.launch();

  // Setup multiplexer for connecting the remote interface and devtools
  const multiplexer = new MultiplexServer({
    remoteClient: `localhost:${chrome.port}`,
    listenPort: chrome.port + 1
  });
  await multiplexer.listen();

  const chromeInterface = await ChromeRemoteInterface({
    port: multiplexer.options.listenPort
  });

  if (isDebugging) {
    await openDevTools(chrome.port, multiplexer.options.listenPort);
  }

  const {
    Page,
    Runtime
  } = chromeInterface;

  await Page.enable();
  await Page.navigate({ url});
  await Page.loadEventFired();

  // Construct test scripts to inject into page
  const qunitConfig = `
    QUnit = {
      config: {
        autostart: false
      }
    };
  `;
  const qunitPath = require.resolve('qunitjs');
  const qunit = fs.readFileSync(qunitPath, 'utf-8');
  const testScript = `
    new Promise((resolve) => {
      QUnit.on('runEnd', (data) => resolve(JSON.stringify(data)));
      QUnit.test('testing', ${test});
      QUnit.start();
    });
  `;

  // Evaluate test scripts in page
  await injectScript(Runtime, qunitConfig);
  await injectScript(Runtime, qunit);

  const testData = await injectScript(Runtime, testScript, { awaitPromise: true });
  const testResult = JSON.parse(testData.result.value);

  chromeInterface.close();
  chrome.kill();

  return testResult;
}

module.exports = inBrowserTest;
