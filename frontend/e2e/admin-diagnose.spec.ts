import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const _API_URL = 'http://localhost:8000';
const ADMIN_EMAIL = 'admin@hafrose.com';
const ADMIN_PASSWORD = 'Admin@Hafrose2024!';

test('Diagnose admin login - capture ALL requests and errors', async ({ page }) => {
  const allRequests: { method: string; url: string; payload: string }[] = [];
  const allResponses: { url: string; status: number; body: string }[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  // Capture ALL requests
  page.on('request', req => {
    allRequests.push({
      method: req.method(),
      url: req.url(),
      payload: req.postData() || '',
    });
  });

  // Capture ALL responses (including failed ones)
  page.on('response', async resp => {
    try {
      const body = await resp.text();
      allResponses.push({ url: resp.url(), status: resp.status(), body: body.slice(0, 500) });
    } catch {
      allResponses.push({ url: resp.url(), status: resp.status(), body: '[unreadable]' });
    }
  });

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Capture page-level errors
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  // Navigate to admin login
  await page.goto(`${BASE_URL}/admin/login`);
  await page.waitForLoadState('networkidle');

  // Clear previous requests/responses
  allRequests.length = 0;
  allResponses.length = 0;
  consoleErrors.length = 0;
  pageErrors.length = 0;

  // Fill and submit
  await page.locator('#admin-email').fill(ADMIN_EMAIL);
  await page.locator('#admin-password').fill(ADMIN_PASSWORD);

  // Wait for the button to be ready
  await page.locator('button[type="submit"]').waitFor({ state: 'visible' });
  await page.locator('button[type="submit"]').click();

  // Wait for network to settle
  await page.waitForTimeout(5000);

  // Print everything
  console.log('\n=== ALL REQUESTS ===');
  allRequests.forEach(r => console.log(`[${r.method}] ${r.url}${r.payload ? ' BODY: ' + r.payload : ''}`));

  console.log('\n=== ALL RESPONSES ===');
  allResponses.forEach(r => console.log(`[${r.status}] ${r.url}\nBODY: ${r.body}\n`));

  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrors.forEach(e => console.log('ERROR:', e));

  console.log('\n=== PAGE ERRORS ===');
  pageErrors.forEach(e => console.log('PAGE ERROR:', e));

  console.log('\n=== CURRENT URL ===', page.url());

  // Check localStorage
  const ls = await page.evaluate(() => ({
    token: localStorage.getItem('hafrose_auth_token'),
    user: localStorage.getItem('hafrose_user_data'),
  }));
  console.log('\n=== LOCAL STORAGE ===');
  console.log('token:', ls.token ? `EXISTS (len=${ls.token.length})` : 'NULL');
  console.log('user:', ls.user);

  // Get the error message displayed on the page
  const errorEl = page.locator('[class*="alert"], [class*="error"], [role="alert"]').first();
  if (await errorEl.isVisible()) {
    console.log('\n=== ERROR MESSAGE ON PAGE ===', await errorEl.textContent());
  }
});
