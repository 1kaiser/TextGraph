#!/usr/bin/env node
/**
 * Deep analysis of the original Distill text-as-graph implementation
 * Extracts all event listeners, DOM structure, and interactive features
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

async function analyzeOriginal() {
  console.log('🔬 Analyzing original Distill implementation...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Navigate to original
  await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Scroll to text-as-graph section
  await page.evaluate(() => {
    const element = document.querySelector('#text-as-graph');
    if (element) element.scrollIntoView({ block: 'center' });
  });
  
  await page.waitForTimeout(1000);
  
  // Extract comprehensive implementation details
  const analysis = await page.evaluate(() => {
    const container = document.querySelector('#text-as-graph');
    if (!container) return { error: 'Container not found' };
    
    // Helper to get all event listeners on an element
    const getEventListeners = (element) => {
      // This would require Chrome DevTools Protocol
      // For now, we'll check standard events
      const events = [];
      const eventTypes = ['click', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'input', 'change', 'focus', 'blur'];
      
      eventTypes.forEach(type => {
        // Check if element responds to event
        const handler = element[`on${type}`];
        if (handler) {
          events.push(type);
        }
      });
      
      return events;
    };
    
    // Analyze DOM structure
    const analyzeDOM = (root) => {
      const structure = {
        tagName: root.tagName,
        id: root.id,
        className: root.className,
        children: [],
        attributes: {},
        styles: {},
        text: root.childNodes.length === 1 && root.childNodes[0].nodeType === 3 ? root.childNodes[0].textContent : null
      };
      
      // Get attributes
      for (let attr of root.attributes || []) {
        structure.attributes[attr.name] = attr.value;
      }
      
      // Get computed styles for key properties
      if (window.getComputedStyle) {
        const computed = window.getComputedStyle(root);
        const importantStyles = ['position', 'display', 'width', 'height', 'fontSize', 'fontFamily', 'color', 'backgroundColor', 'zIndex'];
        importantStyles.forEach(prop => {
          if (computed[prop]) {
            structure.styles[prop] = computed[prop];
          }
        });
      }
      
      // Recursively analyze children
      for (let child of root.children) {
        structure.children.push(analyzeDOM(child));
      }
      
      return structure;
    };
    
    // Find the input element
    const input = container.querySelector('input');
    const inputAnalysis = input ? {
      value: input.value,
      type: input.type,
      maxLength: input.maxLength,
      styles: {
        fontSize: window.getComputedStyle(input).fontSize,
        fontFamily: window.getComputedStyle(input).fontFamily,
        wordSpacing: window.getComputedStyle(input).wordSpacing,
        color: window.getComputedStyle(input).color,
        background: window.getComputedStyle(input).background,
        position: window.getComputedStyle(input).position,
        zIndex: window.getComputedStyle(input).zIndex
      },
      events: getEventListeners(input)
    } : null;
    
    // Find SVG elements
    const svgs = container.querySelectorAll('svg');
    const svgAnalysis = Array.from(svgs).map((svg, i) => ({
      index: i,
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      viewBox: svg.getAttribute('viewBox'),
      position: window.getComputedStyle(svg).position,
      transform: svg.getAttribute('transform'),
      childrenCount: svg.children.length,
      rectCount: svg.querySelectorAll('rect').length,
      textCount: svg.querySelectorAll('text').length,
      pathCount: svg.querySelectorAll('path').length,
      lineCount: svg.querySelectorAll('line').length
    }));
    
    // Analyze rectangles (word boxes)
    const rects = container.querySelectorAll('svg rect');
    const rectAnalysis = Array.from(rects).slice(0, 5).map(rect => ({
      x: rect.getAttribute('x'),
      y: rect.getAttribute('y'),
      width: rect.getAttribute('width'),
      height: rect.getAttribute('height'),
      fill: rect.getAttribute('fill'),
      stroke: rect.getAttribute('stroke'),
      rx: rect.getAttribute('rx'),
      ry: rect.getAttribute('ry'),
      opacity: rect.getAttribute('opacity') || window.getComputedStyle(rect).opacity
    }));
    
    // Analyze text elements
    const texts = container.querySelectorAll('svg text');
    const textAnalysis = Array.from(texts).slice(0, 10).map(text => ({
      content: text.textContent,
      x: text.getAttribute('x'),
      y: text.getAttribute('y'),
      fill: text.getAttribute('fill'),
      fontSize: text.getAttribute('font-size') || window.getComputedStyle(text).fontSize,
      fontFamily: text.getAttribute('font-family') || window.getComputedStyle(text).fontFamily,
      textAnchor: text.getAttribute('text-anchor'),
      transform: text.getAttribute('transform')
    }));
    
    // Check for d3 usage
    const d3Check = {
      hasD3: typeof d3 !== 'undefined',
      version: typeof d3 !== 'undefined' ? d3.version : null
    };
    
    // Check for special classes or data attributes
    const specialElements = {
      hasWordsHolder: !!container.querySelector('.words-holder'),
      hasAdjMat: !!container.querySelector('[class*="adj"], [class*="mat"], [class*="matrix"]'),
      dataAttributes: []
    };
    
    // Find elements with data attributes
    container.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          specialElements.dataAttributes.push({
            element: el.tagName,
            attribute: attr.name,
            value: attr.value
          });
        }
      });
    });
    
    return {
      domStructure: analyzeDOM(container),
      input: inputAnalysis,
      svgs: svgAnalysis,
      rects: rectAnalysis,
      texts: textAnalysis,
      d3: d3Check,
      special: specialElements,
      totalElements: {
        divs: container.querySelectorAll('div').length,
        svgs: container.querySelectorAll('svg').length,
        rects: container.querySelectorAll('rect').length,
        texts: container.querySelectorAll('text').length,
        paths: container.querySelectorAll('path').length
      }
    };
  });
  
  // Test hover interactions
  console.log('📊 Testing hover interactions...\n');
  
  const hoverTests = [];
  
  // Test hovering over input at different positions
  const input = page.locator('#text-as-graph input');
  const inputBox = await input.boundingBox();
  
  if (inputBox) {
    // Hover over first word
    await page.mouse.move(inputBox.x + 30, inputBox.y + 15);
    await page.waitForTimeout(500);
    hoverTests.push({
      test: 'hover-first-word',
      changes: await captureHighlights(page)
    });
    
    // Hover over middle
    await page.mouse.move(inputBox.x + inputBox.width / 2, inputBox.y + 15);
    await page.waitForTimeout(500);
    hoverTests.push({
      test: 'hover-middle',
      changes: await captureHighlights(page)
    });
  }
  
  // Test hovering over matrix
  const matrix = page.locator('#text-as-graph svg').last();
  const matrixBox = await matrix.boundingBox();
  
  if (matrixBox) {
    await page.mouse.move(matrixBox.x + 30, matrixBox.y + 30);
    await page.waitForTimeout(500);
    hoverTests.push({
      test: 'hover-matrix-cell',
      changes: await captureHighlights(page)
    });
  }
  
  // Reset hover
  await page.mouse.move(0, 0);
  
  // Save analysis to file
  const report = {
    timestamp: new Date().toISOString(),
    analysis,
    hoverTests
  };
  
  await fs.writeFile(
    'test/original-analysis.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('📋 Analysis Report:\n');
  console.log('DOM Structure:', analysis.domStructure ? 'Captured' : 'Failed');
  console.log('Input Element:', analysis.input ? 'Found' : 'Not found');
  console.log('SVGs:', analysis.svgs.length);
  console.log('Rectangles:', analysis.rects.length);
  console.log('Text Elements:', analysis.texts.length);
  console.log('D3.js:', analysis.d3.hasD3 ? `v${analysis.d3.version}` : 'Not detected');
  console.log('\nTotal Elements:');
  Object.entries(analysis.totalElements).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('\n✅ Full analysis saved to test/original-analysis.json');
  
  // Keep browser open for manual inspection
  console.log('\n⏸️  Browser will stay open for 20 seconds for manual inspection...');
  await page.waitForTimeout(20000);
  
  await browser.close();
}

async function captureHighlights(page) {
  return await page.evaluate(() => {
    const highlighted = [];
    
    // Check rectangles for highlighting
    document.querySelectorAll('#text-as-graph svg rect').forEach((rect, i) => {
      const strokeWidth = rect.getAttribute('stroke-width');
      const stroke = rect.getAttribute('stroke');
      if (strokeWidth && strokeWidth !== '1' || stroke === '#000' && strokeWidth === '3') {
        highlighted.push({ type: 'rect', index: i, strokeWidth, stroke });
      }
    });
    
    // Check matrix cells
    document.querySelectorAll('#text-as-graph svg').forEach(svg => {
      svg.querySelectorAll('rect').forEach((rect, i) => {
        const fill = rect.getAttribute('fill');
        if (fill && fill !== 'white' && fill !== 'hsl(51, 100%, 75%)') {
          highlighted.push({ type: 'matrix-cell', index: i, fill });
        }
      });
    });
    
    return highlighted;
  });
}

// Run analysis
analyzeOriginal()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });