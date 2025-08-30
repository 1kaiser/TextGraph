#!/usr/bin/env node
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('Console:', msg.text()));
  page.on('pageerror', err => console.error('Error:', err.message));
  
  await page.goto('http://localhost:34887', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const wordCount = await page.evaluate(() => {
    const words = document.querySelectorAll('#text-as-graph svg text');
    const visibleWords = Array.from(words).filter(w => 
      w.textContent && w.textContent !== '→' && w.textContent.trim() !== ''
    );
    return {
      total: words.length,
      visible: visibleWords.length,
      wordTexts: visibleWords.slice(0, 10).map(w => w.textContent)
    };
  });
  
  console.log('Word count:', wordCount);
  
  await page.screenshot({ path: 'test/screenshots/v2-test.png', fullPage: true });
  console.log('Screenshot saved to test/screenshots/v2-test.png');
  
  await browser.close();
})();