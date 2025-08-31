const { chromium } = require('playwright');

async function analyzeImplementation(url, name, testCases) {
  const browser = await chromium.launch({ headless: false });
  const results = [];
  
  for (const testCase of testCases) {
    const page = await browser.newPage();
    
    try {
      console.log(`🔍 Testing ${name} with: "${testCase.text}"`);
      
      await page.goto(url);
      await page.waitForSelector('#text-as-graph', { timeout: 10000 });
      await page.waitForTimeout(2000); // Wait for initialization
      
      // Use the manual text input interface
      const hasInterface = await page.evaluate(() => {
        return document.getElementById('manual-text-input') !== null;
      });
      
      if (hasInterface) {
        await page.fill('#manual-text-input', testCase.text);
        await page.click('#update-graph');
        await page.waitForTimeout(1500);
      } else {
        // Fallback to direct input manipulation
        await page.evaluate((text) => {
          const input = document.querySelector('#text-as-graph input');
          if (input) {
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, testCase.text);
        await page.waitForTimeout(1500);
      }
      
      // Analyze the result
      const analysis = await page.evaluate(() => {
        const input = document.querySelector('#text-as-graph input');
        const rects = Array.from(document.querySelectorAll('#text-as-graph rect'));
        const visibleRects = rects.filter(r => {
          const opacity = parseFloat(r.getAttribute('opacity') || '1');
          return opacity > 0;
        });
        const matrixRects = Array.from(document.querySelectorAll('#text-as-graph svg:last-child rect'));
        const matrixLabels = Array.from(document.querySelectorAll('#text-as-graph svg:last-child text'));
        const arrows = Array.from(document.querySelectorAll('#text-as-graph text')).filter(t => t.textContent.includes('→'));
        
        const words = input ? input.value.split(' ').filter(w => w.length > 0) : [];
        
        // Check for any errors in console
        const hasErrors = window.console && window.console.error;
        
        // Check matrix visibility and positioning
        const matrixSvg = document.querySelector('#text-as-graph svg:last-child');
        const matrixVisible = matrixSvg && window.getComputedStyle(matrixSvg).display !== 'none';
        const matrixBounds = matrixSvg ? matrixSvg.getBoundingClientRect() : null;
        
        // Check word rectangles positioning
        const wordRectPositions = visibleRects.slice(0, words.length).map(r => ({
          x: parseFloat(r.getAttribute('x')),
          y: parseFloat(r.getAttribute('y')),
          width: parseFloat(r.getAttribute('width')),
          height: parseFloat(r.getAttribute('height'))
        }));
        
        return {
          inputText: input ? input.value : '',
          inputLength: input ? input.value.length : 0,
          wordCount: words.length,
          words: words,
          totalRects: rects.length,
          visibleRects: visibleRects.length,
          matrixRects: matrixRects.length,
          matrixLabels: matrixLabels.length,
          arrows: arrows.length,
          matrixVisible,
          matrixBounds: matrixBounds ? {
            width: matrixBounds.width,
            height: matrixBounds.height,
            x: matrixBounds.x,
            y: matrixBounds.y
          } : null,
          wordRectPositions,
          expectedMatrix: words.length * words.length,
          containerBounds: document.querySelector('#text-as-graph').getBoundingClientRect()
        };
      });
      
      // Take screenshot
      const screenshotPath = `screenshots/multiworker-${name.toLowerCase()}-${testCase.name}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        clip: { x: 0, y: 0, width: 1400, height: 800 } 
      });
      
      results.push({
        testCase: testCase.name,
        text: testCase.text,
        analysis,
        screenshotPath,
        issues: analyzeIssues(analysis, testCase)
      });
      
    } catch (error) {
      console.log(`❌ Error testing ${name} with "${testCase.text}": ${error.message}`);
      results.push({
        testCase: testCase.name,
        text: testCase.text,
        error: error.message
      });
    }
    
    await page.close();
  }
  
  await browser.close();
  return results;
}

function analyzeIssues(analysis, testCase) {
  const issues = [];
  
  // Check if input was truncated
  if (analysis.inputLength < testCase.text.length) {
    issues.push(`Input truncated: ${analysis.inputLength}/${testCase.text.length} chars`);
  }
  
  // Check if word count matches expected
  const expectedWords = testCase.text.split(' ').filter(w => w.length > 0).length;
  if (analysis.wordCount !== expectedWords) {
    issues.push(`Word count mismatch: ${analysis.wordCount} vs ${expectedWords} expected`);
  }
  
  // Check if rectangles match words
  if (analysis.visibleRects < analysis.wordCount) {
    issues.push(`Missing rectangles: ${analysis.visibleRects} vs ${analysis.wordCount} words`);
  }
  
  // Check if matrix size is correct
  if (analysis.matrixRects !== analysis.expectedMatrix) {
    issues.push(`Matrix size incorrect: ${analysis.matrixRects} vs ${analysis.expectedMatrix} expected`);
  }
  
  // Check if matrix is visible
  if (!analysis.matrixVisible) {
    issues.push('Adjacency matrix not visible');
  }
  
  // Check if arrows are present (should be word count - 1)
  const expectedArrows = Math.max(0, analysis.wordCount - 1);
  if (analysis.arrows !== expectedArrows) {
    issues.push(`Arrow count: ${analysis.arrows} vs ${expectedArrows} expected`);
  }
  
  return issues;
}

async function runMultiWorkerAnalysis() {
  console.log('🚀 MULTI-WORKER ANALYSIS STARTING...');
  console.log('');
  
  const testCases = [
    { name: 'short', text: 'Hello world' },
    { name: 'medium', text: 'Machine learning algorithms process data' },
    { name: 'long', text: 'Neural networks can learn complex patterns from large datasets effectively' },
    { name: 'maxlength', text: 'This sentence is designed to test the maximum character limit functionality of both implementations' }
  ];
  
  // Run both implementations in parallel
  const [originalResults, enhancedResults] = await Promise.all([
    analyzeImplementation('http://10.36.4.200:1234', 'Original', testCases),
    analyzeImplementation('http://10.36.4.200:42039', 'Enhanced', testCases)
  ]);
  
  console.log('');
  console.log('📊 MULTI-WORKER ANALYSIS RESULTS:');
  console.log('='.repeat(80));
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const original = originalResults[i];
    const enhanced = enhancedResults[i];
    
    console.log('');
    console.log(`🎯 TEST CASE: ${testCase.name.toUpperCase()} - "${testCase.text}"`);
    console.log('-'.repeat(60));
    
    if (original.error) {
      console.log(`❌ Original failed: ${original.error}`);
    } else {
      console.log(`📊 Original: ${original.analysis.wordCount} words, ${original.analysis.visibleRects} rects, ${original.analysis.matrixRects} matrix`);
      if (original.issues.length > 0) {
        console.log(`⚠️  Issues: ${original.issues.join(', ')}`);
      } else {
        console.log('✅ No issues detected');
      }
    }
    
    if (enhanced.error) {
      console.log(`❌ Enhanced failed: ${enhanced.error}`);
    } else {
      console.log(`📊 Enhanced: ${enhanced.analysis.wordCount} words, ${enhanced.analysis.visibleRects} rects, ${enhanced.analysis.matrixRects} matrix`);
      if (enhanced.issues.length > 0) {
        console.log(`⚠️  Issues: ${enhanced.issues.join(', ')}`);
      } else {
        console.log('✅ No issues detected');
      }
    }
    
    // Compare implementations
    if (!original.error && !enhanced.error) {
      const match = original.analysis.wordCount === enhanced.analysis.wordCount;
      console.log(`🔄 Consistency: ${match ? '✅ Match' : '❌ Different behavior'}`);
    }
  }
  
  console.log('');
  console.log('📸 SCREENSHOTS SAVED:');
  [...originalResults, ...enhancedResults].forEach(result => {
    if (result.screenshotPath) {
      console.log(`  ${result.screenshotPath}`);
    }
  });
  
  console.log('');
  console.log('🏆 MULTI-WORKER ANALYSIS COMPLETE!');
}

runMultiWorkerAnalysis().catch(console.error);