/* global document, axe */
/* eslint-disable prefer-arrow-callback, func-names */

const fs = require('fs-extra');
const path = require('path');
const QUnit = require('qunit');
const server = require('./fixtures/server');
QUnit.test.inBrowser = require('../index');

QUnit.module('QUnit-In-Browser');

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

QUnit.test.inBrowser('can start a server for the duration of the test', {
  url: 'http://localhost:3000',
  server,
}, function(assert) {

  assert.equal(document.body.innerText, 'Hello world from a server!');

});

QUnit.test('verify code usage measurements do not exist', function(assert) {

  fs.removeSync('.qunit-in-browser');
  assert.notOk(fs.existsSync('.qunit-in-browser/code-usage.json'));

});

QUnit.test.inBrowser('can measure code usage and record it', {
  url: `file:${fixturePath}/index.html`,
  measureCodeUsage: true,
}, function(assert) {

  assert.equal(document.body.innerText, 'Hello world!');

});

QUnit.test('verify code usage measurements do exist after test', function(assert) {

  assert.deepEqual(fs.readJsonSync('.qunit-in-browser/code-usage.json'), {
    js: {
      totalBytes: 147,
      usedBytes: 71,
      percentUsed: 48.29931972789115,
    },
    css: {
      totalBytes: 0,
      usedBytes: 0,
      percentUsed: 100,
    },
  });
  fs.removeSync('.qunit-in-browser');

});

QUnit.test('verify code performance measurements do not exist', function(assert) {

  fs.removeSync('.qunit-in-browser');
  assert.notOk(fs.existsSync('.qunit-in-browser/performance.json'));

});

QUnit.test.inBrowser('can measure code performance and record it', {
  url: `file:${fixturePath}/index.html`,
  measurePerformance: true,
}, function(assert) {

  assert.equal(document.body.innerText, 'Hello world!');

});

QUnit.test('verify code performance measurements do exist after test', function(assert) {

  const performanceMetrics = fs.readJsonSync('.qunit-in-browser/performance.json');
  assert.equal(typeof performanceMetrics, 'object');
  assert.equal(typeof performanceMetrics.pageMetrics, 'object');
  assert.equal(typeof performanceMetrics.pageTimings, 'object');
  fs.removeSync('.qunit-in-browser');

});

QUnit.test('verify screenshots do not exist', function(assert) {

  fs.removeSync('.qunit-in-browser');
  assert.notOk(fs.existsSync('.qunit-in-browser/performance.json'));

});

QUnit.test.inBrowser('can measure code performance and record it', {
  url: `file:${fixturePath}/index.html`,
  enableScreenshots: true,
}, async function(assert) {

  assert.equal(document.body.innerText, 'Hello world!');
  await takeScreenshot('home'); // eslint-disable-line no-undef

});

QUnit.test('verify screenshots do exist after test', function(assert) {

  assert.ok(fs.existsSync('.qunit-in-browser/home.png'));
  fs.removeSync('.qunit-in-browser');

});
