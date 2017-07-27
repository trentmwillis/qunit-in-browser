# QUnit-In-Browser

QUnit-In-Browser is a plugin for [QUnit](http://qunitjs.com/)'s CLI that enables you to easily test applications in a web browser. It allows you to write QUnit tests that can run against an actual webpage by being injected into the runtime. This enables you to use the same tools for your end-to-end tests that you are already using for your unit tests!

## Example

```js
QUnit.test.inBrowser = require('qunit-in-browser');

QUnit.test.inBrowser('Home page successfully renders', 'https://localhost:8000/', function(assert) {
  const content = document.getElementById('content');
  assert.ok(content, 'main content is rendered!');
});
```

## Debugging

QUnit-In-Browser will detect when a [`debugger` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) is present in your code and open a [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/) instance alongside the running test. This makes it easy to debug your tests in a similar fashion to how you would most likely normally debug your application.

Note: The DevTools instance will open in a separate browser tab. This is to work around a limitation in the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/#simultaneous) which prevents the QUnit-In-Browser client and the DevTools from simultaneously, directly connecting to the page under test.

## API

```ts
function inBrowser(description: string; options: string|InBrowserOptions; test: function);
```

```ts
interface InBrowserOptions {
  url: string;
  injections: Array<string>;
  server: () => Promise<Server>;
}

interface Server {
  close: () => any;
}
```

* `url` - A string path to navigate the browser to for the test.
* `injections` - An array of string paths to files to be injected alongside the test code. The paths are resolved relative to the current working directory (`cwd`) for injection unless absolute paths are used.
* `server` - A function to start a server in case one is needed to test your code. The function should return a `Promise` that resolves when the server is ready to accept requests. It should resolve with an object representing the server including a `close` method to shutdown the server once the test has concluded. Alternatively, you can start a server externally and then run your tests.
