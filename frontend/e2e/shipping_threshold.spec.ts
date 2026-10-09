import { test, expect } from '@playwright/test';

test.describe('Shipping threshold consistency', () => {
  const cases = [
    { name: 'A. zero threshold disables free shipping', fee: 50, threshold: 0, subtotal: 350, expected: 50 },
    { name: 'B. subtotal below threshold is paid', fee: 50, threshold: 500, subtotal: 350, expected: 50 },
    { name: 'C. subtotal at threshold is free', fee: 50, threshold: 500, subtotal: 500, expected: 0 },
    { name: 'D. subtotal above threshold is free', fee: 50, threshold: 500, subtotal: 600, expected: 0 },
    { name: 'E. zero shipping cost stays free', fee: 0, threshold: 500, subtotal: 350, expected: 0 },
  ];

  for (const scenario of cases) {
    test(scenario.name + ' in cart and checkout estimates', async ({ browser }) => {
      const context = await browser.newContext();
      const item = {
        id: 'shipping-test-default-default',
        product: {
          id: 7001,
          name: 'Produit test livraison',
          slug: 'produit-test-livraison',
          description: 'Test',
          price: scenario.subtotal,
          sale_price: null,
          stock: 10,
          category_id: 1,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        quantity: 1,
        unit_price: scenario.subtotal,
      };

      await context.addInitScript((cartItem) => {
        localStorage.setItem('hafrose_cart', JSON.stringify({
          state: { items: [cartItem] },
          version: 0,
        }));
      }, item);

      const page = await context.newPage();
      await page.route('**/api/settings', (route) => route.fulfill({
        status: 200,
        json: {
          success: true,
          data: {
            shipping_fee: scenario.fee,
            free_shipping_threshold: scenario.threshold,
          },
        },
      }));

      await page.goto('/cart');
      const cartShipping = page.getByText('Livraison estimée').locator('..');
      await expect(cartShipping).toContainText(scenario.expected === 0 ? 'Gratuite' : '50');

      await page.goto('/checkout');
      const checkoutShipping = page.getByText('Frais de livraison').locator('..');
      await expect(checkoutShipping).toContainText(scenario.expected === 0 ? 'Offerts' : '50');

      await context.close();
    });
  }
});
