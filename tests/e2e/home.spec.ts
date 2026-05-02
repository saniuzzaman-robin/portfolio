import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and returns 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('has a non-empty <title>', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('renders a <main> landmark', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('has a skip-to-content link in the DOM', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
  });
});
