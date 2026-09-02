# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-auth.spec.ts >> Admin & Customer Auth - Complete E2E Chain >> Step 6: Customer login non-regression check
- Location: e2e\admin-auth.spec.ts:109:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  11  | 
  12  |   test('Step 1: Direct API call returns 200 with token', async ({ request }) => {
  13  |     const resp = await request.post(`${API_URL}/api/admin/login`, {
  14  |       data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  15  |       headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  16  |     });
  17  |     expect(resp.status()).toBe(200);
  18  |     const body = await resp.json();
  19  |     console.log('DIRECT API RESPONSE:', JSON.stringify(body, null, 2));
  20  |     expect(body.success).toBe(true);
  21  |     expect(body.data.token).toBeTruthy();
  22  |     expect(body.data.user.role).toBe('admin');
  23  |   });
  24  | 
  25  |   test('Step 2: Login form submits correctly and reaches dashboard', async ({ page }) => {
  26  |     // Navigate to login page
  27  |     await page.goto(`${BASE_URL}/admin/login`);
  28  |     await expect(page.locator('h1')).toContainText('Administration HAFROSE');
  29  | 
  30  |     // Fill credentials
  31  |     await page.locator('#admin-email').fill(ADMIN_EMAIL);
  32  |     await page.locator('#admin-password').fill(ADMIN_PASSWORD);
  33  | 
  34  |     console.log('Submitting login form...');
  35  |     await page.locator('button[type="submit"]').click();
  36  | 
  37  |     // Wait for navigation to /admin dashboard
  38  |     await expect(page).toHaveURL(/.*\/admin(\/dashboard)?$/, { timeout: 10000 });
  39  | 
  40  |     // Check localStorage
  41  |     const localStorageData = await page.evaluate(() => ({
  42  |       token: localStorage.getItem('hafrose_auth_token'),
  43  |       user: localStorage.getItem('hafrose_user_data'),
  44  |     }));
  45  |     console.log('LOCALSTORAGE TOKEN:', localStorageData.token ? 'EXISTS (length=' + localStorageData.token.length + ')' : 'NULL');
  46  |     console.log('LOCALSTORAGE USER:', localStorageData.user);
  47  | 
  48  |     expect(localStorageData.token).toBeTruthy();
  49  |     expect(localStorageData.user).toBeTruthy();
  50  |   });
  51  | 
  52  |   test('Step 3: Session persists after reload', async ({ page }) => {
  53  |     // First login
  54  |     await page.goto(`${BASE_URL}/admin/login`);
  55  |     await page.locator('#admin-email').fill(ADMIN_EMAIL);
  56  |     await page.locator('#admin-password').fill(ADMIN_PASSWORD);
  57  |     await page.locator('button[type="submit"]').click();
  58  |     await expect(page).toHaveURL(/.*\/admin(\/dashboard)?$/, { timeout: 10000 });
  59  | 
  60  |     // Reload (F5)
  61  |     await page.reload();
  62  |     await page.waitForTimeout(1000);
  63  | 
  64  |     const currentURL = page.url();
  65  |     console.log('URL after reload:', currentURL);
  66  |     expect(currentURL).not.toContain('/admin/login');
  67  | 
  68  |     const token = await page.evaluate(() => localStorage.getItem('hafrose_auth_token'));
  69  |     expect(token).toBeTruthy();
  70  |   });
  71  | 
  72  |   test('Step 4: Unauthenticated access to /admin is blocked by ProtectedRoute', async ({ page }) => {
  73  |     // Clear localStorage first
  74  |     await page.goto(BASE_URL);
  75  |     await page.evaluate(() => {
  76  |       localStorage.removeItem('hafrose_auth_token');
  77  |       localStorage.removeItem('hafrose_user_data');
  78  |     });
  79  | 
  80  |     // Try accessing admin dashboard directly
  81  |     await page.goto(`${BASE_URL}/admin`);
  82  |     await page.waitForTimeout(1000);
  83  | 
  84  |     const currentURL = page.url();
  85  |     console.log('URL after unauthenticated /admin access:', currentURL);
  86  |     expect(currentURL).toContain('/admin/login');
  87  |   });
  88  | 
  89  |   test('Step 5: Error handling on wrong credentials', async ({ page }) => {
  90  |     // Clear localStorage first
  91  |     await page.goto(BASE_URL);
  92  |     await page.evaluate(() => {
  93  |       localStorage.removeItem('hafrose_auth_token');
  94  |       localStorage.removeItem('hafrose_user_data');
  95  |     });
  96  | 
  97  |     await page.goto(`${BASE_URL}/admin/login`);
  98  |     await page.locator('#admin-email').fill(ADMIN_EMAIL);
  99  |     await page.locator('#admin-password').fill('WrongPassword123!');
  100 |     await page.locator('button[type="submit"]').click();
  101 | 
  102 |     // Verify error alert is displayed
  103 |     const alert = page.getByRole('alert');
  104 |     await expect(alert).toBeVisible({ timeout: 15000 });
  105 |     console.log('Alert text:', await alert.textContent());
  106 |     expect(page.url()).toContain('/admin/login');
  107 |   });
  108 | 
  109 |   test('Step 6: Customer login non-regression check', async ({ page }) => {
  110 |     // Clear localStorage
> 111 |     await page.goto(BASE_URL);
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  112 |     await page.evaluate(() => {
  113 |       localStorage.removeItem('hafrose_auth_token');
  114 |       localStorage.removeItem('hafrose_user_data');
  115 |     });
  116 | 
  117 |     // Go to customer login
  118 |     await page.goto(`${BASE_URL}/login`);
  119 |     await page.locator('input[type="email"]').fill(CUSTOMER_EMAIL);
  120 |     await page.locator('input[type="password"]').fill(CUSTOMER_PASSWORD);
  121 |     await page.getByRole('button', { name: /se connecter/i }).click();
  122 | 
  123 |     // Customer should be redirected to /account or /
  124 |     await expect(page).toHaveURL(/.*(\/account|\/)$/, { timeout: 10000 });
  125 |     const token = await page.evaluate(() => localStorage.getItem('hafrose_auth_token'));
  126 |     expect(token).toBeTruthy();
  127 |   });
  128 | 
  129 | });
  130 | 
```