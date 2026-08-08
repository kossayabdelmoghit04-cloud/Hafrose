import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000';

const TEST_CREDENTIALS = {
  email: 'client.test@hafrose.com',
  password: 'password',
};

test.setTimeout(60000);

test('2. Authentication flow: Login → Account → Logout', async ({ page }) => {
  // Listen to browser console and network response errors
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('response', resp => {
    if (resp.url().includes('/api/')) {
      console.log(`API [${resp.status()}] ${resp.url()}`);
    }
  });

  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('form', { timeout: 10000 });

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_CREDENTIALS.email);
  await passwordInput.fill(TEST_CREDENTIALS.password);

  console.log('Filled email:', await emailInput.inputValue());
  console.log('Filled password length:', (await passwordInput.inputValue()).length);

  await page.getByRole('button', { name: /Se Connecter/i }).click();

  // Wait a few seconds to observe reactions
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log('Current URL after submit:', currentUrl);

  const alertMsg = await page.locator('[role="alert"]').textContent().catch(() => null);
  if (alertMsg) {
    console.log('Alert on page:', alertMsg.trim());
  }

  await expect(page).toHaveURL(/account/);
});
