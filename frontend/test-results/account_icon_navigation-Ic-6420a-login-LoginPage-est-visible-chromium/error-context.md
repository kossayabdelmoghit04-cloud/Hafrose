# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: account_icon_navigation.spec.ts >> Icône 👤 Mon Compte — Navigation conditionnelle (React Router Link) >> TEST 3 — Accès direct /login : LoginPage est visible
- Location: e2e\account_icon_navigation.spec.ts:72:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "domcontentloaded"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Icône 👤 Mon Compte — Navigation conditionnelle (React Router Link)', () => {
  4   | 
  5   |   test('TEST 1 — Utilisateur non authentifié : clic icône compte → /login sans reload inattendu', async ({ page }) => {
  6   |     // 1. Accéder à l'accueil et effacer toute session
  7   |     await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  8   |     await page.evaluate(() => {
  9   |       localStorage.clear();
  10  |       sessionStorage.clear();
  11  |     });
  12  |     await page.reload({ waitUntil: 'domcontentloaded' });
  13  | 
  14  |     // Poser un marqueur window pour attester de l'absence de rechargement complet de page (SPA navigation)
  15  |     await page.evaluate(() => {
  16  |       (window as unknown as { __spaMarker: boolean }).__spaMarker = true;
  17  |     });
  18  | 
  19  |     // 2. Vérifier la visibilité de la barre d'icônes
  20  |     const searchBtn = page.locator('button[aria-label="Rechercher"]');
  21  |     const accountLink = page.locator('a[aria-label="Mon compte"]').first();
  22  |     const wishlistLink = page.locator('a[aria-label^="Liste de souhaits"]').first();
  23  | 
  24  |     await expect(searchBtn).toBeVisible();
  25  |     await expect(accountLink).toBeVisible();
  26  |     await expect(wishlistLink).toBeVisible();
  27  | 
  28  |     // 3. Vérifier le href du lien avant le clic
  29  |     const href = await accountLink.getAttribute('href');
  30  |     expect(href).toBe('/login');
  31  | 
  32  |     // 4. Cliquer sur l'icône compte
  33  |     await accountLink.click();
  34  | 
  35  |     // 5. Vérifier la navigation vers /login et l'affichage de LoginPage
  36  |     await expect(page).toHaveURL('http://localhost:3000/login');
  37  |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  38  | 
  39  |     // 6. Confirmer que la navigation est SPA (le marqueur window est toujours présent)
  40  |     const spaMarker = await page.evaluate(() => (window as unknown as { __spaMarker?: boolean }).__spaMarker);
  41  |     expect(spaMarker).toBe(true);
  42  |   });
  43  | 
  44  |   test('TEST 2 — Utilisateur authentifié : clic icône compte → /account', async ({ page }) => {
  45  |     // 1. Se connecter avec le compte client
  46  |     await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  47  |     await page.fill('input[type="email"]', 'client@hafrose.com');
  48  |     await page.fill('input[type="password"]', 'Secret123!');
  49  |     await page.click('button[type="submit"]');
  50  | 
  51  |     // Attendre redirection vers /account
  52  |     await page.waitForURL(/\/account/, { timeout: 20000 });
  53  |     await expect(page).toHaveURL(/\/account/);
  54  | 
  55  |     // 2. Retourner sur l'accueil
  56  |     await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  57  | 
  58  |     // 3. Vérifier l'icône 👤 et son href
  59  |     const accountLink = page.locator('a[aria-label="Mon compte"]').first();
  60  |     await expect(accountLink).toBeVisible();
  61  |     const href = await accountLink.getAttribute('href');
  62  |     expect(href).toBe('/account');
  63  | 
  64  |     // 4. Cliquer sur l'icône compte
  65  |     await accountLink.click();
  66  | 
  67  |     // 5. Vérifier la navigation vers /account et l'affichage de AccountPage
  68  |     await expect(page).toHaveURL('http://localhost:3000/account');
  69  |     await expect(page.locator('h1')).toContainText('Ravi de vous revoir');
  70  |   });
  71  | 
  72  |   test('TEST 3 — Accès direct /login : LoginPage est visible', async ({ page }) => {
> 73  |     await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  74  |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  75  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  76  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  77  |   });
  78  | 
  79  |   test('TEST 4 — Absence de boucle de redirection sur /login', async ({ page }) => {
  80  |     // 1. Visiteur non connecté accède à l'accueil
  81  |     await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  82  |     await page.evaluate(() => {
  83  |       localStorage.clear();
  84  |       sessionStorage.clear();
  85  |     });
  86  | 
  87  |     const accountLink = page.locator('a[aria-label="Mon compte"]').first();
  88  |     await accountLink.click();
  89  | 
  90  |     await expect(page).toHaveURL('http://localhost:3000/login');
  91  |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  92  | 
  93  |     // Attendre 2 secondes pour vérifier qu'aucune redirection intempestive ne se produit
  94  |     await page.waitForTimeout(2000);
  95  |     expect(page.url()).toBe('http://localhost:3000/login');
  96  |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  97  |   });
  98  | 
  99  |   test('TEST 5 — Menu Mobile : visiteur non connecté clic Mon Compte → /login', async ({ page }) => {
  100 |     // Viewport mobile
  101 |     await page.setViewportSize({ width: 390, height: 844 });
  102 |     await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  103 | 
  104 |     // Ouvrir le menu mobile
  105 |     const menuToggle = page.locator('button[aria-label="Ouvrir le menu"]');
  106 |     await menuToggle.click();
  107 | 
  108 |     // Vérifier le lien "Mon Compte" dans le tiroir mobile
  109 |     const mobileAccountLink = page.locator('nav[aria-label="Navigation mobile"] a:has-text("Mon Compte")');
  110 |     await expect(mobileAccountLink).toBeVisible();
  111 |     const href = await mobileAccountLink.getAttribute('href');
  112 |     expect(href).toBe('/login');
  113 | 
  114 |     // Cliquer
  115 |     await mobileAccountLink.click();
  116 | 
  117 |     // URL obligatoire : /login
  118 |     await expect(page).toHaveURL('http://localhost:3000/login');
  119 |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  120 |   });
  121 | 
  122 | });
  123 | 
```