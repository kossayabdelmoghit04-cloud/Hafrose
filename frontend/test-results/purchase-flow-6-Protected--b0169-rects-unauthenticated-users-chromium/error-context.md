# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-flow.spec.ts >> 6. Protected route guard redirects unauthenticated users
- Location: e2e\purchase-flow.spec.ts:181:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  82  |   const prodResponse = await request.get(`${API_URL}/api/products`);
  83  |   const prodBody = await prodResponse.json();
  84  |   // API-01: data is a direct array at root level (no double nesting)
  85  |   const firstSlug = prodBody.data?.[0]?.slug;
  86  |   expect(firstSlug).toBeTruthy();
  87  | 
  88  |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  89  |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  90  | 
  91  |   const bodyText = await page.locator('body').textContent();
  92  |   expect(bodyText).not.toContain('Produit introuvable');
  93  |   console.log(`✅ Product detail loaded for slug: "${firstSlug}"`);
  94  | });
  95  | 
  96  | // ============================================================
  97  | // TEST 5: Full Purchase Flow (authenticated)
  98  | // ============================================================
  99  | test('5. Full purchase flow: Login → Shop → Product → Cart → Checkout → Order', async ({ request, page }) => {
  100 |   const prodResponse = await request.get(`${API_URL}/api/products`);
  101 |   const prodBody = await prodResponse.json();
  102 |   // API-01: data is a direct array at root level (no double nesting)
  103 |   const firstSlug = prodBody.data?.[0]?.slug;
  104 |   const firstName = prodBody.data?.[0]?.name;
  105 |   expect(firstSlug).toBeTruthy();
  106 | 
  107 |   // --- STEP 1: Login ---
  108 |   await page.goto(`${BASE_URL}/login`);
  109 |   await page.waitForSelector('form', { timeout: 10000 });
  110 | 
  111 |   await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
  112 |   await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);
  113 |   await page.getByRole('button', { name: /Se Connecter/i }).click();
  114 | 
  115 |   await expect(page).toHaveURL(/account/, { timeout: 20000 });
  116 |   console.log('✅ STEP 1: Logged in successfully');
  117 | 
  118 |   // --- STEP 2: Navigate to Product page ---
  119 |   await page.goto(`${BASE_URL}/product/${firstSlug}`);
  120 |   await page.waitForSelector('button:has-text("Ajouter au Panier")', { timeout: 25000 });
  121 |   console.log(`✅ STEP 2: Product page loaded "${firstName}"`);
  122 | 
  123 |   // --- STEP 3: Select size & Add to Cart ---
  124 |   const sizeButtons = page.locator('button').filter({ hasText: /^(34|36|38|40|42|44|XS|S|M|L|XL)$/ });
  125 |   if (await sizeButtons.count() > 0) {
  126 |     await sizeButtons.first().click();
  127 |     console.log('✅ STEP 3a: Size selected');
  128 |   }
  129 | 
  130 |   const addToCartBtn = page.locator('button:has-text("Ajouter au Panier")');
  131 |   await addToCartBtn.click();
  132 |   console.log('✅ STEP 3b: Added product to cart');
  133 | 
  134 |   // --- STEP 4: Go to Cart ---
  135 |   await page.goto(`${BASE_URL}/cart`);
  136 |   await page.waitForSelector('body', { timeout: 10000 });
  137 | 
  138 |   const bodyText = await page.locator('body').textContent();
  139 |   expect(bodyText).not.toContain('Votre panier est vide');
  140 |   console.log('✅ STEP 4: Cart contains items');
  141 | 
  142 |   // --- STEP 5: Click link to Checkout (SPA React Router navigation) ---
  143 |   const checkoutLink = page.locator('a[href="/checkout"]').first();
  144 |   await expect(checkoutLink).toBeVisible({ timeout: 10000 });
  145 |   await checkoutLink.click();
  146 | 
  147 |   await expect(page).toHaveURL(/checkout/, { timeout: 20000 });
  148 |   await page.waitForSelector('form', { timeout: 20000 });
  149 |   console.log('✅ STEP 5: Navigated to Checkout page via SPA');
  150 | 
  151 |   // --- STEP 6: Fill all required fields & submit ---
  152 |   await page.getByRole('textbox', { name: /Prénom/i }).fill('Jean');
  153 |   await page.getByRole('textbox', { name: /^Nom/i }).fill('Dupont');
  154 |   await page.getByRole('textbox', { name: /E-mail/i }).fill('jean.dupont@example.com');
  155 |   await page.getByRole('textbox', { name: /Téléphone/i }).fill('+33612345678');
  156 |   await page.getByRole('textbox', { name: /Adresse/i }).fill('124 Avenue Montaigne');
  157 |   await page.getByRole('textbox', { name: /Code Postal/i }).fill('75008');
  158 |   await page.getByRole('textbox', { name: /Ville/i }).fill('Paris');
  159 | 
  160 |   // Ensure CGV checkbox is checked
  161 |   const cgvCheckbox = page.locator('input[type="checkbox"]');
  162 |   if (await cgvCheckbox.count() > 0) {
  163 |     if (!(await cgvCheckbox.first().isChecked())) {
  164 |       await cgvCheckbox.first().check();
  165 |     }
  166 |   }
  167 | 
  168 |   const submitBtn = page.getByRole('button', { name: /Confirmer et Payer/i });
  169 |   await expect(submitBtn).toBeVisible({ timeout: 10000 });
  170 |   await submitBtn.click();
  171 |   console.log('✅ STEP 6: Order submitted');
  172 | 
  173 |   // --- STEP 7: Order Confirmation ---
  174 |   await page.waitForSelector('text=Merci pour Votre Commande', { timeout: 30000 });
  175 |   console.log('✅ STEP 7: Order confirmation received!');
  176 | });
  177 | 
  178 | // ============================================================
  179 | // TEST 6: Protected Routes — Auth Guard
  180 | // ============================================================
  181 | test('6. Protected route guard redirects unauthenticated users', async ({ page }) => {
> 182 |   await page.goto(`${BASE_URL}/login`);
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  183 |   await page.evaluate(() => localStorage.clear());
  184 |   await page.reload();
  185 | 
  186 |   await page.goto(`${BASE_URL}/account`);
  187 |   await expect(page).toHaveURL(/login/, { timeout: 20000 });
  188 |   console.log('✅ Auth guard: unauthenticated access to /account redirected to /login');
  189 | });
  190 | 
```