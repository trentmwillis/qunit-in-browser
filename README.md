# QUnit-In-Browser

[![npm version](https://badge.fury.io/js/qunit-in-browser.svg)](https://www.npmjs.com/package/qunit-in-browser)
[![Build Status](https://travis-ci.org/trentmwillis/qunit-in-browser.svg?branch=master)](https://travis-ci.org/trentmwillis/qunit-in-browser)

QUnit-In-Browser is a plugin for [QUnit](http://qunitjs.com/)'s CLI that enables you to easily test applications in a web browser. It allows you to write QUnit tests that can run against an actual webpage by being injected into the runtime. This enables you to use the same tools for your end-to-end tests that you are already using for your unit tests!

For more background on the _what, why, and how_ of QUnit-In-Browser, check out [this blog post](https://pretty-okay.com/2017/12/04/qunit-in-browser).

To get started using QUnit-In-Browser, install it via npm:

```bash
npm install --save-dev qunit-in-browser
```

Note: This plugin is built on-top of [Puppeteer](https://github.com/GoogleChrome/puppeteer) which means the only supported browsers are Chromium and Chrome. Hopefully in the future other browsers will align on a protocol to enable this sort of functionality across all browsers easily.

## Example

```js
QUnit.test.inBrowser = require('qunit-in-browser');

QUnit.test.inBrowser('Home page successfully renders', 'https://localhost:8000/', function(assert) {
  const content = document.getElementById('content');
  assert.ok(content, 'main content is rendered!');
});
```

## API

```ts
function inBrowser(description: string; options: string|InBrowserOptions; test: function);
```

```ts
interface InBrowserOptions {
  browser: Object;
  injections: Array<string>;
  server: () => Promise<Server>;
  url: string;
  measureCodeUsage: boolean;
  measurePerformance: boolean;
}

interface Server {
  close: () => any;
}
```

### Options Details

* `browser` - Options to be used when launching the browser. For details, refer to [the options provided by `puppeteer`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions).
* `injections` - An array of string paths to files to be injected alongside the test code. The paths are resolved relative to the current working directory (`cwd`) for injection unless absolute paths are used.
* `server` - A function to start a server in case one is needed to test your code. The function should return a `Promise` that resolves when the server is ready to accept requests. It should resolve with an object representing the server including a `close` method to shutdown the server once the test has concluded. Alternatively, you can start a server externally and then run your tests.
* `url` - A string path to navigate the browser to for the test.
* `measureCodeUsage` - A boolean denoting whether or not to record code usage stats for the test. The stats will be output in `.qunit-in-browser/code-usage.json` as well as logged to the console.
* `measurePerformance` - A boolean indicating whether or not to record performance statistics for the test. The stats will be output in `.qunit-in-browser/performance.json` as well logged to the console.

## Debugging

QUnit-In-Browser will detect when a [`debugger` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) is present in your code and open a [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/) instance alongside the running test. This makes it easy to debug your tests in a similar fashion to how you would most likely normally debug your application.
