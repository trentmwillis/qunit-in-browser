/* global QUnit */
// eslint-disable-next-line no-new
new Promise((resolve) => {

  const assertions = [];

  function stringifyCircular(obj) {

    const cache = [];

    return JSON.stringify(obj, (key, value) => {

      if (typeof value === 'object') {

        if (cache.indexOf(value) !== -1) {

          return '[CircularReference]';

        }

        cache.push(value);

      }

      return value;

    });

  }

  const clone = obj => JSON.parse(stringifyCircular(obj));

  QUnit.on('assertion', data => assertions.push(clone(data)));
  QUnit.on('runEnd', () => resolve(JSON.stringify(assertions)));
  QUnit.test('testing', TEST_FUNCTION); // eslint-disable-line no-undef
  QUnit.start();

});
