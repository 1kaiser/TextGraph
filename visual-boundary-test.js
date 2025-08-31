const { chromium } = require('playwright');

async function visualBoundaryTest() {
    console.log('🔍 Visual boundary test with screenshots...');
    
    const testCases = [
        { name: 'Wide Characters', text: 'WWWWWWWWWW MMMMMMMMMM' },
        { name: 'Mixed Sizes', text: 'AI supercalifragilisticexpialidocious tiny' },
        { name: 'Normal Text', text: 'Graphs are all around us' },
        { name: 'Long Single Word', text: 'Pneumonoultramicroscopicsilicovolcanoconiosisanddeoxyribonucleicacidstructures' }
    ];

    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });
    
    const page = await context.newPage();
    
    try {
        await page.goto('http://10.36.4.200:42040');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        for (const testCase of testCases) {
            console.log(`\n🧪 Testing: ${testCase.name}`);
            console.log(`📝 Text: "${testCase.text}"`);
            
            // Clear and enter text
            await page.fill('#manual-text-input', '');
            await page.fill('#manual-text-input', testCase.text);
            await page.click('#update-graph');
            
            // Wait for rendering
            await page.waitForTimeout(2000);
            
            // Take screenshot
            const screenshotPath = `/home/kaiser/claude_project1/TextGraph/screenshots/visual-boundary-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            
            // Analyze boundary fit
            const analysis = await page.evaluate(() => {
                const rects = document.querySelectorAll('#text-as-graph rect');
                const texts = document.querySelectorAll('#text-as-graph text');
                
                const results = [];
                for (let i = 0; i < Math.min(rects.length, texts.length); i++) {
                    const rect = rects[i];
                    const text = texts[i];
                    
                    if (!text.textContent || text.textContent === '→' || text.textContent === '↓') continue;
                    
                    const rectBounds = rect.getBoundingClientRect();
                    const textBounds = text.getBoundingClientRect();
                    
                    const fits = textBounds.left >= rectBounds.left && 
                                textBounds.right <= rectBounds.right;
                    
                    results.push({
                        word: text.textContent,
                        rectWidth: rectBounds.width,
                        textWidth: textBounds.width,
                        fits: fits,
                        overflow: fits ? 0 : Math.max(
                            rectBounds.left - textBounds.left,
                            textBounds.right - rectBounds.right
                        )
                    });
                }
                return results;
            });
            
            console.log(`📸 Screenshot: ${screenshotPath}`);
            
            let hasOverflow = false;
            analysis.forEach((item, idx) => {
                const status = item.fits ? '✅' : '❌';
                console.log(`   ${status} "${item.word}": rect=${item.rectWidth.toFixed(0)}px, text=${item.textWidth.toFixed(0)}px${item.fits ? '' : `, overflow=${item.overflow.toFixed(0)}px`}`);
                if (!item.fits) hasOverflow = true;
            });
            
            console.log(`   📊 Result: ${hasOverflow ? '❌ HAS OVERFLOW' : '✅ ALL WORDS FIT'}`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

visualBoundaryTest();