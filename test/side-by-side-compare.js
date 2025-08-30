#!/usr/bin/env node
/**
 * Side-by-side visual comparison with pixel difference analysis
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

async function compareImplementations() {
  console.log('🔍 Side-by-side comparison of implementations\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--force-device-scale-factor=1']
  });
  
  // Create two browser contexts
  const context1 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  const context2 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  
  const pageOriginal = await context1.newPage();
  const pageOurs = await context2.newPage();
  
  console.log('Loading original at http://localhost:1234...');
  await pageOriginal.goto('http://localhost:1234', { waitUntil: 'networkidle' });
  
  console.log('Loading our implementation at http://localhost:34887...');
  await pageOurs.goto('http://localhost:34887', { waitUntil: 'networkidle' });
  
  // Scroll to text-as-graph sections
  await pageOriginal.evaluate(() => {
    const element = document.querySelector('#text-as-graph');
    if (element) element.scrollIntoView({ block: 'center' });
  });
  
  await pageOurs.evaluate(() => {
    const element = document.querySelector('#text-as-graph');
    if (element) element.scrollIntoView({ block: 'center' });
  });
  
  await pageOriginal.waitForTimeout(2000);
  await pageOurs.waitForTimeout(2000);
  
  // Test different input values
  const testInputs = [
    'Graphs are all around us',
    'Hello World',
    'GNN example',
    'A B C D E F',
    ''
  ];
  
  for (const testText of testInputs) {
    console.log(`\nTesting with: "${testText}"`);
    
    // Set the same text in both
    const inputOriginal = pageOriginal.locator('#text-as-graph input');
    const inputOurs = pageOurs.locator('#text-as-graph input');
    
    await inputOriginal.clear();
    await inputOriginal.fill(testText);
    await inputOurs.clear();
    await inputOurs.fill(testText);
    
    await pageOriginal.waitForTimeout(500);
    await pageOurs.waitForTimeout(500);
    
    // Get bounding boxes
    const bboxOriginal = await pageOriginal.locator('#text-as-graph').boundingBox();
    const bboxOurs = await pageOurs.locator('#text-as-graph').boundingBox();
    
    // Take screenshots
    const screenshotOriginal = await pageOriginal.screenshot({ 
      clip: bboxOriginal
    });
    
    const screenshotOurs = await pageOurs.screenshot({ 
      clip: bboxOurs
    });
    
    // Save screenshots
    const safeFileName = testText.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'empty';
    await fs.writeFile(`test/screenshots/compare-original-${safeFileName}.png`, screenshotOriginal);
    await fs.writeFile(`test/screenshots/compare-ours-${safeFileName}.png`, screenshotOurs);
    
    // Compare dimensions
    const img1 = PNG.sync.read(screenshotOriginal);
    const img2 = PNG.sync.read(screenshotOurs);
    
    console.log(`  Original size: ${img1.width}x${img1.height}`);
    console.log(`  Our size: ${img2.width}x${img2.height}`);
    
    // If same size, do pixel comparison
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
      
      const diffPercent = (numDiffPixels / (img1.width * img1.height)) * 100;
      console.log(`  Pixel difference: ${diffPercent.toFixed(2)}%`);
      
      // Save diff image
      await fs.writeFile(
        `test/screenshots/compare-diff-${safeFileName}.png`,
        PNG.sync.write(diff)
      );
    } else {
      console.log(`  ⚠️  Size mismatch - cannot compare pixels`);
    }
  }
  
  // Test hover interactions
  console.log('\n📊 Testing hover interactions...');
  
  // Reset to default text
  const inputOriginalReset = pageOriginal.locator('#text-as-graph input');
  const inputOursReset = pageOurs.locator('#text-as-graph input');
  await inputOriginalReset.clear();
  await inputOriginalReset.fill('Graphs are all around us');
  await inputOursReset.clear();
  await inputOursReset.fill('Graphs are all around us');
  await pageOriginal.waitForTimeout(500);
  await pageOurs.waitForTimeout(500);
  
  // Test hover on first word
  const inputOriginal2 = pageOriginal.locator('#text-as-graph input');
  const inputOurs2 = pageOurs.locator('#text-as-graph input');
  const inputBox1 = await inputOriginal2.boundingBox();
  const inputBox2 = await inputOurs2.boundingBox();
  
  if (inputBox1 && inputBox2) {
    await pageOriginal.mouse.move(inputBox1.x + 30, inputBox1.y + 15);
    await pageOurs.mouse.move(inputBox2.x + 30, inputBox2.y + 15);
    await pageOriginal.waitForTimeout(500);
    await pageOurs.waitForTimeout(500);
    
    // Get fresh bounding boxes for screenshots
    const bboxOriginal2 = await pageOriginal.locator('#text-as-graph').boundingBox();
    const bboxOurs2 = await pageOurs.locator('#text-as-graph').boundingBox();
    
    // Capture hover state
    const hoverScreenshot1 = await pageOriginal.screenshot({ clip: bboxOriginal2 });
    const hoverScreenshot2 = await pageOurs.screenshot({ clip: bboxOurs2 });
    
    await fs.writeFile('test/screenshots/compare-original-hover.png', hoverScreenshot1);
    await fs.writeFile('test/screenshots/compare-ours-hover.png', hoverScreenshot2);
    
    console.log('  Hover screenshots captured');
  }
  
  // Analyze DOM differences
  console.log('\n📋 DOM Structure Comparison:');
  
  const domOriginal = await pageOriginal.evaluate(() => {
    const container = document.querySelector('#text-as-graph');
    return {
      totalElements: container.querySelectorAll('*').length,
      svgs: container.querySelectorAll('svg').length,
      rects: container.querySelectorAll('rect').length,
      texts: container.querySelectorAll('text').length,
      divs: container.querySelectorAll('div').length,
      hasInput: !!container.querySelector('input'),
      inputVisible: container.querySelector('input')?.style.color !== 'transparent'
    };
  });
  
  const domOurs = await pageOurs.evaluate(() => {
    const container = document.querySelector('#text-as-graph');
    return {
      totalElements: container.querySelectorAll('*').length,
      svgs: container.querySelectorAll('svg').length,
      rects: container.querySelectorAll('rect').length,
      texts: container.querySelectorAll('text').length,
      divs: container.querySelectorAll('div').length,
      hasInput: !!container.querySelector('input'),
      inputVisible: container.querySelector('input')?.style.color !== 'transparent'
    };
  });
  
  console.log('\nOriginal:', domOriginal);
  console.log('Ours:', domOurs);
  
  console.log('\n✅ Comparison complete. Check test/screenshots/ for visual results.');
  
  await browser.close();
}

// Run comparison
compareImplementations()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });