#!/usr/bin/env node
/**
 * Multi-worker debugging tool to find and fix implementation issues
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

const NUM_WORKERS = 3;

async function workerTask(workerId, taskType) {
  console.log(`[Worker ${workerId}] Starting ${taskType} task...`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--force-device-scale-factor=1']
  });
  
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }});
  const page = await context.newPage();
  
  const results = { workerId, taskType };
  
  try {
    if (taskType === 'test-original') {
      // Test original implementation
      await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
      
      await page.evaluate(() => {
        const element = document.querySelector('#text-as-graph');
        if (element) element.scrollIntoView({ block: 'center' });
      });
      
      await page.waitForTimeout(1000);
      
      results.analysis = await page.evaluate(() => {
        const container = document.querySelector('#text-as-graph');
        const input = container.querySelector('input');
        
        return {
          hasContainer: !!container,
          hasInput: !!input,
          inputValue: input ? input.value : null,
          inputEditable: input ? !input.disabled && !input.readOnly : false,
          rectCount: container.querySelectorAll('rect').length,
          textCount: container.querySelectorAll('text').length,
          svgCount: container.querySelectorAll('svg').length,
          dimensions: container.getBoundingClientRect()
        };
      });
      
      // Take screenshot
      const bbox = await page.locator('#text-as-graph').boundingBox();
      await page.screenshot({ 
        clip: bbox,
        path: `test/screenshots/worker${workerId}-original.png`
      });
      
    } else if (taskType === 'test-ours') {
      // Test our implementation
      await page.goto('http://localhost:34887', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      // Check for JavaScript errors
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      
      results.analysis = await page.evaluate(() => {
        const container = document.querySelector('#text-as-graph');
        const input = container.querySelector('input');
        
        return {
          hasContainer: !!container,
          hasInput: !!input,
          inputValue: input ? input.value : null,
          inputEditable: input ? !input.disabled && !input.readOnly : false,
          rectCount: container.querySelectorAll('rect').length,
          textCount: container.querySelectorAll('text').length,
          svgCount: container.querySelectorAll('svg').length,
          dimensions: container.getBoundingClientRect(),
          hasD3: typeof d3 !== 'undefined',
          hasConventions: typeof d3 !== 'undefined' && typeof d3.conventions !== 'undefined'
        };
      });
      
      results.errors = errors;
      
      // Take screenshot
      const bbox = await page.locator('#text-as-graph').boundingBox();
      await page.screenshot({ 
        clip: bbox,
        path: `test/screenshots/worker${workerId}-ours.png`
      });
      
    } else if (taskType === 'test-interaction') {
      // Test interaction functionality
      await page.goto('http://localhost:34887', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      const input = page.locator('#text-as-graph input');
      
      try {
        // Test if input exists and is interactable
        await input.waitFor({ state: 'visible', timeout: 5000 });
        
        // Try to change text
        await input.clear();
        await input.fill('Test ABC');
        
        await page.waitForTimeout(500);
        
        results.analysis = await page.evaluate(() => {
          const container = document.querySelector('#text-as-graph');
          const input = container.querySelector('input');
          const visibleRects = Array.from(container.querySelectorAll('rect'))
            .filter(r => r.getAttribute('opacity') === '1' || r.style.opacity === '1');
          
          return {
            inputValue: input.value,
            visibleRects: visibleRects.length,
            totalRects: container.querySelectorAll('rect').length,
            renderWorking: visibleRects.length > 0
          };
        });
        
        // Take screenshot of interaction
        const bbox = await page.locator('#text-as-graph').boundingBox();
        await page.screenshot({ 
          clip: bbox,
          path: `test/screenshots/worker${workerId}-interaction.png`
        });
        
      } catch (error) {
        results.error = error.message;
      }
    }
    
  } catch (error) {
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  console.log(`[Worker ${workerId}] Completed ${taskType}`);
  return results;
}

async function runMultiWorkerDebug() {
  console.log(`🚀 Starting multi-worker debugging with ${NUM_WORKERS} workers...\n`);
  
  const tasks = [
    { workerId: 1, taskType: 'test-original' },
    { workerId: 2, taskType: 'test-ours' },
    { workerId: 3, taskType: 'test-interaction' }
  ];
  
  // Run all workers in parallel
  const results = await Promise.all(
    tasks.map(task => workerTask(task.workerId, task.taskType))
  );
  
  // Analyze results
  console.log('\n📊 Multi-Worker Analysis Results:\n');
  console.log('═'.repeat(60));
  
  results.forEach(result => {
    console.log(`\n[Worker ${result.workerId}] ${result.taskType.toUpperCase()}:`);
    
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
    } else if (result.analysis) {
      console.log(`  ✓ Container: ${result.analysis.hasContainer}`);
      console.log(`  ✓ Input: ${result.analysis.hasInput}`);
      console.log(`  ✓ Input Value: "${result.analysis.inputValue}"`);
      console.log(`  ✓ Rectangles: ${result.analysis.rectCount}`);
      console.log(`  ✓ Text Elements: ${result.analysis.textCount}`);
      console.log(`  ✓ SVGs: ${result.analysis.svgCount}`);
      
      if (result.analysis.dimensions) {
        console.log(`  ✓ Size: ${Math.round(result.analysis.dimensions.width)}x${Math.round(result.analysis.dimensions.height)}`);
      }
      
      if (result.analysis.hasOwnProperty('hasD3')) {
        console.log(`  ✓ D3: ${result.analysis.hasD3}`);
        console.log(`  ✓ Conventions: ${result.analysis.hasConventions}`);
      }
      
      if (result.analysis.renderWorking !== undefined) {
        console.log(`  ✓ Rendering: ${result.analysis.renderWorking ? 'Working' : 'Broken'}`);
      }
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log(`  ❌ JS Errors: ${result.errors.length}`);
      result.errors.forEach(err => console.log(`    - ${err}`));
    }
  });
  
  console.log('\n═'.repeat(60));
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    workers: results,
    summary: {
      originalWorking: results[0] && results[0].analysis && results[0].analysis.hasContainer,
      oursWorking: results[1] && results[1].analysis && results[1].analysis.hasContainer,
      interactionWorking: results[2] && results[2].analysis && results[2].analysis.renderWorking
    }
  };
  
  await fs.writeFile(
    'test/multi-worker-debug-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Multi-worker debug complete. Report saved to test/multi-worker-debug-report.json');
  
  return report.summary;
}

// Run multi-worker debug
runMultiWorkerDebug()
  .then(summary => {
    console.log('\n🎯 Summary:');
    console.log(`Original: ${summary.originalWorking ? '✅' : '❌'}`);
    console.log(`Ours: ${summary.oursWorking ? '✅' : '❌'}`);
    console.log(`Interaction: ${summary.interactionWorking ? '✅' : '❌'}`);
    
    process.exit(summary.originalWorking && summary.oursWorking ? 0 : 1);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });