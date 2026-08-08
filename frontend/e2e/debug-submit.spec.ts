import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000';

const TEST_CREDENTIALS = {
  email: 'client.test@hafrose.com',
  password: 'password',
};

test('debug order submit', async ({ request, page }) => {
  page.on('response', async resp => {
    if (resp.url().includes('/api/orders')) {
      console.log(`API [${resp.status()}] ${resp.url()}`);
      console.log('RESPONSE BODY:', await resp.text());
    }
  });

  const prodResponse = await request.get(`${API_URL}/api/products`);
  const prodBody = await prodResponse.json();
  const firstSlug = prodBody.data?.data?.[0]?.slug;

  // Login
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  await page.getByRole('button', { name: /Se Connecter/i }).click();
  await expect(page).toHaveURL(/account/);

  // Add product to cart
  await page.goto(`${BASE_URL}/product/${firstSlug}`);
  await page.waitForSelector('button:has-text("Ajouter au Panier")');
  await page.locator('button:has-text("Ajouter au Panier")').click();

  // Cart -> Checkout link
  await page.goto(`${BASE_URL}/cart`);
  const checkoutLink = page.locator('a[href="/checkout"]').first();
  await checkoutLink.click();
  await expect(page).toHaveURL(/checkout/);
  await page.waitForSelector('form');

  // Fill form inputs cleanly
  const inputs = page.locator('form input[type="text"], form input[type="email"], form input[type="tel"]');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const val = await input.inputValue();
    if (!val || val.trim() === '') {
      await input.fill('+33612345678');
    }
  }

  // Ensure CGV checked
  const cgvCheckbox = page.locator('input[type="checkbox"]');
  if (await cgvCheckbox.count() > 0) {
    if (!(await cgvCheckbox.first().isChecked())) {
      await cgvCheckbox.first().check();
    }
  }

  const submitBtn = page.getByRole('button', { name: /Confirmer et Payer/i });
  await submitBtn.click();

  await page.waitForTimeout(5000);
});
