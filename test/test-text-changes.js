#!/usr/bin/env node
/**
 * Test text changes in both implementations
 */

const { chromium } = require('playwright');

async function testTextChanges() {
  console.log('🔄 Testing text changes in both implementations...\n');
  
  const browser = await chromium.launch({ headless: true });
  
  const context1 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  const context2 = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  
  const pageOriginal = await context1.newPage();
  const pageOurs = await context2.newPage();
  
  // Load both implementations
  await pageOriginal.goto('http://localhost:1234', { waitUntil: 'networkidle' });
  await pageOurs.goto('http://localhost:41773', { waitUntil: 'networkidle' });
  
  // Navigate to text-as-graph in original
  await pageOriginal.evaluate(() => {
    const element = document.querySelector('#text-as-graph');
    if (element) element.scrollIntoView({ block: 'center' });
  });
  
  await pageOriginal.waitForTimeout(1000);
  await pageOurs.waitForTimeout(1000);
  
  // Test different sentences
  const testSentences = [
    'Machine Learning Models',
    'AI Neural Networks',
    'Deep Learning',
    'Graph Neural Networks',
    'Hello World Test'
  ];
  
  for (const sentence of testSentences) {
    console.log(`\nTesting: "${sentence}"`);
    
    // Change text in both
    const inputOriginal = pageOriginal.locator('#text-as-graph input');
    const inputOurs = pageOurs.locator('#text-as-graph input');
    
    await inputOriginal.clear();
    await inputOriginal.fill(sentence);
    await inputOurs.clear();
    await inputOurs.fill(sentence);
    
    await pageOriginal.waitForTimeout(500);
    await pageOurs.waitForTimeout(500);
    
    // Analyze changes
    const analysisOriginal = await pageOriginal.evaluate(() => {
      const container = document.querySelector('#text-as-graph');
      const input = container.querySelector('input');
      const rects = container.querySelectorAll('rect');
      const visibleRects = Array.from(rects).filter(r => 
        r.getAttribute('opacity') === '1' || r.style.opacity === '1');
      const matrixCells = container.querySelectorAll('svg:last-child rect');
      
      return {
        inputValue: input.value,
        totalRects: rects.length,
        visibleRects: visibleRects.length,
        matrixCells: matrixCells.length,
        wordCount: input.value.split(' ').length
      };
    });
    
    const analysisOurs = await pageOurs.evaluate(() => {
      const container = document.querySelector('#text-as-graph');
      const input = container.querySelector('input');
      const rects = container.querySelectorAll('rect');
      const visibleRects = Array.from(rects).filter(r => 
        r.getAttribute('opacity') === '1' || r.style.opacity === '1');
      const matrixCells = container.querySelectorAll('svg:last-child rect');
      
      return {
        inputValue: input ? input.value : 'NO INPUT',
        totalRects: rects.length,
        visibleRects: visibleRects.length,
        matrixCells: matrixCells.length,
        wordCount: input ? input.value.split(' ').length : 0,
        hasInput: !!input
      };
    });
    
    console.log(`  Original: ${analysisOriginal.wordCount} words → ${analysisOriginal.visibleRects} rects, ${analysisOriginal.matrixCells} matrix cells`);
    console.log(`  Ours: ${analysisOurs.wordCount} words → ${analysisOurs.visibleRects} rects, ${analysisOurs.matrixCells} matrix cells`);
    
    if (!analysisOurs.hasInput) {
      console.log(`  ❌ Our implementation has no input element!`);
    }
    
    // Take screenshots for this test
    const safeFileName = sentence.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const bboxOriginal = await pageOriginal.locator('#text-as-graph').boundingBox();
    const bboxOurs = await pageOurs.locator('#text-as-graph').boundingBox();
    
    await pageOriginal.screenshot({ 
      clip: bboxOriginal,
      path: `test/screenshots/test-original-${safeFileName}.png`
    });
    
    await pageOurs.screenshot({ 
      clip: bboxOurs,
      path: `test/screenshots/test-ours-${safeFileName}.png`
    });
  }
  
  console.log('\n✅ Text change testing complete. Screenshots saved for each test.');
  
  await browser.close();
}

testTextChanges().catch(console.error);