import type createMarkdownIt from 'markdown-it';

/**
 * Markdown → sanitized HTML with markdown-it (CommonMark plus GFM tables, strikethrough and task
 * lists) and DOMPurify. Both load on demand; DOMPurify needs a DOM, so this runs in the browser
 * (or jsdom in tests).
 */

export type MarkdownOptions = {
  /** Allow raw HTML in the source (still sanitized). */
  html: boolean;
  /** Turn plain URLs (with a scheme) into links. */
  linkify: boolean;
  /** Smart quotes, dashes and ellipses. */
  typographer: boolean;
  /** Single newlines become <br>. */
  breaks: boolean;
};

export const DEFAULT_MARKDOWN_OPTIONS: MarkdownOptions = {
  html: true,
  linkify: true,
  typographer: false,
  breaks: false,
};

export function isMarkdownOptions(value: unknown): value is MarkdownOptions {
  const options = value as MarkdownOptions | null;
  return (
    typeof options === 'object' &&
    options !== null &&
    (Object.keys(DEFAULT_MARKDOWN_OPTIONS) as (keyof MarkdownOptions)[]).every(
      (key) => typeof options[key] === 'boolean'
    )
  );
}

/**
 * `preview` swaps remote images for placeholders (the site's CSP only allows same-origin and
 * data: images) and opens links in a new tab; `export` keeps the HTML as written.
 */
export type RenderTarget = 'preview' | 'export';

export type Rendered = { html: string; blockedImages: number };

/** Block elements carry this attribute: the 0-based source line they start on. */
export const SOURCE_LINE_ATTRIBUTE = 'data-source-line';

type MarkdownIt = ReturnType<typeof createMarkdownIt>;
type CoreRule = Parameters<MarkdownIt['core']['ruler']['push']>[1];
type CoreState = Parameters<CoreRule>[0];
type Token = CoreState['tokens'][number];

const TASK = /^\[([ xX])\][ \t]/;

/** GFM task list items: `- [ ] todo` / `- [x] done` get a disabled checkbox, labeled by the item text. */
const taskLists: CoreRule = (state) => {
  const tokens = state.tokens;
  for (let index = 2; index < tokens.length; index++) {
    const inline = tokens[index];
    if (
      inline.type !== 'inline' ||
      tokens[index - 1].type !== 'paragraph_open' ||
      tokens[index - 2].type !== 'list_item_open'
    ) {
      continue;
    }
    const first = inline.children?.[0];
    const match = first?.type === 'text' ? TASK.exec(first.content) : null;
    if (!first || !match || !inline.children) continue;
    first.content = first.content.slice(match[0].length);
    const checkbox = new state.Token('html_inline', '', 0);
    const checked = match[1] !== ' ' ? ' checked' : '';
    checkbox.content = `<label><input type="checkbox" class="task-list-item-checkbox" disabled${checked}> `;
    const close = new state.Token('html_inline', '', 0);
    close.content = '</label>';
    inline.children.unshift(checkbox);
    inline.children.push(close);

    const item = tokens[index - 2];
    item.attrJoin('class', 'task-list-item');
    for (let back = index - 3; back >= 0; back--) {
      const list: Token = tokens[back];
      if (
        list.level === item.level - 1 &&
        (list.type === 'bullet_list_open' || list.type === 'ordered_list_open')
      ) {
        if (!String(list.attrGet('class') ?? '').includes('contains-task-list')) {
          list.attrJoin('class', 'contains-task-list');
        }
        break;
      }
    }
  }
};

/** Table alignment as `align` (like GitHub), since the sanitizer drops inline styles. */
const tableAlign: CoreRule = (state) => {
  for (const token of state.tokens) {
    if (token.type !== 'th_open' && token.type !== 'td_open') continue;
    const align = /text-align:\s*(left|center|right)/.exec(String(token.attrGet('style') ?? ''));
    if (!align) continue;
    token.attrs = (token.attrs ?? []).filter(([name]) => name !== 'style');
    token.attrSet('align', align[1]);
  }
};

/** Tags block elements with their source line, for synced scrolling. */
const sourceLines: CoreRule = (state) => {
  for (const token of state.tokens) {
    if (token.map && token.nesting >= 0 && token.type !== 'inline') {
      token.attrSet(SOURCE_LINE_ATTRIBUTE, String(token.map[0]));
    }
  }
};

const parsers = new Map<string, MarkdownIt>();

async function parser(options: MarkdownOptions): Promise<MarkdownIt> {
  const key = JSON.stringify(options);
  const cached = parsers.get(key);
  if (cached) return cached;
  const { default: MarkdownItClass } = await import('markdown-it');
  const md = new MarkdownItClass('default', { ...options, langPrefix: 'language-' });
  md.core.ruler.push('task_lists', taskLists);
  md.core.ruler.push('table_align', tableAlign);
  md.core.ruler.push('source_lines', sourceLines);
  parsers.set(key, md);
  return md;
}

type Purify = Awaited<typeof import('dompurify')>['default'];
let purifier: { purify: Purify; target: RenderTarget; blocked: number } | undefined;

const REMOTE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

async function getPurifier() {
  if (purifier) return purifier;
  const { default: createPurify } = await import('dompurify');
  // Our own instance, so the hooks below don't affect anything else using DOMPurify.
  const purify = createPurify(window);
  const state = { purify, target: 'preview' as RenderTarget, blocked: 0 };
  // Runs inside DOMPurify's inert document, so blocked images never start loading.
  purify.addHook('afterSanitizeAttributes', (current) => {
    if (state.target !== 'preview' || current.nodeType !== Node.ELEMENT_NODE) return;
    const node = current as Element;
    if (node.tagName === 'IMG' && REMOTE.test(node.getAttribute('src') ?? '')) {
      const placeholder = node.ownerDocument.createElement('span');
      placeholder.className = 'md-blocked-image';
      placeholder.title = node.getAttribute('src') ?? '';
      placeholder.textContent = node.getAttribute('alt') || placeholder.title;
      node.replaceWith(placeholder);
      state.blocked++;
    } else if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') ?? '')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  purifier = state;
  return state;
}

/** Renders `source`; a rejection only means a library chunk failed to load. */
export async function renderMarkdown(
  source: string,
  options: MarkdownOptions,
  target: RenderTarget
): Promise<Rendered> {
  const [md, state] = await Promise.all([parser(options), getPurifier()]);
  const raw = md.render(source);
  state.target = target;
  state.blocked = 0;
  const html = state.purify.sanitize(raw, {
    // <style> would restyle the whole page, and inline styles can cover the workbench.
    FORBID_TAGS: ['style', 'form'],
    FORBID_ATTR: ['style'],
    ADD_ATTR: target === 'preview' ? ['target'] : [],
  });
  return { html, blockedImages: state.blocked };
}

/** The first heading's text, for the exported document's <title>. */
export function documentTitle(source: string): string | null {
  const match = /^ {0,3}#{1,6}[ \t]+(.+?)[ \t#]*$/m.exec(source);
  return match ? match[1].trim() : null;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const EXPORT_CSS = `body{max-width:46rem;margin:2rem auto;padding:0 1rem;font:16px/1.6 system-ui,sans-serif;color:#1f2328;background:#fff}
pre,code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.875em}
code{background:#f3f4f6;padding:.15em .35em;border-radius:4px}
pre{background:#f6f8fa;padding:1rem;overflow:auto;border-radius:6px}pre code{background:none;padding:0}
table{border-collapse:collapse}th,td{border:1px solid #d0d7de;padding:.4em .75em}
blockquote{margin:0;padding:0 1em;color:#59636e;border-left:.25em solid #d0d7de}
img{max-width:100%}ul.contains-task-list{list-style:none;padding-left:1.25em}
@media (prefers-color-scheme:dark){body{color:#e6edf3;background:#0d1117}code,pre{background:#161b22}th,td{border-color:#3d444d}blockquote{color:#9198a1;border-color:#3d444d}}`;

/** A complete HTML file around an exported body. */
export function standaloneHtml(body: string, title: string): string {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    `<style>${EXPORT_CSS}</style>`,
    '</head>',
    '<body>',
    body.trimEnd(),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
