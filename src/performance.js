const Table = require('cli-table');
const fs = require('fs-extra');
const path = require('path');

async function recordPerformance(page) {

  const pageMetrics = await page.metrics();
  const pageTimings = await page.evaluate(() => {

    // eslint-disable-next-line no-undef
    const perfEntries = performance.getEntries();
    return JSON.parse(JSON.stringify(perfEntries));

  });

  const outputPath = path.join(process.cwd(), '.qunit-in-browser', 'performance.json');
  fs.outputJsonSync(outputPath, {
    pageMetrics,
    pageTimings,
  });

  const table = new Table({
    head: ['Perf Metric', 'Timestamp'],
  });
  table.push(
    ['First Paint', pageTimings.filter(timing => timing.name === 'first-paint').pop().startTime],
    ['First Contentful Paint', pageTimings.filter(timing => timing.name === 'first-contentful-paint').pop().startTime],
  );
  console.log(table.toString());

}

module.exports = {
  recordPerformance,
};
