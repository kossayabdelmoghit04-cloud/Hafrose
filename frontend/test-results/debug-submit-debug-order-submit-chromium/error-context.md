# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: debug-submit.spec.ts >> debug order submit
- Location: e2e\debug-submit.spec.ts:11:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /account/
Received string:  "http://localhost:3000/login"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × locator resolved to <html lang="fr" dir="ltr">…</html>
       - unexpected value "http://localhost:3000/login"

```

```yaml
- link "HAFROSE Maison de Haute Couture":
  - /url: /
- heading "Connexion Client" [level=1]
- paragraph: Accédez à votre espace privé et suivez vos commandes.
- alert:
  - img
  - heading "Erreur de connexion" [level=5]
  - text: Validation failed
- text: Adresse E-mail
- img
- textbox "Adresse E-mail":
  - /placeholder: nom@exemple.com
  - text: client.test@hafrose.com
- text: Mot de Passe
- img
- textbox "Mot de Passe":
  - /placeholder: ••••••••
  - text: password
- button "Afficher le mot de passe":
  - img
- checkbox "Se souvenir de moi"
- img
- text: Se souvenir de moi
- link "Mot de passe oublié ?":
  - /url: /forgot-password
- button "Se Connecter":
  - img
  - text: Se Connecter
- text: Pas encore de compte ?
- link "Créer un compte HAFROSE":
  - /url: /register
- paragraph: © 2026 HAFROSE. Tous droits réservés.
```

# Test source

```ts
  1  | ﻿import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:3000';
  4  | const API_URL = 'http://localhost:8000';
  5  | 
  6  | const TEST_CREDENTIALS = {
  7  |   email: 'client.test@hafrose.com',
  8  |   password: 'password',
  9  | };
  10 | 
  11 | test('debug order submit', async ({ request, page }) => {
  12 |   page.on('response', async resp => {
  13 |     if (resp.url().includes('/api/orders')) {
  14 |       console.log(`API [${resp.status()}] ${resp.url()}`);
  15 |       console.log('RESPONSE BODY:', await resp.text());
  16 |     }
  17 |   });
  18 | 
  19 |   const prodResponse = await request.get(`${API_URL}/api/products`);
  20 |   const prodBody = await prodResponse.json();
  21 |   const firstSlug = prodBody.data?.data?.[0]?.slug;
  22 | 
  23 |   // Login
  24 |   await page.goto(`${BASE_URL}/login`);
  25 |   await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  26 |   await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  27 |   await page.getByRole('button', { name: /Se Connecter/i }).click();
> 28 |   await expect(page).toHaveURL(/account/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  29 | 
  30 |   // Add product to cart
  31 |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  32 |   await page.waitForSelector('button:has-text("Ajouter au Panier")');
  33 |   await page.locator('button:has-text("Ajouter au Panier")').click();
  34 | 
  35 |   // Cart -> Checkout link
  36 |   await page.goto(`${BASE_URL}/cart`);
  37 |   const checkoutLink = page.locator('a[href="/checkout"]').first();
  38 |   await checkoutLink.click();
  39 |   await expect(page).toHaveURL(/checkout/);
  40 |   await page.waitForSelector('form');
  41 | 
  42 |   // Fill form inputs cleanly
  43 |   const inputs = page.locator('form input[type="text"], form input[type="email"], form input[type="tel"]');
  44 |   const count = await inputs.count();
  45 |   for (let i = 0; i < count; i++) {
  46 |     const input = inputs.nth(i);
  47 |     const val = await input.inputValue();
  48 |     if (!val || val.trim() === '') {
  49 |       await input.fill('+33612345678');
  50 |     }
  51 |   }
  52 | 
  53 |   // Ensure CGV checked
  54 |   const cgvCheckbox = page.locator('input[type="checkbox"]');
  55 |   if (await cgvCheckbox.count() > 0) {
  56 |     if (!(await cgvCheckbox.first().isChecked())) {
  57 |       await cgvCheckbox.first().check();
  58 |     }
  59 |   }
  60 | 
  61 |   const submitBtn = page.getByRole('button', { name: /Confirmer et Payer/i });
  62 |   await submitBtn.click();
  63 | 
  64 |   await page.waitForTimeout(5000);
  65 | });
  66 | 
```