
import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';

const PORT = 1237;

test.describe('Model Loading and Inference', () => {
  let serverProcess;

  test.beforeAll(async () => {
    // Start vite server
    console.log(`Starting vite server on port ${PORT}...`);
    serverProcess = spawn('npx', ['vite', '--port', PORT.toString()], {
      stdio: 'pipe',
      shell: true
    });

    serverProcess.stdout.on('data', (data) => {
      // console.log(`Vite stdout: ${data}`);
    });
    serverProcess.stderr.on('data', (data) => {
      // console.error(`Vite stderr: ${data}`);
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  test.afterAll(() => {
    if (serverProcess) {
      try {
        process.kill(-serverProcess.pid);
      } catch (e) {
        // ignore
      }
      try {
        serverProcess.kill();
      } catch (e) {
        // ignore
      }
    }
  });

  test('Verify progress bar, console logs, and inference', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes timeout for model download

    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('Loading model') || text.includes('TextGraph') || text.includes('progress')) {
          console.log(`BROWSER_LOG: ${text}`);
      }
    });

    console.log(`Navigating to http://localhost:${PORT}`);
    await page.goto(`http://localhost:${PORT}`);

    // Check for progress bar
    const loadingIndicator = page.locator('.loading-indicator');
    const progressBarFill = page.locator('.progress-bar-fill');

    // Attempt to catch loading state
    try {
        await expect(loadingIndicator).toBeVisible({ timeout: 5000 });
        console.log("Loading indicator visible.");

        // Take a screenshot of loading state
        await page.screenshot({ path: 'screenshot_loading.png' });
        console.log("Captured screenshot_loading.png");

        // Verify progress bar width changes (optional, but good for "works or not")
        // We can check if style attribute contains width
        const widthStyle = await progressBarFill.getAttribute('style');
        console.log(`Progress bar style: ${widthStyle}`);

    } catch (e) {
        console.log("Loading indicator not caught (might have loaded too fast or error).");
    }

    // Wait for loading to finish
    console.log("Waiting for loading to complete...");
    await expect(loadingIndicator).toBeHidden({ timeout: 120000 });
    console.log("Loading complete.");

    // Verify logs
    const progressLogs = logs.filter(l => l.includes('Loading model') || l.includes('progress'));
    console.log(`Caught ${progressLogs.length} progress-related logs.`);

    // Verify Tokenizer loaded log
    const tokenizerLog = logs.find(l => l.includes('✅ Tokenizer loaded and tested.'));
    expect(tokenizerLog).toBeDefined();
    console.log("Verified tokenizer success log.");

    // Verify Inference
    console.log("Testing inference input...");
    const input = page.locator('#manual-text-input');
    await input.fill('Playwright test inference');
    await input.press('Enter');

    // Wait for graph to update
    // The first word 'playwright' should appear as a text node in the graph
    // Note: tokenization might split it or lowercase it. "Playwright" -> "playwright"
    const graphText = page.locator('#text-as-graph text').filter({ hasText: 'playwright' });
    await expect(graphText.first()).toBeVisible({ timeout: 10000 });
    console.log("Inference success: 'playwright' node found in graph.");

    // Take final screenshot
    await page.screenshot({ path: 'screenshot_final.png' });
    console.log("Captured screenshot_final.png");
  });
});
