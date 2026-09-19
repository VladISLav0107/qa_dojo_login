import { test, expect, Page } from '@playwright/test';

const uniqueEmail = () => `student-${Date.now()}-${Math.random()}@example.com`;

async function registerNewUser( page:Page ) {
    const username = `user-${Date.now()}`;
    const email = uniqueEmail();
    const password = 'Test123!';

    await page.goto('/register');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/email/i).fill(email);
    await page.getByTestId('auth-password').fill(password);
    await page.getByLabel(/Repeat password/i).fill(password);
    await page.getByTestId('register-terms').check();
    await page.getByTestId('auth-submit').click();
    await expect(page.getByTestId('nav-profile')).toBeVisible();
    await page.getByTestId('nav-profile').click();
   
    await expect(
        page.getByTestId('profile-page').locator('header')
    ).toContainText('Contributor');

    return { username, email, password};

}


test.describe('Registration', { tag: '@auth' }, () => {

  test('Registration successful, all data is unique', async ({ page }) => {
    await registerNewUser(page);
  });

  test('Registration with an email address that has already been used', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('auth-username').fill('testLV');
    await page.getByTestId('auth-email').fill('test@lv.com');
    await page.getByTestId('auth-password').fill('123456');
    await page.getByTestId('register-confirm-password').fill('123456');
    await page.getByTestId('register-terms').check();
    await page.getByTestId('auth-submit').click();
    
    await expect(
        page.getByText('body email або username')
    ).toBeVisible();
  });

  test('Registration with invalid or empty data', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('auth-username').fill('123456');
    await page.getByTestId('auth-password').fill('12345');
    await page.getByTestId('register-confirm-password').fill('12345');
    await page.getByTestId('register-terms').check();
    await page.getByTestId('auth-submit').click();
    
    await expect(
        page.getByTestId('error-messages')
    ).toContainText('email некоректний emailpassword пароль має містити щонайменше 6 символів');
  });

});

test.describe('Login', { tag: '@auth' }, () => {

    const email_user = 'test@lv.com';
    const password_user = '123456';

  test('existing user and the correct password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill(email_user);
    await page.getByTestId('auth-password').fill(password_user);
    await page.getByTestId('auth-submit').click();
    
    await expect(
        page.getByTestId('nav-profile')
    ).toBeVisible();
  });
  
  test('unique email address and any password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill(`test_${Date.now()}@lv.com`);
    await page.getByTestId('auth-password').click();
    await page.getByTestId('auth-password').fill(`${Math.random()}`);
    await page.getByTestId('auth-submit').click();
    
    await expect(
        page.getByTestId('error-messages')
    ).toContainText('email or password неправильні');
  });
  
  test('Existing email address and incorrect password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill(email_user);
    await page.getByTestId('auth-password').fill(`${Date.now()}`);
    await page.getByTestId('auth-submit').click();
    
    await expect(
        page.getByTestId('error-messages')
    ).toContainText('email or password неправильні');

  });
  
});