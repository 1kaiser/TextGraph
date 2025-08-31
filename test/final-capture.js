#!/usr/bin/env node
/**
 * Final capture for comparison
 */

const { chromium } = require('playwright');

async function finalCapture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing our implementation at http://localhost:41773...');
  
  page.on('console', msg => console.log('Console:', msg.text()));
  page.on('pageerror', err => console.error('Error:', err.message));
  
  await page.goto('http://localhost:41773', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const analysis = await page.evaluate(() => {
    const container = document.querySelector('#text-as-graph');
    return {
      exists: !!container,
      innerHTML: container ? container.innerHTML.substring(0, 200) : 'No container'
    };
  });
  
  console.log('Analysis:', analysis);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test/screenshots/current-implementation.png',
    fullPage: true
  });
  
  console.log('Screenshot saved');
  
  await browser.close();
}

finalCapture().catch(console.error);