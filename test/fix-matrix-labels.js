#!/usr/bin/env node
/**
 * Test fix for matrix label visibility
 */

const { chromium } = require('playwright');

async function testFix() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  console.log('Loading implementation and applying fixes...');
  await page.goto('http://localhost:34887', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Apply CSS fixes to make labels visible
  await page.evaluate(() => {
    // Find the matrix SVG (second one)
    const svgs = document.querySelectorAll('#text-as-graph svg');
    if (svgs.length > 1) {
      const matrixSvg = svgs[1];
      
      // Ensure SVG has overflow visible
      matrixSvg.style.overflow = 'visible';
      
      // Add padding to the SVG to accommodate labels
      matrixSvg.setAttribute('width', '200');
      matrixSvg.setAttribute('height', '200');
      
      // Move all content inside the SVG to make room for labels
      const rects = matrixSvg.querySelectorAll('rect');
      const texts = matrixSvg.querySelectorAll('text');
      
      // Shift rectangles to make room for side labels
      rects.forEach(rect => {
        const transform = rect.getAttribute('transform');
        if (transform) {
          // Parse and adjust transform
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            const x = parseFloat(match[1]) + 50;  // Add offset for labels
            const y = parseFloat(match[2]) + 20;  // Add offset for top labels
            rect.setAttribute('transform', `translate(${x}, ${y})`);
          }
        }
      });
      
      // Adjust text label positions
      texts.forEach(text => {
        const className = text.className.baseVal;
        const transform = text.getAttribute('transform');
        
        if (className === 'top' && transform) {
          // Adjust top labels
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            const x = parseFloat(match[1]) + 50;
            text.setAttribute('transform', `translate(${x}, 15) rotate(-90)`);
          }
        } else if (className === 'side' && transform) {
          // Adjust side labels
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            const y = parseFloat(match[2]) + 20;
            text.setAttribute('transform', `translate(45, ${y})`);
          }
        }
      });
      
      console.log('Applied fixes to matrix SVG');
    }
  });
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test/screenshots/matrix-labels-fixed.png',
    fullPage: true
  });
  
  console.log('Screenshot saved to test/screenshots/matrix-labels-fixed.png');
  console.log('Browser will stay open for inspection...');
  
  await page.waitForTimeout(20000);
  await browser.close();
}

testFix().catch(console.error);