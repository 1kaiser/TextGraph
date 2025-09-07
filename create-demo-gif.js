/**
 * Create interactive GIF demo of TextGraph GAT attention visualization
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function createInteractiveDemo() {
  console.log('🎬 Starting TextGraph interactive demo capture...');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser for debugging
    slowMo: 500      // Slow down actions for better GIF capture
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: './screenshots/',
      size: { width: 1280, height: 800 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to local server
    console.log('📂 Navigating to TextGraph...');
    await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Demo Sequence 1: Enter context paragraph
    console.log('📝 Entering context paragraph...');
    const paragraphInput = await page.locator('#paragraph-input');
    await paragraphInput.click();
    await paragraphInput.fill('Graph neural networks are powerful tools for analyzing structured data. Attention mechanisms enable nodes to focus on relevant neighbors. Modern architectures combine both approaches for enhanced performance.');
    await page.waitForTimeout(1500);
    
    // Demo Sequence 2: Enter query text
    console.log('🎯 Entering query sentence...');
    const queryInput = await page.locator('#manual-text-input');
    await queryInput.click();
    await queryInput.fill('Attention mechanisms enable nodes');
    await page.waitForTimeout(1500);
    
    // Demo Sequence 3: Trigger GAT computation
    console.log('🧠 Computing GAT attention...');
    const computeButton = await page.locator('#update-graph');
    await computeButton.click();
    await page.waitForTimeout(3000); // Wait for computation and rendering
    
    // Demo Sequence 4: Show hover interactions - graph nodes
    console.log('🎨 Demonstrating hover interactions...');
    const graphNodes = await page.locator('#text-as-graph text').all();
    
    // Hover over first few nodes to show matrix highlighting
    for (let i = 0; i < Math.min(3, graphNodes.length); i++) {
      await graphNodes[i].hover();
      await page.waitForTimeout(1500);
    }
    
    // Demo Sequence 5: Show matrix hover interactions
    console.log('🔗 Demonstrating matrix interactions...');
    const matrixCells = await page.locator('.adj-mat-square, rect[data-attention]').all();
    
    // Hover over matrix cells to show graph highlighting
    for (let i = 0; i < Math.min(4, matrixCells.length); i++) {
      try {
        await matrixCells[i].hover();
        await page.waitForTimeout(1200);
      } catch (e) {
        console.log(`Skipping matrix cell ${i}: ${e.message}`);
      }
    }
    
    // Demo Sequence 6: Show different query
    console.log('🔄 Demonstrating with different query...');
    await queryInput.click();
    await queryInput.fill('Graph neural networks analysis');
    await computeButton.click();
    await page.waitForTimeout(2500);
    
    // Final hover demonstration
    const finalNodes = await page.locator('#text-as-graph text').all();
    for (let i = 0; i < Math.min(2, finalNodes.length); i++) {
      await finalNodes[i].hover();
      await page.waitForTimeout(1000);
    }
    
    // End with a pause to show final state
    await page.waitForTimeout(2000);
    
    console.log('✅ Demo sequence completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during demo capture:', error);
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('🎞️ Video saved to screenshots/ directory');
  console.log('📝 Convert to GIF using: ffmpeg -i video.webm -vf "fps=10,scale=640:400" textgraph-demo.gif');
}

// Run the demo
if (require.main === module) {
  createInteractiveDemo().catch(console.error);
}

module.exports = { createInteractiveDemo };