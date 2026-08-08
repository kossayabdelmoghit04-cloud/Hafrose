import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000';

const TEST_CREDENTIALS = {
  email: 'client.test@hafrose.com',
  password: 'password',
};

test.setTimeout(90000);

test('debug order creation', async ({ request, page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('response', async resp => {
    if (resp.url().includes('/api/')) {
      console.log(`API [${resp.status()}] ${resp.url()}`);
      if (resp.status() >= 400) {
        console.log('API ERROR BODY:', await resp.text());
      }
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
  await expect(page).toHaveURL(/account/, { timeout: 20000 });

  // Add product to cart
  await page.goto(`${BASE_URL}/product/${firstSlug}`);
  await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });

  const sizeButtons = page.locator('button').filter({ hasText: /^(34|36|38|40|42|44|XS|S|M|L|XL)$/ });
  if (await sizeButtons.count() > 0) {
    await sizeButtons.first().click();
  }
  await page.locator('button:has-text("Ajouter au Panier")').click();

  // Go to cart & click checkout
  await page.goto(`${BASE_URL}/cart`);
  const checkoutLink = page.locator('a[href="/checkout"]').first();
  await checkoutLink.click();
  await expect(page).toHaveURL(/checkout/, { timeout: 20000 });
  await page.waitForSelector('form', { timeout: 20000 });

  // Ensure CGV checked
  const cgvCheckbox = page.locator('input[type="checkbox"]');
  if (await cgvCheckbox.count() > 0) {
    if (!(await cgvCheckbox.first().isChecked())) {
      await cgvCheckbox.first().check();
    }
  }

  // Click submit order
  const submitBtn = page.getByRole('button', { name: /Confirmer et Payer/i });
  await submitBtn.click();

  // Wait 10s and check URL and page content
  await page.waitForTimeout(10000);

  const currentText = await page.locator('body').textContent();
  console.log('Page content after submit:', currentText?.substring(0, 500));

  const alertMsg = await page.locator('[role="alert"]').textContent().catch(() => null);
  if (alertMsg) {
    console.log('Alert on page:', alertMsg.trim());
  }
});
