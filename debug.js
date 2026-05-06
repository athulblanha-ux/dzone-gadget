const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type().toUpperCase(), msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('BROWSER ERROR:', error.message);
  });
  
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.failure().errorText, request.url());
  });

  try {
    console.log('Navigating to http://localhost:3001 ...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Page loaded. Capturing HTML body...');
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('BODY LENGTH:', html.length);
    if (html.length < 500) {
      console.log('BODY IS VERY SMALL. IT MIGHT BE BLANK.');
    }
  } catch (err) {
    console.error('PUPPETEER ERROR:', err.message);
  } finally {
    await browser.close();
  }
})();
