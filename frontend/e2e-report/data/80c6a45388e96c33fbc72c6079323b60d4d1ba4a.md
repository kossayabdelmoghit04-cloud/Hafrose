# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-diagnose.spec.ts >> Diagnose admin login - capture ALL requests and errors
- Location: e2e\admin-diagnose.spec.ts:8:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/login
Call log:
  - navigating to "http://localhost:3000/admin/login", waiting until "load"

```

# Test source

```ts
  1  | import { test } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:3000';
  4  | const _API_URL = 'http://localhost:8000';
  5  | const ADMIN_EMAIL = 'admin@hafrose.com';
  6  | const ADMIN_PASSWORD = 'Admin@Hafrose2024!';
  7  | 
  8  | test('Diagnose admin login - capture ALL requests and errors', async ({ page }) => {
  9  |   const allRequests: { method: string; url: string; payload: string }[] = [];
  10 |   const allResponses: { url: string; status: number; body: string }[] = [];
  11 |   const consoleErrors: string[] = [];
  12 |   const pageErrors: string[] = [];
  13 | 
  14 |   // Capture ALL requests
  15 |   page.on('request', req => {
  16 |     allRequests.push({
  17 |       method: req.method(),
  18 |       url: req.url(),
  19 |       payload: req.postData() || '',
  20 |     });
  21 |   });
  22 | 
  23 |   // Capture ALL responses (including failed ones)
  24 |   page.on('response', async resp => {
  25 |     try {
  26 |       const body = await resp.text();
  27 |       allResponses.push({ url: resp.url(), status: resp.status(), body: body.slice(0, 500) });
  28 |     } catch {
  29 |       allResponses.push({ url: resp.url(), status: resp.status(), body: '[unreadable]' });
  30 |     }
  31 |   });
  32 | 
  33 |   // Capture console errors
  34 |   page.on('console', msg => {
  35 |     if (msg.type() === 'error') {
  36 |       consoleErrors.push(msg.text());
  37 |     }
  38 |   });
  39 | 
  40 |   // Capture page-level errors
  41 |   page.on('pageerror', err => {
  42 |     pageErrors.push(err.message);
  43 |   });
  44 | 
  45 |   // Navigate to admin login
> 46 |   await page.goto(`${BASE_URL}/admin/login`);
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/login
  47 |   await page.waitForLoadState('networkidle');
  48 | 
  49 |   // Clear previous requests/responses
  50 |   allRequests.length = 0;
  51 |   allResponses.length = 0;
  52 |   consoleErrors.length = 0;
  53 |   pageErrors.length = 0;
  54 | 
  55 |   // Fill and submit
  56 |   await page.locator('#admin-email').fill(ADMIN_EMAIL);
  57 |   await page.locator('#admin-password').fill(ADMIN_PASSWORD);
  58 | 
  59 |   // Wait for the button to be ready
  60 |   await page.locator('button[type="submit"]').waitFor({ state: 'visible' });
  61 |   await page.locator('button[type="submit"]').click();
  62 | 
  63 |   // Wait for network to settle
  64 |   await page.waitForTimeout(5000);
  65 | 
  66 |   // Print everything
  67 |   console.log('\n=== ALL REQUESTS ===');
  68 |   allRequests.forEach(r => console.log(`[${r.method}] ${r.url}${r.payload ? ' BODY: ' + r.payload : ''}`));
  69 | 
  70 |   console.log('\n=== ALL RESPONSES ===');
  71 |   allResponses.forEach(r => console.log(`[${r.status}] ${r.url}\nBODY: ${r.body}\n`));
  72 | 
  73 |   console.log('\n=== CONSOLE ERRORS ===');
  74 |   consoleErrors.forEach(e => console.log('ERROR:', e));
  75 | 
  76 |   console.log('\n=== PAGE ERRORS ===');
  77 |   pageErrors.forEach(e => console.log('PAGE ERROR:', e));
  78 | 
  79 |   console.log('\n=== CURRENT URL ===', page.url());
  80 | 
  81 |   // Check localStorage
  82 |   const ls = await page.evaluate(() => ({
  83 |     token: localStorage.getItem('hafrose_auth_token'),
  84 |     user: localStorage.getItem('hafrose_user_data'),
  85 |   }));
  86 |   console.log('\n=== LOCAL STORAGE ===');
  87 |   console.log('token:', ls.token ? `EXISTS (len=${ls.token.length})` : 'NULL');
  88 |   console.log('user:', ls.user);
  89 | 
  90 |   // Get the error message displayed on the page
  91 |   const errorEl = page.locator('[class*="alert"], [class*="error"], [role="alert"]').first();
  92 |   if (await errorEl.isVisible()) {
  93 |     console.log('\n=== ERROR MESSAGE ON PAGE ===', await errorEl.textContent());
  94 |   }
  95 | });
  96 | 
```