import { test, expect } from '@playwright/test';
import { SITE_URL } from '../../src/lib/site';
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath } from '../../src/i18n/config';

const PAGES = ['/', '/projects', '/resume'] as const;

const absolute = (path: string) => (path === '/' ? SITE_URL : `${SITE_URL}${path}`);

test.describe('Localized pages', () => {
  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const url = localePath(locale, page);

      test(`${url} renders with lang/dir, canonical and hreflang`, async ({ page: tab }) => {
        const response = await tab.goto(url);
        expect(response?.status()).toBe(200);

        const html = tab.locator('html');
        await expect(html).toHaveAttribute('lang', locale);
        await expect(html).toHaveAttribute('dir', LOCALE_META[locale].dir);
        await expect(tab.locator('main')).toBeVisible();

        await expect(tab.locator('link[rel="canonical"]')).toHaveAttribute('href', absolute(url));
        for (const alt of LOCALES) {
          await expect(tab.locator(`link[rel="alternate"][hreflang="${alt}"]`)).toHaveAttribute(
            'href',
            absolute(localePath(alt, page))
          );
        }
        await expect(tab.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
          'href',
          absolute(localePath(DEFAULT_LOCALE, page))
        );
      });
    }
  }

  test('/en/* redirects to the unprefixed URL', async ({ page }) => {
    await page.goto('/en/projects');
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/projects$/);
  });

  test('language switcher links to the same page in another locale', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('a[href="/ar/projects"]').first()).toBeAttached();
  });
});
