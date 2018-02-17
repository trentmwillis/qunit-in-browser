const puppeteer = require('puppeteer');

const fs = require('fs-extra');
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

  if (options.enableScreenshots) {

    const takeScreenshot = fs.readFileSync(path.resolve(__dirname, './injections/take-screenshot.js'), 'utf-8');
    await injectScript(page, takeScreenshot);
    page.on('console', async (msg) => {

      const msgText = msg.text();
      if (msgText.startsWith('taking screenshot')) {

        const id = msgText.substr('taking screenshot'.length + 1);
        fs.ensureDirSync('./.qunit-in-browser');
        await page.screenshot({
          path: `./.qunit-in-browser/${id}.png`,
        });
        await page.evaluate(`resolveScreenshot('${id}');`);

      }

    });

  }

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

  // Evaluate test scripts in page
  await injectScript(page, qunitConfig);
  await injectScript(page, qunit);

  const { injections } = options;
  if (injections) {

    await injectScriptsFromPaths(page, injections);

  }

  const testScript = fs.readFileSync(path.resolve(__dirname, './injections/test-script.js'), 'utf-8').replace('TEST_FUNCTION', test.toString());
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
