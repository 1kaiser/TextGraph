#!/usr/bin/env node
/**
 * Final side-by-side comparison of implementations
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

async function finalComparison() {
  console.log('📸 Final visual comparison...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--force-device-scale-factor=1']
  });
  
  const context1 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  const context2 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  
  const pageOriginal = await context1.newPage();
  const pageOurs = await context2.newPage();
  
  // Load both implementations
  console.log('Loading original...');
  await pageOriginal.goto('http://localhost:1234', { waitUntil: 'networkidle' });
  
  console.log('Loading our implementation...');
  await pageOurs.goto('http://localhost:34887', { waitUntil: 'networkidle' });
  
  // Navigate to text-as-graph in original
  await pageOriginal.evaluate(() => {
    const element = document.querySelector('#text-as-graph');
    if (element) element.scrollIntoView({ block: 'center' });
  });
  
  await pageOriginal.waitForTimeout(1000);
  await pageOurs.waitForTimeout(1000);
  
  // Capture both with default text
  const bboxOriginal = await pageOriginal.locator('#text-as-graph').boundingBox();
  const bboxOurs = await pageOurs.locator('#text-as-graph').boundingBox();
  
  console.log(`Original dimensions: ${bboxOriginal.width}x${bboxOriginal.height}`);
  console.log(`Our dimensions: ${bboxOurs.width}x${bboxOurs.height}`);
  
  const screenshotOriginal = await pageOriginal.screenshot({ 
    clip: bboxOriginal,
    path: 'test/screenshots/final-original.png'
  });
  
  const screenshotOurs = await pageOurs.screenshot({ 
    clip: bboxOurs,
    path: 'test/screenshots/final-ours.png'
  });
  
  // Test with different text
  const testText = 'Neural Networks';
  
  const inputOriginal = pageOriginal.locator('#text-as-graph input');
  const inputOurs = pageOurs.locator('#text-as-graph input');
  
  await inputOriginal.clear();
  await inputOriginal.fill(testText);
  await inputOurs.clear();
  await inputOurs.fill(testText);
  
  await pageOriginal.waitForTimeout(500);
  await pageOurs.waitForTimeout(500);
  
  await pageOriginal.screenshot({ 
    clip: bboxOriginal,
    path: 'test/screenshots/final-original-neural.png'
  });
  
  await pageOurs.screenshot({ 
    clip: bboxOurs,
    path: 'test/screenshots/final-ours-neural.png'
  });
  
  console.log('\n✅ Screenshots captured:');
  console.log('- final-original.png (default text)');
  console.log('- final-ours.png (default text)');
  console.log('- final-original-neural.png (Neural Networks)');
  console.log('- final-ours-neural.png (Neural Networks)');
  
  await browser.close();
}

finalComparison().catch(console.error);