# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-flow.spec.ts >> 2. Authentication flow: Login → Account → Logout
- Location: e2e\purchase-flow.spec.ts:49:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /account/
Received string:  "http://localhost:3000/login"
Timeout: 20000ms

Call log:
  - Expect "toHaveURL" with timeout 20000ms
    43 × locator resolved to <html lang="fr" dir="ltr">…</html>
       - unexpected value "http://localhost:3000/login"

```

```yaml
- link "HAFROSE Maison de Haute Couture":
  - /url: /
- heading "Connexion Client" [level=1]
- paragraph: Accédez à votre espace privé et suivez vos commandes.
- alert:
  - img
  - heading "Erreur de connexion" [level=5]
  - text: Validation failed
- text: Adresse E-mail
- img
- textbox "Adresse E-mail":
  - /placeholder: nom@exemple.com
  - text: client.test@hafrose.com
- text: Mot de Passe
- img
- textbox "Mot de Passe":
  - /placeholder: ••••••••
  - text: password
- button "Afficher le mot de passe":
  - img
- checkbox "Se souvenir de moi"
- img
- text: Se souvenir de moi
- link "Mot de passe oublié ?":
  - /url: /forgot-password
- button "Se Connecter":
  - img
  - text: Se Connecter
- text: Pas encore de compte ?
- link "Créer un compte HAFROSE":
  - /url: /register
- paragraph: © 2026 HAFROSE. Tous droits réservés.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * HAFROSE — Phase 8.2.6.6
  5   |  * E2E Purchase Flow Certification
  6   |  *
  7   |  * Full journey: LOGIN → SHOP → PRODUCT → CART → CHECKOUT → ORDER → LOGOUT
  8   |  *
  9   |  * Real frontend (localhost:3000) + Real Laravel API (localhost:8000)
  10  |  * Real Sanctum authentication + Real database (no mocks)
  11  |  */
  12  | 
  13  | const BASE_URL = 'http://localhost:3000';
  14  | const API_URL = 'http://localhost:8000';
  15  | 
  16  | const TEST_CREDENTIALS = {
  17  |   email: 'client.test@hafrose.com',
  18  |   password: 'password',
  19  | };
  20  | 
  21  | test.setTimeout(90000);
  22  | 
  23  | // ============================================================
  24  | // TEST 1: Backend API Health Check
  25  | // ============================================================
  26  | test('1. Backend API is reachable and returning real data', async ({ request }) => {
  27  |   const catResponse = await request.get(`${API_URL}/api/categories`);
  28  |   expect(catResponse.status()).toBe(200);
  29  |   const catBody = await catResponse.json();
  30  |   expect(catBody.data).toBeDefined();
  31  |   expect(catBody.data.length).toBeGreaterThan(0);
  32  |   console.log(`✅ Categories count: ${catBody.data.length}`);
  33  | 
  34  |   const prodResponse = await request.get(`${API_URL}/api/products`);
  35  |   expect(prodResponse.status()).toBe(200);
  36  |   const prodBody = await prodResponse.json();
  37  |   const products = prodBody.data?.data ?? [];
  38  |   expect(products.length).toBeGreaterThan(0);
  39  |   console.log(`✅ Products count: ${products.length} (total: ${prodBody.data?.meta?.total})`);
  40  | 
  41  |   const firstSlug = products[0]?.slug;
  42  |   expect(firstSlug).toBeTruthy();
  43  |   console.log(`✅ First product slug: "${firstSlug}"`);
  44  | });
  45  | 
  46  | // ============================================================
  47  | // TEST 2: Authentication Flow — Login → Account
  48  | // ============================================================
  49  | test('2. Authentication flow: Login → Account → Logout', async ({ page }) => {
  50  |   await page.goto(`${BASE_URL}/login`);
  51  |   await page.waitForSelector('form', { timeout: 10000 });
  52  | 
  53  |   await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  54  |   await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  55  |   await page.getByRole('button', { name: /Se Connecter/i }).click();
  56  | 
> 57  |   await expect(page).toHaveURL(/account/, { timeout: 20000 });
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  58  |   console.log('✅ Login successful — redirected to /account');
  59  | 
  60  |   await page.waitForSelector('body', { timeout: 10000 });
  61  |   console.log('✅ Account page rendered');
  62  | });
  63  | 
  64  | // ============================================================
  65  | // TEST 3: Shop Page — Product Listing
  66  | // ============================================================
  67  | test('3. Shop page loads real products from API', async ({ page }) => {
  68  |   await page.goto(`${BASE_URL}/shop`);
  69  |   await page.waitForSelector('main h3', { timeout: 20000 });
  70  | 
  71  |   const productCards = page.locator('main h3');
  72  |   const count = await productCards.count();
  73  |   expect(count).toBeGreaterThan(0);
  74  |   console.log(`✅ Shop: ${count} product cards rendered in main grid`);
  75  | });
  76  | 
  77  | // ============================================================
  78  | // TEST 4: Product Detail Page
  79  | // ============================================================
  80  | test('4. Product detail page displays real product data', async ({ request, page }) => {
  81  |   const prodResponse = await request.get(`${API_URL}/api/products`);
  82  |   const prodBody = await prodResponse.json();
  83  |   const firstSlug = prodBody.data?.data?.[0]?.slug;
  84  |   expect(firstSlug).toBeTruthy();
  85  | 
  86  |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  87  |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  88  | 
  89  |   const bodyText = await page.locator('body').textContent();
  90  |   expect(bodyText).not.toContain('Produit introuvable');
  91  |   console.log(`✅ Product detail loaded for slug: "${firstSlug}"`);
  92  | });
  93  | 
  94  | // ============================================================
  95  | // TEST 5: Full Purchase Flow (authenticated)
  96  | // ============================================================
  97  | test('5. Full purchase flow: Login → Shop → Product → Cart → Checkout → Order', async ({ request, page }) => {
  98  |   const prodResponse = await request.get(`${API_URL}/api/products`);
  99  |   const prodBody = await prodResponse.json();
  100 |   const firstSlug = prodBody.data?.data?.[0]?.slug;
  101 |   const firstName = prodBody.data?.data?.[0]?.name;
  102 |   expect(firstSlug).toBeTruthy();
  103 | 
  104 |   // --- STEP 1: Login ---
  105 |   await page.goto(`${BASE_URL}/login`);
  106 |   await page.waitForSelector('form', { timeout: 10000 });
  107 | 
  108 |   await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  109 |   await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  110 |   await page.getByRole('button', { name: /Se Connecter/i }).click();
  111 | 
  112 |   await expect(page).toHaveURL(/account/, { timeout: 20000 });
  113 |   console.log('✅ STEP 1: Logged in successfully');
  114 | 
  115 |   // --- STEP 2: Navigate to Product page ---
  116 |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  117 |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  118 |   console.log(`✅ STEP 2: Product page loaded "${firstName}"`);
  119 | 
  120 |   // --- STEP 3: Select size & Add to Cart ---
  121 |   const sizeButtons = page.locator('button').filter({ hasText: /^(34|36|38|40|42|44|XS|S|M|L|XL)$/ });
  122 |   if (await sizeButtons.count() > 0) {
  123 |     await sizeButtons.first().click();
  124 |     console.log('✅ STEP 3a: Size selected');
  125 |   }
  126 | 
  127 |   const addToCartBtn = page.locator('button:has-text("Ajouter au Panier")');
  128 |   await addToCartBtn.click();
  129 |   console.log('✅ STEP 3b: Added product to cart');
  130 | 
  131 |   // --- STEP 4: Go to Cart ---
  132 |   await page.goto(`${BASE_URL}/cart`);
  133 |   await page.waitForSelector('body', { timeout: 10000 });
  134 | 
  135 |   const bodyText = await page.locator('body').textContent();
  136 |   expect(bodyText).not.toContain('Votre panier est vide');
  137 |   console.log('✅ STEP 4: Cart contains items');
  138 | 
  139 |   // --- STEP 5: Click link to Checkout (SPA React Router navigation) ---
  140 |   const checkoutLink = page.locator('a[href="/checkout"]').first();
  141 |   await expect(checkoutLink).toBeVisible({ timeout: 10000 });
  142 |   await checkoutLink.click();
  143 | 
  144 |   await expect(page).toHaveURL(/checkout/, { timeout: 20000 });
  145 |   await page.waitForSelector('form', { timeout: 20000 });
  146 |   console.log('✅ STEP 5: Navigated to Checkout page via SPA');
  147 | 
  148 |   // --- STEP 6: Fill all required fields & submit ---
  149 |   await page.getByRole('textbox', { name: /Prénom/i }).fill('Jean');
  150 |   await page.getByRole('textbox', { name: /^Nom/i }).fill('Dupont');
  151 |   await page.getByRole('textbox', { name: /E-mail/i }).fill('jean.dupont@example.com');
  152 |   await page.getByRole('textbox', { name: /Téléphone/i }).fill('+33612345678');
  153 |   await page.getByRole('textbox', { name: /Adresse/i }).fill('124 Avenue Montaigne');
  154 |   await page.getByRole('textbox', { name: /Code Postal/i }).fill('75008');
  155 |   await page.getByRole('textbox', { name: /Ville/i }).fill('Paris');
  156 | 
  157 |   // Ensure CGV checkbox is checked
```