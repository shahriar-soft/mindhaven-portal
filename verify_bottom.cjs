const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1280, height: 2000 });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000);

  // Try to find the emergency section and scroll to it
  const emergency = await page.$('#emergency');
  if (emergency) {
    await emergency.scrollIntoViewIfNeeded();
  } else {
    // If no ID, just scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  await page.screenshot({ path: 'homepage-bottom.png' });

  await browser.close();
})();
