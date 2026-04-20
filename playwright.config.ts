import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Chrome args that work on both local macOS and Linux CI runners.
// --no-sandbox / --disable-dev-shm-usage are required on Linux Docker environments.
const chromeArgs = [
  '--disable-notifications',
  '--disable-popup-blocking',
  '--no-first-run',
  '--disable-infobars',
  ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] : []),
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL:           process.env.BASE_URL ?? 'http://localhost:3000',
    headless:          !!process.env.CI,
    trace:             'on-first-retry',
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    actionTimeout:     15000,
    navigationTimeout: 30000,
    permissions:       ['notifications'],
  },

  projects: [
    // ── Auth setup — runs once, saves browser state ──────────
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: chromeArgs },
      },
    },

    // ── Login / auth flow tests — no saved state ─────────────
    {
      name: 'chromium',
      testMatch: /tests\/auth\/.*/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: chromeArgs },
      },
    },

    // ── Dashboard tests — reuse authenticated state ──────────
    {
      name: 'chromium-authenticated',
      testMatch: /tests\/dashboard\/.*/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
        launchOptions: { args: chromeArgs },
      },
    },
  ],

  outputDir: 'test-results/',
});
