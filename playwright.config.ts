import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Fitness Timer E2E tests
 * Tests run with iPhone viewport by default for mobile-first validation
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    // Base URL for test navigation
    baseURL: 'http://localhost:3000',

    // Trace for debugging failed tests
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'firefox-mobile',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],

  // Web Server configuration
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
