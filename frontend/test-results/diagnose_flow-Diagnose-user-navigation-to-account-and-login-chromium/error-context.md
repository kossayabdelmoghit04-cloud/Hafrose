# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagnose_flow.spec.ts >> Diagnose user navigation to /account and /login
- Location: e2e\diagnose_flow.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | import { test } from '@playwright/test';
  2  | 
  3  | test('Diagnose user navigation to /account and /login', async ({ page }) => {
  4  |   const consoleLogs: string[] = [];
  5  |   const networkLogs: string[] = [];
  6  | 
  7  |   page.on('console', msg => {
  8  |     const text = `[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`;
  9  |     consoleLogs.push(text);
  10 |     console.log(text);
  11 |   });
  12 | 
  13 |   page.on('pageerror', err => {
  14 |     console.log('[PAGE ERROR]', err);
  15 |   });
  16 | 
  17 |   page.on('requestfailed', req => {
  18 |     const text = `[REQUEST FAILED] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`;
  19 |     networkLogs.push(text);
  20 |     console.log(text);
  21 |   });
  22 | 
  23 |   page.on('response', res => {
  24 |     if (res.status() >= 400) {
  25 |       console.log(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
  26 |     }
  27 |   });
  28 | 
  29 |   console.log('--- Step 1: Navigating to http://localhost:3000/ ---');
> 30 |   await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  31 |   console.log('Home title:', await page.title());
  32 | 
  33 |   console.log('--- Step 2: Clicking on Mon Compte (User icon) ---');
  34 |   const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
  35 |   await userLink.click();
  36 |   await page.waitForTimeout(2000);
  37 | 
  38 |   console.log('URL after /account click:', page.url());
  39 |   const bodyText1 = await page.innerText('body');
  40 |   console.log('Body after /account click:\n', bodyText1.slice(0, 500));
  41 | 
  42 |   console.log('--- Step 3: Navigating directly to /login ---');
  43 |   await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  44 |   await page.waitForTimeout(1000);
  45 | 
  46 |   console.log('URL at /login:', page.url());
  47 |   const bodyText2 = await page.innerText('body');
  48 |   console.log('Body at /login:\n', bodyText2.slice(0, 1000));
  49 | 
  50 |   // Check what is visible on /login
  51 |   const heading = page.locator('h1');
  52 |   console.log('H1 text at /login:', await heading.allInnerTexts());
  53 | });
  54 | 
```