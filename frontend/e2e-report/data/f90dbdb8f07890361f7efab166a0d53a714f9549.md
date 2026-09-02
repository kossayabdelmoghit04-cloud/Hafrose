# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth_customer_journey.spec.ts >> Customer Authentication and Account Journey >> TEST 1: Direct access to /login when online displays LoginPage without offline error
- Location: e2e\auth_customer_journey.spec.ts:5:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "domcontentloaded"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Customer Authentication and Account Journey', () => {
  4   | 
  5   |   test('TEST 1: Direct access to /login when online displays LoginPage without offline error', async ({ page }) => {
> 6   |     await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  7   |     
  8   |     // Check heading
  9   |     const heading = page.locator('h1');
  10  |     await expect(heading).toHaveText('Connexion Client');
  11  |     
  12  |     // Check form elements
  13  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  14  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  15  |     await expect(page.locator('button[type="submit"]')).toContainText('Se Connecter');
  16  | 
  17  |     // Confirm no offline screen
  18  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  19  |     await expect(offlineIcon).toHaveCount(0);
  20  |     const bodyText = await page.innerText('body');
  21  |     expect(bodyText).not.toContain('Hors Connexion');
  22  |     expect(bodyText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  23  |   });
  24  | 
  25  |   test('TEST 2: Visitor clicks Mon Compte icon in Header -> redirects to /login', async ({ page }) => {
  26  |     await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  27  |     
  28  |     // Click on User icon
  29  |     const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
  30  |     await userLink.click();
  31  |     
  32  |     // Expect URL to become /login
  33  |     await expect(page).toHaveURL(/.*\/login/);
  34  |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  35  |   });
  36  | 
  37  |   test('TEST 5: Invalid login credentials show auth error alert (NOT offline screen)', async ({ page }) => {
  38  |     await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  39  |     
  40  |     await page.fill('input[type="email"]', 'wronguser@example.com');
  41  |     await page.fill('input[type="password"]', 'WrongPassword999!');
  42  |     await page.click('button[type="submit"]');
  43  |     
  44  |     // An error alert should appear
  45  |     const alert = page.locator('[role="alert"]');
  46  |     await expect(alert).toBeVisible();
  47  |     const alertText = await alert.innerText();
  48  |     expect(alertText).toMatch(/Identifiants incorrects|Erreur de connexion|Veuillez/i);
  49  | 
  50  |     // Confirm no offline state
  51  |     expect(alertText).not.toContain('Hors Connexion');
  52  |     expect(alertText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  53  |   });
  54  | 
  55  |   test('TEST 3: Valid customer login redirects to /account', async ({ page }) => {
  56  |     await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  57  |     
  58  |     await page.fill('input[type="email"]', 'client@hafrose.com');
  59  |     await page.fill('input[type="password"]', 'Secret123!');
  60  |     await page.click('button[type="submit"]');
  61  |     
  62  |     // Expect redirection to /account
  63  |     await expect(page).toHaveURL(/.*\/account/);
  64  |     
  65  |     // Verify dashboard welcome message
  66  |     const welcome = page.locator('h1');
  67  |     await expect(welcome).toContainText('Ravi de vous revoir');
  68  |     await expect(welcome).toContainText('Sophie');
  69  | 
  70  |     // Confirm no offline screen
  71  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  72  |     await expect(offlineIcon).toHaveCount(0);
  73  |   });
  74  | 
  75  |   test('TEST 4 & 6: Logged-in user can access /account, /account/orders, and click Mon compte', async ({ page }) => {
  76  |     // 1. Log in
  77  |     await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  78  |     await page.fill('input[type="email"]', 'client@hafrose.com');
  79  |     await page.fill('input[type="password"]', 'Secret123!');
  80  |     await page.click('button[type="submit"]');
  81  |     await page.waitForURL(/.*\/account/, { timeout: 20000 });
  82  |     await expect(page).toHaveURL(/.*\/account/);
  83  | 
  84  |     // 2. Navigate to orders page
  85  |     await page.goto('http://localhost:3000/account/orders', { waitUntil: 'domcontentloaded' });
  86  |     const ordersHeading = page.locator('h1');
  87  |     await expect(ordersHeading).toHaveText('Mes Commandes');
  88  | 
  89  |     // 3. Confirm no offline screen on orders page
  90  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  91  |     await expect(offlineIcon).toHaveCount(0);
  92  | 
  93  |     // 4. Return to home and click Mon Compte
  94  |     await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  95  |     // Wait for the authenticated link to appear (href=/account not /login)
  96  |     const userLink = page.locator('a[aria-label="Mon compte"][href="/account"], a[href="/account"]').first();
  97  |     await expect(userLink).toBeVisible({ timeout: 10000 });
  98  |     await userLink.click();
  99  |     
  100 |     // Since user is logged in, it should go directly to /account, NOT /login
  101 |     await page.waitForURL(/.*\/account/, { timeout: 15000 });
  102 |     await expect(page).toHaveURL(/.*\/account/);
  103 |     await expect(page.locator('h1')).toContainText('Ravi de vous revoir');
  104 |   });
  105 | 
  106 |   test('TEST 7: Register a new customer account', async ({ page }) => {
```