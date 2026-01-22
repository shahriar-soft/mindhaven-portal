const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto('http://localhost:8080');

  // Click the Emergency Resources link
  await page.click('text=Emergency Resources');

  // Wait for dialog content
  await page.waitForSelector('text=999');
  await page.waitForSelector('text=Crisis Text Line');

  // Take screenshot of the open dialog
  await page.screenshot({ path: 'emergency-dialog-v2.png' });

  // Close dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Find Success Stories button
  const successStories = page.locator('text=Read Success Stories').first();
  await successStories.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'homepage-success-stories-btn-v2.png' });

  await browser.close();
})();
