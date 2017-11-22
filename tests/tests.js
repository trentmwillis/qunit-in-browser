/* global document, window, axe */
/* eslint-disable prefer-arrow-callback, func-names */

const path = require('path');
const QUnit = require('qunit');
const server = require('./fixtures/server');
QUnit.test.inBrowser = require('../index');

const fixturePath = path.resolve(__dirname, './fixtures');
QUnit.test.inBrowser('can run a simple test', `file:${fixturePath}/index.html`, function(assert) {

  assert.equal(document.body.innerText, 'Hello world!');

});

QUnit.test.inBrowser('can run an async test', `file:${fixturePath}/index.html`, async function(assert) {

  await new Promise(resolve => setTimeout(() => {

    assert.equal(document.body.innerText, 'Hello world!');
    resolve();

  }));

});

QUnit.test.inBrowser('can inject other files into the test with cwd-relative paths', {
  url: `file:${fixturePath}/index.html`,
  injections: [
    'node_modules/axe-core/axe.min.js',
  ],
}, async function(assert) {

  const results = await axe.run();
  assert.equal(results.violations.length, 0);
  assert.equal(document.body.innerText, 'Hello world!');

});

QUnit.test.inBrowser('can pass options to the browser launcher', {
  url: `file:${fixturePath}/index.html`,
  browser: {
    chromeFlags: [
      '--headless',
      '--disable-gpu',
    ],
  },
}, function(assert) {

  // Check UA to make sure we're in headless mode
  assert.equal(document.body.innerText, 'Hello world!');
  assert.ok(/HeadlessChrome/.test(window.navigator.userAgent));

});

QUnit.test.inBrowser('can start a server for the duration of the test', {
  url: 'http://localhost:3000',
  server,
}, function(assert) {

  assert.equal(document.body.innerText, 'Hello world from a server!');

});
