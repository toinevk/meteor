var createPage = require('webpage').create;
var system = require('system');
var puppeteer = require('puppeteer');
var platform = system.args[1] || 'local';
var platformUrl = system.env.URL + platform;
var testUrls = [
  // Additional application URLs can be added here to re-run tests in
  // PhantomJS with different query parameter-based configurations.
  platformUrl
];

async function runNextUrl() {
  var url = testUrls.shift();
  if (!url) {
    await page.close();
    return;
  }

  console.log('Running Meteor tests in Puppeteer ' + url);

  // --no-sandbox and --disable-setuid-sandbox required for CI compability
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  console.log(await browser.version());
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(msg);
  });

  await page.goto(url);

  async function poll() {
    if (isDone(page)) {
      var failCount = getFailCount(page);
      if (failCount > 0) {
        await page.close();
        console.log('Complete with errors');
      } else {
        await page.close();
        setTimeout(runNextUrl, 1000);
      }
    } else {
      setTimeout(poll, 1000);
    }
  }

  poll();
}

function isDone(page) {
  return page.evaluate(function() {
    if (typeof TEST_STATUS !== 'undefined') {
      return TEST_STATUS.DONE;
    }

    return typeof DONE !== 'undefined' && DONE;
  });
}

function getFailCount(page) {
  return page.evaluate(function() {
    if (typeof TEST_STATUS !== 'undefined') {
      return TEST_STATUS.FAILURES;
    }

    if (typeof FAILURES === 'undefined') {
      return 1;
    }

    return 0;
  });
}

runNextUrl();
