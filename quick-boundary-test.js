const { chromium } = require('playwright');

async function quickTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    
    try {
        await page.goto('http://10.36.4.200:42040');
        await page.waitForTimeout(2000);
        
        // Test wide characters
        console.log('Testing: WWWWWWWWWW MMMMMMMMMM');
        await page.fill('#manual-text-input', 'WWWWWWWWWW MMMMMMMMMM');
        await page.click('#update-graph');
        await page.waitForTimeout(2000);
        
        const result = await page.evaluate(() => {
            const rects = document.querySelectorAll('#text-as-graph rect');
            const texts = document.querySelectorAll('#text-as-graph text');
            
            return Array.from(rects).map((rect, i) => {
                const text = texts[i];
                if (!text) return null;
                
                const rectWidth = parseFloat(rect.getAttribute('width'));
                const span = document.createElement('span');
                span.style.font = '30px monospace';
                span.style.visibility = 'hidden';
                span.textContent = text.textContent;
                document.body.appendChild(span);
                const actualWidth = span.offsetWidth;
                document.body.removeChild(span);
                
                return {
                    word: text.textContent,
                    rectWidth,
                    actualWidth,
                    fits: actualWidth <= rectWidth
                };
            }).filter(Boolean);
        });
        
        result.forEach(r => {
            console.log(`${r.word}: rect=${r.rectWidth}px, text=${r.actualWidth}px, fits=${r.fits ? 'YES' : 'NO'}`);
        });
        
        await page.screenshot({ path: '/home/kaiser/claude_project1/TextGraph/screenshots/quick-boundary-test.png' });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

quickTest();