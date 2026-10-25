// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { minifyHtml, type HtmlMinifyOptions } from '@/lib/tools/format/html-minify';

const INLINE: HtmlMinifyOptions = { inline: true, mangle: true };

async function min(html: string, options: HtmlMinifyOptions = INLINE): Promise<string> {
  const result = await minifyHtml(html, options);
  if (!result.ok) throw new Error(result.error.message);
  return result.text;
}

describe('minifyHtml', () => {
  it('drops whitespace at block boundaries and collapses it between inline content', async () => {
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hi  there</title>
  </head>
  <body>
    <p>
      Hello   <b>bold</b>
      <i>world</i>
    </p>
  </body>
</html>
`;
    expect(await min(html)).toBe(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hi  there</title></head>' +
        '<body><p>Hello <b>bold</b> <i>world</i></p></body></html>'
    );
  });

  it('keeps <pre> and <textarea> contents exactly', async () => {
    const html =
      '<div>\n  <pre>  a\n    <b> b </b>\n</pre>\n  <textarea>\n  x  </textarea>\n</div>';
    expect(await min(html)).toBe(
      '<div><pre>  a\n    <b> b </b>\n</pre><textarea>\n  x  </textarea></div>'
    );
  });

  it('removes comments except conditional ones', async () => {
    const html = '<p>a <!-- note --> b</p><!--[if IE]><p>old</p><![endif]-->';
    expect(await min(html)).toBe('<p>a b</p><!--[if IE]><p>old</p><![endif]-->');
  });

  it('normalizes spacing inside tags and class lists, keeping attribute values', async () => {
    expect(
      await min('<a   href = "/x?a=1&amp;b"\n   class=" one   two "  data-x=\'  y \' >t</a>')
    ).toBe('<a href="/x?a=1&amp;b" class="one two" data-x=\'  y \'>t</a>');
    expect(await min('<img src=x.png alt="" hidden />')).toBe('<img src=x.png alt="" hidden/>');
  });

  it('minifies inline CSS, JS and JSON', async () => {
    const html = `<style>
  a { color : red; }
</style>
<p style="color : red ; margin : 0 ;">x</p>
<script>
  function greet(name) { return 'hi ' + name; }
  console.log(greet('a'));
</script>
<script type="application/ld+json">
  { "@type": "Person", "name": "Ada" }
</script>
<script type="text/template"><b> keep </b></script>`;
    expect(await min(html)).toBe(
      '<style>a{color:red}</style><p style="color:red;margin:0">x</p>' +
        '<script>function greet(e){return"hi "+e}console.log(greet("a"));</script>' +
        ' <script type="application/ld+json">{"@type":"Person","name":"Ada"}</script>' +
        ' <script type="text/template"><b> keep </b></script>'
    );
  });

  it('keeps inline code that fails to minify and warns about it', async () => {
    const result = await minifyHtml('<script>let = ;</script>', INLINE);
    expect(result).toMatchObject({ ok: true, text: '<script>let = ;</script>' });
    expect(result.ok && result.warnings).toHaveLength(1);
  });

  it('leaves inline code alone when inline minification is off', async () => {
    const html = '<style> a { b: c } </style>';
    expect(await min(html, { inline: false, mangle: false })).toBe(html);
  });

  it('reports unterminated constructs', async () => {
    expect(await minifyHtml('<p>a <!-- b', INLINE)).toMatchObject({
      ok: false,
      error: { message: 'Unterminated comment', from: 5 },
    });
    expect(await minifyHtml('<div class="x>', INLINE)).toMatchObject({ ok: false });
    expect(await minifyHtml('<script>a()', INLINE)).toMatchObject({
      ok: false,
      error: { message: '<script> is never closed' },
    });
  });
});
