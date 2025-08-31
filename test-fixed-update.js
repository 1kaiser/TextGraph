const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING FIXED UPDATE MECHANISM...');
  
  const browser = await chromium.launch({ headless: false });
  
  // Test Enhanced Implementation (new port)
  console.log('\n📊 Testing Enhanced Implementation:');
  const page1 = await browser.newPage();
  await page1.goto('http://10.36.4.200:42039');
  await page1.waitForSelector('#text-as-graph');
  
  // Test the fix
  const testEnhanced = await page1.evaluate(() => {
    // Check if function now exists
    const hasFunctionBefore = typeof window.updateVisualization === 'function';
    
    // Get initial values
    const manualInput = document.getElementById('manual-text-input');
    const visInput = document.querySelector('#text-as-graph input');
    const initialManual = manualInput ? manualInput.value : null;
    const initialVis = visInput ? visInput.value : null;
    
    // Change manual input
    if (manualInput) {
      manualInput.value = 'Hello beautiful world';
    }
    
    // Try to call update function
    let updateResult = 'function not found';
    if (typeof window.updateVisualization === 'function') {
      try {
        window.updateVisualization();
        updateResult = 'function called successfully';
      } catch (e) {
        updateResult = 'function threw error: ' + e.message;
      }
    }
    
    // Check final values
    const finalManual = manualInput ? manualInput.value : null;
    const finalVis = visInput ? visInput.value : null;
    const words = finalVis ? finalVis.split(' ') : [];
    
    return {
      hasFunctionBefore,
      initialManual,
      initialVis,
      finalManual,
      finalVis,
      updateResult,
      wordCount: words.length,
      success: finalVis === finalManual && finalManual !== initialManual
    };
  });
  
  console.log('   Has update function:', testEnhanced.hasFunctionBefore);
  console.log('   Initial manual input:', testEnhanced.initialManual);
  console.log('   Final manual input:', testEnhanced.finalManual);
  console.log('   Final visualization:', testEnhanced.finalVis);
  console.log('   Update result:', testEnhanced.updateResult);
  console.log('   Word count:', testEnhanced.wordCount);
  console.log('   ✅ Success:', testEnhanced.success);
  
  await page1.screenshot({ path: 'screenshots/fixed-enhanced.png', clip: { x: 0, y: 0, width: 1400, height: 800 } });
  
  // Test Original Implementation
  console.log('\n📊 Testing Original Implementation:');
  const page2 = await browser.newPage();
  await page2.goto('http://10.36.4.200:1234');
  await page2.waitForSelector('#text-as-graph');
  await page2.waitForTimeout(3000); // Extra wait for compilation
  
  const testOriginal = await page2.evaluate(() => {
    // Check if function now exists
    const hasFunctionBefore = typeof window.updateVisualization === 'function';
    
    // Get initial values
    const manualInput = document.getElementById('manual-text-input');
    const visInput = document.querySelector('#text-as-graph input');
    const initialManual = manualInput ? manualInput.value : null;
    const initialVis = visInput ? visInput.value : null;
    
    // Change manual input
    if (manualInput) {
      manualInput.value = 'Hello beautiful world';
    }
    
    // Try to call update function
    let updateResult = 'function not found';
    if (typeof window.updateVisualization === 'function') {
      try {
        window.updateVisualization();
        updateResult = 'function called successfully';
      } catch (e) {
        updateResult = 'function threw error: ' + e.message;
      }
    }
    
    // Check final values
    const finalManual = manualInput ? manualInput.value : null;
    const finalVis = visInput ? visInput.value : null;
    const words = finalVis ? finalVis.split(' ') : [];
    
    return {
      hasFunctionBefore,
      initialManual,
      initialVis,
      finalManual,
      finalVis,
      updateResult,
      wordCount: words.length,
      success: finalVis === finalManual && finalManual !== initialManual
    };
  });
  
  console.log('   Has update function:', testOriginal.hasFunctionBefore);
  console.log('   Initial manual input:', testOriginal.initialManual);
  console.log('   Final manual input:', testOriginal.finalManual);
  console.log('   Final visualization:', testOriginal.finalVis);
  console.log('   Update result:', testOriginal.updateResult);
  console.log('   Word count:', testOriginal.wordCount);
  console.log('   ✅ Success:', testOriginal.success);
  
  await page2.screenshot({ path: 'screenshots/fixed-original.png', clip: { x: 0, y: 0, width: 1400, height: 800 } });
  
  console.log('\n🏆 FINAL RESULTS:');
  console.log('Enhanced implementation fixed:', testEnhanced.success ? '✅' : '❌');
  console.log('Original implementation fixed:', testOriginal.success ? '✅' : '❌');
  
  if (testEnhanced.success && testOriginal.success) {
    console.log('\n🎉 SUCCESS! Both implementations now have working manual text input!');
    console.log('🌐 Access URLs:');
    console.log('   Enhanced: http://10.36.4.200:42039');
    console.log('   Original: http://10.36.4.200:1234');
  } else {
    console.log('\n⚠️  Some issues remain:');
    if (!testEnhanced.success) console.log('   - Enhanced implementation still not updating');
    if (!testOriginal.success) console.log('   - Original implementation still not updating');
  }
  
  await browser.close();
})();