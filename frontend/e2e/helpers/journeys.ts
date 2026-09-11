import { expect, Page } from '@playwright/test';
import type { E2ECredentials } from './credentials';

export const API_URL = process.env.E2E_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';

export async function clearBrowserState(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function loginCustomer(page: Page, credentials: E2ECredentials): Promise<void> {
  await page.goto('/login');
  await page.getByRole('textbox', { name: /e-mail/i }).fill(credentials.email);
  await page.locator('input[type="password"]').fill(credentials.password);
  await page.getByRole('button', { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/account(?:\/|$)/);
}

export async function loginAdmin(page: Page, credentials: E2ECredentials): Promise<void> {
  await page.goto('/admin/login');
  await page.locator('#admin-email').fill(credentials.email);
  await page.locator('#admin-password').fill(credentials.password);
  await page.getByRole('button', { name: /connexion/i }).click();
  await expect(page).toHaveURL(/\/admin(?:\/|$)/);
}

export async function addAvailableProductToCart(page: Page): Promise<string> {
  const response = await page.request.get(`${API_URL}/api/products`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const products = Array.isArray(body.data) ? body.data : (body.data?.data ?? []);
  const product = products.find((item: { slug?: string; stock?: number; stock_quantity?: number }) =>
    item.slug && Number(item.stock ?? item.stock_quantity ?? 0) > 0
  );
  expect(product, 'The E2E catalog needs at least one in-stock product').toBeTruthy();

  await page.goto(`/product/${product.slug}`);
  const addButton = page.getByRole('button', { name: /ajouter au panier/i });
  await expect(addButton).toBeVisible();
  await addButton.click();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  return product.name;
}

type CreatedOrder = { id: number; orderNumber: string; userId: number | null; paymentStatus: string };

function orderData(body: any): any {
  return body?.data?.data ?? body?.data ?? body;
}

export async function completeCheckout(page: Page, marker: string): Promise<CreatedOrder> {
  await page.getByRole('link', { name: /procéder au paiement/i }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  const values = {
    firstName: 'E2E',
    lastName: marker,
    email: `e2e+${marker.toLowerCase()}@example.invalid`,
    phone: '+212600000000',
    address: `1 Rue Certification ${marker}`,
    postalCode: '20000',
    city: 'Casablanca',
  };
  await page.getByRole('textbox', { name: /prénom/i }).fill(values.firstName);
  await page.getByRole('textbox', { name: /^nom/i }).fill(values.lastName);
  await page.getByRole('textbox', { name: /e-mail/i }).fill(values.email);
  await page.getByRole('textbox', { name: /téléphone/i }).fill(values.phone);
  await page.getByRole('textbox', { name: /adresse/i }).fill(values.address);
  await page.getByRole('textbox', { name: /code postal/i }).fill(values.postalCode);
  await page.getByRole('textbox', { name: /ville/i }).fill(values.city);

  const orderResponse = page.waitForResponse(
    (response) => response.request().method() === 'POST' && /\/api\/orders$/.test(response.url())
  );
  await page.getByRole('button', { name: /confirmer et payer/i }).click();
  const response = await orderResponse;
  expect(response.ok(), `Order creation returned HTTP ${response.status()}`).toBeTruthy();
  const order = orderData(await response.json());
  expect(order?.id).toBeTruthy();
  expect(order?.order_number).toBeTruthy();
  await expect(page.getByRole('heading', { name: /merci pour votre commande/i })).toBeVisible();
  await expect(page.getByText(order.order_number, { exact: false })).toBeVisible();

  return {
    id: Number(order.id),
    orderNumber: String(order.order_number),
    userId: order.user_id == null ? null : Number(order.user_id),
    paymentStatus: String(order.payment_status),
  };
}

export function uniqueMarker(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
