import { test, expect } from '@playwright/test';

const routes = [
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/skills', label: 'Skills' },
  { path: '/resume', label: 'Resume' },
  { path: '/blog', label: 'Blog' },
  { path: '/games', label: 'Games' },
] as const;

test.describe('Static pages', () => {
  for (const { path, label } of routes) {
    test(`${label} page loads without error (200)`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });

    test(`${label} page renders a <main> landmark`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
    });
  }
});

test.describe('Navigation', () => {
  test('Projects link navigates to /projects', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/projects"]').first().click();
    await expect(page).toHaveURL(/\/projects/);
  });

  test('Games link navigates to /games', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/games"]').first().click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('Home link from /projects navigates back to /', async ({ page }) => {
    await page.goto('/projects');
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });
});

test.describe('404 page', () => {
  test('returns 404 for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
