/**
 * Create simple demo screenshots that work around viewport issues
 */

const { chromium } = require('playwright');

async function createSimpleDemo() {
  console.log('📸 Starting simple TextGraph demo...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    let shotNumber = 4; // Continue from where we left off
    
    // Just work with the default query that's already there
    console.log(`🧠 Computing with existing query...`);
    await page.evaluate(() => {
      // Use JavaScript to trigger the function directly
      if (typeof updateVisualization === 'function') {
        updateVisualization();
      }
    });
    await page.waitForTimeout(3000);
    console.log(`📷 Screenshot ${shotNumber}: GAT computed`);
    await page.screenshot({ 
      path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png`,
      fullPage: false
    });
    shotNumber++;
    
    // Try different approach for interactions
    console.log(`🎨 Attempting hover interactions...`);
    try {
      // Use evaluate to hover via JavaScript
      await page.evaluate(() => {
        const nodes = document.querySelectorAll('#text-as-graph text');
        if (nodes.length > 0) {
          // Simulate hover on first node
          const event = new MouseEvent('mouseover', { bubbles: true });
          nodes[0].dispatchEvent(event);
        }
      });
      await page.waitForTimeout(1000);
      console.log(`📷 Screenshot ${shotNumber}: Hover interaction`);
      await page.screenshot({ 
        path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png`,
        fullPage: false
      });
      shotNumber++;
      
      // Hover on matrix cell via JavaScript
      await page.evaluate(() => {
        const rects = document.querySelectorAll('rect');
        if (rects.length > 3) {
          const event = new MouseEvent('mouseover', { bubbles: true });
          rects[3].dispatchEvent(event);
        }
      });
      await page.waitForTimeout(1000);
      console.log(`📷 Screenshot ${shotNumber}: Matrix hover`);
      await page.screenshot({ 
        path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png`,
        fullPage: false
      });
      shotNumber++;
      
    } catch (error) {
      console.log('Hover interactions failed, skipping...');
    }
    
    // Reset hover states
    await page.evaluate(() => {
      const nodes = document.querySelectorAll('#text-as-graph text');
      const rects = document.querySelectorAll('rect');
      [...nodes, ...rects].forEach(el => {
        const event = new MouseEvent('mouseout', { bubbles: true });
        el.dispatchEvent(event);
      });
    });
    await page.waitForTimeout(500);
    
    console.log(`📷 Screenshot ${shotNumber}: Final state`);
    await page.screenshot({ 
      path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png`,
      fullPage: false
    });
    
    console.log(`✅ Created ${shotNumber - 3} additional screenshots!`);
    console.log('🎞️ Total demo screenshots: 01-07.png');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

createSimpleDemo().catch(console.error);