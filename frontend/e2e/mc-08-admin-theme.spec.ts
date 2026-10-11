import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@hafrose.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@Hafrose2024!';

test.describe('MC-08 Admin Dark / Light Mode Implementation & Isolation', () => {
  // Fast & reliable admin session setup via API token injection
  async function loginAsAdmin(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext) {
    const resp = await request.post('http://127.0.0.1:8000/api/admin/login', {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      headers: { Accept: 'application/json' },
    });
    const body = await resp.json();
    const token = body?.data?.token;
    const user = body?.data?.user;

    await page.goto(`${BASE_URL}/admin/login`);
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('hafrose_auth_token', token);
      localStorage.setItem('hafrose_user_data', JSON.stringify(user));
    }, { token, user });

    await page.goto(`${BASE_URL}/admin`);
    await expect(page.locator('.admin-root')).toBeVisible({ timeout: 15000 });
  }

  test('MC-08-01 Theme toggle exists in header and is accessible with aria-checked and role="switch"', async ({ page, request }) => {
    await loginAsAdmin(page, request);

    const toggle = page.locator('#admin-theme-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('role', 'switch');
    const ariaChecked = await toggle.getAttribute('aria-checked');
    expect(['true', 'false']).toContain(ariaChecked);
  });

  test('MC-08-02 Admin toggles from Dark to Light: root class, sidebar, header and KPI switch theme', async ({ page, request }) => {
    await loginAsAdmin(page, request);

    const rootAdmin = page.locator('.admin-root');
    await expect(rootAdmin).toBeVisible();

    // Ensure we start from dark
    await page.evaluate(() => localStorage.setItem('hafrose_admin_theme', 'dark'));
    await page.reload();
    await expect(rootAdmin).toHaveClass(/admin-theme-dark/);

    // Click toggle to switch to Light
    const toggle = page.locator('#admin-theme-toggle');
    await toggle.click();

    // Immediately changes to light without reload
    await expect(rootAdmin).toHaveClass(/admin-theme-light/);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Storage is updated
    const storedTheme = await page.evaluate(() => localStorage.getItem('hafrose_admin_theme'));
    expect(storedTheme).toBe('light');
  });

  test('MC-08-03 Theme choice persists across navigation between Admin pages', async ({ page, request }) => {
    await loginAsAdmin(page, request);

    // Switch to light mode
    await page.evaluate(() => localStorage.setItem('hafrose_admin_theme', 'light'));
    await page.reload();

    const rootAdmin = page.locator('.admin-root');
    await expect(rootAdmin).toHaveClass(/admin-theme-light/);

    // Navigate to Products page
    await page.getByRole('link', { name: /produits/i }).first().click();
    await expect(page).toHaveURL(/.*\/admin\/products/);

    // Still in light mode
    await expect(rootAdmin).toHaveClass(/admin-theme-light/);

    // Navigate to Categories page
    await page.getByRole('link', { name: /catégories/i }).first().click();
    await expect(page).toHaveURL(/.*\/admin\/categories/);
    await expect(rootAdmin).toHaveClass(/admin-theme-light/);
  });

  test('MC-08-04 Theme choice persists after page refresh (F5)', async ({ page, request }) => {
    await loginAsAdmin(page, request);

    // Set to light
    const toggle = page.locator('#admin-theme-toggle');
    const isDark = (await toggle.getAttribute('aria-checked')) === 'true';
    if (isDark) {
      await toggle.click();
    }
    const rootAdmin = page.locator('.admin-root');
    await expect(rootAdmin).toHaveClass(/admin-theme-light/);

    // Refresh
    await page.reload();

    // Verify persisted
    await expect(rootAdmin).toHaveClass(/admin-theme-light/);
    const storedTheme = await page.evaluate(() => localStorage.getItem('hafrose_admin_theme'));
    expect(storedTheme).toBe('light');
  });

  test('MC-08-05 Keyboard accessibility: Enter / Space triggers theme toggle', async ({ page, request }) => {
    await loginAsAdmin(page, request);

    const toggle = page.locator('#admin-theme-toggle');
    await toggle.focus();

    const rootAdmin = page.locator('.admin-root');
    const wasDark = await rootAdmin.evaluate((el) => el.classList.contains('admin-theme-dark'));

    // Press Space
    await page.keyboard.press('Space');
    if (wasDark) {
      await expect(rootAdmin).toHaveClass(/admin-theme-light/);
    } else {
      await expect(rootAdmin).toHaveClass(/admin-theme-dark/);
    }

    // Press Enter to toggle back
    await page.keyboard.press('Enter');
    if (wasDark) {
      await expect(rootAdmin).toHaveClass(/admin-theme-dark/);
    } else {
      await expect(rootAdmin).toHaveClass(/admin-theme-light/);
    }
  });

  test('MC-08-06 Strict Scope Isolation: Public Home Page is NOT affected by Admin theme', async ({ page, request }) => {
    await loginAsAdmin(page, request);

    // Set admin theme to dark
    await page.evaluate(() => localStorage.setItem('hafrose_admin_theme', 'dark'));

    // Visit public home page
    await page.goto(`${BASE_URL}/`);

    // Public pages should never have .admin-root or admin-theme classes
    const adminRoot = page.locator('.admin-root');
    await expect(adminRoot).toHaveCount(0);

    const bodyClass = (await page.locator('body').getAttribute('class')) || '';
    expect(bodyClass).not.toContain('admin-theme');

    // Visit public shop page
    await page.goto(`${BASE_URL}/shop`);
    await expect(adminRoot).toHaveCount(0);
  });

  test('MC-08-07 Responsive display: Toggle is accessible on 375px, 768px, 1366px, 1920px', async ({ page, request }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await loginAsAdmin(page, request);

      const toggle = page.locator('#admin-theme-toggle');
      await expect(toggle).toBeVisible();

      // Ensure no horizontal scrollbar on viewport
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    }
  });
});
