#!/usr/bin/env node
/**
 * Visual comparison test using Playwright
 * Compares our implementation with the original Distill version
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const ORIGINAL_URL = 'http://localhost:1234';  // Distill original
const OUR_URL = 'http://localhost:35417';      // Our implementation

async function compareImplementations() {
  console.log('🔍 Starting visual comparison test...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--force-device-scale-factor=1']
  });
  
  // Test configurations
  const tests = [
    {
      name: 'default',
      text: 'Graphs are all around us',
      action: null
    },
    {
      name: 'short-text',
      text: 'Hello World',
      action: null
    },
    {
      name: 'long-text',
      text: 'This is a longer text sample',
      action: null
    },
    {
      name: 'hover-input',
      text: 'Test hover',
      action: async (page) => {
        const input = page.locator('#text-as-graph input');
        const box = await input.boundingBox();
        await page.mouse.move(box.x + 50, box.y + 15);
        await page.waitForTimeout(500);
      }
    },
    {
      name: 'hover-matrix',
      text: 'Matrix test',
      action: async (page) => {
        const matrix = page.locator('#text-as-graph svg').last();
        const box = await matrix.boundingBox();
        if (box) {
          await page.mouse.move(box.x + 30, box.y + 30);
          await page.waitForTimeout(500);
        }
      }
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`📸 Testing: ${test.name}`);
    
    // Create two pages for comparison
    const context1 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
    const context2 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Load both implementations
    await page1.goto(ORIGINAL_URL, { waitUntil: 'networkidle' });
    await page2.goto(OUR_URL, { waitUntil: 'networkidle' });
    
    // Navigate to text-as-graph section
    await page1.evaluate(() => {
      const element = document.querySelector('#text-as-graph');
      if (element) element.scrollIntoView({ block: 'center' });
    });
    
    await page2.evaluate(() => {
      const element = document.querySelector('#text-as-graph');
      if (element) element.scrollIntoView({ block: 'center' });
    });
    
    await page1.waitForTimeout(1000);
    await page2.waitForTimeout(1000);
    
    // Set the same text
    const input1 = page1.locator('#text-as-graph input');
    const input2 = page2.locator('#text-as-graph input');
    
    await input1.clear();
    await input1.fill(test.text);
    await input2.clear();
    await input2.fill(test.text);
    
    await page1.waitForTimeout(500);
    await page2.waitForTimeout(500);
    
    // Perform any additional actions
    if (test.action) {
      await test.action(page1);
      await test.action(page2);
    }
    
    // Take screenshots
    const bbox1 = await page1.locator('#text-as-graph').boundingBox();
    const bbox2 = await page2.locator('#text-as-graph').boundingBox();
    
    const screenshot1 = await page1.screenshot({ 
      clip: bbox1,
      path: `test/screenshots/original-${test.name}.png`
    });
    
    const screenshot2 = await page2.screenshot({ 
      clip: bbox2,
      path: `test/screenshots/our-${test.name}.png`
    });
    
    // Compare images
    const img1 = PNG.sync.read(screenshot1);
    const img2 = PNG.sync.read(screenshot2);
    
    // Ensure same dimensions
    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);
    
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    
    const diffPercent = (numDiffPixels / (width * height)) * 100;
    
    // Save diff image
    await fs.writeFile(
      `test/screenshots/diff-${test.name}.png`,
      PNG.sync.write(diff)
    );
    
    results.push({
      name: test.name,
      diffPixels: numDiffPixels,
      diffPercent: diffPercent.toFixed(2),
      passed: diffPercent < 5  // Less than 5% difference
    });
    
    console.log(`  ✓ Difference: ${diffPercent.toFixed(2)}%`);
    
    await context1.close();
    await context2.close();
  }
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log('─'.repeat(50));
  
  let allPassed = true;
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.diffPercent}% difference`);
    if (!result.passed) allPassed = false;
  }
  
  console.log('─'.repeat(50));
  
  if (allPassed) {
    console.log('✨ All visual tests passed!');
  } else {
    console.log('⚠️ Some visual tests failed. Check the diff images.');
  }
  
  await browser.close();
  return allPassed;
}

// Run the test
compareImplementations()
  .then(passed => process.exit(passed ? 0 : 1))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });