/**
 * Create series of screenshots for TextGraph interactive demo
 * These can be combined into a GIF using external tools
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function createDemoScreenshots() {
  console.log('📸 Starting TextGraph demo screenshot sequence...');
  
  const browser = await chromium.launch({ 
    headless: true  // Run headless for screenshots
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 } // Larger viewport to fit all elements
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to local server
    console.log('📂 Loading TextGraph...');
    await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    let shotNumber = 1;
    
    // Screenshot 1: Initial state
    console.log(`📷 Screenshot ${shotNumber}: Initial state`);
    await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
    shotNumber++;
    
    // Screenshot 2: Show paragraph section
    console.log(`📝 Opening paragraph section...`);
    await page.click('#toggle-paragraph'); // First expand the paragraph section
    await page.waitForTimeout(500);
    console.log(`📷 Screenshot ${shotNumber}: Paragraph section opened`);
    await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
    shotNumber++;
    
    // Screenshot 3: Enter context paragraph
    console.log(`📝 Entering context paragraph...`);
    await page.click('#paragraph-input');
    await page.fill('#paragraph-input', 'Graph neural networks are powerful tools for analyzing structured data. Attention mechanisms enable nodes to focus on relevant neighbors.');
    console.log(`📷 Screenshot ${shotNumber}: Context entered`);
    await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
    shotNumber++;
    
    // Screenshot 4: Enter query text
    console.log(`🎯 Entering query sentence...`);
    await page.locator('#manual-text-input').scrollIntoViewIfNeeded();
    await page.click('#manual-text-input', { force: true });
    await page.fill('#manual-text-input', 'Attention mechanisms enable nodes');
    console.log(`📷 Screenshot ${shotNumber}: Query entered`);
    await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
    shotNumber++;
    
    // Screenshot 5: After GAT computation
    console.log(`🧠 Computing GAT attention...`);
    await page.click('#update-graph');
    await page.waitForTimeout(3000); // Wait for computation
    console.log(`📷 Screenshot ${shotNumber}: GAT computed - transparency applied`);
    await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
    shotNumber++;
    
    // Screenshot 5: Hover on first graph node
    const graphNodes = await page.locator('#text-as-graph text').all();
    if (graphNodes.length > 0) {
      console.log(`🎨 Hovering on graph node...`);
      await graphNodes[0].hover();
      await page.waitForTimeout(500);
      console.log(`📷 Screenshot ${shotNumber}: Graph node hover - matrix highlighting`);
      await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
      shotNumber++;
    }
    
    // Screenshot 6: Hover on second graph node
    if (graphNodes.length > 1) {
      await graphNodes[1].hover();
      await page.waitForTimeout(500);
      console.log(`📷 Screenshot ${shotNumber}: Second node hover`);
      await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
      shotNumber++;
    }
    
    // Screenshot 7: Hover on matrix cell
    const matrixCells = await page.locator('rect').all();
    if (matrixCells.length > 5) {
      console.log(`🔗 Hovering on matrix cell...`);
      await matrixCells[5].hover();
      await page.waitForTimeout(500);
      console.log(`📷 Screenshot ${shotNumber}: Matrix cell hover - graph highlighting`);
      await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
      shotNumber++;
    }
    
    // Screenshot 8: Different query
    console.log(`🔄 Changing to different query...`);
    await page.click('#manual-text-input');
    await page.fill('#manual-text-input', 'Graph neural networks');
    await page.click('#update-graph');
    await page.waitForTimeout(2500);
    console.log(`📷 Screenshot ${shotNumber}: New query computed`);
    await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
    shotNumber++;
    
    // Screenshot 9: Final hover state
    const finalNodes = await page.locator('#text-as-graph text').all();
    if (finalNodes.length > 0) {
      await finalNodes[0].hover();
      await page.waitForTimeout(500);
      console.log(`📷 Screenshot ${shotNumber}: Final interactive state`);
      await page.screenshot({ path: `screenshots/demo-${String(shotNumber).padStart(2, '0')}.png` });
    }
    
    console.log(`✅ Created ${shotNumber - 1} demo screenshots!`);
    console.log('🎞️ To create GIF: convert -delay 100 screenshots/demo-*.png textgraph-demo.gif');
    console.log('Or use: ffmpeg -framerate 2 -pattern_type glob -i "screenshots/demo-*.png" -vf scale=800:500 textgraph-demo.gif');
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the demo
createDemoScreenshots().catch(console.error);