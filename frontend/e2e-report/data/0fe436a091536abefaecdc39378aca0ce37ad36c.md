# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_account_direct.spec.ts >> Test direct access to /account without auth and with auth
- Location: e2e\test_account_direct.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Test direct access to /account without auth and with auth', async ({ page }) => {
  4  |   // Clear any stale auth state from previous tests
> 5  |   await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  6  |   await page.evaluate(() => {
  7  |     localStorage.removeItem('hafrose_auth_token');
  8  |     localStorage.removeItem('hafrose_user_data');
  9  |     localStorage.removeItem('hafrose_admin_token');
  10 |     sessionStorage.clear();
  11 |   });
  12 | 
  13 |   console.log('--- Step 1: Navigating directly to http://localhost:3000/account (visiteur non connecté) ---');
  14 |   await page.goto('http://localhost:3000/account', { waitUntil: 'domcontentloaded' });
  15 |   await page.waitForURL(/\/login/, { timeout: 10000 });
  16 |   
  17 |   const currentUrl1 = page.url();
  18 |   console.log('URL actuelle après accès à /account (visiteur) :', currentUrl1);
  19 | 
  20 |   // Wait for React to render the h1, then assert
  21 |   const h1Locator = page.locator('h1');
  22 |   await expect(h1Locator).toHaveText('Connexion Client', { timeout: 8000 });
  23 |   const h1Text1 = await h1Locator.allInnerTexts();
  24 |   console.log('H1 visible :', h1Text1);
  25 | 
  26 |   // Screenshot du résultat visiteur
  27 |   await page.screenshot({ path: 'test-results/account_visitor_test.png', fullPage: true });
  28 | 
  29 |   // Doit rediriger vers /login
  30 |   expect(currentUrl1).toContain('/login');
  31 |   expect(h1Text1[0]).toBe('Connexion Client');
  32 | 
  33 |   console.log('--- Step 2: Connexion avec un compte client valide ---');
  34 |   await page.fill('input[type="email"]', 'client@hafrose.com');
  35 |   await page.fill('input[type="password"]', 'Secret123!');
  36 |   await page.click('button[type="submit"]');
  37 | 
  38 |   await page.waitForURL(/\/account/, { timeout: 20000 });
  39 |   await expect(page).toHaveURL(/\/account/);
  40 |   const welcomeHeading = page.locator('h1');
  41 |   await expect(welcomeHeading).toContainText('Ravi de vous revoir');
  42 |   console.log('H1 text in dashboard :', await welcomeHeading.innerText());
  43 | 
  44 |   // Screenshot du dashboard client
  45 |   await page.screenshot({ path: 'test-results/account_authenticated_test.png', fullPage: true });
  46 | });
  47 | 
```