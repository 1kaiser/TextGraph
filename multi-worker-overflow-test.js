const { chromium } = require('playwright');

async function testOverflowBoundaries() {
    console.log('🔍 Starting multi-worker overflow boundary testing...');
    
    const testCases = [
        {
            name: 'Very Short Words',
            text: 'I am a cat dog fox pig owl bat bee',
            description: 'Single letter to 3-letter words'
        },
        {
            name: 'Medium Words',
            text: 'Graph neural networks process sequential textual information effectively',
            description: '5-12 letter words'
        },
        {
            name: 'Long Words',
            text: 'Comprehensive understanding of computational methodologies requires sophisticated implementation strategies',
            description: '10-20 letter words'
        },
        {
            name: 'Mixed Length',
            text: 'AI ML deep learning algorithms computational linguistics natural language processing transformers',
            description: '2-12 letter mix'
        },
        {
            name: 'Very Long Words',
            text: 'Electroencephalography neuropsychopharmacology psychoneuroimmunology bioelectromagnetism',
            description: '15-25 letter words'
        },
        {
            name: 'Maximum Length',
            text: 'Pneumonoultramicroscopicsilicovolcanoconiosisanddeoxyribonucleicacidstructures',
            description: 'Single very long word'
        },
        {
            name: 'Edge Case - Single Char',
            text: 'a b c d e f g h i j k l m n o p q r s t u v w x y z',
            description: 'Single character words'
        },
        {
            name: 'Numbers and Symbols',
            text: '123 456789 ABC-DEF GHI_JKL MNO@PQR STU#VWX YZ$123',
            description: 'Mixed alphanumeric with symbols'
        }
    ];

    const workers = [];
    const results = [];

    // Launch multiple workers
    for (let i = 0; i < 4; i++) {
        workers.push(testWorker(i, testCases.slice(i * 2, (i + 1) * 2)));
    }

    // Wait for all workers
    const workerResults = await Promise.all(workers);
    workerResults.forEach(result => results.push(...result));

    console.log('\n📊 OVERFLOW BOUNDARY TEST RESULTS\n');
    console.log('='.repeat(80));

    results.forEach(result => {
        console.log(`\n🧪 Test: ${result.testName}`);
        console.log(`📝 Text: "${result.text}"`);
        console.log(`📏 Character Count: ${result.text.length}`);
        console.log(`📦 Word Count: ${result.wordCount}`);
        console.log(`📐 Graph Width: ${result.graphWidth}px`);
        console.log(`🖥️  Screen Width: ${result.screenWidth}px`);
        console.log(`⚠️  Overflow: ${result.hasOverflow ? 'YES' : 'NO'}`);
        console.log(`📊 Usage: ${result.widthUsage}%`);
        
        if (result.hasOverflow) {
            console.log(`🚨 OVERFLOW DETECTED: Graph exceeds screen by ${result.overflowAmount}px`);
        }
        
        if (result.lineWrapping) {
            console.log(`📄 Line Wrapping: ${result.lineCount} lines`);
        }
        
        console.log('-'.repeat(60));
    });

    // Analysis
    const overflowCases = results.filter(r => r.hasOverflow);
    const wrapCases = results.filter(r => r.lineWrapping);
    
    console.log('\n📈 ANALYSIS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total tests: ${results.length}`);
    console.log(`Overflow cases: ${overflowCases.length}`);
    console.log(`Line wrap cases: ${wrapCases.length}`);
    console.log(`Max graph width: ${Math.max(...results.map(r => r.graphWidth))}px`);
    console.log(`Min screen usage: ${Math.min(...results.map(r => r.widthUsage))}%`);
    console.log(`Max screen usage: ${Math.max(...results.map(r => r.widthUsage))}%`);

    console.log('\n🔧 BUFFERING RECOMMENDATIONS:');
    if (overflowCases.length > 0) {
        const maxOverflow = Math.max(...overflowCases.map(r => r.overflowAmount));
        console.log(`• Increase margin buffer by ${Math.ceil(maxOverflow / 10) * 10}px`);
    }
    
    const highUsageCases = results.filter(r => r.widthUsage > 95);
    if (highUsageCases.length > 0) {
        console.log(`• ${highUsageCases.length} cases use >95% screen width - need more aggressive wrapping`);
    }
    
    console.log(`• Current margin: 80px, recommended: ${Math.max(120, 80 + (overflowCases.length * 20))}px`);
}

async function testWorker(workerId, testCases) {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    const results = [];
    
    try {
        console.log(`🤖 Worker ${workerId}: Testing ${testCases.length} cases`);
        
        // Navigate to the page
        await page.goto('http://10.36.4.200:35365');
        await page.waitForLoadState('networkidle');
        
        for (const testCase of testCases) {
            console.log(`🤖 Worker ${workerId}: Testing "${testCase.name}"`);
            
            // Clear and enter text
            await page.fill('#manual-text-input', '');
            await page.fill('#manual-text-input', testCase.text);
            await page.click('#update-graph');
            
            // Wait for rendering
            await page.waitForTimeout(1000);
            
            // Get viewport dimensions
            const viewport = await page.evaluate(() => ({
                width: window.innerWidth,
                height: window.innerHeight
            }));
            
            // Measure graph dimensions and detect overflow
            const measurements = await page.evaluate(() => {
                const graphContainer = document.querySelector('#text-as-graph');
                const wordsHolder = graphContainer.querySelector('div');
                const rects = wordsHolder.querySelectorAll('rect');
                const arrows = wordsHolder.querySelectorAll('text');
                
                let minX = Infinity, maxX = -Infinity;
                let lineCount = 1;
                
                // Check rectangles for bounds
                rects.forEach(rect => {
                    const x = parseFloat(rect.getAttribute('x'));
                    const width = parseFloat(rect.getAttribute('width'));
                    const y = parseFloat(rect.getAttribute('y'));
                    
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x + width);
                    
                    // Count lines based on Y positions
                    const lineY = Math.round(y / 120);
                    lineCount = Math.max(lineCount, lineY + 1);
                });
                
                // Check arrows for bounds
                arrows.forEach(arrow => {
                    const x = parseFloat(arrow.getAttribute('x'));
                    minX = Math.min(minX, x - 15); // Arrow width buffer
                    maxX = Math.max(maxX, x + 15);
                });
                
                const graphWidth = maxX - minX;
                const containerLeft = parseFloat(getComputedStyle(wordsHolder).left || '0');
                const actualMinX = minX + containerLeft;
                const actualMaxX = maxX + containerLeft;
                
                return {
                    graphWidth,
                    minX: actualMinX,
                    maxX: actualMaxX,
                    lineCount,
                    containerLeft,
                    hasOverflow: actualMinX < 0 || actualMaxX > window.innerWidth
                };
            });
            
            // Take screenshot for visual verification
            const screenshotPath = `/home/kaiser/claude_project1/TextGraph/screenshots/overflow-test-worker${workerId}-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            
            const result = {
                workerId,
                testName: testCase.name,
                text: testCase.text,
                description: testCase.description,
                wordCount: testCase.text.split(' ').length,
                graphWidth: measurements.graphWidth,
                screenWidth: viewport.width,
                hasOverflow: measurements.hasOverflow,
                overflowAmount: measurements.hasOverflow ? 
                    Math.max(0 - measurements.minX, measurements.maxX - viewport.width) : 0,
                widthUsage: (measurements.graphWidth / viewport.width * 100).toFixed(1),
                lineWrapping: measurements.lineCount > 1,
                lineCount: measurements.lineCount,
                screenshotPath,
                measurements
            };
            
            results.push(result);
            
            console.log(`🤖 Worker ${workerId}: ${testCase.name} - ${result.hasOverflow ? 'OVERFLOW' : 'OK'} (${result.widthUsage}% usage)`);
        }
        
    } catch (error) {
        console.error(`🤖 Worker ${workerId} error:`, error);
    } finally {
        await browser.close();
    }
    
    return results;
}

// Run the test
testOverflowBoundaries().catch(console.error);