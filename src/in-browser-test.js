const puppeteer = require('puppeteer');

const fs = require('fs');
const path = require('path');

const CodeUsage = require('./code-usage');
const Performance = require('./performance');

async function injectScript(page, script) {

  return page.evaluate(script);

}

async function injectScriptsFromPaths(page, paths) {

  for (let i = 0; i < paths.length; i++) {

    const resolvedPath = path.resolve(paths[i]);
    const script = fs.readFileSync(resolvedPath, 'utf-8');

    await injectScript(page, script); // eslint-disable-line no-await-in-loop

  }

}

async function inBrowserTest(options, test) {

  const isDebugging = test.toString().indexOf('debugger') !== -1;
  let server;

  if (typeof options.server === 'function') {

    server = await options.server();

  }

  // Launch Chrome
  const chromeOptions = Object.assign({
    devtools: isDebugging,
  }, options.browser);

  const browser = await puppeteer.launch(chromeOptions);

  const pages = await browser.pages();
  const page = pages[0];

  if (options.measureCodeUsage) {

    await CodeUsage.startRecordingCodeUsage(page);

  }

  await page.goto(options.url);

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
  await injectScript(page, qunitConfig);
  await injectScript(page, qunit);

  const { injections } = options;
  if (injections) {

    await injectScriptsFromPaths(page, injections);

  }

  const testResult = await injectScript(page, testScript);
  const testData = JSON.parse(testResult);

  if (options.measurePerformance) {

    await Performance.recordPerformance(page);

  }

  if (options.measureCodeUsage) {

    await CodeUsage.stopRecordingCodeUsage(page);

  }

  await page.close();
  await browser.close();

  if (server) {

    server.close();

  }

  return testData;

}

module.exports = inBrowserTest;
