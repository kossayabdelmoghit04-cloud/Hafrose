import { expect, test } from '@playwright/test';
import { adminCredentials, customerCredentials, secondCustomerCredentials } from './helpers/credentials';
import {
  addAvailableProductToCart,
  clearBrowserState,
  completeCheckout,
  loginAdmin,
  loginCustomer,
  uniqueMarker,
} from './helpers/journeys';

test.describe('MC-01-C1 E2E certification coverage', () => {
  test('E2E-01 guest checkout creates an unowned pending order', async ({ page }) => {
    await clearBrowserState(page);
    await addAvailableProductToCart(page);
    const order = await completeCheckout(page, uniqueMarker('guest'));

    expect(order.userId).toBeNull();
    expect(order.paymentStatus).toBe('pending');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('E2E-02 authenticated checkout appears in account orders', async ({ page }) => {
    await loginCustomer(page, customerCredentials());
    await addAvailableProductToCart(page);
    const order = await completeCheckout(page, uniqueMarker('customer'));

    expect(order.userId).not.toBeNull();
    expect(order.paymentStatus).toBe('pending');
    await page.goto('/account/orders');
    await expect(page.getByRole('heading', { name: /mes commandes/i })).toBeVisible();
    await expect(page.getByText(order.orderNumber, { exact: true })).toBeVisible();
  });

  test('E2E-03 customer can open their newly created order', async ({ page }) => {
    await loginCustomer(page, customerCredentials());
    const productName = await addAvailableProductToCart(page);
    const order = await completeCheckout(page, uniqueMarker('owner'));

    await page.goto(`/account/orders/${order.id}`);
    await expect(page).toHaveURL(new RegExp(`/account/orders/${order.id}$`));
    await expect(page.getByRole('heading', { name: new RegExp(order.orderNumber) })).toBeVisible();
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/commande introuvable/i)).toHaveCount(0);
  });

  test('E2E-04 customer cannot open another customer order', async ({ page }) => {
    await loginCustomer(page, secondCustomerCredentials());
    await addAvailableProductToCart(page);
    const foreignOrder = await completeCheckout(page, uniqueMarker('foreign'));

    await clearBrowserState(page);
    await loginCustomer(page, customerCredentials());
    const detailResponse = page.waitForResponse(
      (response) => response.request().method() === 'GET' && response.url().endsWith(`/api/auth/orders/${foreignOrder.id}`)
    );
    await page.goto(`/account/orders/${foreignOrder.id}`);
    const response = await detailResponse;
    expect([403, 404]).toContain(response.status());
    await expect(page.getByText(/commande introuvable/i)).toBeVisible();
    await expect(page.getByText(foreignOrder.orderNumber, { exact: false })).toHaveCount(0);
  });

  test('E2E-05 admin can navigate to protected order management', async ({ page }) => {
    await clearBrowserState(page);
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/\/admin\/login$/);

    await loginAdmin(page, adminCredentials());
    await page.getByRole('link', { name: /commandes/i }).click();
    await expect(page).toHaveURL(/\/admin\/orders$/);
    await expect(page.getByRole('heading', { name: /gestion des commandes/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /commande/i })).toBeVisible();
    await expect(page.getByText(/une erreur/i)).toHaveCount(0);
  });
});
