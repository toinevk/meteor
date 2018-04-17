const puppeteer = require('puppeteer');

console.log(process.env.URL);
console.log("Running test with Puppeteer")

async function runNextUrl() {
  // --no-sandbox and --disable-setuid-sandbox must be disabled for CI compatibility
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  console.log(`Using version: ${await browser.version()}`);
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log(msg);
  });

  const url = "http://localhost:4096/"
  if (! url) {
    await page.close();
    await browser.close();
    return;
  }

  await page.goto(url);

  async function poll() {
    if (isDone(page)) {
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
  return page.evaluate(function () {
    if (typeof TEST_STATUS !== "undefined") {
      return TEST_STATUS.DONE;
    }

    return typeof DONE !== "undefined" && DONE;
  });
}

function getFailCount(page) {
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

runNextUrl();
