import { describe, it, expect } from 'vitest';
import { decodeHtmlEntities, encodeHtmlEntities } from '@/lib/tools/encode/html';
import { ENTITY_CODE_POINTS } from '@/lib/tools/encode/html-entities';
import { decodeUnicodeEscapes, encodeUnicodeEscapes } from '@/lib/tools/encode/unicode';
import {
  domainToAscii,
  domainToUnicode,
  punycodeDecode,
  punycodeEncode,
} from '@/lib/tools/encode/punycode';
import {
  decodeQuotedPrintableBytes,
  encodeQuotedPrintable,
} from '@/lib/tools/encode/quoted-printable';
import { rot } from '@/lib/tools/encode/rot';

describe('HTML entities', () => {
  it('escapes the specials, or every non-ASCII character too', () => {
    expect(encodeHtmlEntities(`<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;'
    );
    expect(encodeHtmlEntities('café 😀', { scope: 'nonAscii' })).toBe('caf&eacute; &#128512;');
    expect(encodeHtmlEntities('café 😀', { scope: 'nonAscii', format: 'hex' })).toBe(
      'caf&#xE9; &#x1F600;'
    );
    expect(encodeHtmlEntities('é<', { scope: 'nonAscii', format: 'decimal' })).toBe('&#233;&#60;');
  });

  it('decodes named and numeric references and reports unknown names', () => {
    expect(decodeHtmlEntities('&lt;p&gt; &copy; &#169; &#xA9; &#169 &euro;').value).toBe(
      '<p> © © © © €'
    );
    expect(decodeHtmlEntities('&#0; &#x110000;').value).toBe('\ufffd \ufffd');
    expect(decodeHtmlEntities('&bogus; &amp &nbsp;')).toEqual({
      value: '&bogus; &amp \u00a0',
      unknown: ['&bogus;'],
    });
  });

  it('maps every name to the code point browsers use', () => {
    const element = document.createElement('textarea');
    for (const [name, code] of ENTITY_CODE_POINTS) {
      element.innerHTML = `&${name};`;
      expect(element.value.codePointAt(0), name).toBe(code);
    }
    expect(ENTITY_CODE_POINTS.size).toBe(253);
  });
});

describe('Unicode escapes', () => {
  it('escapes non-ASCII as UTF-16 units or code points', () => {
    expect(encodeUnicodeEscapes('é 😀')).toBe('\\u00e9 \\ud83d\\ude00');
    expect(encodeUnicodeEscapes('é 😀', { style: 'codePoint' })).toBe('\\u{e9} \\u{1f600}');
    expect(encodeUnicodeEscapes('A\n', { all: true })).toBe('\\u0041\\u000a');
  });

  it('decodes every escape form and joins surrogate pairs', () => {
    expect(decodeUnicodeEscapes('\\ud83d\\ude00 \\u{1F600} \\U0001F600 \\x41 \\u00E9')).toEqual({
      ok: true,
      value: '😀 😀 😀 A é',
    });
  });

  it('keeps escaped backslashes and Windows paths, and rejects a malformed \\u', () => {
    expect(decodeUnicodeEscapes('\\\\u0041 C:\\Users\\xyz')).toEqual({
      ok: true,
      value: '\\\\u0041 C:\\Users\\xyz',
    });
    expect(decodeUnicodeEscapes('ab\\u12')).toMatchObject({ ok: false, error: { from: 2, to: 6 } });
    expect(decodeUnicodeEscapes('\\u{110000}')).toMatchObject({ ok: false });
  });
});

describe('punycode', () => {
  // RFC 3492 §7.1 samples (plus the classic IDN examples).
  const SAMPLES: [string, string][] = [
    ['bücher', 'bcher-kva'],
    ['münchen', 'mnchen-3ya'],
    ['他们为什么不说中文', 'ihqwcrb4cv8a8dqg056pqjye'],
    ['ليهمابتكلموشعربي؟', 'egbpdaj6bu4bxfgehfvwxn'],
    ['Pročprostěnemluvíčesky', 'Proprostnemluvesky-uyb24dma41a'],
    ['3年B組金八先生', '3B-ww4c5e180e575a65lsy2b'],
    ['安室奈美恵-with-SUPER-MONKEYS', '-with-SUPER-MONKEYS-pc58ag80a8qai00g7n9n'],
    ['-> $1.00 <-', '-> $1.00 <--'],
  ];

  it.each(SAMPLES)('%s ↔ %s', (unicode, encoded) => {
    expect(punycodeEncode(unicode)).toBe(encoded);
    expect(punycodeDecode(encoded)).toEqual({ ok: true, value: unicode });
  });

  it('converts whole domains and emails, one per line', () => {
    expect(domainToAscii('MÜNCHEN.de\nuser@bücher.example')).toEqual({
      ok: true,
      value: 'xn--mnchen-3ya.de\nuser@xn--bcher-kva.example',
    });
    expect(domainToUnicode('xn--mnchen-3ya.de\nXN--bcher-kva.example')).toEqual({
      ok: true,
      value: 'münchen.de\nbücher.example',
    });
  });

  it('reports invalid labels at their position', () => {
    expect(domainToUnicode('ok.xn--a!b.com')).toMatchObject({ ok: false, error: { from: 8 } });
  });
});

describe('quoted-printable', () => {
  const decode = (text: string) => {
    const result = decodeQuotedPrintableBytes(text);
    if (!result.ok) throw new Error(result.error.message);
    return new TextDecoder().decode(result.value.bytes);
  };

  it('encodes non-ASCII, "=" and trailing whitespace', () => {
    expect(encodeQuotedPrintable('café = 1 \nnext\t')).toBe('caf=C3=A9 =3D 1=20\nnext=09');
  });

  it('soft-wraps long lines at 76 characters without splitting an escape', () => {
    const encoded = encodeQuotedPrintable(`${'a'.repeat(74)}é`);
    expect(encoded).toBe(`${'a'.repeat(74)}=\n=C3=A9`);
    expect(encoded.split('\n').every((line) => line.length <= 76)).toBe(true);
    expect(decode(encoded)).toBe(`${'a'.repeat(74)}é`);
  });

  it('decodes soft breaks, lowercase hex and strips transport padding', () => {
    expect(decode('caf=c3=a9 =\r\nlatte  \nok')).toBe('café latte\nok');
  });

  it('rejects a stray "="', () => {
    expect(decodeQuotedPrintableBytes('a=zz')).toMatchObject({ ok: false, error: { from: 1 } });
  });
});

describe('rot', () => {
  it('rotates letters (ROT13) or all printable ASCII (ROT47) and is its own inverse', () => {
    expect(rot('Hello, World!', 13)).toBe('Uryyb, Jbeyq!');
    expect(rot('Hello, World!', 47)).toBe('w6==@[ (@C=5P');
    expect(rot(rot('Any text 123', 47), 47)).toBe('Any text 123');
  });
});
