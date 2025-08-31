#!/usr/bin/env node
/**
 * Analyze MathJax's role in text rectangle sizing
 */

const { chromium } = require('playwright');

async function analyzeMathjaxRectangles() {
  console.log('🔬 Analyzing MathJax impact on rectangle sizing...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Load original with MathJax
  console.log('Loading original implementation...');
  await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
  
  // Navigate to text-as-graph
  await page.evaluate(() => {
    const element = document.querySelector('#text-as-graph');
    if (element) element.scrollIntoView({ block: 'center' });
  });
  
  await page.waitForTimeout(2000);
  
  // Analyze character width calculation and rectangle sizing
  const mathjaxAnalysis = await page.evaluate(() => {
    // Check if MathJax is available
    const hasMathJax = typeof MathJax !== 'undefined';
    const mathJaxVersion = hasMathJax ? MathJax.version : null;
    
    // Analyze the character width calculation
    const input = document.querySelector('#text-as-graph input');
    const inputStyles = window.getComputedStyle(input);
    
    // Create test span to measure character width like the original does
    const testSpan = document.createElement('span');
    testSpan.textContent = 'x';
    testSpan.style.fontFamily = inputStyles.fontFamily;
    testSpan.style.fontSize = inputStyles.fontSize;
    testSpan.style.position = 'absolute';
    testSpan.style.visibility = 'hidden';
    document.body.appendChild(testSpan);
    
    const charWidth = testSpan.offsetWidth;
    document.body.removeChild(testSpan);
    
    // Analyze each word rectangle
    const words = input.value.split(' ');
    const rects = document.querySelectorAll('#text-as-graph svg rect[opacity="1"]');
    
    const wordAnalysis = words.map((word, i) => {
      const rect = rects[i];
      if (!rect) return null;
      
      return {
        word: word,
        expectedWidth: word.length * charWidth,
        actualWidth: parseFloat(rect.getAttribute('width')),
        rectX: parseFloat(rect.getAttribute('x')),
        charCount: word.length,
        charWidth: charWidth
      };
    }).filter(Boolean);
    
    // Check font rendering differences
    const fontInfo = {
      fontFamily: inputStyles.fontFamily,
      fontSize: inputStyles.fontSize,
      fontWeight: inputStyles.fontWeight,
      letterSpacing: inputStyles.letterSpacing,
      wordSpacing: inputStyles.wordSpacing
    };
    
    return {
      hasMathJax,
      mathJaxVersion,
      charWidth,
      fontInfo,
      wordAnalysis,
      totalWords: words.length,
      totalRects: rects.length
    };
  });
  
  console.log('📊 MathJax Analysis Results:');
  console.log(`MathJax Present: ${mathjaxAnalysis.hasMathJax}`);
  console.log(`MathJax Version: ${mathjaxAnalysis.mathJaxVersion}`);
  console.log(`Character Width: ${mathjaxAnalysis.charWidth}px`);
  console.log('\nFont Information:');
  Object.entries(mathjaxAnalysis.fontInfo).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('\nWord Rectangle Analysis:');
  mathjaxAnalysis.wordAnalysis.forEach((word, i) => {
    const widthDiff = word.actualWidth - word.expectedWidth;
    console.log(`  "${word.word}": ${word.charCount} chars × ${word.charWidth}px = ${word.expectedWidth}px expected, ${word.actualWidth}px actual (${widthDiff > 0 ? '+' : ''}${widthDiff}px)`);
  });
  
  // Test our implementation for comparison
  console.log('\n🔄 Comparing with our implementation...');
  
  const pageOurs = await browser.newPage();
  await pageOurs.goto('http://localhost:41773', { waitUntil: 'networkidle' });
  await pageOurs.waitForTimeout(1000);
  
  const ourAnalysis = await pageOurs.evaluate(() => {
    // Check if MathJax is available
    const hasMathJax = typeof MathJax !== 'undefined';
    
    const input = document.querySelector('#text-as-graph input');
    if (!input) return { error: 'No input found' };
    
    const inputStyles = window.getComputedStyle(input);
    
    // Create test span to measure character width
    const testSpan = document.createElement('span');
    testSpan.textContent = 'x';
    testSpan.style.fontFamily = inputStyles.fontFamily;
    testSpan.style.fontSize = inputStyles.fontSize;
    testSpan.style.position = 'absolute';
    testSpan.style.visibility = 'hidden';
    document.body.appendChild(testSpan);
    
    const charWidth = testSpan.offsetWidth;
    document.body.removeChild(testSpan);
    
    // Analyze rectangles
    const words = input.value.split(' ');
    const rects = document.querySelectorAll('#text-as-graph svg rect[data-index]');
    
    const wordAnalysis = words.map((word, i) => {
      const rect = Array.from(rects).find(r => r.getAttribute('data-index') == i);
      if (!rect) return null;
      
      return {
        word: word,
        expectedWidth: word.length * charWidth,
        actualWidth: parseFloat(rect.getAttribute('width')),
        rectX: parseFloat(rect.getAttribute('x')),
        charCount: word.length,
        charWidth: charWidth
      };
    }).filter(Boolean);
    
    return {
      hasMathJax,
      charWidth,
      fontInfo: {
        fontFamily: inputStyles.fontFamily,
        fontSize: inputStyles.fontSize,
        wordSpacing: inputStyles.wordSpacing
      },
      wordAnalysis,
      totalWords: words.length,
      totalRects: rects.length
    };
  });
  
  console.log('\n📊 Our Implementation Analysis:');
  console.log(`MathJax Present: ${ourAnalysis.hasMathJax || false}`);
  console.log(`Character Width: ${ourAnalysis.charWidth}px`);
  
  if (ourAnalysis.wordAnalysis) {
    console.log('\nOur Word Rectangle Analysis:');
    ourAnalysis.wordAnalysis.forEach((word, i) => {
      const widthDiff = word.actualWidth - word.expectedWidth;
      console.log(`  "${word.word}": ${word.charCount} chars × ${word.charWidth}px = ${word.expectedWidth}px expected, ${word.actualWidth}px actual (${widthDiff > 0 ? '+' : ''}${widthDiff}px)`);
    });
  }
  
  // Compare character width calculations
  console.log('\n🔍 Character Width Comparison:');
  console.log(`Original char width: ${mathjaxAnalysis.charWidth}px`);
  console.log(`Our char width: ${ourAnalysis.charWidth}px`);
  console.log(`Difference: ${Math.abs(mathjaxAnalysis.charWidth - ourAnalysis.charWidth)}px`);
  
  console.log('\nBrowser will stay open for inspection...');
  await page.waitForTimeout(15000);
  
  await browser.close();
}

analyzeMathjaxRectangles().catch(console.error);