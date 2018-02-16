const Table = require('cli-table');
const fs = require('fs-extra');
const path = require('path');

function calculateUsage(coverage) {

  let totalBytes = 0;
  let usedBytes = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const entry of coverage) {

    totalBytes += entry.text.length;

    // eslint-disable-next-line no-restricted-syntax
    for (const range of entry.ranges) {

      usedBytes += range.end - range.start - 1;

    }

  }

  const percentUsed = totalBytes === 0 ? 100 : ((usedBytes / totalBytes) * 100);

  return {
    totalBytes,
    usedBytes,
    percentUsed,
  };

}

function startRecordingCodeUsage(page) {

  return Promise.all([
    page.coverage.startCSSCoverage(),
    page.coverage.startJSCoverage(),
  ]);

}

async function stopRecordingCodeUsage(page) {

  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ]);

  const codeUsage = {
    js: calculateUsage(jsCoverage),
    css: calculateUsage(cssCoverage),
  };

  const outputPath = path.join(process.cwd(), '.qunit-in-browser', 'code-usage.json');
  fs.outputJsonSync(outputPath, codeUsage);

  const table = new Table({
    head: ['Code Usage', 'Total Bytes', 'Used Bytes', 'Percentage Used'],
  });
  table.push(
    ['JS', codeUsage.js.totalBytes, codeUsage.js.usedBytes, codeUsage.js.percentUsed],
    ['CSS', codeUsage.css.totalBytes, codeUsage.css.usedBytes, codeUsage.css.percentUsed],
  );
  console.log(table.toString());

}

module.exports = {
  startRecordingCodeUsage,
  stopRecordingCodeUsage,
};

