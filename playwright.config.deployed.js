module.exports = {
  testDir: '.',
  testMatch: '**/test-deployed-full.spec.js',
  timeout: 60000,
  use: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  workers: 3,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],
};
