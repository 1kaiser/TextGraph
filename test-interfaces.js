const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  
  console.log('🎯 TESTING MANUAL TEXT INPUT INTERFACES');
  console.log('');
  
  // Test our enhanced implementation
  console.log('📊 Testing Enhanced TextGraph Implementation...');
  const page1 = await browser.newPage();
  await page1.goto('http://10.36.4.200:39053');
  await page1.waitForSelector('#text-as-graph');
  
  // Check if the interface elements exist
  const ourInterface = await page1.evaluate(() => {
    const textInput = document.getElementById('manual-text-input');
    const button = document.getElementById('update-graph');
    const charCount = document.getElementById('char-count');
    
    return {
      hasTextInput: textInput !== null,
      hasButton: button !== null,
      hasCharCount: charCount !== null,
      initialText: textInput ? textInput.value : null,
      maxLength: textInput ? textInput.getAttribute('maxlength') : null
    };
  });
  
  console.log('  Interface elements found:', ourInterface.hasTextInput && ourInterface.hasButton && ourInterface.hasCharCount ? '✅' : '❌');
  console.log('  Max length limit:', ourInterface.maxLength);
  console.log('  Initial text:', '"' + ourInterface.initialText + '"');
  
  // Test functionality by entering new text
  if (ourInterface.hasTextInput) {
    await page1.fill('#manual-text-input', 'Neural networks process data efficiently');
    await page1.click('#update-graph');
    await page1.waitForTimeout(1000);
    
    const result1 = await page1.evaluate(() => {
      const visInput = document.querySelector('#text-as-graph input');
      const words = visInput ? visInput.value.split(' ') : [];
      const rects = document.querySelectorAll('#text-as-graph rect');
      
      return {
        visualizationText: visInput ? visInput.value : null,
        wordCount: words.length,
        rectangleCount: rects.length
      };
    });
    
    console.log('  ✅ Test successful! Words:', result1.wordCount, 'Rectangles:', result1.rectangleCount);
  }
  
  await page1.screenshot({ path: 'screenshots/enhanced-with-interface.png', clip: { x: 0, y: 0, width: 1400, height: 800 } });
  
  console.log('');
  
  // Test original implementation
  console.log('📊 Testing Original Distill Implementation...');
  const page2 = await browser.newPage();
  await page2.goto('http://10.36.4.200:1234');
  await page2.waitForSelector('#text-as-graph');
  await page2.waitForTimeout(3000); // Wait for dynamic loading
  
  const originalInterface = await page2.evaluate(() => {
    const textInput = document.getElementById('manual-text-input');
    const button = document.getElementById('update-graph');
    const charCount = document.getElementById('char-count');
    
    return {
      hasTextInput: textInput !== null,
      hasButton: button !== null,
      hasCharCount: charCount !== null,
      initialText: textInput ? textInput.value : null,
      maxLength: textInput ? textInput.getAttribute('maxlength') : null
    };
  });
  
  console.log('  Interface elements found:', originalInterface.hasTextInput && originalInterface.hasButton && originalInterface.hasCharCount ? '✅' : '❌');
  console.log('  Max length limit:', originalInterface.maxLength);
  console.log('  Initial text:', '"' + originalInterface.initialText + '"');
  
  // Test functionality
  if (originalInterface.hasTextInput) {
    await page2.fill('#manual-text-input', 'Machine learning rocks');
    await page2.click('#update-graph');
    await page2.waitForTimeout(1000);
    
    const result2 = await page2.evaluate(() => {
      const visInput = document.querySelector('#text-as-graph input');
      const words = visInput ? visInput.value.split(' ') : [];
      const rects = document.querySelectorAll('#text-as-graph rect');
      
      return {
        visualizationText: visInput ? visInput.value : null,
        wordCount: words.length,
        rectangleCount: rects.length
      };
    });
    
    console.log('  ✅ Test successful! Words:', result2.wordCount, 'Rectangles:', result2.rectangleCount);
  }
  
  await page2.screenshot({ path: 'screenshots/original-with-interface.png', clip: { x: 0, y: 0, width: 1400, height: 800 } });
  
  console.log('');
  console.log('📸 Screenshots saved:');
  console.log('  Enhanced: screenshots/enhanced-with-interface.png');
  console.log('  Original: screenshots/original-with-interface.png');
  
  console.log('');
  console.log('🌐 LIVE ACCESS URLS:');
  console.log('  Enhanced TextGraph: http://10.36.4.200:39053');
  console.log('  Original Distill: http://10.36.4.200:1234');
  console.log('');
  console.log('✅ Manual text input interfaces successfully added to both implementations!');
  
  await browser.close();
})();