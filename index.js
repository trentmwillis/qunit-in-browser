const inBrowserTest = require('./src/in-browser-test.js');

QUnit.test.inBrowser = function inBrowser(description, url, test) {
  QUnit.test(description, async function(assert) {
    const result = await inBrowserTest(url, test);
    assert.equal(result.status, 'passed');
  });
};
