const { chromium } = require('playwright');

async function checkVisual() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    
    try {
        await page.goto('http://10.36.4.200:42040');
        await page.waitForTimeout(3000);
        
        // Take screenshot
        await page.screenshot({ 
            path: '/home/kaiser/claude_project1/TextGraph/screenshots/final-layout.png',
            fullPage: true 
        });
        
        console.log('📸 Screenshot saved: final-layout.png');
        
        // Test dragging functionality
        const dragHandle = await page.$('.drag-handle');
        if (dragHandle) {
            console.log('🔴 Red drag handle found');
            
            // Test drag movement
            await dragHandle.hover();
            await page.mouse.down();
            await page.mouse.move(500, 300);
            await page.mouse.up();
            
            await page.screenshot({ 
                path: '/home/kaiser/claude_project1/TextGraph/screenshots/after-drag.png',
                fullPage: true 
            });
            
            console.log('📸 After drag screenshot saved');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

checkVisual();