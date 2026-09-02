# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-flow.spec.ts >> 2. Authentication flow: Login → Account → Logout
- Location: e2e\purchase-flow.spec.ts:50:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

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
  37  |   const products = Array.isArray(prodBody.data) ? prodBody.data : (prodBody.data?.data ?? []);
  38  |   expect(products.length).toBeGreaterThan(0);
  39  |   const total = prodBody.meta?.total ?? prodBody.data?.meta?.total;
  40  |   console.log(`✅ Products count: ${products.length} (total: ${total})`);
  41  | 
  42  |   const firstSlug = products[0]?.slug;
  43  |   expect(firstSlug).toBeTruthy();
  44  |   console.log(`✅ First product slug: "${firstSlug}"`);
  45  | });
  46  | 
  47  | // ============================================================
  48  | // TEST 2: Authentication Flow — Login → Account
  49  | // ============================================================
  50  | test('2. Authentication flow: Login → Account → Logout', async ({ page }) => {
> 51  |   await page.goto(`${BASE_URL}/login`);
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  52  |   await page.waitForSelector('form', { timeout: 10000 });
  53  | 
  54  |   await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  55  |   await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  56  |   await page.getByRole('button', { name: /Se Connecter/i }).click();
  57  | 
  58  |   await expect(page).toHaveURL(/account/, { timeout: 20000 });
  59  |   console.log('✅ Login successful — redirected to /account');
  60  | 
  61  |   await page.waitForSelector('body', { timeout: 10000 });
  62  |   console.log('✅ Account page rendered');
  63  | });
  64  | 
  65  | // ============================================================
  66  | // TEST 3: Shop Page — Product Listing
  67  | // ============================================================
  68  | test('3. Shop page loads real products from API', async ({ page }) => {
  69  |   await page.goto(`${BASE_URL}/shop`);
  70  |   await page.waitForSelector('main h3', { timeout: 20000 });
  71  | 
  72  |   const productCards = page.locator('main h3');
  73  |   const count = await productCards.count();
  74  |   expect(count).toBeGreaterThan(0);
  75  |   console.log(`✅ Shop: ${count} product cards rendered in main grid`);
  76  | });
  77  | 
  78  | // ============================================================
  79  | // TEST 4: Product Detail Page
  80  | // ============================================================
  81  | test('4. Product detail page displays real product data', async ({ request, page }) => {
  82  |   const prodResponse = await request.get(`${API_URL}/api/products`);
  83  |   const prodBody = await prodResponse.json();
  84  |   // API-01: data is a direct array at root level (no double nesting)
  85  |   const firstSlug = prodBody.data?.[0]?.slug;
  86  |   expect(firstSlug).toBeTruthy();
  87  | 
  88  |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  89  |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  90  | 
  91  |   const bodyText = await page.locator('body').textContent();
  92  |   expect(bodyText).not.toContain('Produit introuvable');
  93  |   console.log(`✅ Product detail loaded for slug: "${firstSlug}"`);
  94  | });
  95  | 
  96  | // ============================================================
  97  | // TEST 5: Full Purchase Flow (authenticated)
  98  | // ============================================================
  99  | test('5. Full purchase flow: Login → Shop → Product → Cart → Checkout → Order', async ({ request, page }) => {
  100 |   const prodResponse = await request.get(`${API_URL}/api/products`);
  101 |   const prodBody = await prodResponse.json();
  102 |   // API-01: data is a direct array at root level (no double nesting)
  103 |   const firstSlug = prodBody.data?.[0]?.slug;
  104 |   const firstName = prodBody.data?.[0]?.name;
  105 |   expect(firstSlug).toBeTruthy();
  106 | 
  107 |   // --- STEP 1: Login ---
  108 |   await page.goto(`${BASE_URL}/login`);
  109 |   await page.waitForSelector('form', { timeout: 10000 });
  110 | 
  111 |   await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  112 |   await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  113 |   await page.getByRole('button', { name: /Se Connecter/i }).click();
  114 | 
  115 |   await expect(page).toHaveURL(/account/, { timeout: 20000 });
  116 |   console.log('✅ STEP 1: Logged in successfully');
  117 | 
  118 |   // --- STEP 2: Navigate to Product page ---
  119 |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  120 |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  121 |   console.log(`✅ STEP 2: Product page loaded "${firstName}"`);
  122 | 
  123 |   // --- STEP 3: Select size & Add to Cart ---
  124 |   const sizeButtons = page.locator('button').filter({ hasText: /^(34|36|38|40|42|44|XS|S|M|L|XL)$/ });
  125 |   if (await sizeButtons.count() > 0) {
  126 |     await sizeButtons.first().click();
  127 |     console.log('✅ STEP 3a: Size selected');
  128 |   }
  129 | 
  130 |   const addToCartBtn = page.locator('button:has-text("Ajouter au Panier")');
  131 |   await addToCartBtn.click();
  132 |   console.log('✅ STEP 3b: Added product to cart');
  133 | 
  134 |   // --- STEP 4: Go to Cart ---
  135 |   await page.goto(`${BASE_URL}/cart`);
  136 |   await page.waitForSelector('body', { timeout: 10000 });
  137 | 
  138 |   const bodyText = await page.locator('body').textContent();
  139 |   expect(bodyText).not.toContain('Votre panier est vide');
  140 |   console.log('✅ STEP 4: Cart contains items');
  141 | 
  142 |   // --- STEP 5: Click link to Checkout (SPA React Router navigation) ---
  143 |   const checkoutLink = page.locator('a[href="/checkout"]').first();
  144 |   await expect(checkoutLink).toBeVisible({ timeout: 10000 });
  145 |   await checkoutLink.click();
  146 | 
  147 |   await expect(page).toHaveURL(/checkout/, { timeout: 20000 });
  148 |   await page.waitForSelector('form', { timeout: 20000 });
  149 |   console.log('✅ STEP 5: Navigated to Checkout page via SPA');
  150 | 
  151 |   // --- STEP 6: Fill all required fields & submit ---
```