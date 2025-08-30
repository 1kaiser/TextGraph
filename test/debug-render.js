#!/usr/bin/env node
/**
 * Debug script to check what's happening with rendering
 */

const { chromium } = require('playwright');

async function debugRender() {
  console.log('🔍 Debugging render issue...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser
    devtools: true    // Open devtools
  });
  
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('❌ Browser error:', text);
    } else {
      console.log('Browser console:', text);
    }
  });
  
  page.on('pageerror', err => console.error('❌ Page error:', err));
  
  // Load our implementation
  console.log('Loading http://localhost:43033...');
  await page.goto('http://localhost:43033', { waitUntil: 'networkidle' });
  
  // Wait a bit
  await page.waitForTimeout(2000);
  
  // Check the input value
  const inputValue = await page.evaluate(() => {
    const input = document.querySelector('#text-as-graph input');
    return input ? input.value : 'NO INPUT FOUND';
  });
  console.log('Input value:', inputValue);
  
  // Check how many words are being rendered
  const wordData = await page.evaluate(() => {
    const rects = document.querySelectorAll('#text-as-graph svg rect');
    const texts = document.querySelectorAll('#text-as-graph svg text');
    const visibleRects = Array.from(rects).filter(r => r.style.opacity !== '0' && r.getAttribute('opacity') !== '0');
    const visibleTexts = Array.from(texts).filter(t => t.style.opacity !== '0' && t.getAttribute('opacity') !== '0');
    
    return {
      totalRects: rects.length,
      visibleRects: visibleRects.length,
      totalTexts: texts.length,
      visibleTexts: visibleTexts.length,
      rectDetails: visibleRects.map(r => ({
        x: r.getAttribute('x'),
        width: r.getAttribute('width'),
        opacity: r.getAttribute('opacity') || r.style.opacity,
        fill: r.getAttribute('fill')
      })),
      textDetails: visibleTexts.map(t => ({
        text: t.textContent,
        x: t.getAttribute('x'),
        opacity: t.getAttribute('opacity') || t.style.opacity
      }))
    };
  });
  
  console.log('\nRendering details:');
  console.log('Total rects:', wordData.totalRects);
  console.log('Visible rects:', wordData.visibleRects);
  console.log('Total texts:', wordData.totalTexts);
  console.log('Visible texts:', wordData.visibleTexts);
  
  console.log('\nVisible rectangles:');
  wordData.rectDetails.forEach((r, i) => {
    console.log(`  Rect ${i}: x=${r.x}, width=${r.width}, opacity=${r.opacity}`);
  });
  
  console.log('\nVisible texts:');
  wordData.textDetails.forEach((t, i) => {
    console.log(`  Text ${i}: "${t.text}" at x=${t.x}, opacity=${t.opacity}`);
  });
  
  // Check if render function is being called
  await page.evaluate(() => {
    if (window.textAsGraphInstance) {
      console.log('TextAsGraph instance exists');
      // Try to manually trigger render
      if (window.textAsGraphInstance.render) {
        console.log('Calling render manually...');
        window.textAsGraphInstance.render();
      }
    } else {
      console.log('No TextAsGraph instance found on window');
    }
  });
  
  // Keep browser open for inspection
  console.log('\n⏸️  Browser will stay open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

// Run debug
debugRender()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });