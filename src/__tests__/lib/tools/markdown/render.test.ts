import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MARKDOWN_OPTIONS,
  documentTitle,
  isMarkdownOptions,
  renderMarkdown,
  standaloneHtml,
} from '@/lib/tools/markdown/render';

const preview = (source: string, options = DEFAULT_MARKDOWN_OPTIONS) =>
  renderMarkdown(source, options, 'preview');

/** Rendered HTML without the source-line attributes, for readable assertions. */
const plain = async (source: string, options = DEFAULT_MARKDOWN_OPTIONS) =>
  (await renderMarkdown(source, options, 'export')).html.replace(/ data-source-line="\d+"/g, '');

describe('renderMarkdown', () => {
  it('renders CommonMark and GFM tables and strikethrough', async () => {
    expect(await plain('# Title\n\nSome *em* and **strong** and ~~gone~~.')).toBe(
      '<h1>Title</h1>\n<p>Some <em>em</em> and <strong>strong</strong> and <s>gone</s>.</p>\n'
    );
    expect(await plain('| a | b | c |\n|:--|--:|---|\n| 1 | 2 | 3 |')).toContain(
      '<table>\n<thead>\n<tr>\n<th align="left">a</th>\n<th align="right">b</th>\n<th>c</th>'
    );
  });

  it('renders task lists', async () => {
    const html = await plain('- [ ] todo\n- [x] done\n- plain');
    expect(html).toBe(
      '<ul class="contains-task-list">\n' +
        '<li class="task-list-item"><label><input type="checkbox" class="task-list-item-checkbox" disabled=""> todo</label></li>\n' +
        '<li class="task-list-item"><label><input type="checkbox" class="task-list-item-checkbox" disabled="" checked=""> done</label></li>\n' +
        '<li>plain</li>\n</ul>\n'
    );
    expect(await plain('- [ ] parent\n  - child')).toContain(
      '<label><input type="checkbox" class="task-list-item-checkbox" disabled=""> parent</label>\n<ul>'
    );
  });

  it('tags blocks with their source line', async () => {
    const { html } = await preview('# A\n\npara\n\n```js\nx\n```\n\n- item');
    expect(html).toContain('<h1 data-source-line="0">');
    expect(html).toContain('<p data-source-line="2">');
    expect(html).toContain('<code data-source-line="4" class="language-js">');
    expect(html).toContain('<li data-source-line="8">');
  });

  it('sanitizes raw HTML', async () => {
    const html = await plain(
      '<script>alert(1)</script><img src="x.png" onerror="alert(1)"><a href="javascript:alert(1)">x</a><style>body{}</style><b style="color:red">b</b>'
    );
    expect(html).not.toMatch(/script|onerror|javascript:|<style|style=/);
    expect(html).toContain('<img src="x.png">');
    expect(html).toContain('<b>b</b>');
  });

  it('escapes raw HTML when it is turned off', async () => {
    expect(await plain('<b>x</b>', { ...DEFAULT_MARKDOWN_OPTIONS, html: false })).toBe(
      '<p>&lt;b&gt;x&lt;/b&gt;</p>\n'
    );
  });

  it('blocks remote images and opens links in a new tab only in the preview', async () => {
    const source =
      '![logo](https://example.com/logo.png) ![local](data:image/png;base64,AA==) <img src="//cdn.example.com/a.png">\n\n[site](https://example.com) [here](#top)';
    const shown = await preview(source);
    expect(shown.blockedImages).toBe(2);
    expect(shown.html).toContain(
      '<span class="md-blocked-image" title="https://example.com/logo.png">logo</span>'
    );
    expect(shown.html).toContain('<img src="data:image/png;base64,AA==" alt="local">');
    expect(shown.html).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a>'
    );
    expect(shown.html).toContain('<a href="#top">here</a>');

    const exported = await renderMarkdown(source, DEFAULT_MARKDOWN_OPTIONS, 'export');
    expect(exported.blockedImages).toBe(0);
    expect(exported.html).toContain('<img src="https://example.com/logo.png" alt="logo">');
    expect(exported.html).not.toContain('target=');
  });

  it('honours linkify, typographer and breaks', async () => {
    expect(await plain('see https://example.com')).toContain(
      '<a href="https://example.com">https://example.com</a>'
    );
    const off = { html: true, linkify: false, typographer: true, breaks: true };
    expect(await plain('see https://example.com\n"quoted" -- x', off)).toBe(
      '<p>see https://example.com<br>\n“quoted” – x</p>\n'
    );
  });
});

describe('helpers', () => {
  it('finds the first heading for the title', () => {
    expect(documentTitle('intro\n\n## Getting started ##\n# Later')).toBe('Getting started');
    expect(documentTitle('no headings')).toBeNull();
  });

  it('wraps the body in a complete document', () => {
    const html = standaloneHtml('<p>x</p>\n', 'A <b> & c');
    expect(html.startsWith('<!doctype html>\n<html lang="en">')).toBe(true);
    expect(html).toContain('<title>A &lt;b&gt; &amp; c</title>');
    expect(html).toContain('<body>\n<p>x</p>\n</body>');
  });

  it('validates persisted options', () => {
    expect(isMarkdownOptions(DEFAULT_MARKDOWN_OPTIONS)).toBe(true);
    expect(isMarkdownOptions({ ...DEFAULT_MARKDOWN_OPTIONS, html: 'yes' })).toBe(false);
    expect(isMarkdownOptions(null)).toBe(false);
  });
});
