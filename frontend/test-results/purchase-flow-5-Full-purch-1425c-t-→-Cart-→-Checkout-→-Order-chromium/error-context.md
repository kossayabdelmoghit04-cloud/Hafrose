# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-flow.spec.ts >> 5. Full purchase flow: Login → Shop → Product → Cart → Checkout → Order
- Location: e2e\purchase-flow.spec.ts:98:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: undefined
```

# Test source

```ts
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
  51  |   await page.goto(`${BASE_URL}/login`);
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
  84  |   const firstSlug = prodBody.data?.data?.[0]?.slug;
  85  |   expect(firstSlug).toBeTruthy();
  86  | 
  87  |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  88  |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  89  | 
  90  |   const bodyText = await page.locator('body').textContent();
  91  |   expect(bodyText).not.toContain('Produit introuvable');
  92  |   console.log(`✅ Product detail loaded for slug: "${firstSlug}"`);
  93  | });
  94  | 
  95  | // ============================================================
  96  | // TEST 5: Full Purchase Flow (authenticated)
  97  | // ============================================================
  98  | test('5. Full purchase flow: Login → Shop → Product → Cart → Checkout → Order', async ({ request, page }) => {
  99  |   const prodResponse = await request.get(`${API_URL}/api/products`);
  100 |   const prodBody = await prodResponse.json();
  101 |   const firstSlug = prodBody.data?.data?.[0]?.slug;
  102 |   const firstName = prodBody.data?.data?.[0]?.name;
> 103 |   expect(firstSlug).toBeTruthy();
      |                     ^ Error: expect(received).toBeTruthy()
  104 | 
  105 |   // --- STEP 1: Login ---
  106 |   await page.goto(`${BASE_URL}/login`);
  107 |   await page.waitForSelector('form', { timeout: 10000 });
  108 | 
  109 |   await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  110 |   await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  111 |   await page.getByRole('button', { name: /Se Connecter/i }).click();
  112 | 
  113 |   await expect(page).toHaveURL(/account/, { timeout: 20000 });
  114 |   console.log('✅ STEP 1: Logged in successfully');
  115 | 
  116 |   // --- STEP 2: Navigate to Product page ---
  117 |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  118 |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  119 |   console.log(`✅ STEP 2: Product page loaded "${firstName}"`);
  120 | 
  121 |   // --- STEP 3: Select size & Add to Cart ---
  122 |   const sizeButtons = page.locator('button').filter({ hasText: /^(34|36|38|40|42|44|XS|S|M|L|XL)$/ });
  123 |   if (await sizeButtons.count() > 0) {
  124 |     await sizeButtons.first().click();
  125 |     console.log('✅ STEP 3a: Size selected');
  126 |   }
  127 | 
  128 |   const addToCartBtn = page.locator('button:has-text("Ajouter au Panier")');
  129 |   await addToCartBtn.click();
  130 |   console.log('✅ STEP 3b: Added product to cart');
  131 | 
  132 |   // --- STEP 4: Go to Cart ---
  133 |   await page.goto(`${BASE_URL}/cart`);
  134 |   await page.waitForSelector('body', { timeout: 10000 });
  135 | 
  136 |   const bodyText = await page.locator('body').textContent();
  137 |   expect(bodyText).not.toContain('Votre panier est vide');
  138 |   console.log('✅ STEP 4: Cart contains items');
  139 | 
  140 |   // --- STEP 5: Click link to Checkout (SPA React Router navigation) ---
  141 |   const checkoutLink = page.locator('a[href="/checkout"]').first();
  142 |   await expect(checkoutLink).toBeVisible({ timeout: 10000 });
  143 |   await checkoutLink.click();
  144 | 
  145 |   await expect(page).toHaveURL(/checkout/, { timeout: 20000 });
  146 |   await page.waitForSelector('form', { timeout: 20000 });
  147 |   console.log('✅ STEP 5: Navigated to Checkout page via SPA');
  148 | 
  149 |   // --- STEP 6: Fill all required fields & submit ---
  150 |   await page.getByRole('textbox', { name: /Prénom/i }).fill('Jean');
  151 |   await page.getByRole('textbox', { name: /^Nom/i }).fill('Dupont');
  152 |   await page.getByRole('textbox', { name: /E-mail/i }).fill('jean.dupont@example.com');
  153 |   await page.getByRole('textbox', { name: /Téléphone/i }).fill('+33612345678');
  154 |   await page.getByRole('textbox', { name: /Adresse/i }).fill('124 Avenue Montaigne');
  155 |   await page.getByRole('textbox', { name: /Code Postal/i }).fill('75008');
  156 |   await page.getByRole('textbox', { name: /Ville/i }).fill('Paris');
  157 | 
  158 |   // Ensure CGV checkbox is checked
  159 |   const cgvCheckbox = page.locator('input[type="checkbox"]');
  160 |   if (await cgvCheckbox.count() > 0) {
  161 |     if (!(await cgvCheckbox.first().isChecked())) {
  162 |       await cgvCheckbox.first().check();
  163 |     }
  164 |   }
  165 | 
  166 |   const submitBtn = page.getByRole('button', { name: /Confirmer et Payer/i });
  167 |   await expect(submitBtn).toBeVisible({ timeout: 10000 });
  168 |   await submitBtn.click();
  169 |   console.log('✅ STEP 6: Order submitted');
  170 | 
  171 |   // --- STEP 7: Order Confirmation ---
  172 |   await page.waitForSelector('text=Merci pour Votre Commande', { timeout: 30000 });
  173 |   console.log('✅ STEP 7: Order confirmation received!');
  174 | });
  175 | 
  176 | // ============================================================
  177 | // TEST 6: Protected Routes — Auth Guard
  178 | // ============================================================
  179 | test('6. Protected route guard redirects unauthenticated users', async ({ page }) => {
  180 |   await page.goto(`${BASE_URL}/login`);
  181 |   await page.evaluate(() => localStorage.clear());
  182 |   await page.reload();
  183 | 
  184 |   await page.goto(`${BASE_URL}/account`);
  185 |   await expect(page).toHaveURL(/login/, { timeout: 20000 });
  186 |   console.log('✅ Auth guard: unauthenticated access to /account redirected to /login');
  187 | });
  188 | 
```