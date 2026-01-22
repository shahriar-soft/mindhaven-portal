const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Taking screenshot of Homepage (Emergency section)...');
  await page.goto('http://localhost:8080');
  await page.evaluate(() => {
    document.getElementById('emergency')?.scrollIntoView();
  });
  await page.screenshot({ path: 'homepage-emergency.png' });

  console.log('Taking screenshot of Breathing page...');
  await page.goto('http://localhost:8080/breathing');
  await page.waitForTimeout(1000); // Wait for animation
  await page.screenshot({ path: 'breathing.png' });

  console.log('Taking screenshot of Wellness Tips page...');
  await page.goto('http://localhost:8080/wellness-tips');
  await page.screenshot({ path: 'wellness-tips.png' });

  console.log('Taking screenshot of Success Stories page...');
  await page.goto('http://localhost:8080/success-stories');
  await page.screenshot({ path: 'success-stories.png' });

  await browser.close();
  console.log('Screenshots taken successfully.');
})();
