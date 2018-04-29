async function runTests() {
  let page;

  if (process.env.phantom === true) {
    console.log('im here');
    const createPage = require('webpage').create;
    const system = require('system');
    const platform = system.args[1] || 'local';
    const platformUrl = system.env.URL + platform;
    const testUrls = [
      // Additional application URLs can be added here to re-run tests in
      // PhantomJS with different query parameter-based configurations.
      platformUrl
    ];

    console.log('Running Meteor tests in PhantomJS... ' + url);

    page = createPage();

    page.onConsoleMessage = function(message) {
      console.log(message);
    };

    page.open(url);
  } else {
    const puppeteer = require('puppeteer');

    console.log(`Running test with Puppeteer at ${process.env.URL}`);

    // --no-sandbox and --disable-setuid-sandbox must be disabled for CI compatibility
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    console.log(`Using version: ${await browser.version()}`);
    page = await browser.newPage();

    page.on('console', msg => {
      console.log(msg._text);
    });

    await page.goto(process.env.URL);
  }

  runNextUrl(page);
}

async function runNextUrl(page) {
  if (!process.env.URL) {
    // end process based on enviroment
    if (process.env.phantom === true) {
      phantom.exit(0);
    } else {
      await page.close();
      process.exit(0);
    }
    return;
  }

  async function poll() {
    if (await isDone(page)) {
      let failCount = await getFailCount(page);
      if (failCount > 0) {
        if (!process.env.URL) {
          // end process based on enviroment
          if (process.env.phantom === true) {
            phantom.exit(1);
          } else {
            await page.close();
            process.exit(1);
          }
        } else {
          await page.close();
          setTimeout(runNextUrl, 1000);
        }
      } else {
        setTimeout(poll, 1000);
      }
    }
  }

  poll();
}

async function isDone(page) {
  return await page.evaluate(function() {
    if (typeof TEST_STATUS !== 'undefined') {
      return TEST_STATUS.DONE;
    }

    return typeof DONE !== 'undefined' && DONE;
  });
}

async function getFailCount(page) {
  return await page.evaluate(function() {
    if (typeof TEST_STATUS !== 'undefined') {
      return TEST_STATUS.FAILURES;
    }

    if (typeof FAILURES === 'undefined') {
      return 1;
    }

    return 0;
  });
}

runTests();
