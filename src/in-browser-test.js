const ChromeRemoteInterface = require('chrome-remote-interface');
const ChromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function injectScript(Runtime, script, options) {
  const runtimeOptions = Object.assign({ expression: script }, options);
  return await Runtime.evaluate(runtimeOptions);
}

async function inBrowserTest(url, test) {
  const chrome = await ChromeLauncher.launch({
    startingUrl: url
  });
  const chromeInterface = await ChromeRemoteInterface({
    port: chrome.port
  });

  const {
    Page,
    Runtime
  } = chromeInterface;

  await Page.enable();
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
      ${test.toString().indexOf('debugger') === -1 ? 'QUnit.start();' : ''}
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
