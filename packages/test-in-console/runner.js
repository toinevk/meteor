const puppeteer = require('puppeteer');

console.log("Running test with Puppeteer")

async function runTests() {
  // --no-sandbox and --disable-setuid-sandbox allow this to easily run in docker
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  console.log(await browser.version());
  const page = await browser.newPage();

  // console message args come in as handles, use this to evaluate them all
  async function evaluateHandles (msg) {
    return (await Promise.all(msg.args().map(arg => page.evaluate(h => h.toString(), arg))))
      .join(' ');
  }

  page.on('console', async (msg) => {
    // this is racy but how else to do it?
    const testsAreRunning = await page.evaluate('window.testsAreRunning');
    if (msg.type() === 'error' && !testsAreRunning) {
      stderr(await evaluateHandles(msg));
    } else {
      stdout(await evaluateHandles(msg));
    }
  });

  await page.goto(process.env.ROOT_URL);
}

runTests();
