import { test, expect } from '@playwright/test';

test.describe('Icône 👤 Mon Compte — Navigation conditionnelle (React Router Link)', () => {

  test('TEST 1 — Utilisateur non authentifié : clic icône compte → /login sans reload inattendu', async ({ page }) => {
    // 1. Accéder à l'accueil et effacer toute session
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Poser un marqueur window pour attester de l'absence de rechargement complet de page (SPA navigation)
    await page.evaluate(() => {
      (window as unknown as { __spaMarker: boolean }).__spaMarker = true;
    });

    // 2. Vérifier la visibilité de la barre d'icônes
    const searchBtn = page.locator('button[aria-label="Rechercher"]');
    const accountLink = page.locator('a[aria-label="Mon compte"]').first();
    const wishlistLink = page.locator('a[aria-label^="Liste de souhaits"]').first();

    await expect(searchBtn).toBeVisible();
    await expect(accountLink).toBeVisible();
    await expect(wishlistLink).toBeVisible();

    // 3. Vérifier le href du lien avant le clic
    const href = await accountLink.getAttribute('href');
    expect(href).toBe('/login');

    // 4. Cliquer sur l'icône compte
    await accountLink.click();

    // 5. Vérifier la navigation vers /login et l'affichage de LoginPage
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('h1')).toHaveText('Connexion Client');

    // 6. Confirmer que la navigation est SPA (le marqueur window est toujours présent)
    const spaMarker = await page.evaluate(() => (window as unknown as { __spaMarker?: boolean }).__spaMarker);
    expect(spaMarker).toBe(true);
  });

  test('TEST 2 — Utilisateur authentifié : clic icône compte → /account', async ({ page }) => {
    // 1. Se connecter avec le compte client
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'client@hafrose.com');
    await page.fill('input[type="password"]', 'Secret123!');
    await page.click('button[type="submit"]');

    // Attendre redirection vers /account
    await page.waitForURL(/\/account/, { timeout: 20000 });
    await expect(page).toHaveURL(/\/account/);

    // 2. Retourner sur l'accueil
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // 3. Vérifier l'icône 👤 et son href
    const accountLink = page.locator('a[aria-label="Mon compte"]').first();
    await expect(accountLink).toBeVisible();
    const href = await accountLink.getAttribute('href');
    expect(href).toBe('/account');

    // 4. Cliquer sur l'icône compte
    await accountLink.click();

    // 5. Vérifier la navigation vers /account et l'affichage de AccountPage
    await expect(page).toHaveURL('http://localhost:3000/account');
    await expect(page.locator('h1')).toContainText('Ravi de vous revoir');
  });

  test('TEST 3 — Accès direct /login : LoginPage est visible', async ({ page }) => {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toHaveText('Connexion Client');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('TEST 4 — Absence de boucle de redirection sur /login', async ({ page }) => {
    // 1. Visiteur non connecté accède à l'accueil
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    const accountLink = page.locator('a[aria-label="Mon compte"]').first();
    await accountLink.click();

    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('h1')).toHaveText('Connexion Client');

    // Attendre 2 secondes pour vérifier qu'aucune redirection intempestive ne se produit
    await page.waitForTimeout(2000);
    expect(page.url()).toBe('http://localhost:3000/login');
    await expect(page.locator('h1')).toHaveText('Connexion Client');
  });

  test('TEST 5 — Menu Mobile : visiteur non connecté clic Mon Compte → /login', async ({ page }) => {
    // Viewport mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // Ouvrir le menu mobile
    const menuToggle = page.locator('button[aria-label="Ouvrir le menu"]');
    await menuToggle.click();

    // Vérifier le lien "Mon Compte" dans le tiroir mobile
    const mobileAccountLink = page.locator('nav[aria-label="Navigation mobile"] a:has-text("Mon Compte")');
    await expect(mobileAccountLink).toBeVisible();
    const href = await mobileAccountLink.getAttribute('href');
    expect(href).toBe('/login');

    // Cliquer
    await mobileAccountLink.click();

    // URL obligatoire : /login
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('h1')).toHaveText('Connexion Client');
  });

});
