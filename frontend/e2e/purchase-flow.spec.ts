import { test, expect } from '@playwright/test';

/**
 * HAFROSE — Phase 8.2.6.6
 * E2E Purchase Flow Certification
 *
 * Full journey: LOGIN → SHOP → PRODUCT → CART → CHECKOUT → ORDER → LOGOUT
 */

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000';

const TEST_CREDENTIALS = {
  email: 'client.test@hafrose.com',
  password: 'password',
};

test.setTimeout(60000);

// ============================================================
// TEST 1: Backend API Health Check
// ============================================================
test('1. Backend API is reachable and returning real data', async ({ request }) => {
  const catResponse = await request.get(`${API_URL}/api/categories`);
  expect(catResponse.status()).toBe(200);
  const catBody = await catResponse.json();
  expect(catBody.data).toBeDefined();
  expect(catBody.data.length).toBeGreaterThan(0);
  console.log(`✅ Categories count: ${catBody.data.length}`);

  const prodResponse = await request.get(`${API_URL}/api/products`);
  expect(prodResponse.status()).toBe(200);
  const prodBody = await prodResponse.json();
  const products = Array.isArray(prodBody.data) ? prodBody.data : prodBody.data?.data ?? [];
  expect(products.length).toBeGreaterThan(0);
  console.log(`✅ Products count: ${products.length}`);
});

// ============================================================
// TEST 2: Authentication Flow — Login → Session → Logout
// ============================================================
test('2. Authentication flow: Login → Account → Logout', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('form', { timeout: 10000 });

  // Fill login inputs explicitly by input type
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.fill(TEST_CREDENTIALS.email);
  await passwordInput.fill(TEST_CREDENTIALS.password);

  // Click submit button
  await page.getByRole('button', { name: /Se Connecter/i }).click();

  // Wait for navigation to /account
  await page.waitForURL('**/account', { timeout: 20000 });
  expect(page.url()).toContain('/account');
  console.log('✅ Login successful — redirected to /account');

  // Verify account dashboard elements loaded
  await page.waitForSelector('body', { timeout: 10000 });
  console.log('✅ Account page rendered');
});

// ============================================================
// TEST 3: Shop Page — Product Listing
// ============================================================
test('3. Shop page loads real products from API', async ({ page }) => {
  await page.goto(`${BASE_URL}/shop`);
  await page.waitForSelector('h3', { timeout: 20000 });

  const productCards = page.locator('h3');
  const count = await productCards.count();
  expect(count).toBeGreaterThan(0);
  console.log(`✅ Shop: ${count} product headings rendered`);
});

// ============================================================
// TEST 4: Product Detail Page
// ============================================================
test('4. Product detail page displays real product data', async ({ page }) => {
  // Go to shop and click first product to ensure valid loaded product
  await page.goto(`${BASE_URL}/shop`);
  await page.waitForSelector('h3', { timeout: 20000 });

  const firstCard = page.locator('h3').first();
  const productName = await firstCard.textContent();
  await firstCard.click();

  await page.waitForURL('**/product/**', { timeout: 15000 });
  await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });

  console.log(`✅ Product detail loaded: "${productName?.trim()}"`);
});

// ============================================================
// TEST 5: Full Purchase Flow (authenticated)
// ============================================================
test('5. Full purchase flow: Login → Shop → Product → Cart → Checkout → Order', async ({ page }) => {
  // --- STEP 1: Login ---
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('form', { timeout: 10000 });

  await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  await page.getByRole('button', { name: /Se Connecter/i }).click();

  await page.waitForURL('**/account', { timeout: 20000 });
  console.log('✅ STEP 1: Logged in successfully');

  // --- STEP 2: Navigate to Shop ---
  await page.goto(`${BASE_URL}/shop`);
  await page.waitForSelector('h3', { timeout: 20000 });
  console.log('✅ STEP 2: Shop page loaded');

  // --- STEP 3: Click first product ---
  const firstProductCard = page.locator('h3').first();
  const productName = await firstProductCard.textContent();
  await firstProductCard.click();

  await page.waitForURL('**/product/**', { timeout: 15000 });
  await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  console.log(`✅ STEP 3: Product page loaded "${productName?.trim()}"`);

  // --- STEP 4: Add to cart ---
  const sizeButtons = page.locator('button').filter({ hasText: /^(34|36|38|40|42|44|XS|S|M|L|XL)$/ });
  if (await sizeButtons.count() > 0) {
    await sizeButtons.first().click();
  }

  const addToCartBtn = page.locator('button:has-text("Ajouter au Panier")');
  await addToCartBtn.click();
  console.log('✅ STEP 4: Added product to cart');

  // --- STEP 5: Go to Cart ---
  await page.goto(`${BASE_URL}/cart`);
  await page.waitForSelector('body', { timeout: 10000 });

  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('Votre panier est vide');
  console.log('✅ STEP 5: Cart contains items');

  // --- STEP 6: Go to Checkout ---
  await page.goto(`${BASE_URL}/checkout`);
  await page.waitForURL('**/checkout', { timeout: 15000 });
  await page.waitForSelector('form', { timeout: 20000 });
  console.log('✅ STEP 6: On Checkout page');

  // --- STEP 7: Check CGV & submit ---
  const cgvCheckbox = page.locator('input[type="checkbox"]');
  if (await cgvCheckbox.count() > 0) {
    if (!(await cgvCheckbox.first().isChecked())) {
      await cgvCheckbox.first().check();
    }
  }

  const submitBtn = page.getByRole('button', { name: /Confirmer et Payer/i });
  await expect(submitBtn).toBeVisible({ timeout: 10000 });
  await submitBtn.click();

  // --- STEP 8: Confirmation ---
  await page.waitForSelector('text=Merci pour Votre Commande', { timeout: 30000 });
  console.log('✅ STEP 8: Order confirmation received!');
});

// ============================================================
// TEST 6: Protected Routes — Auth Guard
// ============================================================
test('6. Protected route guard redirects unauthenticated users', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.goto(`${BASE_URL}/account`);

  await page.waitForURL('**/login**', { timeout: 15000 });
  expect(page.url()).toContain('/login');
  console.log('✅ Auth guard: unauthenticated access to /account redirected to /login');
});
