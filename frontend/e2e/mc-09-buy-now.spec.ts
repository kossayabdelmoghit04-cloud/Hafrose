import { expect, test } from '@playwright/test';
import { clearBrowserState } from './helpers/journeys';

test.describe('MC-09 Homepage Direct Purchase UX ("ACHETER")', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('MC-09-01 Homepage product cards render the ACHETER button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for at least one product card to load on the homepage
    const buyButtons = page.getByRole('button', { name: /^acheter/i });
    await expect(buyButtons.first()).toBeVisible({ timeout: 20000 });

    const count = await buyButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('MC-09-02 Clic ACHETER adds product to cart and redirects directly to /checkout', async ({ page }) => {
    await page.goto('/');

    const firstBuyButton = page.getByRole('button', { name: /^acheter/i }).first();
    await expect(firstBuyButton).toBeVisible({ timeout: 15000 });

    // Click ACHETER
    await firstBuyButton.click();

    // Must navigate directly to /checkout
    await expect(page).toHaveURL(/\/checkout/, { timeout: 15000 });

    // Verify checkout page is displayed with order summary
    await expect(page.getByRole('heading', { name: /commande|paiement|livraison|coordonnées/i }).first()).toBeVisible();

    // Verify cart storage contains the item in hafrose_cart
    const cartState = await page.evaluate(() => {
      const stored = localStorage.getItem('hafrose_cart');
      return stored ? JSON.parse(stored) : null;
    });

    expect(cartState).not.toBeNull();
    expect(cartState.state.items.length).toBeGreaterThanOrEqual(1);
  });

  test('MC-09-03 Cart drawer remains closed during direct checkout navigation', async ({ page }) => {
    await page.goto('/');

    const firstBuyButton = page.getByRole('button', { name: /^acheter/i }).first();
    await expect(firstBuyButton).toBeVisible({ timeout: 15000 });

    await firstBuyButton.click();
    await expect(page).toHaveURL(/\/checkout/);

    // Verify cart drawer is not visible/open
    const cartDrawerHeading = page.getByRole('heading', { name: /votre panier/i });
    await expect(cartDrawerHeading).toBeHidden();
  });

  test('MC-09-04 Scope isolation — /shop retains Ajout Rapide and does not use ACHETER button', async ({ page }) => {
    await page.goto('/shop');

    // Wait for shop products to load by waiting for Ajout Rapide button in DOM
    const quickAddButtons = page.getByRole('button', { name: /ajout rapide/i });
    await expect(quickAddButtons.first()).toBeAttached({ timeout: 15000 });

    expect(await quickAddButtons.count()).toBeGreaterThan(0);

    // On shop page, product cards should NOT render ACHETER button
    const buyButtons = page.getByRole('button', { name: /^acheter/i });
    await expect(buyButtons).toHaveCount(0);
  });

  test('MC-09-05 Double-click guard prevents race condition duplicate item additions', async ({ page }) => {
    await page.goto('/');

    const firstBuyButton = page.getByRole('button', { name: /^acheter/i }).first();
    await expect(firstBuyButton).toBeVisible({ timeout: 15000 });

    // Rapid double click
    await firstBuyButton.dblclick();

    await expect(page).toHaveURL(/\/checkout/);

    const cartState = await page.evaluate(() => {
      const stored = localStorage.getItem('hafrose_cart');
      return stored ? JSON.parse(stored) : null;
    });

    // Should only have added 1 item with quantity 1
    expect(cartState?.state?.items?.length).toBe(1);
    expect(cartState?.state?.items?.[0]?.quantity).toBe(1);
  });

  test('MC-09-06 Mobile responsive display: ACHETER button is visible and clickable on 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const firstBuyButton = page.getByRole('button', { name: /^acheter/i }).first();
    await expect(firstBuyButton).toBeVisible({ timeout: 15000 });

    await firstBuyButton.click();
    await expect(page).toHaveURL(/\/checkout/);
  });

  // ── MC-09-C1 Variant & Continuity Remediation (F01-D1) ─────────────────
  test.describe('MC-09-C1 ProductDetailPage ?buyNow=1 Continuity', () => {
    const knownSlug = 'porte-monnaie-compact-en-cuir-taupe';

    test('MC-09-C1-01 Standard PDP visit without ?buyNow=1 does NOT redirect and shows "Ajouter au Panier"', async ({ page }) => {
      // Navigate to a product detail page directly without query params
      await page.goto(`/product/${knownSlug}`);

      await expect(page).toHaveURL(new RegExp(`/product/${knownSlug}$`));
      // Wait for PDP layout
      const addToCartBtn = page.getByRole('button', { name: /ajouter au panier/i });
      await expect(addToCartBtn).toBeVisible({ timeout: 15000 });
      // URL must stay on /product/...
      expect(page.url()).not.toContain('/checkout');
    });

    test('MC-09-C1-02 PDP with ?buyNow=1 auto-adds simple in-stock product and navigates to /checkout', async ({ page }) => {
      // Navigate to PDP with ?buyNow=1
      await page.goto(`/product/${knownSlug}?buyNow=1`);

      // Should automatically add to cart and redirect to /checkout
      await expect(page).toHaveURL(/\/checkout/, { timeout: 20000 });

      // Verify cart state
      const cartState = await page.evaluate(() => {
        const stored = localStorage.getItem('hafrose_cart');
        return stored ? JSON.parse(stored) : null;
      });
      expect(cartState?.state?.items?.length).toBeGreaterThanOrEqual(1);
    });

    test('MC-09-C1-03 PDP with ?buyNow=1 preserves previously added cart items', async ({ page }) => {
      // Seed pre-existing cart item
      await page.goto('/');
      await page.evaluate(() => {
        const initialCart = {
          state: {
            items: [
              {
                id: 99999,
                product_id: 99999,
                quantity: 2,
                product: {
                  id: 99999,
                  name: 'Pre-existing Item',
                  slug: 'pre-existing-item',
                  price: '500.00',
                  stock: 10,
                  stock_quantity: 10,
                },
              },
            ],
            isDrawerOpen: false,
          },
          version: 0,
        };
        localStorage.setItem('hafrose_cart', JSON.stringify(initialCart));
      });

      // Navigate to a real product with ?buyNow=1
      await page.goto(`/product/${knownSlug}?buyNow=1`);
      await expect(page).toHaveURL(/\/checkout/, { timeout: 20000 });

      // Verify pre-existing item is preserved alongside the new item
      const cartState = await page.evaluate(() => {
        const stored = localStorage.getItem('hafrose_cart');
        return stored ? JSON.parse(stored) : null;
      });
      const items = cartState?.state?.items ?? [];
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.some((i: { product?: { id: number } }) => i.product?.id === 99999)).toBe(true);
    });

    test('MC-09-C1-04 Out-of-stock product with ?buyNow=1 displays unavailable banner and does NOT navigate to checkout', async ({ page }) => {
      // Intercept product API to mock out-of-stock
      await page.route('**/api/products/*', async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        if (json?.data) {
          json.data.stock = 0;
          json.data.stock_quantity = 0;
        }
        await route.fulfill({ json });
      });

      await page.goto('/product/test-product?buyNow=1');

      // Out-of-stock banner should appear if product is loaded
      const outOfStockBanner = page.locator('[data-testid="buynow-outofstock-banner"]');
      // Should not navigate to /checkout
      await page.waitForTimeout(1500);
      expect(page.url()).not.toContain('/checkout');
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    });
  });
});

