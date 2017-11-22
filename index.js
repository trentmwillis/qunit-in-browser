/* global QUnit */
const inBrowserTest = require('./src/in-browser-test.js');

module.exports = function inBrowser(description, options, test) {

  // eslint-disable-next-line prefer-arrow-callback
  QUnit.test(description, async function inBrowserTestWrapper(assert) {

    let actualOptions = options;

    if (typeof actualOptions === 'string') {

      actualOptions = {
        url: actualOptions,
      };

    }

    const assertions = await inBrowserTest(actualOptions, test);
    assertions.forEach((assertion) => {

      assert.pushResult({
        result: assertion.passed,
        actual: assertion.actual,
        expected: assertion.expected,
        message: assertion.message,
        source: assertion.source,
      });

    });

  });

};
