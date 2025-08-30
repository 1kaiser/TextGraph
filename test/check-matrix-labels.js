#!/usr/bin/env node
/**
 * Debug script to check why matrix labels aren't showing
 */

const { chromium } = require('playwright');

async function checkMatrixLabels() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  console.log('Loading our implementation...');
  await page.goto('http://localhost:34887', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Check for matrix labels
  const matrixInfo = await page.evaluate(() => {
    const container = document.querySelector('#text-as-graph');
    const svgs = container.querySelectorAll('svg');
    
    const results = [];
    svgs.forEach((svg, i) => {
      const texts = svg.querySelectorAll('text');
      const topLabels = svg.querySelectorAll('text.top');
      const sideLabels = svg.querySelectorAll('text.side');
      
      results.push({
        svgIndex: i,
        totalTexts: texts.length,
        topLabels: topLabels.length,
        sideLabels: sideLabels.length,
        textContents: Array.from(texts).map(t => ({
          content: t.textContent,
          class: t.className.baseVal,
          transform: t.getAttribute('transform'),
          x: t.getAttribute('x'),
          y: t.getAttribute('y')
        }))
      });
    });
    
    return results;
  });
  
  console.log('\nMatrix Label Analysis:');
  matrixInfo.forEach(info => {
    console.log(`\nSVG ${info.svgIndex}:`);
    console.log(`  Total texts: ${info.totalTexts}`);
    console.log(`  Top labels: ${info.topLabels}`);
    console.log(`  Side labels: ${info.sideLabels}`);
    
    if (info.textContents.length > 0) {
      console.log('  Text elements:');
      info.textContents.forEach(t => {
        console.log(`    "${t.content}" - class: ${t.class}, transform: ${t.transform}`);
      });
    }
  });
  
  // Check the actual matrix SVG positioning
  const matrixPosition = await page.evaluate(() => {
    const svgs = document.querySelectorAll('#text-as-graph svg');
    if (svgs.length > 1) {
      const matrix = svgs[1];
      const rect = matrix.getBoundingClientRect();
      const styles = window.getComputedStyle(matrix);
      return {
        top: styles.top,
        left: styles.left,
        position: styles.position,
        width: rect.width,
        height: rect.height
      };
    }
    return null;
  });
  
  console.log('\nMatrix SVG positioning:', matrixPosition);
  
  console.log('\nBrowser will stay open for inspection...');
  await page.waitForTimeout(15000);
  
  await browser.close();
}

checkMatrixLabels().catch(console.error);