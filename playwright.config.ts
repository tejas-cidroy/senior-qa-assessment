import { defineConfig } from '@playwright/test';
import { BASE_URL } from './src/config';

/**
 * One runner for API and UI tests:  npm test
 * Workers = 1 because tests share one environment, one store clock (BR-24) and
 * limited slot capacity (BR-05); parallel runs would interfere with each other.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    {
      name: 'ui',
      testDir: './tests/ui',
      // Trailing slash matters: relative paths like page.goto('catalogue') then keep the /c/<id>/ prefix.
      use: { browserName: 'chromium', baseURL: BASE_URL + '/' },
    },
  ],
});
