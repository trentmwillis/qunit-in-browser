/* global window */

const inflightScreenshots = Object.create(null);

window.takeScreenshot = function takeScreenshot(identifier) {

  if (!identifier || typeof identifier !== 'string') {

    throw new Error('The idenfitied for a screenshot must be a non-empty string.');

  }

  // We log a statement to the console to send an event back to Puppeteer. This
  // also helps with debugging.
  console.log('taking screenshot', identifier); // eslint-disable-line no-console

  return new Promise((resolve) => {

    inflightScreenshots[identifier] = resolve;

  });

};

window.resolveScreenshot = function resolveScreenshot(identifier) {

  inflightScreenshots[identifier]();
  delete inflightScreenshots[identifier];

};
