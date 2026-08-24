import { test } from '@playwright/test';

test('Diagnose user navigation to /account and /login', async ({ page }) => {
  const consoleLogs: string[] = [];
  const networkLogs: string[] = [];

  page.on('console', msg => {
    const text = `[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleLogs.push(text);
    console.log(text);
  });

  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err);
  });

  page.on('requestfailed', req => {
    const text = `[REQUEST FAILED] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`;
    networkLogs.push(text);
    console.log(text);
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      console.log(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
    }
  });

  console.log('--- Step 1: Navigating to http://localhost:3000/ ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  console.log('Home title:', await page.title());

  console.log('--- Step 2: Clicking on Mon Compte (User icon) ---');
  const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
  await userLink.click();
  await page.waitForTimeout(2000);

  console.log('URL after /account click:', page.url());
  const bodyText1 = await page.innerText('body');
  console.log('Body after /account click:\n', bodyText1.slice(0, 500));

  console.log('--- Step 3: Navigating directly to /login ---');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('URL at /login:', page.url());
  const bodyText2 = await page.innerText('body');
  console.log('Body at /login:\n', bodyText2.slice(0, 1000));

  // Check what is visible on /login
  const heading = page.locator('h1');
  console.log('H1 text at /login:', await heading.allInnerTexts());
});
