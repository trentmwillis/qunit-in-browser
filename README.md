# QUnit-In-Browser

QUnit-In-Browser is a plugin for [QUnit](http://qunitjs.com/)'s CLI that enables you to easily test applications in a web browser. It allows you to write QUnit tests that can run against an actual webpage by being injected into the runtime. This enables you to use the same tools for your end-to-end tests that you are already using for your unit tests!

## Example

```js
QUnit.test.inBrowser('Home page successfully renders', 'https://localhost:8000/', function(assert) {
  const content = document.getElementById('content');
  assert.ok(content, 'main content is rendered!');
});
```

## Todo

The following are the features to implement before an initial release:

1. Ability to inject user-specified files into the runtime (primarily helper code)
2. Basic debugging support (should pause execution when a debugger is in the test code)
3. Detailed test feedback (we have all the test run info, we should present it to the user)
4. Tests for the codebase
