const { chromium } = require('playwright');

async function testWordBoundaries() {
    console.log('🔍 Testing word boundary overflow (text extending beyond rectangles)...');
    
    const testCases = [
        {
            name: 'Short Words',
            text: 'cat dog fox',
            charWidth: 15,
            expectedIssue: 'Text might be narrower than rectangle'
        },
        {
            name: 'Medium Words', 
            text: 'algorithm processing',
            charWidth: 15,
            expectedIssue: 'Standard case - should fit well'
        },
        {
            name: 'Long Words',
            text: 'supercalifragilisticexpialidocious antidisestablishmentarianism',
            charWidth: 15,
            expectedIssue: 'Text might exceed rectangle boundaries'
        },
        {
            name: 'Mixed Lengths',
            text: 'AI deep learning computational methodology',
            charWidth: 15,
            expectedIssue: 'Inconsistent text-to-rectangle ratios'
        },
        {
            name: 'Very Wide Characters',
            text: 'WWWWWWWWWW MMMMMMMMMM',
            charWidth: 15,
            expectedIssue: 'Wide characters might overflow fixed charWidth'
        },
        {
            name: 'Narrow Characters',
            text: 'iiiiiiiiii llllllllll',
            charWidth: 15,
            expectedIssue: 'Narrow characters create excess padding'
        }
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
        await page.goto('http://10.36.4.200:35365');
        await page.waitForLoadState('networkidle');
        
        for (const testCase of testCases) {
            console.log(`\n🧪 Testing: ${testCase.name}`);
            console.log(`📝 Text: "${testCase.text}"`);
            console.log(`🔍 Issue: ${testCase.expectedIssue}`);
            
            // Clear and enter text
            await page.fill('#manual-text-input', '');
            await page.fill('#manual-text-input', testCase.text);
            await page.click('#update-graph');
            
            // Wait for rendering
            await page.waitForTimeout(1500);
            
            // Measure word boundaries vs rectangle boundaries
            const boundaryAnalysis = await page.evaluate(() => {
                const graphContainer = document.querySelector('#text-as-graph');
                const wordsHolder = graphContainer.querySelector('div');
                const rects = wordsHolder.querySelectorAll('rect');
                const texts = wordsHolder.querySelectorAll('text');
                
                const results = [];
                
                for (let i = 0; i < Math.min(rects.length, texts.length); i++) {
                    const rect = rects[i];
                    const text = texts[i];
                    
                    const rectX = parseFloat(rect.getAttribute('x'));
                    const rectWidth = parseFloat(rect.getAttribute('width'));
                    const rectRight = rectX + rectWidth;
                    
                    const textX = parseFloat(text.getAttribute('x'));
                    const textContent = text.textContent;
                    
                    // Create a temporary span to measure actual text width
                    const span = document.createElement('span');
                    span.style.font = '30px monospace';
                    span.style.visibility = 'hidden';
                    span.style.position = 'absolute';
                    span.textContent = textContent;
                    document.body.appendChild(span);
                    const actualTextWidth = span.offsetWidth;
                    document.body.removeChild(span);
                    
                    const textLeft = textX - actualTextWidth / 2;
                    const textRight = textX + actualTextWidth / 2;
                    
                    const leftOverflow = textLeft < rectX;
                    const rightOverflow = textRight > rectRight;
                    const leftGap = rectX - textLeft;
                    const rightGap = rectRight - textRight;
                    
                    results.push({
                        wordIndex: i,
                        word: textContent,
                        rectBounds: [rectX, rectRight],
                        textBounds: [textLeft, textRight],
                        rectWidth: rectWidth,
                        actualTextWidth: actualTextWidth,
                        leftOverflow: leftOverflow,
                        rightOverflow: rightOverflow,
                        leftGap: leftGap,
                        rightGap: rightGap,
                        hasOverflow: leftOverflow || rightOverflow,
                        fitRatio: actualTextWidth / rectWidth
                    });
                }
                
                return results;
            });
            
            // Take screenshot for visual verification
            const screenshotPath = `/home/kaiser/claude_project1/TextGraph/screenshots/word-boundary-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            
            console.log(`📸 Screenshot: ${screenshotPath}`);
            
            // Analyze results
            boundaryAnalysis.forEach((analysis, idx) => {
                console.log(`\n  📦 Word ${idx}: "${analysis.word}"`);
                console.log(`     Rectangle: ${analysis.rectWidth.toFixed(1)}px wide`);
                console.log(`     Text: ${analysis.actualTextWidth.toFixed(1)}px wide`);
                console.log(`     Fit Ratio: ${analysis.fitRatio.toFixed(2)} (1.0 = perfect fit)`);
                
                if (analysis.hasOverflow) {
                    console.log(`     🚨 OVERFLOW: ${analysis.leftOverflow ? 'LEFT' : ''} ${analysis.rightOverflow ? 'RIGHT' : ''}`);
                    if (analysis.leftOverflow) console.log(`     ←  ${Math.abs(analysis.leftGap).toFixed(1)}px overflow on left`);
                    if (analysis.rightOverflow) console.log(`     →  ${Math.abs(analysis.rightGap).toFixed(1)}px overflow on right`);
                } else {
                    console.log(`     ✅ FITS: ${analysis.leftGap.toFixed(1)}px left gap, ${analysis.rightGap.toFixed(1)}px right gap`);
                }
            });
            
            // Summary for this test case
            const overflowWords = boundaryAnalysis.filter(a => a.hasOverflow);
            const avgFitRatio = boundaryAnalysis.reduce((sum, a) => sum + a.fitRatio, 0) / boundaryAnalysis.length;
            
            console.log(`\n  📊 Summary: ${overflowWords.length}/${boundaryAnalysis.length} words overflow`);
            console.log(`  📏 Average fit ratio: ${avgFitRatio.toFixed(2)}`);
            
            if (overflowWords.length > 0) {
                console.log(`  ⚠️  NEEDS FIXING: Word boundary overflow detected`);
            }
        }
        
    } catch (error) {
        console.error('Error during word boundary testing:', error);
    } finally {
        await browser.close();
    }
}

testWordBoundaries().catch(console.error);