const inBrowserTest = require('./src/in-browser-test.js');

QUnit.test.inBrowser = function inBrowser(description, url, test) {
  QUnit.test(description, async function(assert) {
    const result = await inBrowserTest(url, test);

    const errors = result.tests[0].errors;
    if (errors.length) {
      errors.forEach((error) => console.log(error.message));
    }

    assert.equal(result.status, 'passed');
  });
};
