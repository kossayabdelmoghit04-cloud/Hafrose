import { test, expect, Page } from '@playwright/test';

const VALID_PASSWORD = 'ValidPassword!123';
const RESET_URL = '/reset-password?token=test-reset-token&email=test%40example.com';

async function submitReset(page: Page, password = VALID_PASSWORD, confirmation = password) {
  const passwordInputs = page.locator('input[type=password]');
  await passwordInputs.nth(0).fill(password);
  await passwordInputs.nth(1).fill(confirmation);
  await page.getByRole('button', { name: /Mettre.*Jour le Mot de Passe/i }).click();
}

async function expectErrorWithoutSuccess(page: Page) {
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText(/Mot de Passe R.*initialis/i)).toHaveCount(0);
}

test.describe('Password reset security', () => {
  test('A. missing token prevents reset request and shows an error', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/auth/reset-password', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 200, json: { success: true, data: null } });
    });

    await page.goto('/reset-password?email=test%40example.com');
    await expect(page.getByRole('alert')).toContainText(/invalide|incomplet/i);
    expect(requestCount).toBe(0);
  });

  for (const scenario of [
    { name: 'B. invalid token', message: 'Le lien de réinitialisation est invalide ou expiré.' },
    { name: 'C. expired token', message: 'Le lien de réinitialisation est invalide ou expiré.' },
  ]) {
    test(scenario.name + ' remains an error', async ({ page }) => {
      await page.route('**/api/auth/reset-password', (route) => route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: scenario.message }),
      }));

      await page.goto(RESET_URL);
      await submitReset(page);
      await expectErrorWithoutSuccess(page);
      await expect(page.getByRole('alert')).toContainText(/invalide|expiré/i);
    });
  }

  for (const scenario of [
    { name: 'D. too short', password: 'Short1!' },
    { name: 'E. without uppercase', password: 'validpassword!123' },
    { name: 'F. without lowercase', password: 'VALIDPASSWORD!123' },
    { name: 'G. without number', password: 'ValidPassword!!!' },
    { name: 'H. without symbol', password: 'ValidPassword123' },
  ]) {
    test(scenario.name + ' is rejected locally', async ({ page }) => {
      let requestCount = 0;
      await page.route('**/api/auth/reset-password', async (route) => {
        requestCount += 1;
        await route.fulfill({ status: 200, json: { success: true, data: null } });
      });

      await page.goto(RESET_URL);
      await submitReset(page, scenario.password);
      await expect(page.getByRole('alert')).toContainText(/12 caractères.*majuscule.*minuscule.*chiffre.*symbole/i);
      expect(requestCount).toBe(0);
    });
  }

  test('I. confirmation mismatch is rejected locally', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/auth/reset-password', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 200, json: { success: true, data: null } });
    });

    await page.goto(RESET_URL);
    await submitReset(page, VALID_PASSWORD, 'DifferentPassword!123');
    await expect(page.getByRole('alert')).toContainText(/ne correspondent pas/i);
    expect(requestCount).toBe(0);
  });

  test('J. valid token and password show real success', async ({ page }) => {
    await page.route('**/api/auth/reset-password', async (route) => {
      const payload = route.request().postDataJSON();
      expect(payload).toMatchObject({
        email: 'test@example.com',
        token: 'test-reset-token',
        password: VALID_PASSWORD,
        password_confirmation: VALID_PASSWORD,
      });
      await route.fulfill({
        status: 200,
        json: { success: true, data: null, message: 'Mot de passe réinitialisé avec succès.' },
      });
    });

    await page.goto(RESET_URL);
    await submitReset(page);
    await expect(page.getByText(/Mot de Passe R.*initialis/i)).toBeVisible();
  });

  test('K. API 500 never shows success', async ({ page }) => {
    await page.route('**/api/auth/reset-password', (route) => route.fulfill({
      status: 500,
      json: { message: 'La réinitialisation a échoué.' },
    }));

    await page.goto(RESET_URL);
    await submitReset(page);
    await expectErrorWithoutSuccess(page);
  });

  test('K. network failure never shows success', async ({ page }) => {
    await page.route('**/api/auth/reset-password', (route) => route.abort('failed'));

    await page.goto(RESET_URL);
    await submitReset(page);
    await expectErrorWithoutSuccess(page);
  });
});
