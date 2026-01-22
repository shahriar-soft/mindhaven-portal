const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');

  // Click the Emergency Resources link
  await page.click('text=Emergency Resources');

  // Wait for dialog to be visible
  await page.waitForSelector('text=Emergency Services');

  await page.screenshot({ path: 'emergency-dialog.png' });

  // Close dialog (press Escape or click outside)
  await page.keyboard.press('Escape');

  // Find the Success Stories button
  // It's in the Testimonials section
  const successStoriesBtn = await page.getByRole('button', { name: 'Read Success Stories' });
  if (await successStoriesBtn.isVisible()) {
    await successStoriesBtn.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'homepage-success-stories-btn.png' });
  } else {
    console.log('Success Stories button not found with getByRole, trying text search');
     const btn = await page.locator('button:has-text("Read Success Stories")');
     await btn.scrollIntoViewIfNeeded();
     await page.screenshot({ path: 'homepage-success-stories-btn.png' });
  }

  await browser.close();
})();
