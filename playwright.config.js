module.exports = {
  testDir: './',
  testMatch: '**/*.spec.js',
  timeout: 120000, // Increased timeout to 2 minutes for model loading
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    video: 'on', // Enable video recording
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
};