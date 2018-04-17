const puppeteer = require('puppeteer');
const testUrls = [
  // Additional application URLs can be added here to re-run tests in
  // Puppeteer with different query parameter-based configurations.
  system.env.URL,
];

console.log(system.env.URL);
console.log("Running test with Puppeteer")

async function runTests() {
  // --no-sandbox and --disable-setuid-sandbox allow this to easily run in docker
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  console.log(await browser.version());
  const page = await browser.newPage();

  page.on('console', async (msg) => {
    console.log(message);
  });

  const url = testUrls.shift();
  if (! url) {
    await page.close();
    await browser.close();
    return;
  }

  await page.goto(url);
}

runTests();
