const puppeteer = require('puppeteer');

async function runNextUrl(browser) {
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log(msg);
  });

  
  if (!process.env.URL) {
    console.log('im here');
    await page.close();
    await browser.close();
    return;
  }

  await page.goto(process.env.URL);
  console.log('im here2');

  async function poll() {
    if (isDone(page)) {
      console.log('im herePoll');
      let failCount = getFailCount(page);
      if (failCount > 0) {
        await page.close();
        await browser.close();
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
  console.log('im isDone');
  return page.evaluate(function () {
    if (typeof TEST_STATUS !== "undefined") {
      return TEST_STATUS.DONE;
    }

    return typeof DONE !== "undefined" && DONE;
  });
}

function getFailCount(page) {
  console.log('im getFail');
  return page.evaluate(function () {
    if (typeof TEST_STATUS !== "undefined") {
      return TEST_STATUS.FAILURES;
    }

    if (typeof FAILURES === "undefined") {
      return 1;
    }

    return 0;
  });
}


async function runTests() {
  console.log(`Running test with Puppeteer at ${process.env.URL}`)

   // --no-sandbox and --disable-setuid-sandbox must be disabled for CI compatibility
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  console.log(`Using version: ${await browser.version()}`);
  runNextUrl(browser);
}

runTests();

