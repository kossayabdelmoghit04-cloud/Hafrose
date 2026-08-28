import { test, expect } from '@playwright/test';

test.describe('Icône 👤 Mon Compte — Navigation conditionnelle (React Router Link)', () => {

  test('TEST 1 — Visiteur non connecté : clic 👤 (entre 🔍 et ♡) → http://localhost:3000/login', async ({ page }) => {
    // 1. Accéder à l'accueil
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // 2. Vérifier la visibilité de la barre d'icônes
    const searchBtn = page.locator('button[aria-label="Rechercher"]');
    const accountLink = page.locator('a[aria-label="Mon compte"]').first();
    const wishlistLink = page.locator('a[aria-label^="Liste de souhaits"]').first();

    await expect(searchBtn).toBeVisible();
    await expect(accountLink).toBeVisible();
    await expect(wishlistLink).toBeVisible();

    // 3. Vérifier le href du lien avant le clic
    const href = await accountLink.getAttribute('href');
    console.log('Account Link href (visiteur) :', href);
    expect(href).toBe('/login');

    // 4. Cliquer sur l'icône 👤 visible
    await accountLink.click();

    // 5. Vérifier la navigation vers /login
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('h1')).toHaveText('Connexion Client');
  });

  test('TEST 2 — Accès direct /login affiche LoginPage', async ({ page }) => {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toHaveText('Connexion Client');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('TEST 3 — Client connecté : clic 👤 → http://localhost:3000/account', async ({ page }) => {
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
    console.log('Account Link href (client connecté) :', href);
    expect(href).toBe('/account');

    // 4. Cliquer sur 👤
    await accountLink.click();

    // 5. Vérifier la navigation vers /account
    await expect(page).toHaveURL('http://localhost:3000/account');
    await expect(page.locator('h1')).toContainText('Ravi de vous revoir');
  });

  test('TEST 4 — Menu Mobile : visiteur non connecté clic Mon Compte → /login', async ({ page }) => {
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
    console.log('Mobile Account Link href (visiteur) :', href);
    expect(href).toBe('/login');

    // Cliquer
    await mobileAccountLink.click();

    // URL obligatoire : /login
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('h1')).toHaveText('Connexion Client');
  });

});
