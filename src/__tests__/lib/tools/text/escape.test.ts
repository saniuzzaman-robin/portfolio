import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ESCAPE_OPTIONS,
  ESCAPE_TARGETS,
  escapeText,
  unescapeText,
  type EscapeOptions,
  type EscapeTarget,
} from '@/lib/tools/text/escape';

const escape = (text: string, target: EscapeTarget, options: Partial<EscapeOptions> = {}) =>
  escapeText(text, target, { ...DEFAULT_ESCAPE_OPTIONS, ...options });
const unescape = (text: string, target: EscapeTarget, options: Partial<EscapeOptions> = {}) =>
  unescapeText(text, target, { ...DEFAULT_ESCAPE_OPTIONS, ...options });
const ok = (text: string) => ({ ok: true, text, warnings: [] });

const TRICKY = `it's "quoted" \\ back\tslash\nline\u0000 1   ${'${x}'} café 😀 \x7f`;

describe('escapeText', () => {
  it('JSON', () => {
    expect(escape('a"b\\c\n', 'json')).toBe('"a\\"b\\\\c\\n"');
    expect(escape('café 😀', 'json', { quotes: false, ascii: true })).toBe(
      'caf\\u00E9 \\uD83D\\uDE00'
    );
  });

  it('JavaScript, evaluating to the original text', () => {
    for (const jsQuote of ["'", '"', '`'] as const) {
      for (const ascii of [false, true]) {
        const literal = escape(TRICKY, 'javascript', { jsQuote, ascii });
        expect(new Function(`return ${literal};`)()).toBe(TRICKY);
        if (ascii) expect(literal).toMatch(/^[\x20-\x7e]*$/);
      }
    }
    expect(escape('\u00001', 'javascript', { quotes: false })).toBe('\\x001');
  });

  it('SQL, standard and MySQL', () => {
    expect(escape("O'Brien\\", 'sql')).toBe("'O''Brien\\'");
    expect(escape("O'Brien\\\n", 'sql', { sqlBackslashes: true })).toBe("'O''Brien\\\\\\n'");
  });

  it('regex, matching the text literally with and without the u flag', () => {
    const text = 'a.b*c?(d)[e]{f}|g^h$i\\j/k+l-m';
    const escaped = escape(text, 'regex');
    for (const flags of ['', 'u', 'v']) {
      expect(new RegExp(`^${escaped}$`, flags).test(text)).toBe(true);
    }
  });

  it('CSV only quotes when needed', () => {
    expect(escape('plain', 'csv', { quotes: false })).toBe('plain');
    expect(escape('a,"b"', 'csv', { quotes: false })).toBe('"a,""b"""');
    expect(escape(' padded', 'csv', { quotes: false })).toBe('" padded"');
    expect(escape('plain', 'csv')).toBe('"plain"');
  });

  it('shell', () => {
    expect(escape('safe/path-1.txt', 'shell', { quotes: false })).toBe('safe/path-1.txt');
    expect(escape("it's $HOME", 'shell', { quotes: false })).toBe("'it'\\''s $HOME'");
    expect(escape('', 'shell', { quotes: false })).toBe("''");
  });
});

describe('unescapeText', () => {
  it.each(ESCAPE_TARGETS)('round-trips through %s', (target) => {
    const text = target === 'shell' ? TRICKY.replace(/\s+/g, '_') : TRICKY;
    const result = unescape(escape(text, target), target);
    expect(result).toEqual(ok(text));
  });

  it('JavaScript escapes, with or without quotes', () => {
    expect(unescape('\\x41\\u0042\\u{1F600}\\0\\q\\\nend', 'javascript')).toEqual(ok('AB😀\0qend'));
    expect(unescape("'it\\'s'", 'javascript')).toEqual(ok("it's"));
    expect(unescape("'it's'", 'javascript')).toEqual({
      ok: false,
      error: { message: "Unescaped ' inside the string", from: 3, to: 4 },
    });
    expect(unescape('\\1', 'javascript')).toMatchObject({ ok: false, error: { from: 0, to: 2 } });
    expect(unescape('\\u12', 'javascript')).toMatchObject({ ok: false });
  });

  it('SQL', () => {
    expect(unescape("'O''Brien'", 'sql')).toEqual(ok("O'Brien"));
    expect(unescape("'O'Brien'", 'sql')).toMatchObject({ ok: false, error: { from: 2 } });
    expect(unescape("'a\\nb\\%'", 'sql', { sqlBackslashes: true })).toEqual(ok('a\nb\\%'));
  });

  it('regex refuses classes and backreferences', () => {
    expect(unescape('a\\.b\\/c\\cJ', 'regex')).toEqual(ok('a.b/c\n'));
    expect(unescape('x\\d', 'regex')).toMatchObject({ ok: false, error: { from: 1, to: 3 } });
    expect(unescape('\\1', 'regex')).toMatchObject({ ok: false });
  });

  it('CSV', () => {
    expect(unescape('"a ""b"""', 'csv')).toEqual(ok('a "b"'));
    expect(unescape('unquoted "x"', 'csv')).toEqual(ok('unquoted "x"'));
    expect(unescape('"a"b"', 'csv')).toMatchObject({ ok: false, error: { from: 2 } });
  });

  it('splits a shell command into arguments', () => {
    expect(
      unescape(`git commit -m "fix: \\"quotes\\" \\$5"  'it'\\''s' a\\ b \\\n  c ""`, 'shell')
    ).toEqual(ok(['git', 'commit', '-m', 'fix: "quotes" $5', "it's", 'a b', 'c', ''].join('\n')));
    expect(unescape(`echo 'open`, 'shell')).toMatchObject({ ok: false, error: { from: 5 } });
  });
});
