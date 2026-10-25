import { describe, it, expect } from 'vitest';
import { minifyCss, type CssMinifyOptions } from '@/lib/tools/format/css-minify';

function min(css: string, options?: CssMinifyOptions): string {
  const result = minifyCss(css, options);
  if (!result.ok) throw new Error(result.error.message);
  return result.text;
}

describe('minifyCss', () => {
  it('drops whitespace around punctuation and the last semicolon of a block', () => {
    expect(min('a , b > c {\n  color : red ;\n  margin: 0 auto;\n}\n\nd ~ e { x: y }')).toBe(
      'a,b>c{color:red;margin:0 auto}d~e{x:y}'
    );
  });

  it('keeps the spaces that change meaning', () => {
    // Descendant pseudo-class, media query `and (`, calc operators, `+` combinator.
    expect(min('a :hover {}')).toBe('a :hover{}');
    expect(min('a { b :hover { c : d } }')).toBe('a{b :hover{c:d}}');
    expect(min('@media screen and (min-width: 600px) { a { b: c } }')).toBe(
      '@media screen and (min-width:600px){a{b:c}}'
    );
    expect(min('a { width: calc( 100% - (2 * 8px) ); }')).toBe('a{width:calc(100% - (2 * 8px))}');
    expect(min('a + b {}')).toBe('a + b{}');
  });

  it('leaves strings, unquoted urls and escapes alone', () => {
    expect(min('a::before { content: "  ;  } /* x */ " }')).toBe(
      'a::before{content:"  ;  } /* x */ "}'
    );
    expect(min('a { background: url( //cdn.example.com/a;b.png ) }')).toBe(
      'a{background:url(//cdn.example.com/a;b.png)}'
    );
    expect(min("a { background: url( 'x y.png' ) }")).toBe("a{background:url('x y.png')}");
    // The space after a hex escape belongs to it; the second one is a combinator.
    expect(min('.\\31  a {}')).toBe('.\\31  a{}');
    expect(min('.a\\;{}')).toBe('.a\\;{}');
  });

  it('removes comments but keeps /*! license comments', () => {
    expect(min('/*! keep */\n/* drop */ a { b: c /* x */ d }')).toBe('/*! keep */a{b:c d}');
  });

  it('treats // as a comment only in SCSS/Less mode', () => {
    const scss = '$x: 1; // note\na { b: $x; }';
    expect(min(scss, { lineComments: true })).toBe('$x:1;a{b:$x}');
    expect(min('a { background: url(//x.png) }', { lineComments: true })).toBe(
      'a{background:url(//x.png)}'
    );
  });

  it('keeps the space after an interpolation', () => {
    expect(min('a { margin: #{$a} #{$b}; }', { lineComments: true })).toBe('a{margin:#{$a} #{$b}}');
    expect(min('.@{name} { a: b }', { lineComments: true })).toBe('.@{name}{a:b}');
  });

  it('reports unterminated strings and comments with their position', () => {
    expect(minifyCss('a { content: "oops\n }')).toMatchObject({
      ok: false,
      error: { message: 'Unterminated string', from: 13 },
    });
    expect(minifyCss('a {} /* open')).toMatchObject({
      ok: false,
      error: { message: 'Unterminated comment', from: 5 },
    });
  });
});
