import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://127.0.0.1:8000';
const ADMIN_EMAIL = 'admin@hafrose.com';
const ADMIN_PASSWORD = 'Admin@Hafrose2024!';
const CUSTOMER_EMAIL = 'client.test@hafrose.com';
const CUSTOMER_PASSWORD = 'password';

test.describe('Admin & Customer Auth - Complete E2E Chain', () => {

  test('Step 1: Direct API call returns 200 with token', async ({ request }) => {
    const resp = await request.post(`${API_URL}/api/admin/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    console.log('DIRECT API RESPONSE:', JSON.stringify(body, null, 2));
    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.role).toBe('admin');
  });

  test('Step 2: Login form submits correctly and reaches dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/admin/login`);
    await expect(page.locator('h1')).toContainText('Administration HAFROSE');

    // Fill credentials
    await page.locator('#admin-email').fill(ADMIN_EMAIL);
    await page.locator('#admin-password').fill(ADMIN_PASSWORD);

    console.log('Submitting login form...');
    await page.locator('button[type="submit"]').click();

    // Wait for navigation to /admin dashboard
    await expect(page).toHaveURL(/.*\/admin(\/dashboard)?$/, { timeout: 10000 });

    // Check localStorage
    const localStorageData = await page.evaluate(() => ({
      token: localStorage.getItem('hafrose_auth_token'),
      user: localStorage.getItem('hafrose_user_data'),
    }));
    console.log('LOCALSTORAGE TOKEN:', localStorageData.token ? 'EXISTS (length=' + localStorageData.token.length + ')' : 'NULL');
    console.log('LOCALSTORAGE USER:', localStorageData.user);

    expect(localStorageData.token).toBeTruthy();
    expect(localStorageData.user).toBeTruthy();
  });

  test('Step 3: Session persists after reload', async ({ page }) => {
    // First login
    await page.goto(`${BASE_URL}/admin/login`);
    await page.locator('#admin-email').fill(ADMIN_EMAIL);
    await page.locator('#admin-password').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/admin(\/dashboard)?$/, { timeout: 10000 });

    // Reload (F5)
    await page.reload();
    await page.waitForTimeout(1000);

    const currentURL = page.url();
    console.log('URL after reload:', currentURL);
    expect(currentURL).not.toContain('/admin/login');

    const token = await page.evaluate(() => localStorage.getItem('hafrose_auth_token'));
    expect(token).toBeTruthy();
  });

  test('Step 4: Unauthenticated access to /admin is blocked by ProtectedRoute', async ({ page }) => {
    // Clear localStorage first
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.removeItem('hafrose_auth_token');
      localStorage.removeItem('hafrose_user_data');
    });

    // Try accessing admin dashboard directly
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(1000);

    const currentURL = page.url();
    console.log('URL after unauthenticated /admin access:', currentURL);
    expect(currentURL).toContain('/admin/login');
  });

  test('Step 5: Error handling on wrong credentials', async ({ page }) => {
    // Clear localStorage first
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.removeItem('hafrose_auth_token');
      localStorage.removeItem('hafrose_user_data');
    });

    await page.goto(`${BASE_URL}/admin/login`);
    await page.locator('#admin-email').fill(ADMIN_EMAIL);
    await page.locator('#admin-password').fill('WrongPassword123!');
    await page.locator('button[type="submit"]').click();

    // Verify error alert is displayed
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 15000 });
    console.log('Alert text:', await alert.textContent());
    expect(page.url()).toContain('/admin/login');
  });

  test('Step 6: Customer login non-regression check', async ({ page }) => {
    // Clear localStorage
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.removeItem('hafrose_auth_token');
      localStorage.removeItem('hafrose_user_data');
    });

    // Go to customer login
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"]').fill(CUSTOMER_EMAIL);
    await page.locator('input[type="password"]').fill(CUSTOMER_PASSWORD);
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Customer should be redirected to /account or /
    await expect(page).toHaveURL(/.*(\/account|\/)$/, { timeout: 10000 });
    const token = await page.evaluate(() => localStorage.getItem('hafrose_auth_token'));
    expect(token).toBeTruthy();
  });

});
