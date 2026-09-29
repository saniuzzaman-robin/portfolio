import { test, expect } from '@playwright/test';

const routes = [
  { path: '/projects', label: 'Projects' },
  { path: '/resume', label: 'Resume' },
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
  test('Projects link navigates to /projects', async ({ page, isMobile }) => {
    await page.goto('/');
    // Below `lg` the primary nav lives in the mobile drawer.
    if (isMobile) await page.locator('button[aria-controls="mobile-nav"]').click();
    await page.locator('a[href="/projects"]:visible').first().click();
    await expect(page).toHaveURL(/\/projects/);
  });

  test('Home link from /projects navigates back to /', async ({ page }) => {
    await page.goto('/projects');
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });
});

test.describe('Removed pages', () => {
  test('/about redirects to /', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });

  test('/skills redirects to /resume', async ({ page }) => {
    await page.goto('/skills');
    await expect(page).toHaveURL(/\/resume$/);
  });

  test('/blog returns 410 Gone', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.status()).toBe(410);
  });
});

test.describe('404 page', () => {
  test('returns 404 for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
