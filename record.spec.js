const { test, expect } = require('@playwright/test');

test('record interactions', async ({ page }) => {
  await page.goto('http://localhost:1234');

  // Wait for the real embedding model to be ready (or fail gracefully)
  try {
    await expect(page.locator('#real-embedding-label')).not.toHaveAttribute('title', 'Loading model...', { timeout: 60000 });
  } catch (e) {
    console.warn('Real embedding model did not load in time, continuing with synthetic embeddings.');
  }

  // Type in a new paragraph
  await page.locator('#paragraph-input').fill('This is a test paragraph for the recording. It demonstrates the ability of the model to process new text and generate a graph visualization based on attention mechanisms.');

  // Type in a new query sentence
  await page.locator('#manual-text-input').fill('A test for the recording');

  // Click the update graph button
  await page.locator('#update-graph').click();

  // Wait for the graph to be generated. We can check for the presence of SVG elements.
  await expect(page.locator('#text-as-graph > svg').first()).toBeVisible();

  // Drag the input box
  const inputBox = page.locator('.text-input-section');
  await inputBox.hover();
  await page.mouse.down();
  await page.mouse.move(500, 200);
  await page.mouse.up();

  // Wait for a moment to see the result
  await page.waitForTimeout(5000);
});