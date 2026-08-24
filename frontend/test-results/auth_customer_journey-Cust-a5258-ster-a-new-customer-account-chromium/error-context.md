# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth_customer_journey.spec.ts >> Customer Authentication and Account Journey >> TEST 7: Register a new customer account
- Location: e2e\auth_customer_journey.spec.ts:102:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.fill: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('input[name="first_name"], input[placeholder="Prénom"], input[type="text"]').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "HAFROSE Maison de Haute Couture" [ref=e5] [cursor=pointer]:
    - /url: /
    - generic [ref=e6]: HAFROSE
    - generic [ref=e7]: Maison de Haute Couture
  - generic [ref=e9]:
    - generic [ref=e10]:
      - heading "Créer un Compte" [level=1] [ref=e11]
      - paragraph [ref=e12]: Rejoignez le Cercle Privé HAFROSE et bénéficiez d'avantages exclusifs.
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]: Prénom*
          - textbox "Prénom" [ref=e18]:
            - /placeholder: Éléonore
        - generic [ref=e19]:
          - generic [ref=e20]: Nom*
          - textbox "Nom" [ref=e22]:
            - /placeholder: De Saint-Germain
      - generic [ref=e23]:
        - generic [ref=e24]: Adresse E-mail*
        - textbox "Adresse E-mail" [ref=e26]:
          - /placeholder: eleonore@exemple.com
      - generic [ref=e27]:
        - generic [ref=e28]: Téléphone (Optionnel)
        - textbox "Téléphone (Optionnel)" [ref=e30]:
          - /placeholder: +33 6 12 34 56 78
      - generic [ref=e32]:
        - generic [ref=e33]: Mot de Passe*
        - generic [ref=e34]:
          - textbox "Mot de Passe" [ref=e35]:
            - /placeholder: ••••••••
          - button "Afficher le mot de passe" [ref=e37] [cursor=pointer]
      - generic [ref=e41]:
        - generic [ref=e42]: Confirmer le Mot de Passe*
        - generic [ref=e43]:
          - textbox "Confirmer le Mot de Passe" [ref=e44]:
            - /placeholder: ••••••••
          - button "Afficher le mot de passe" [ref=e46] [cursor=pointer]
      - generic [ref=e51] [cursor=pointer]:
        - checkbox "J'accepte les Conditions Générales de Vente et la Politique de Confidentialité." [ref=e53]
        - generic [ref=e56]:
          - text: J'accepte les
          - link "Conditions Générales de Vente" [ref=e57]:
            - /url: "#"
          - text: et la Politique de Confidentialité.
      - button "Créer mon Compte" [ref=e58] [cursor=pointer]
    - generic [ref=e64]:
      - text: Déjà membre HAFROSE ?
      - link "Se connecter" [ref=e65] [cursor=pointer]:
        - /url: /login
  - paragraph [ref=e66]: © 2026 HAFROSE. Tous droits réservés.
```

# Test source

```ts
  7   |     
  8   |     // Check heading
  9   |     const heading = page.locator('h1');
  10  |     await expect(heading).toHaveText('Connexion Client');
  11  |     
  12  |     // Check form elements
  13  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  14  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  15  |     await expect(page.locator('button[type="submit"]')).toContainText('Se Connecter');
  16  | 
  17  |     // Confirm no offline screen
  18  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  19  |     await expect(offlineIcon).toHaveCount(0);
  20  |     const bodyText = await page.innerText('body');
  21  |     expect(bodyText).not.toContain('Hors Connexion');
  22  |     expect(bodyText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  23  |   });
  24  | 
  25  |   test('TEST 2: Visitor clicks Mon Compte icon in Header -> redirects to /login', async ({ page }) => {
  26  |     await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  27  |     
  28  |     // Click on User icon
  29  |     const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
  30  |     await userLink.click();
  31  |     
  32  |     // Expect URL to become /login
  33  |     await expect(page).toHaveURL(/.*\/login/);
  34  |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  35  |   });
  36  | 
  37  |   test('TEST 5: Invalid login credentials show auth error alert (NOT offline screen)', async ({ page }) => {
  38  |     await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  39  |     
  40  |     await page.fill('input[type="email"]', 'wronguser@example.com');
  41  |     await page.fill('input[type="password"]', 'WrongPassword999!');
  42  |     await page.click('button[type="submit"]');
  43  |     
  44  |     // An error alert should appear
  45  |     const alert = page.locator('[role="alert"]');
  46  |     await expect(alert).toBeVisible();
  47  |     const alertText = await alert.innerText();
  48  |     expect(alertText).toMatch(/Identifiants incorrects|Erreur de connexion|Veuillez/i);
  49  | 
  50  |     // Confirm no offline state
  51  |     expect(alertText).not.toContain('Hors Connexion');
  52  |     expect(alertText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  53  |   });
  54  | 
  55  |   test('TEST 3: Valid customer login redirects to /account', async ({ page }) => {
  56  |     await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  57  |     
  58  |     await page.fill('input[type="email"]', 'client@hafrose.com');
  59  |     await page.fill('input[type="password"]', 'Secret123!');
  60  |     await page.click('button[type="submit"]');
  61  |     
  62  |     // Expect redirection to /account
  63  |     await expect(page).toHaveURL(/.*\/account/);
  64  |     
  65  |     // Verify dashboard welcome message
  66  |     const welcome = page.locator('h1');
  67  |     await expect(welcome).toContainText('Ravi de vous revoir');
  68  |     await expect(welcome).toContainText('Sophie');
  69  | 
  70  |     // Confirm no offline screen
  71  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  72  |     await expect(offlineIcon).toHaveCount(0);
  73  |   });
  74  | 
  75  |   test('TEST 4 & 6: Logged-in user can access /account, /account/orders, and click Mon compte', async ({ page }) => {
  76  |     // 1. Log in
  77  |     await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  78  |     await page.fill('input[type="email"]', 'client@hafrose.com');
  79  |     await page.fill('input[type="password"]', 'Secret123!');
  80  |     await page.click('button[type="submit"]');
  81  |     await expect(page).toHaveURL(/.*\/account/);
  82  | 
  83  |     // 2. Navigate to orders page
  84  |     await page.goto('http://localhost:3000/account/orders', { waitUntil: 'networkidle' });
  85  |     const ordersHeading = page.locator('h1');
  86  |     await expect(ordersHeading).toHaveText('Mes Commandes');
  87  | 
  88  |     // 3. Confirm no offline screen on orders page
  89  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  90  |     await expect(offlineIcon).toHaveCount(0);
  91  | 
  92  |     // 4. Return to home and click Mon Compte
  93  |     await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  94  |     const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
  95  |     await userLink.click();
  96  |     
  97  |     // Since user is logged in, it should go directly to /account, NOT /login
  98  |     await expect(page).toHaveURL(/.*\/account/);
  99  |     await expect(page.locator('h1')).toContainText('Ravi de vous revoir');
  100 |   });
  101 | 
  102 |   test('TEST 7: Register a new customer account', async ({ page }) => {
  103 |     const uniqueEmail = `test_${Date.now()}@hafrose.com`;
  104 |     await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
  105 |     
  106 |     // Fill register form
> 107 |     await page.fill('input[name="first_name"], input[placeholder="Prénom"], input[type="text"] >> nth=0', 'Claire');
      |                ^ Error: page.fill: Test timeout of 45000ms exceeded.
  108 |     await page.fill('input[name="last_name"], input[placeholder="Nom"], input[type="text"] >> nth=1', 'Dubois');
  109 |     await page.fill('input[type="email"]', uniqueEmail);
  110 |     await page.fill('input[type="password"] >> nth=0', 'SecretPass123!');
  111 |     await page.fill('input[type="password"] >> nth=1', 'SecretPass123!');
  112 |     
  113 |     // Check CGV if present
  114 |     const terms = page.locator('input[type="checkbox"]');
  115 |     if (await terms.count() > 0) {
  116 |       await terms.first().check();
  117 |     }
  118 |     
  119 |     await page.click('button[type="submit"]');
  120 |     
  121 |     // Expect redirect to /account or success
  122 |     await expect(page).toHaveURL(/.*\/account/);
  123 |   });
  124 | 
  125 | });
  126 | 
```