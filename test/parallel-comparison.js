#!/usr/bin/env node
/**
 * Parallel visual comparison test using multiple workers
 * Compares our implementation with the original Distill version
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const ORIGINAL_URL = 'http://localhost:1234';  // Distill original
const OUR_URL = 'http://localhost:43033';      // Our implementation
const NUM_WORKERS = 4;  // Number of parallel workers

// Test configurations
const testCases = [
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
    text: 'This is a longer text sample that will create more nodes',
    action: null
  },
  {
    name: 'special-chars',
    text: 'Test! With? Special# Characters.',
    action: null
  },
  {
    name: 'hover-first-word',
    text: 'Hover test example',
    action: async (page) => {
      const input = page.locator('#text-as-graph input');
      const box = await input.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 20, box.y + 15);
        await page.waitForTimeout(500);
      }
    }
  },
  {
    name: 'hover-matrix-cell',
    text: 'Matrix hover test',
    action: async (page) => {
      const matrix = page.locator('#text-as-graph svg').last();
      const box = await matrix.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 50, box.y + 50);
        await page.waitForTimeout(500);
      }
    }
  },
  {
    name: 'empty-text',
    text: '',
    action: null
  },
  {
    name: 'single-word',
    text: 'Word',
    action: null
  }
];

async function processTestCase(browser, testCase, workerId) {
  console.log(`[Worker ${workerId}] 📸 Testing: ${testCase.name}`);
  
  const context1 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  const context2 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  
  try {
    // Load both implementations
    await page1.goto(ORIGINAL_URL, { waitUntil: 'networkidle' });
    await page2.goto(OUR_URL, { waitUntil: 'networkidle' });
    
    // Navigate to text-as-graph section in original
    await page1.evaluate(() => {
      const element = document.querySelector('#text-as-graph');
      if (element) element.scrollIntoView({ block: 'center' });
    });
    
    // Our implementation has it directly
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
    await input1.fill(testCase.text);
    await input2.clear();
    await input2.fill(testCase.text);
    
    await page1.waitForTimeout(500);
    await page2.waitForTimeout(500);
    
    // Perform any additional actions
    if (testCase.action) {
      await testCase.action(page1);
      await testCase.action(page2);
    }
    
    // Take screenshots of just the visualization area
    const bbox1 = await page1.locator('#text-as-graph').boundingBox();
    const bbox2 = await page2.locator('#text-as-graph').boundingBox();
    
    const screenshot1Path = `test/screenshots/original-${testCase.name}.png`;
    const screenshot2Path = `test/screenshots/our-${testCase.name}.png`;
    
    await page1.screenshot({ 
      clip: bbox1,
      path: screenshot1Path
    });
    
    await page2.screenshot({ 
      clip: bbox2,
      path: screenshot2Path
    });
    
    // Compare images
    const img1Data = await fs.readFile(screenshot1Path);
    const img2Data = await fs.readFile(screenshot2Path);
    
    const img1 = PNG.sync.read(img1Data);
    const img2 = PNG.sync.read(img2Data);
    
    let diffPercent = 100;
    let sizeMismatch = false;
    
    if (img1.width === img2.width && img1.height === img2.height) {
      const diff = new PNG({ width: img1.width, height: img1.height });
      
      const numDiffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        img1.width,
        img1.height,
        { threshold: 0.1 }
      );
      
      diffPercent = (numDiffPixels / (img1.width * img1.height)) * 100;
      
      // Save diff image
      await fs.writeFile(
        `test/screenshots/diff-${testCase.name}.png`,
        PNG.sync.write(diff)
      );
    } else {
      sizeMismatch = true;
      console.log(`[Worker ${workerId}]   ⚠️  Size mismatch - Original: ${img1.width}x${img1.height}, Our: ${img2.width}x${img2.height}`);
    }
    
    const result = {
      name: testCase.name,
      diffPercent: diffPercent.toFixed(2),
      passed: diffPercent < 5,
      sizeMismatch
    };
    
    if (!sizeMismatch) {
      console.log(`[Worker ${workerId}]   ✓ Difference: ${diffPercent.toFixed(2)}%`);
    }
    
    return result;
    
  } finally {
    await context1.close();
    await context2.close();
  }
}

async function runParallelTests() {
  console.log(`🚀 Starting parallel visual comparison with ${NUM_WORKERS} workers...\n`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--force-device-scale-factor=1']
  });
  
  // Split test cases among workers
  const testsPerWorker = Math.ceil(testCases.length / NUM_WORKERS);
  const workerPromises = [];
  
  for (let i = 0; i < NUM_WORKERS; i++) {
    const workerTests = testCases.slice(
      i * testsPerWorker,
      (i + 1) * testsPerWorker
    );
    
    if (workerTests.length > 0) {
      const workerPromise = (async () => {
        const results = [];
        for (const test of workerTests) {
          try {
            const result = await processTestCase(browser, test, i + 1);
            results.push(result);
          } catch (error) {
            console.error(`[Worker ${i + 1}] Error processing ${test.name}:`, error.message);
            results.push({
              name: test.name,
              diffPercent: 'ERROR',
              passed: false,
              error: error.message
            });
          }
        }
        return results;
      })();
      
      workerPromises.push(workerPromise);
    }
  }
  
  // Wait for all workers to complete
  const allResults = await Promise.all(workerPromises);
  const results = allResults.flat();
  
  // Print summary
  console.log('\n📊 Test Results Summary:');
  console.log('═'.repeat(60));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    const details = result.sizeMismatch 
      ? 'Size mismatch' 
      : result.error 
      ? `Error: ${result.error}`
      : `${result.diffPercent}% difference`;
    
    console.log(`${status} ${result.name.padEnd(20)} ${details}`);
    
    if (result.passed) totalPassed++;
    else totalFailed++;
  }
  
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${totalPassed}/${results.length}`);
  console.log(`❌ Failed: ${totalFailed}/${results.length}`);
  
  await browser.close();
  
  if (totalFailed === 0) {
    console.log('\n🎉 All visual tests passed!');
    return true;
  } else {
    console.log('\n⚠️  Some visual tests failed. Check the diff images in test/screenshots/');
    return false;
  }
}

// Run the parallel tests
runParallelTests()
  .then(passed => process.exit(passed ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });