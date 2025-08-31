#!/usr/bin/env node
/**
 * Comprehensive dependency analysis tool for text-as-graph implementation
 * Uses Chrome DevTools Protocol and runtime analysis
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function analyzeDependencies() {
  console.log('🔬 Starting comprehensive dependency analysis...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    args: ['--enable-logging', '--v=1']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable Chrome DevTools Protocol
  const client = await page.context().newCDPSession(page);
  
  // Enable necessary domains
  await client.send('Runtime.enable');
  await client.send('Profiler.enable');
  await client.send('Performance.enable');
  
  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Collect network requests
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });
  
  // Collect responses
  page.on('response', response => {
    const request = networkRequests.find(r => r.url === response.url());
    if (request) {
      request.status = response.status();
      request.size = response.headers()['content-length'];
    }
  });
  
  console.log('📊 Loading original implementation...');
  
  // Start profiling
  await client.send('Profiler.start');
  
  // Navigate to the page
  await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
  
  // Wait for text-as-graph to be available
  await page.waitForSelector('#text-as-graph', { timeout: 10000 });
  
  // Scroll to text-as-graph
  await page.evaluate(() => {
    const element = document.querySelector('#text-as-graph');
    if (element) element.scrollIntoView({ block: 'center' });
  });
  
  await page.waitForTimeout(2000);
  
  // Stop profiling
  const profileResult = await client.send('Profiler.stop');
  
  console.log('🔍 Analyzing runtime dependencies...\n');
  
  // Analyze loaded scripts and dependencies
  const scriptAnalysis = await page.evaluate(() => {
    // Get all script tags
    const scripts = Array.from(document.querySelectorAll('script')).map(script => ({
      src: script.src,
      type: script.type,
      async: script.async,
      defer: script.defer,
      inline: !script.src,
      content: !script.src ? script.textContent.substring(0, 100) + '...' : null
    }));
    
    // Check for specific libraries
    const libraries = {
      d3: typeof d3 !== 'undefined' ? d3.version : null,
      jQuery: typeof jQuery !== 'undefined' ? jQuery.fn.jquery : null,
      lodash: typeof _ !== 'undefined' && _.VERSION ? _.VERSION : null,
      react: typeof React !== 'undefined' ? React.version : null,
      vue: typeof Vue !== 'undefined' ? Vue.version : null
    };
    
    // Check for d3 modules
    const d3Modules = {};
    if (typeof d3 !== 'undefined') {
      const d3Keys = Object.keys(d3);
      d3Modules.totalMethods = d3Keys.length;
      d3Modules.modules = d3Keys.filter(key => key.startsWith('scale') || 
                                               key.startsWith('select') || 
                                               key.startsWith('axis') ||
                                               key.startsWith('color') ||
                                               key.startsWith('cross')).slice(0, 20);
    }
    
    return { scripts, libraries, d3Modules };
  });
  
  // Analyze text-as-graph specific dependencies
  const textAsGraphAnalysis = await page.evaluate(() => {
    const container = document.querySelector('#text-as-graph');
    if (!container) return { error: 'Container not found' };
    
    // Use Chrome's getEventListeners if available
    const analyzeEventListeners = (element) => {
      try {
        // This only works in DevTools console, not in page.evaluate
        // So we'll use a different approach
        const events = [];
        const possibleEvents = ['click', 'mouseover', 'mouseout', 'mousemove', 
                               'mouseenter', 'mouseleave', 'input', 'change'];
        
        possibleEvents.forEach(eventType => {
          // Check if element has inline handler
          if (element[`on${eventType}`]) {
            events.push(eventType);
          }
        });
        
        return events;
      } catch (e) {
        return [];
      }
    };
    
    // Find all interactive elements
    const input = container.querySelector('input');
    const svgs = container.querySelectorAll('svg');
    const rects = container.querySelectorAll('rect');
    const texts = container.querySelectorAll('text');
    
    // Analyze input
    const inputInfo = input ? {
      value: input.value,
      events: analyzeEventListeners(input),
      computedStyle: {
        fontSize: window.getComputedStyle(input).fontSize,
        fontFamily: window.getComputedStyle(input).fontFamily,
        wordSpacing: window.getComputedStyle(input).wordSpacing
      }
    } : null;
    
    // Check for d3 selections
    let d3SelectionInfo = null;
    if (typeof d3 !== 'undefined') {
      try {
        const selection = d3.select('#text-as-graph');
        d3SelectionInfo = {
          hasD3Selection: !!selection,
          nodeCount: selection.selectAll('*').size()
        };
      } catch (e) {
        d3SelectionInfo = { error: e.message };
      }
    }
    
    // Check for custom properties or data
    const customData = [];
    container.querySelectorAll('*').forEach(el => {
      if (el.__data__) {
        customData.push({
          tagName: el.tagName,
          data: typeof el.__data__
        });
      }
    });
    
    return {
      inputInfo,
      svgCount: svgs.length,
      rectCount: rects.length,
      textCount: texts.length,
      d3SelectionInfo,
      hasCustomData: customData.length > 0,
      customDataSample: customData.slice(0, 5)
    };
  });
  
  // Analyze bundle/build information
  const bundleInfo = networkRequests
    .filter(r => r.resourceType === 'script')
    .map(r => ({
      url: r.url,
      size: r.size ? parseInt(r.size) : 'unknown',
      status: r.status
    }));
  
  // Get performance metrics
  const performanceMetrics = await page.evaluate(() => {
    const perf = window.performance;
    const navigation = perf.getEntriesByType('navigation')[0];
    const resources = perf.getEntriesByType('resource');
    
    return {
      navigation: navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive,
        domComplete: navigation.domComplete
      } : null,
      resources: resources
        .filter(r => r.name.includes('.js') || r.name.includes('.css'))
        .map(r => ({
          name: r.name.split('/').pop(),
          duration: r.duration,
          size: r.transferSize
        }))
    };
  });
  
  // Test interactive features
  console.log('🎮 Testing interactive features...\n');
  
  const interactionTest = await page.evaluate(() => {
    const input = document.querySelector('#text-as-graph input');
    const results = [];
    
    if (input) {
      // Trigger input event
      const originalValue = input.value;
      input.value = 'Test input';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Check if anything changed
      const afterInput = {
        svgCount: document.querySelectorAll('#text-as-graph svg').length,
        rectCount: document.querySelectorAll('#text-as-graph rect').length,
        textCount: document.querySelectorAll('#text-as-graph text').length
      };
      
      // Restore original
      input.value = originalValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      results.push({ test: 'input-change', result: afterInput });
    }
    
    return results;
  });
  
  // Create comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    url: 'http://localhost:1234',
    scriptAnalysis,
    textAsGraphAnalysis,
    bundleInfo,
    performanceMetrics,
    interactionTest,
    consoleLogs: consoleLogs.slice(0, 20),
    networkSummary: {
      totalRequests: networkRequests.length,
      scripts: networkRequests.filter(r => r.resourceType === 'script').length,
      stylesheets: networkRequests.filter(r => r.resourceType === 'stylesheet').length,
      images: networkRequests.filter(r => r.resourceType === 'image').length
    }
  };
  
  // Save report
  await fs.writeFile(
    'test/dependency-analysis-report.json',
    JSON.stringify(report, null, 2)
  );
  
  // Print summary
  console.log('📋 Dependency Analysis Summary:\n');
  console.log('Libraries detected:');
  Object.entries(scriptAnalysis.libraries).forEach(([lib, version]) => {
    if (version) console.log(`  ✓ ${lib}: v${version}`);
  });
  
  console.log('\nD3.js analysis:');
  if (scriptAnalysis.d3Modules.totalMethods) {
    console.log(`  Total D3 methods: ${scriptAnalysis.d3Modules.totalMethods}`);
    console.log(`  Sample modules: ${scriptAnalysis.d3Modules.modules.join(', ')}`);
  }
  
  console.log('\nText-as-graph components:');
  console.log(`  SVGs: ${textAsGraphAnalysis.svgCount}`);
  console.log(`  Rectangles: ${textAsGraphAnalysis.rectCount}`);
  console.log(`  Text elements: ${textAsGraphAnalysis.textCount}`);
  console.log(`  Has custom data: ${textAsGraphAnalysis.hasCustomData}`);
  
  console.log('\nBundle information:');
  bundleInfo.forEach(bundle => {
    console.log(`  ${bundle.url.split('/').pop()}: ${bundle.size} bytes`);
  });
  
  console.log('\nPerformance metrics:');
  if (performanceMetrics.navigation) {
    console.log(`  DOM Content Loaded: ${performanceMetrics.navigation.domContentLoaded}ms`);
    console.log(`  Page Load Complete: ${performanceMetrics.navigation.loadComplete}ms`);
  }
  
  console.log('\n✅ Full report saved to test/dependency-analysis-report.json');
  
  // Keep browser open for manual inspection
  console.log('\n⏸️  Browser will stay open for 15 seconds for manual inspection...');
  await page.waitForTimeout(15000);
  
  await browser.close();
}

// Run analysis
analyzeDependencies()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });