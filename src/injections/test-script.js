new Promise((resolve) => {
  const assertions = [];

  const clone = obj => JSON.parse(stringifyCircular(obj));

  function stringifyCircular(obj) {
    const cache = [];

    return JSON.stringify(obj, (key, value) => {

      if (typeof value === 'object') {
        if (cache.indexOf(value) !== -1) {
          return '[CircularReference]';
        } else {
          cache.push(value);
        }
      }

      return value;

    });

  }

  QUnit.on('assertion', (data) => assertions.push(clone(data)));
  QUnit.on('runEnd', (data) => resolve(JSON.stringify(assertions)));
  QUnit.test('testing', TEST_FUNCTION);
  QUnit.start();

});
