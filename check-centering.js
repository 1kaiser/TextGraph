const { chromium } = require('playwright');

async function checkCentering() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    
    try {
        await page.goto('http://10.36.4.200:42040');
        await page.waitForTimeout(3000);
        
        // Test with default text
        console.log('📸 Taking screenshot of current centering...');
        await page.screenshot({ 
            path: '/home/kaiser/claude_project1/TextGraph/screenshots/current-centering.png',
            fullPage: true 
        });
        
        // Check centering measurements
        const measurements = await page.evaluate(() => {
            const wordsHolder = document.querySelector('#text-as-graph > div');
            const adjMatrix = document.querySelector('#text-as-graph > svg');
            
            if (!wordsHolder) return { error: 'No words holder found' };
            
            const wordsLeft = parseFloat(getComputedStyle(wordsHolder).left || '0');
            const wordsWidth = wordsHolder.getBoundingClientRect().width;
            const wordsCenter = wordsLeft + wordsWidth / 2;
            const screenCenter = window.innerWidth / 2;
            
            let matrixLeft = 0, matrixWidth = 0, matrixCenter = 0;
            if (adjMatrix) {
                matrixLeft = parseFloat(getComputedStyle(adjMatrix).left || '0');
                matrixWidth = adjMatrix.getBoundingClientRect().width;
                matrixCenter = matrixLeft + matrixWidth / 2;
            }
            
            return {
                screenWidth: window.innerWidth,
                screenCenter,
                words: {
                    left: wordsLeft,
                    width: wordsWidth,
                    center: wordsCenter,
                    centerError: Math.abs(wordsCenter - screenCenter)
                },
                matrix: adjMatrix ? {
                    left: matrixLeft,
                    width: matrixWidth,
                    center: matrixCenter,
                    centerError: Math.abs(matrixCenter - screenCenter)
                } : null
            };
        });
        
        console.log('\n📊 CENTERING ANALYSIS:');
        console.log('='.repeat(50));
        console.log(`Screen width: ${measurements.screenWidth}px`);
        console.log(`Screen center: ${measurements.screenCenter}px`);
        
        console.log('\n📦 Words Graph:');
        console.log(`   Position: ${measurements.words.left.toFixed(1)}px from left`);
        console.log(`   Width: ${measurements.words.width.toFixed(1)}px`);
        console.log(`   Center: ${measurements.words.center.toFixed(1)}px`);
        console.log(`   Center error: ${measurements.words.centerError.toFixed(1)}px`);
        console.log(`   Status: ${measurements.words.centerError < 5 ? '✅ CENTERED' : '❌ OFF-CENTER'}`);
        
        if (measurements.matrix) {
            console.log('\n🔲 Adjacency Matrix:');
            console.log(`   Position: ${measurements.matrix.left.toFixed(1)}px from left`);
            console.log(`   Width: ${measurements.matrix.width.toFixed(1)}px`);
            console.log(`   Center: ${measurements.matrix.center.toFixed(1)}px`);
            console.log(`   Center error: ${measurements.matrix.centerError.toFixed(1)}px`);
            console.log(`   Status: ${measurements.matrix.centerError < 5 ? '✅ CENTERED' : '❌ OFF-CENTER'}`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

checkCentering();