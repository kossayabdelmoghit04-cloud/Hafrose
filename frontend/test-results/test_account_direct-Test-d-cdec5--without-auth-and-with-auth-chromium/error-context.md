# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_account_direct.spec.ts >> Test direct access to /account without auth and with auth
- Location: e2e\test_account_direct.spec.ts:3:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Connexion Client"
Received: undefined
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - link "HAFROSE Maison de Haute Couture" [ref=f1e5] [cursor=pointer]:
    - /url: /
    - generic [ref=f1e6]: HAFROSE
    - generic [ref=f1e7]: Maison de Haute Couture
  - generic [ref=f1e9]:
    - generic [ref=f1e10]:
      - heading "Connexion Client" [level=1] [ref=f1e11]
      - paragraph [ref=f1e12]: Accédez à votre espace privé et suivez vos commandes.
    - generic [ref=f1e13]:
      - generic [ref=f1e14]:
        - generic [ref=f1e15]: Adresse E-mail*
        - textbox "Adresse E-mail" [ref=f1e17]:
          - /placeholder: nom@exemple.com
      - generic [ref=f1e18]:
        - generic [ref=f1e19]: Mot de Passe*
        - generic [ref=f1e20]:
          - textbox "Mot de Passe" [ref=f1e21]:
            - /placeholder: ••••••••
          - button "Afficher le mot de passe" [ref=f1e23] [cursor=pointer]
      - generic [ref=f1e27]:
        - generic [ref=f1e29] [cursor=pointer]:
          - checkbox "Se souvenir de moi" [ref=f1e31]
          - generic [ref=f1e32]: Se souvenir de moi
        - link "Mot de passe oublié ?" [ref=f1e33] [cursor=pointer]:
          - /url: /forgot-password
      - button "Se Connecter" [ref=f1e34] [cursor=pointer]
    - generic [ref=f1e40]:
      - text: Pas encore de compte ?
      - link "Créer un compte HAFROSE" [ref=f1e41] [cursor=pointer]:
        - /url: /register
  - paragraph [ref=f1e42]: © 2026 HAFROSE. Tous droits réservés.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Test direct access to /account without auth and with auth', async ({ page }) => {
  4  |   // Clear any stale auth state from previous tests
  5  |   await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  6  |   await page.evaluate(() => {
  7  |     localStorage.removeItem('hafrose_auth_token');
  8  |     localStorage.removeItem('hafrose_user_data');
  9  |     localStorage.removeItem('hafrose_admin_token');
  10 |     sessionStorage.clear();
  11 |   });
  12 | 
  13 |   console.log('--- Step 1: Navigating directly to http://localhost:3000/account (visiteur non connecté) ---');
  14 |   await page.goto('http://localhost:3000/account', { waitUntil: 'domcontentloaded' });
  15 |   await page.waitForURL(/\/login/, { timeout: 10000 });
  16 |   
  17 |   const currentUrl1 = page.url();
  18 |   console.log('URL actuelle après accès à /account (visiteur) :', currentUrl1);
  19 |   const h1Text1 = await page.locator('h1').allInnerTexts();
  20 |   console.log('H1 visible :', h1Text1);
  21 |   
  22 |   // Screenshot du résultat visiteur
  23 |   await page.screenshot({ path: 'test-results/account_visitor_test.png', fullPage: true });
  24 | 
  25 |   // Doit rediriger vers /login
  26 |   expect(currentUrl1).toContain('/login');
> 27 |   expect(h1Text1[0]).toBe('Connexion Client');
     |                      ^ Error: expect(received).toBe(expected) // Object.is equality
  28 | 
  29 |   console.log('--- Step 2: Connexion avec un compte client valide ---');
  30 |   await page.fill('input[type="email"]', 'client@hafrose.com');
  31 |   await page.fill('input[type="password"]', 'Secret123!');
  32 |   await page.click('button[type="submit"]');
  33 | 
  34 |   await expect(page).toHaveURL(/\/account/);
  35 |   const welcomeHeading = page.locator('h1');
  36 |   await expect(welcomeHeading).toContainText('Ravi de vous revoir');
  37 |   console.log('H1 text in dashboard :', await welcomeHeading.innerText());
  38 | 
  39 |   // Screenshot du dashboard client
  40 |   await page.screenshot({ path: 'test-results/account_authenticated_test.png', fullPage: true });
  41 | });
  42 | 
```