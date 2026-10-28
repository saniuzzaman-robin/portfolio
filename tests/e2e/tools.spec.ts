import { test, expect, type Locator, type Page } from '@playwright/test';
import { TOOLS, TOOLS_PATH, toolPath, type ToolSlug } from '../../src/lib/data/tools';
import { LOCALES, localePath } from '../../src/i18n/config';
import { en } from '../../src/i18n/messages/en';
import { toolsEn } from '../../src/i18n/tools/en';

const common = toolsEn.common;

/** Replaces a CodeMirror editor's whole document, the way a user would type or paste it. */
async function fillEditor(page: Page, editor: Locator, text: string) {
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
}

/** Fails the test on uncaught errors and console errors (CSP violations are reported there). */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** One real interaction per tool: input in, the expected result out. */
const SMOKE: Record<ToolSlug, (page: Page) => Promise<void>> = {
  json: async (page) => {
    await fillEditor(page, page.getByRole('textbox', { name: common.input }), '{"b":1,"a":[2]}');
    await page.getByRole('button', { name: toolsEn.json.format, exact: true }).click();
    await expect(page.getByRole('textbox', { name: common.output })).toContainText('"b": 1,');
    await fillEditor(page, page.getByRole('textbox', { name: common.input }), '{"b":}');
    await page.keyboard.press('ControlOrMeta+Enter');
    await expect(page.getByText(/Error at 1:6/)).toBeVisible();
  },
  format: async (page) => {
    await page.getByRole('combobox', { name: toolsEn.format.language }).click();
    await page.getByRole('option', { name: 'CSS', exact: true }).click();
    await fillEditor(page, page.getByRole('textbox', { name: common.input }), 'a{color:red}');
    await page.getByRole('button', { name: toolsEn.format.modes.beautify, exact: true }).click();
    await expect(page.getByRole('textbox', { name: common.output })).toContainText('color: red;');
  },
  convert: async (page) => {
    await fillEditor(page, page.getByRole('textbox', { name: common.input }), '{"name":"Ada"}');
    await page.getByRole('button', { name: toolsEn.convert.convert, exact: true }).click();
    await expect(page.getByRole('textbox', { name: common.output })).toContainText('name: Ada');
  },
  encode: async (page) => {
    await fillEditor(page, page.getByRole('textbox', { name: common.input }), 'hello');
    await page.getByRole('button', { name: toolsEn.encode.encode, exact: true }).click();
    await expect(page.getByRole('textbox', { name: common.output })).toHaveText('aGVsbG8=');
  },
  jwt: async (page) => {
    await page.getByRole('button', { name: toolsEn.jwt.decode, exact: true }).click();
    await expect(page.getByText(toolsEn.jwt.verified, { exact: true }).first()).toBeVisible();
    await page.getByRole('textbox', { name: toolsEn.jwt.secret }).fill('wrong-secret');
    // Nothing re-verifies on its own: the change is flagged until Decode runs again.
    await expect(page.getByText(`Changes not applied: press ${toolsEn.jwt.decode}`)).toBeVisible();
    await expect(page.getByText(toolsEn.jwt.verified, { exact: true }).first()).toBeVisible();
    await page.keyboard.press('ControlOrMeta+Enter');
    await expect(
      page.getByText(toolsEn.jwt.invalidSignature, { exact: true }).first()
    ).toBeVisible();
  },
  crypto: async (page) => {
    await fillEditor(page, page.getByRole('textbox', { name: common.input }), 'abc');
    await page.keyboard.press('ControlOrMeta+Enter');
    await expect(
      page.getByText('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    ).toBeVisible();
  },
  generate: async (page) => {
    await page.getByRole('button', { name: common.generate, exact: true }).click();
    await expect(
      page.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/).first()
    ).toBeVisible();
  },
  'qr-code': async (page) => {
    await page.getByRole('textbox', { name: 'URL' }).fill('https://example.org/e2e');
    await page.getByRole('button', { name: common.generate, exact: true }).click();
    await expect(page.getByRole('img', { name: toolsEn['qr-code'].previewLabel })).toBeVisible();
    await expect(page.getByRole('button', { name: toolsEn['qr-code'].downloadPng })).toBeEnabled();
  },
  diff: async (page) => {
    await fillEditor(page, page.getByRole('textbox', { name: toolsEn.diff.original }), 'one\ntwo');
    await fillEditor(page, page.getByRole('textbox', { name: toolsEn.diff.changed }), 'one\n2');
    await page.getByRole('button', { name: toolsEn.diff.compareAction, exact: true }).click();
    await expect(page.getByRole('deletion').filter({ hasText: 'two' }).first()).toBeVisible();
    await expect(page.getByRole('insertion').filter({ hasText: '2' }).first()).toBeVisible();
  },
  time: async (page) => {
    await page.getByRole('textbox', { name: toolsEn.time.value }).fill('0');
    await page.getByRole('button', { name: toolsEn.time.convertAction, exact: true }).click();
    await expect(page.getByText('1970-01-01T00:00:00Z', { exact: true }).first()).toBeVisible();
  },
  network: async (page) => {
    await page.getByRole('textbox', { name: 'CIDR' }).fill('10.0.0.0/30');
    await page.getByRole('button', { name: toolsEn.network.calculateAction, exact: true }).click();
    await expect(
      page.getByRole('definition').filter({ hasText: '10.0.0.3' }).first()
    ).toBeVisible();
  },
  regex: async (page) => {
    await fillEditor(
      page,
      page.getByRole('textbox', { name: toolsEn.regex.text }),
      'on 2024-01-02'
    );
    await page.getByRole('button', { name: toolsEn.regex.modes.match, exact: true }).click();
    await expect(page.getByRole('table', { name: toolsEn.regex.panels.matches })).toContainText(
      '2024-01-02'
    );
  },
  text: async (page) => {
    await fillEditor(page, page.getByRole('textbox', { name: common.input }), 'hello world');
    await page.getByRole('button', { name: toolsEn.text.caseAction, exact: true }).click();
    await expect(page.getByText('helloWorld', { exact: true })).toBeVisible();
  },
  color: async (page) => {
    await page.getByRole('textbox', { name: toolsEn.color.input }).fill('#ff0000');
    await page.getByRole('button', { name: common.run, exact: true }).click();
    await expect(page.getByRole('definition').filter({ hasText: 'rgb(255 0 0)' })).toBeVisible();
  },
  markdown: async (page) => {
    await fillEditor(
      page,
      page.getByRole('textbox', { name: toolsEn.markdown.editor }),
      '# Hi e2e'
    );
    await page.getByRole('button', { name: toolsEn.markdown.render, exact: true }).click();
    await expect(
      page
        .getByRole('document', { name: toolsEn.markdown.previewLabel })
        .getByRole('heading', { name: 'Hi e2e' })
    ).toBeVisible();
  },
  playground: async (page) => {
    await fillEditor(
      page,
      page.getByRole('textbox', { name: toolsEn.playground.editor }),
      'console.log({ sum: 1 + 1 });\nawait new Promise((resolve) => setTimeout(resolve, 50));'
    );
    await page.getByRole('button', { name: toolsEn.playground.run, exact: true }).click();
    const output = page.getByRole('log', { name: toolsEn.playground.outputLabel });
    await expect(output.getByText('{ sum: 2 }', { exact: true })).toBeVisible();
    await expect(output).toContainText(toolsEn.playground.finished.replace(' {time}', ''));

    // A type error blocks the run. The first TypeScript run fetches the libs and starts the compiler.
    await page.getByText(toolsEn.playground.languages.typescript, { exact: true }).click();
    await fillEditor(
      page,
      page.getByRole('textbox', { name: toolsEn.playground.editor }),
      'const s: string = 1;\nconsole.log("ran");'
    );
    await page.getByRole('button', { name: toolsEn.playground.run, exact: true }).click();
    await expect(
      page.getByText(toolsEn.playground.rejected.replace('{count}', '1'), { exact: true })
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Error at 1:7/)).toBeVisible();
    await expect(output.getByText('ran', { exact: true })).toHaveCount(0);
  },
};

test.describe('Tools index', () => {
  test('lists every tool and filters by search', async ({ page }) => {
    const errors = trackErrors(page);
    const response = await page.goto(TOOLS_PATH);
    expect(response?.status()).toBe(200);
    const main = page.locator('main');
    for (const tool of TOOLS) {
      await expect(main.locator(`a[href="${toolPath(tool.slug)}"]`).first()).toBeAttached();
    }

    const search = page.getByRole('searchbox', { name: en.tools.search });
    await search.fill('sha256');
    await expect(main.locator(`a[href="${toolPath('crypto')}"]`).first()).toBeVisible();
    await expect(main.locator(`a[href="${toolPath('json')}"]`)).toHaveCount(0);

    await search.fill('no-such-tool-xyz');
    await expect(page.getByRole('status')).toContainText('no-such-tool-xyz');
    expect(errors).toEqual([]);
  });

  test('old tool URLs redirect to their new pages', async ({ page }) => {
    await page.goto('/tools/base64');
    await expect(page).toHaveURL(/\/tools\/encode$/);
    await page.goto('/tools/cron');
    await expect(page).toHaveURL(/\/tools\/time$/);
  });
});

test.describe('Tool pages', () => {
  for (const tool of TOOLS) {
    test(`${tool.slug} renders and works`, async ({ page }) => {
      const errors = trackErrors(page);
      const response = await page.goto(toolPath(tool.slug));
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(
        tool.slug === 'markdown' ? 2 : 1 // The Markdown preview renders the sample's own <h1>.
      );
      await expect(page.locator('h1').first()).toHaveText(en.tools.items[tool.slug].title);
      await SMOKE[tool.slug](page);
      expect(errors).toEqual([]);
    });
  }

  test('switching tools keeps the workbench', async ({ page, isMobile }) => {
    await page.goto(toolPath('json'));
    // Below `lg` the rail is replaced by a select in the tool header.
    if (isMobile) {
      await page.getByRole('combobox', { name: common.switchTool }).click();
      await page.getByRole('option', { name: en.tools.items.jwt.label }).click();
    } else {
      await page
        .getByRole('navigation', { name: common.switchTool })
        .getByRole('link', { name: en.tools.items.jwt.label })
        .click();
    }
    await expect(page).toHaveURL(/\/tools\/jwt$/);
    await expect(page.locator('h1')).toHaveText(en.tools.items.jwt.title);
  });
});

test.describe('Manual run', () => {
  test('edits mark the output stale until the next run; reloads do not run', async ({ page }) => {
    await page.goto(toolPath('json'));
    const input = page.getByRole('textbox', { name: common.input });
    const output = page.getByRole('textbox', { name: common.output });
    const action = toolsEn.json.format;
    const hint = common.runHint.replace('{action}', action).replace('{shortcut}', 'Ctrl/⌘+Enter');
    const stale = page.getByText(common.stale.replace('{action}', action));
    await expect(output).toHaveAttribute('aria-placeholder', hint);

    await fillEditor(page, input, '{"a":1}');
    await page.getByRole('button', { name: action, exact: true }).click();
    await expect(output).toContainText('"a": 1');
    await expect(stale).toBeHidden();

    await fillEditor(page, input, '{"b":2}');
    await expect(stale).toBeVisible();
    await expect(output).toContainText('"a": 1');
    await stale.click();
    await expect(output).toContainText('"b": 2');
    await expect(stale).toBeHidden();

    // The input is restored (once its debounced save lands), but the output waits for a run.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('tools:json:input')))
      .toBe(JSON.stringify('{"b":2}'));
    await page.reload();
    await expect(input).toContainText('{"b":2}');
    await expect(output).toHaveAttribute('aria-placeholder', hint);
    await expect(output).not.toContainText('"b": 2');
  });
});

test.describe('Tool pages are English-only', () => {
  test(`${toolPath('json')} renders in English with no horizontal scroll`, async ({ page }) => {
    const errors = trackErrors(page);
    const response = await page.goto(toolPath('json'));
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('h1')).toHaveText(en.tools.items.json.title);
    // No horizontal page scroll: only the panes scroll.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  for (const locale of LOCALES.filter((l) => l !== 'en')) {
    test(`${localePath(locale, TOOLS_PATH)} and its tools are gone`, async ({ request }) => {
      for (const path of [TOOLS_PATH, toolPath('json')]) {
        const response = await request.get(localePath(locale, path));
        expect(response.status()).toBe(410);
      }
    });
  }
});

test.describe('Tool keyboard access', () => {
  test('Escape then Tab leaves the editor', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern');
    await page.goto(toolPath('json'));
    const input = page.getByRole('textbox', { name: common.input });
    await input.click();
    await page.keyboard.press('Tab'); // Indents inside the editor.
    await expect(input).toBeFocused();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Tab');
    await expect(input).not.toBeFocused();
  });

  test('mode switches use arrow keys', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern');
    await page.goto(toolPath('json'));
    const radios = page.getByRole('radiogroup').first().getByRole('radio');
    await radios.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(radios.nth(1)).toBeFocused();
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true');
  });

  test('selects open, navigate and choose from the keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern');
    await page.goto(toolPath('format'));
    const select = page.getByRole('combobox', { name: toolsEn.format.language });
    const listbox = page.getByRole('listbox', { name: toolsEn.format.language });
    await select.focus();
    await page.keyboard.press('ArrowDown');
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    await expect(listbox).toBeVisible();
    const css = await listbox.getByRole('option', { name: 'CSS', exact: true }).getAttribute('id');
    await page.keyboard.type('cs');
    await expect(select).toHaveAttribute('aria-activedescendant', css ?? '');
    await page.keyboard.press('Enter');
    await expect(listbox).toBeHidden();
    await expect(select).toHaveText('CSS');
    await expect(select).toBeFocused();

    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(select).toHaveText('CSS');
  });

  test('time zone select filters as you type', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern');
    await page.goto(toolPath('time'));
    const select = page.getByRole('combobox', { name: toolsEn.time.timeZone }).first();
    await select.click();
    await page.keyboard.type('tokyo');
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(select).toHaveText('Asia/Tokyo');
    await expect(select).toBeFocused();
  });
});
