import { test, expect } from '@playwright/test';

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });

test('land on homepage', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  const hacker_portal = await page.locator('div:has-text("app router endpoint reached!")');

  await expect(hacker_portal).toHaveCount(1); 
})

test('should type "abc" into input field, click "Add a new user" button, and check for 500 error', async ({ page }) => {

  await page.goto('http://localhost:3000/'); 

  const inputField = await page.locator('input[placeholder="first name"]');
  await inputField.fill('abc');

  await expect(inputField).toHaveValue('abc');

  const [response] = await Promise.all([
    page.waitForResponse(response => response.status() === 500), 
    page.click('button:has-text("Add a new user")') 
  ]);

  expect(response.status()).toBe(500);
});