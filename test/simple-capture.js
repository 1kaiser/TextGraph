#!/usr/bin/env node
/**
 * Simple capture test to check our implementation
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

async function captureOurImplementation() {
  console.log('📸 Capturing our implementation...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Let's see what's happening
    args: ['--force-device-scale-factor=1']
  });
  
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', err => console.error('Browser error:', err));
  
  // Load our implementation
  console.log('Loading http://localhost:43033...');
  await page.goto('http://localhost:43033', { waitUntil: 'networkidle' });
  
  // Wait for the visualization to render
  await page.waitForTimeout(2000);
  
  // Check if the element exists
  const textAsGraph = await page.locator('#text-as-graph').count();
  console.log('Found #text-as-graph elements:', textAsGraph);
  
  // Check for any SVG elements
  const svgCount = await page.locator('#text-as-graph svg').count();
  console.log('Found SVG elements:', svgCount);
  
  // Check for input
  const inputCount = await page.locator('#text-as-graph input').count();
  console.log('Found input elements:', inputCount);
  
  // Get any error messages
  const errors = await page.evaluate(() => {
    const errorElements = document.querySelectorAll('.error, .exception');
    return Array.from(errorElements).map(el => el.textContent);
  });
  
  if (errors.length > 0) {
    console.log('Found errors:', errors);
  }
  
  // Take a screenshot
  await page.screenshot({ 
    fullPage: true,
    path: 'test/screenshots/our-implementation-debug.png'
  });
  
  console.log('\n✅ Screenshot saved to test/screenshots/our-implementation-debug.png');
  
  // Keep browser open for 5 seconds to observe
  await page.waitForTimeout(5000);
  
  await browser.close();
}

// Run the test
captureOurImplementation()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });