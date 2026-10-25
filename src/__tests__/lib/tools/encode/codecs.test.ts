import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CODEC_OPTIONS,
  TEXT_CODECS,
  isCodecOptions,
  runCodec,
} from '@/lib/tools/encode/codecs';
import { detectEncoding } from '@/lib/tools/encode/detect';
import { detectFileType, extensionFor } from '@/lib/tools/encode/mime';
import {
  buildQuery,
  buildUrl,
  decodeUrlBytes,
  encodeUrl,
  parseQuery,
  parseUrl,
} from '@/lib/tools/encode/url';
import { invalidUtf8Offset } from '@/lib/tools/encode/utf8';

const options = DEFAULT_CODEC_OPTIONS;
const SAMPLE = 'Grüße, 世界! 😀 <a href="?q=1&x=2">';

describe('runCodec', () => {
  it.each(TEXT_CODECS)('%s round-trips Unicode text', (codec) => {
    const input = codec === 'punycode' ? 'bücher.example\nmünchen.de' : SAMPLE;
    const encoded = runCodec(codec, 'encode', input, options);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    expect(runCodec(codec, 'decode', encoded.value, options)).toMatchObject({
      ok: true,
      value: input,
    });
  });

  it('points a UTF-8 error at the input character it came from', () => {
    // "/w==" is the single byte 0xFF, which can't start a UTF-8 sequence.
    expect(runCodec('base64', 'decode', 'aGk= /w==', options)).toMatchObject({
      ok: false,
      error: { from: 5 },
    });
    expect(runCodec('hex', 'decode', '68 69 ff', options)).toMatchObject({
      ok: false,
      error: { from: 6, to: 8 },
    });
  });

  it('refuses to encode unpaired surrogates instead of silently replacing them', () => {
    expect(runCodec('base64', 'encode', 'a\ud800b', options)).toMatchObject({
      ok: false,
      error: { from: 1 },
    });
  });

  it('warns about unknown HTML entities', () => {
    expect(runCodec('html', 'decode', '&amp;&nope;', options)).toMatchObject({
      ok: true,
      value: '&&nope;',
      warning: expect.stringContaining('&nope;'),
    });
  });
});

describe('isCodecOptions', () => {
  it('accepts the defaults and rejects stale or tampered shapes', () => {
    expect(isCodecOptions(DEFAULT_CODEC_OPTIONS)).toBe(true);
    expect(
      isCodecOptions({ ...DEFAULT_CODEC_OPTIONS, hex: { separator: 'tab', upper: true } })
    ).toBe(false);
    expect(isCodecOptions({ ...DEFAULT_CODEC_OPTIONS, rot: undefined })).toBe(false);
    expect(isCodecOptions(null)).toBe(false);
  });
});

describe('URL encoding', () => {
  it('encodes a component, a full URI and form data', () => {
    const input = "a b&c=d/é!'()*~";
    expect(encodeUrl(input, 'component')).toEqual({
      ok: true,
      value: "a%20b%26c%3Dd%2F%C3%A9!'()*~",
    });
    expect(encodeUrl('https://x.dev/a b?q=é#h', 'uri')).toEqual({
      ok: true,
      value: 'https://x.dev/a%20b?q=%C3%A9#h',
    });
    expect(encodeUrl(input, 'form')).toEqual({
      ok: true,
      value: 'a+b%26c%3Dd%2F%C3%A9%21%27%28%29*%7E',
    });
  });

  it('keeps reserved escapes when decoding a full URI, and "+" means space only in forms', () => {
    const decode = (text: string, mode: 'component' | 'uri' | 'form') => {
      const result = decodeUrlBytes(text, mode);
      return result.ok ? new TextDecoder().decode(result.value.bytes) : result.error.message;
    };
    expect(decode('a%2Fb%20c+d', 'uri')).toBe('a%2Fb c+d');
    expect(decode('a%2Fb%20c+d', 'component')).toBe('a/b c+d');
    expect(decode('a%2Fb%20c+d', 'form')).toBe('a/b c d');
  });

  it('reports a malformed escape at its position', () => {
    expect(decodeUrlBytes('ab%2', 'component')).toMatchObject({
      ok: false,
      error: { from: 2, to: 4 },
    });
  });
});

describe('URL parts', () => {
  const URL_TEXT = 'https://user:pw@例え.jp:8080/a%20b/c?q=1&tag=a+b&x#frag';

  it('splits a URL and rebuilds it unchanged', () => {
    const parsed = parseUrl(URL_TEXT);
    expect(parsed).toMatchObject({
      ok: true,
      value: {
        protocol: 'https',
        username: 'user',
        password: 'pw',
        hostname: 'xn--r8jz45g.jp',
        port: '8080',
        pathname: '/a%20b/c',
        query: 'q=1&tag=a+b&x',
        hash: 'frag',
      },
    });
    if (!parsed.ok) return;
    expect(buildUrl(parsed.value)).toBe(new URL(URL_TEXT).href);
    const mailto = parseUrl('mailto:a@b.dev?subject=hi');
    expect(mailto.ok && buildUrl(mailto.value)).toBe('mailto:a@b.dev?subject=hi');
  });

  it('decodes query params for editing and re-encodes them', () => {
    const params = parseQuery('q=1&tag=a+b&x&name=J%C3%BCrgen&bad=%E0%A4%A');
    expect(params).toEqual([
      { key: 'q', value: '1' },
      { key: 'tag', value: 'a b' },
      { key: 'x', value: '' },
      { key: 'name', value: 'Jürgen' },
      { key: 'bad', value: '%E0%A4%A' },
    ]);
    expect(buildQuery([...params.slice(0, 2), { key: '', value: '' }])).toBe('q=1&tag=a%20b');
  });

  it('rejects relative URLs', () => {
    expect(parseUrl('/just/a/path')).toMatchObject({ ok: false });
  });
});

describe('detectEncoding', () => {
  it.each([
    ['SGVsbG8sIFdvcmxkIQ==', 'base64'],
    ['JBSWY3DPEBLW64TMMQQQ====', 'base32'],
    ['48 65 6c 6c 6f', 'hex'],
    ['48656c6c6f2c20776f726c64', 'hex'],
    ['01001000 01101001', 'binary'],
    ['hello%20world%21', 'url'],
    ['caf&eacute; &amp; cr&egrave;me', 'html'],
    ['caf\\u00e9', 'unicode'],
    ['xn--mnchen-3ya.de', 'punycode'],
    ['caf=C3=A9 cr=C3=A8me br=C3=BBl=C3=A9e', 'qp'],
    ['data:image/png;base64,iVBORw0KGgo=', 'file'],
    ['iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB', 'file'],
  ])('%s → %s', (input, expected) => {
    expect(detectEncoding(input)).toBe(expected);
  });

  it.each(['Hello world', '12345678', 'Password', 'just some words here', 'abc'])(
    'leaves plain text alone: %s',
    (input) => {
      expect(detectEncoding(input)).toBeNull();
    }
  );
});

describe('detectFileType', () => {
  it('recognizes formats by their magic bytes', () => {
    const bytes = (...values: number[]) => new Uint8Array(values);
    expect(detectFileType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe(
      'image/png'
    );
    expect(detectFileType(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe('image/jpeg');
    expect(detectFileType(new TextEncoder().encode('%PDF-1.7'))?.extension).toBe('pdf');
    expect(detectFileType(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))?.mime).toBe(
      'image/webp'
    );
    expect(
      detectFileType(new TextEncoder().encode('<?xml version="1.0"?>\n<svg xmlns="">'))?.mime
    ).toBe('image/svg+xml');
    expect(detectFileType(new TextEncoder().encode('plain text'))).toBeNull();
    expect(extensionFor('image/png')).toBe('png');
    expect(extensionFor('application/x-unknown')).toBe('bin');
  });
});

describe('invalidUtf8Offset', () => {
  it('finds overlongs, surrogates, truncation and stray continuation bytes', () => {
    const at = (...values: number[]) => invalidUtf8Offset(new Uint8Array(values));
    expect(at(0x61, 0xc3, 0xa9)).toBe(-1);
    expect(at(0x61, 0xc0, 0x80)).toBe(1);
    expect(at(0xed, 0xa0, 0x80)).toBe(0);
    expect(at(0x61, 0xe2, 0x82)).toBe(1);
    expect(at(0x80)).toBe(0);
    expect(at(0xf4, 0x90, 0x80, 0x80)).toBe(0);
  });
});
