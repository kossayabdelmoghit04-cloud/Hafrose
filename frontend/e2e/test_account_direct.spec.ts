import { test, expect } from '@playwright/test';

test('Test direct access to /account without auth and with auth', async ({ page }) => {
  // Clear any stale auth state from previous tests
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('hafrose_auth_token');
    localStorage.removeItem('hafrose_user_data');
    localStorage.removeItem('hafrose_admin_token');
    sessionStorage.clear();
  });

  console.log('--- Step 1: Navigating directly to http://localhost:3000/account (visiteur non connecté) ---');
  await page.goto('http://localhost:3000/account', { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/login/, { timeout: 10000 });
  
  const currentUrl1 = page.url();
  console.log('URL actuelle après accès à /account (visiteur) :', currentUrl1);

  // Wait for React to render the h1, then assert
  const h1Locator = page.locator('h1');
  await expect(h1Locator).toHaveText('Connexion Client', { timeout: 8000 });
  const h1Text1 = await h1Locator.allInnerTexts();
  console.log('H1 visible :', h1Text1);

  // Screenshot du résultat visiteur
  await page.screenshot({ path: 'test-results/account_visitor_test.png', fullPage: true });

  // Doit rediriger vers /login
  expect(currentUrl1).toContain('/login');
  expect(h1Text1[0]).toBe('Connexion Client');

  console.log('--- Step 2: Connexion avec un compte client valide ---');
  await page.fill('input[type="email"]', 'client@hafrose.com');
  await page.fill('input[type="password"]', 'Secret123!');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/account/, { timeout: 20000 });
  await expect(page).toHaveURL(/\/account/);
  const welcomeHeading = page.locator('h1');
  await expect(welcomeHeading).toContainText('Ravi de vous revoir');
  console.log('H1 text in dashboard :', await welcomeHeading.innerText());

  // Screenshot du dashboard client
  await page.screenshot({ path: 'test-results/account_authenticated_test.png', fullPage: true });
});
