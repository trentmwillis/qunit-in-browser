const inBrowserTest = require('./src/in-browser-test.js');

module.exports = function inBrowser(description, options, test) {
  QUnit.test(description, async function(assert) {
    let actualOptions = options;

    if (typeof actualOptions === 'string') {
      actualOptions = {
        url: actualOptions
      };
    }

    const result = await inBrowserTest(actualOptions, test);

    const errors = result.tests[0].errors;
    if (errors.length) {
      errors.forEach((error) => console.log(error.message));
    }

    assert.equal(result.status, 'passed');
  });
};
