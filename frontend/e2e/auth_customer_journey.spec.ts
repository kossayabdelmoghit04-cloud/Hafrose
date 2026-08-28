import { test, expect } from '@playwright/test';

test.describe('Customer Authentication and Account Journey', () => {

  test('TEST 1: Direct access to /login when online displays LoginPage without offline error', async ({ page }) => {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    
    // Check heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Connexion Client');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Se Connecter');

    // Confirm no offline screen
    const offlineIcon = page.locator('svg.lucide-wifi-off');
    await expect(offlineIcon).toHaveCount(0);
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('Hors Connexion');
    expect(bodyText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  });

  test('TEST 2: Visitor clicks Mon Compte icon in Header -> redirects to /login', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // Click on User icon
    const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
    await userLink.click();
    
    // Expect URL to become /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1')).toHaveText('Connexion Client');
  });

  test('TEST 5: Invalid login credentials show auth error alert (NOT offline screen)', async ({ page }) => {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    
    await page.fill('input[type="email"]', 'wronguser@example.com');
    await page.fill('input[type="password"]', 'WrongPassword999!');
    await page.click('button[type="submit"]');
    
    // An error alert should appear
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    const alertText = await alert.innerText();
    expect(alertText).toMatch(/Identifiants incorrects|Erreur de connexion|Veuillez/i);

    // Confirm no offline state
    expect(alertText).not.toContain('Hors Connexion');
    expect(alertText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  });

  test('TEST 3: Valid customer login redirects to /account', async ({ page }) => {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    
    await page.fill('input[type="email"]', 'client@hafrose.com');
    await page.fill('input[type="password"]', 'Secret123!');
    await page.click('button[type="submit"]');
    
    // Expect redirection to /account
    await expect(page).toHaveURL(/.*\/account/);
    
    // Verify dashboard welcome message
    const welcome = page.locator('h1');
    await expect(welcome).toContainText('Ravi de vous revoir');
    await expect(welcome).toContainText('Sophie');

    // Confirm no offline screen
    const offlineIcon = page.locator('svg.lucide-wifi-off');
    await expect(offlineIcon).toHaveCount(0);
  });

  test('TEST 4 & 6: Logged-in user can access /account, /account/orders, and click Mon compte', async ({ page }) => {
    // 1. Log in
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'client@hafrose.com');
    await page.fill('input[type="password"]', 'Secret123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/account/, { timeout: 20000 });
    await expect(page).toHaveURL(/.*\/account/);

    // 2. Navigate to orders page
    await page.goto('http://localhost:3000/account/orders', { waitUntil: 'domcontentloaded' });
    const ordersHeading = page.locator('h1');
    await expect(ordersHeading).toHaveText('Mes Commandes');

    // 3. Confirm no offline screen on orders page
    const offlineIcon = page.locator('svg.lucide-wifi-off');
    await expect(offlineIcon).toHaveCount(0);

    // 4. Return to home and click Mon Compte
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    // Wait for the authenticated link to appear (href=/account not /login)
    const userLink = page.locator('a[aria-label="Mon compte"][href="/account"], a[href="/account"]').first();
    await expect(userLink).toBeVisible({ timeout: 10000 });
    await userLink.click();
    
    // Since user is logged in, it should go directly to /account, NOT /login
    await page.waitForURL(/.*\/account/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/account/);
    await expect(page.locator('h1')).toContainText('Ravi de vous revoir');
  });

  test('TEST 7: Register a new customer account', async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}@hafrose.com`;
    await page.goto('http://localhost:3000/register', { waitUntil: 'domcontentloaded' });
    
    // Fill register form using actual RegisterPage.tsx placeholders
    await page.fill('input[placeholder="Éléonore"]', 'Claire');
    await page.fill('input[placeholder="De Saint-Germain"]', 'Dubois');
    await page.fill('input[type="email"]', uniqueEmail);
    // Fill password fields (both use placeholder="••••••••")
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('SecretPass123!');
    await passwordInputs.nth(1).fill('SecretPass123!');
    
    // Check CGV checkbox
    const terms = page.locator('input[type="checkbox"]');
    if (await terms.count() > 0) {
      await terms.first().check();
    }
    
    await page.click('button[type="submit"]');
    
    // Expect redirect to /account or success
    await expect(page).toHaveURL(/.*\/account/);
  });

});
