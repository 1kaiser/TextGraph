#!/usr/bin/env node
/**
 * Inspect matrix labels using specific selectors
 */

const { chromium } = require('playwright');

async function inspectMatrixLabels() {
  console.log('🔍 Inspecting matrix labels with specific selectors...\n');
  
  const browser = await chromium.launch({ headless: false, devtools: true });
  
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
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
  
  // Test the specific selector
  const originalInspection = await pageOriginal.evaluate(() => {
    const selector = "#text-as-graph > svg > text:nth-child(35)";
    const element = document.querySelector(selector);
    
    // Also check all matrix text elements
    const allTexts = document.querySelectorAll('#text-as-graph svg text');
    const matrixSvg = document.querySelectorAll('#text-as-graph svg')[1]; // Second SVG should be matrix
    const matrixTexts = matrixSvg ? matrixSvg.querySelectorAll('text') : [];
    
    return {
      specificElement: element ? {
        content: element.textContent,
        x: element.getAttribute('x'),
        y: element.getAttribute('y'),
        transform: element.getAttribute('transform'),
        class: element.className.baseVal,
        visible: window.getComputedStyle(element).visibility !== 'hidden'
      } : null,
      totalTexts: allTexts.length,
      matrixTexts: Array.from(matrixTexts).map(t => ({
        content: t.textContent,
        class: t.className.baseVal,
        transform: t.getAttribute('transform'),
        fill: t.getAttribute('fill'),
        visible: window.getComputedStyle(t).visibility !== 'hidden'
      })),
      matrixSvgInfo: matrixSvg ? {
        width: matrixSvg.getAttribute('width'),
        height: matrixSvg.getAttribute('height'),
        position: window.getComputedStyle(matrixSvg).position,
        overflow: window.getComputedStyle(matrixSvg).overflow
      } : null
    };
  });
  
  const oursInspection = await pageOurs.evaluate(() => {
    const selector = "#text-as-graph > svg > text:nth-child(35)";
    const element = document.querySelector(selector);
    
    // Check all matrix text elements
    const allTexts = document.querySelectorAll('#text-as-graph svg text');
    const matrixSvg = document.querySelectorAll('#text-as-graph svg')[1]; // Second SVG should be matrix
    const matrixTexts = matrixSvg ? matrixSvg.querySelectorAll('text') : [];
    
    return {
      specificElement: element ? {
        content: element.textContent,
        x: element.getAttribute('x'),
        y: element.getAttribute('y'),
        transform: element.getAttribute('transform'),
        class: element.className.baseVal,
        visible: window.getComputedStyle(element).visibility !== 'hidden'
      } : null,
      totalTexts: allTexts.length,
      matrixTexts: Array.from(matrixTexts).map(t => ({
        content: t.textContent,
        class: t.className.baseVal,
        transform: t.getAttribute('transform'),
        fill: t.getAttribute('fill'),
        visible: window.getComputedStyle(t).visibility !== 'hidden'
      })),
      matrixSvgInfo: matrixSvg ? {
        width: matrixSvg.getAttribute('width'),
        height: matrixSvg.getAttribute('height'),
        position: window.getComputedStyle(matrixSvg).position,
        overflow: window.getComputedStyle(matrixSvg).overflow
      } : null
    };
  });
  
  console.log('📊 ORIGINAL Implementation:');
  console.log(`Total text elements: ${originalInspection.totalTexts}`);
  console.log(`Matrix texts: ${originalInspection.matrixTexts.length}`);
  console.log('Matrix SVG info:', originalInspection.matrixSvgInfo);
  
  console.log('\nMatrix text elements:');
  originalInspection.matrixTexts.forEach((t, i) => {
    console.log(`  ${i}: "${t.content}" (${t.class}) - visible: ${t.visible}`);
  });
  
  console.log('\n📊 OUR Implementation:');
  console.log(`Total text elements: ${oursInspection.totalTexts}`);
  console.log(`Matrix texts: ${oursInspection.matrixTexts.length}`);
  console.log('Matrix SVG info:', oursInspection.matrixSvgInfo);
  
  console.log('\nMatrix text elements:');
  oursInspection.matrixTexts.forEach((t, i) => {
    console.log(`  ${i}: "${t.content}" (${t.class}) - visible: ${t.visible}`);
  });
  
  if (originalInspection.specificElement) {
    console.log('\n🎯 Specific element (#text-as-graph > svg > text:nth-child(35)):');
    console.log('Original:', originalInspection.specificElement);
  }
  
  if (oursInspection.specificElement) {
    console.log('Ours:', oursInspection.specificElement);
  } else {
    console.log('Ours: Element not found');
  }
  
  console.log('\nBrowser will stay open for manual inspection...');
  await pageOriginal.waitForTimeout(10000);
  await pageOurs.waitForTimeout(10000);
  
  await browser.close();
}

inspectMatrixLabels().catch(console.error);