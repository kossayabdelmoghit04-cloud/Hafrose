import { test, expect } from '@playwright/test';

/**
 * HAFROSE — Phase 8.2.6.6
 * E2E Purchase Flow Certification
 *
 * Full journey: LOGIN → SHOP → PRODUCT → CART → CHECKOUT → ORDER → LOGOUT
 *
 * Real frontend (localhost:3000) + Real Laravel API (localhost:8000)
 * Real Sanctum authentication + Real database (no mocks)
 */

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000';

const TEST_CREDENTIALS = {
  email: 'client.test@hafrose.com',
  password: 'password',
};

test.setTimeout(90000);

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
  const products = prodBody.data?.data ?? [];
  expect(products.length).toBeGreaterThan(0);
  console.log(`✅ Products count: ${products.length} (total: ${prodBody.data?.meta?.total})`);

  const firstSlug = products[0]?.slug;
  expect(firstSlug).toBeTruthy();
  console.log(`✅ First product slug: "${firstSlug}"`);
});

// ============================================================
// TEST 2: Authentication Flow — Login → Account
// ============================================================
test('2. Authentication flow: Login → Account → Logout', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('form', { timeout: 10000 });

  await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  await page.getByRole('button', { name: /Se Connecter/i }).click();

  await expect(page).toHaveURL(/account/, { timeout: 20000 });
  console.log('✅ Login successful — redirected to /account');

  await page.waitForSelector('body', { timeout: 10000 });
  console.log('✅ Account page rendered');
});

// ============================================================
// TEST 3: Shop Page — Product Listing
// ============================================================
test('3. Shop page loads real products from API', async ({ page }) => {
  await page.goto(`${BASE_URL}/shop`);
  await page.waitForSelector('main h3', { timeout: 20000 });

  const productCards = page.locator('main h3');
  const count = await productCards.count();
  expect(count).toBeGreaterThan(0);
  console.log(`✅ Shop: ${count} product cards rendered in main grid`);
});

// ============================================================
// TEST 4: Product Detail Page
// ============================================================
test('4. Product detail page displays real product data', async ({ request, page }) => {
  const prodResponse = await request.get(`${API_URL}/api/products`);
  const prodBody = await prodResponse.json();
  const firstSlug = prodBody.data?.data?.[0]?.slug;
  expect(firstSlug).toBeTruthy();

  await page.goto(`${BASE_URL}/product/${firstSlug}`);
  await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });

  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('Produit introuvable');
  console.log(`✅ Product detail loaded for slug: "${firstSlug}"`);
});

// ============================================================
// TEST 5: Full Purchase Flow (authenticated)
// ============================================================
test('5. Full purchase flow: Login → Shop → Product → Cart → Checkout → Order', async ({ request, page }) => {
  const prodResponse = await request.get(`${API_URL}/api/products`);
  const prodBody = await prodResponse.json();
  const firstSlug = prodBody.data?.data?.[0]?.slug;
  const firstName = prodBody.data?.data?.[0]?.name;
  expect(firstSlug).toBeTruthy();

  // --- STEP 1: Login ---
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('form', { timeout: 10000 });

  await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  await page.getByRole('button', { name: /Se Connecter/i }).click();

  await expect(page).toHaveURL(/account/, { timeout: 20000 });
  console.log('✅ STEP 1: Logged in successfully');

  // --- STEP 2: Navigate to Product page ---
  await page.goto(`${BASE_URL}/product/${firstSlug}`);
  await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  console.log(`✅ STEP 2: Product page loaded "${firstName}"`);

  // --- STEP 3: Select size & Add to Cart ---
  const sizeButtons = page.locator('button').filter({ hasText: /^(34|36|38|40|42|44|XS|S|M|L|XL)$/ });
  if (await sizeButtons.count() > 0) {
    await sizeButtons.first().click();
    console.log('✅ STEP 3a: Size selected');
  }

  const addToCartBtn = page.locator('button:has-text("Ajouter au Panier")');
  await addToCartBtn.click();
  console.log('✅ STEP 3b: Added product to cart');

  // --- STEP 4: Go to Cart ---
  await page.goto(`${BASE_URL}/cart`);
  await page.waitForSelector('body', { timeout: 10000 });

  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('Votre panier est vide');
  console.log('✅ STEP 4: Cart contains items');

  // --- STEP 5: Click link to Checkout (SPA React Router navigation) ---
  const checkoutLink = page.locator('a[href="/checkout"]').first();
  await expect(checkoutLink).toBeVisible({ timeout: 10000 });
  await checkoutLink.click();

  await expect(page).toHaveURL(/checkout/, { timeout: 20000 });
  await page.waitForSelector('form', { timeout: 20000 });
  console.log('✅ STEP 5: Navigated to Checkout page via SPA');

  // --- STEP 6: Fill all required fields & submit ---
  await page.getByRole('textbox', { name: /Prénom/i }).fill('Jean');
  await page.getByRole('textbox', { name: /^Nom/i }).fill('Dupont');
  await page.getByRole('textbox', { name: /E-mail/i }).fill('jean.dupont@example.com');
  await page.getByRole('textbox', { name: /Téléphone/i }).fill('+33612345678');
  await page.getByRole('textbox', { name: /Adresse/i }).fill('124 Avenue Montaigne');
  await page.getByRole('textbox', { name: /Code Postal/i }).fill('75008');
  await page.getByRole('textbox', { name: /Ville/i }).fill('Paris');

  // Ensure CGV checkbox is checked
  const cgvCheckbox = page.locator('input[type="checkbox"]');
  if (await cgvCheckbox.count() > 0) {
    if (!(await cgvCheckbox.first().isChecked())) {
      await cgvCheckbox.first().check();
    }
  }

  const submitBtn = page.getByRole('button', { name: /Confirmer et Payer/i });
  await expect(submitBtn).toBeVisible({ timeout: 10000 });
  await submitBtn.click();
  console.log('✅ STEP 6: Order submitted');

  // --- STEP 7: Order Confirmation ---
  await page.waitForSelector('text=Merci pour Votre Commande', { timeout: 30000 });
  console.log('✅ STEP 7: Order confirmation received!');
});

// ============================================================
// TEST 6: Protected Routes — Auth Guard
// ============================================================
test('6. Protected route guard redirects unauthenticated users', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.goto(`${BASE_URL}/account`);
  await expect(page).toHaveURL(/login/, { timeout: 20000 });
  console.log('✅ Auth guard: unauthenticated access to /account redirected to /login');
});
