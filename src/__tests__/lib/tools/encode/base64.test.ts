import { describe, it, expect } from 'vitest';
import { decodeBase64, encodeBase64, parseDataUri, toDataUri } from '@/lib/tools/encode/base64';
import { decodeBase32, encodeBase32 } from '@/lib/tools/encode/base32';
import { decodeHex, encodeHex } from '@/lib/tools/encode/hex';
import { decodeBinary, encodeBinary } from '@/lib/tools/encode/binary';
import { decodeFilePayload } from '@/lib/tools/encode/file';
import type { CodecResult, DecodedBytes } from '@/lib/tools/encode/types';

const ascii = (text: string) => new TextEncoder().encode(text);
const text = (result: CodecResult<DecodedBytes>) => {
  if (!result.ok) throw new Error(result.error.message);
  return new TextDecoder().decode(result.value.bytes);
};

// RFC 4648 §10 test vectors.
const VECTORS = ['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar'];
const BASE64 = ['', 'Zg==', 'Zm8=', 'Zm9v', 'Zm9vYg==', 'Zm9vYmE=', 'Zm9vYmFy'];
const BASE32 = ['', 'MY======', 'MZXQ====', 'MZXW6===', 'MZXW6YQ=', 'MZXW6YTB', 'MZXW6YTBOI======'];
const BASE16 = ['', '66', '666F', '666F6F', '666F6F62', '666F6F6261', '666F6F626172'];

describe('base64', () => {
  it.each(VECTORS.map((input, i) => [input, BASE64[i]]))(
    'RFC 4648: "%s" ↔ %s',
    (input, encoded) => {
      expect(encodeBase64(ascii(input))).toBe(encoded);
      expect(text(decodeBase64(encoded))).toBe(input);
    }
  );

  it('encodes URL-safe without padding and wraps lines', () => {
    const bytes = new Uint8Array([0xfb, 0xff, 0xbf]);
    expect(encodeBase64(bytes)).toBe('+/+/');
    expect(encodeBase64(bytes, { urlSafe: true })).toBe('-_-_');
    expect(encodeBase64(ascii('f'), { padding: false })).toBe('Zg');
    expect(encodeBase64(ascii('foobar'), { lineLength: 4 })).toBe('Zm9v\nYmFy');
  });

  it('decodes either alphabet, missing padding and whitespace', () => {
    expect(Array.from((decodeBase64('-_-_') as { value: DecodedBytes }).value.bytes)).toEqual([
      0xfb, 0xff, 0xbf,
    ]);
    expect(text(decodeBase64('Zm9v\r\nYg'))).toBe('foob');
  });

  it('reports invalid characters, stray data after padding and bad lengths with positions', () => {
    expect(decodeBase64('Zm9v!')).toMatchObject({ ok: false, error: { from: 4, to: 5 } });
    expect(decodeBase64('Zg==Zg')).toMatchObject({ ok: false, error: { from: 4 } });
    expect(decodeBase64('Zm9vY')).toMatchObject({ ok: false, error: { from: 4, to: 5 } });
    expect(decodeBase64('Zm8==')).toMatchObject({ ok: false, error: { from: 3 } });
  });

  it('tracks where each decoded byte came from', () => {
    const result = decodeBase64('Zm9v Zm9v', true);
    expect(result.ok && Array.from(result.value.starts!)).toEqual([0, 1, 2, 5, 6, 7]);
  });

  it('parses data URIs', () => {
    expect(parseDataUri('data:image/png;base64,iVBO')).toEqual({
      mime: 'image/png',
      base64: true,
      data: 'iVBO',
      dataOffset: 22,
    });
    expect(parseDataUri('data:,Hello%20World')).toMatchObject({
      mime: 'text/plain',
      base64: false,
    });
    expect(parseDataUri('iVBORw0KGgo=')).toBeNull();
    expect(toDataUri(ascii('hi'), 'text/plain')).toBe('data:text/plain;base64,aGk=');
  });
});

describe('base32', () => {
  it.each(VECTORS.map((input, i) => [input, BASE32[i]]))(
    'RFC 4648: "%s" ↔ %s',
    (input, encoded) => {
      expect(encodeBase32(ascii(input))).toBe(encoded);
      expect(text(decodeBase32(encoded))).toBe(input);
    }
  );

  it('decodes lowercase and unpadded input, and rejects impossible lengths', () => {
    expect(text(decodeBase32('mzxw6ytboi'))).toBe('foobar');
    expect(encodeBase32(ascii('fo'), { padding: false })).toBe('MZXQ');
    expect(decodeBase32('MZX')).toMatchObject({ ok: false });
    expect(decodeBase32('MZ1Q')).toMatchObject({ ok: false, error: { from: 2 } });
  });
});

describe('hex', () => {
  it.each(VECTORS.map((input, i) => [input, BASE16[i]]))(
    'RFC 4648: "%s" ↔ %s',
    (input, encoded) => {
      expect(encodeHex(ascii(input), { upper: true })).toBe(encoded);
      expect(text(decodeHex(encoded))).toBe(input);
    }
  );

  it('formats with separators and accepts common notations', () => {
    expect(encodeHex(ascii('foo'), { separator: 'colon' })).toBe('66:6f:6f');
    expect(encodeHex(ascii('foo'), { separator: 'space' })).toBe('66 6f 6f');
    for (const notation of [
      '66 6f 6f',
      '66:6F:6F',
      '0x66, 0x6f, 0x6f',
      '\\x66\\x6f\\x6f',
      '666f6f',
    ]) {
      expect(text(decodeHex(notation))).toBe('foo');
    }
  });

  it('reports non-hex characters and an odd digit count', () => {
    expect(decodeHex('66 6g')).toMatchObject({ ok: false, error: { from: 4 } });
    expect(decodeHex('666')).toMatchObject({ ok: false, error: { from: 2 } });
  });
});

describe('binary', () => {
  it('round-trips bytes as 8-bit groups', () => {
    expect(encodeBinary(ascii('Hi'))).toBe('01001000 01101001');
    expect(encodeBinary(ascii('Hi'), { spaced: false })).toBe('0100100001101001');
    expect(text(decodeBinary('0100100001101001'))).toBe('Hi');
  });

  it('accepts unpadded groups and rejects partial bytes', () => {
    expect(text(decodeBinary('1001000 1101001'))).toBe('Hi');
    expect(decodeBinary('010010000')).toMatchObject({ ok: false, error: { from: 0, to: 9 } });
    expect(decodeBinary('0102')).toMatchObject({ ok: false, error: { from: 3 } });
  });
});

describe('decodeFilePayload', () => {
  const PNG_BASE64 = 'iVBORw0KGgo=';

  it('decodes plain base64 and detects the type', () => {
    const result = decodeFilePayload(PNG_BASE64);
    expect(result).toMatchObject({
      ok: true,
      value: { declared: null, detected: { mime: 'image/png' } },
    });
  });

  it('decodes base64 and percent-encoded data URIs', () => {
    expect(decodeFilePayload(`data:image/png;base64,${PNG_BASE64}`)).toMatchObject({
      ok: true,
      value: { declared: 'image/png', detected: { extension: 'png' } },
    });
    const plain = decodeFilePayload('data:text/plain,Hi%21');
    expect(plain.ok && new TextDecoder().decode(plain.value.bytes)).toBe('Hi!');
  });

  it('reports errors at their position in the whole text', () => {
    expect(decodeFilePayload('data:image/png;base64,iVB!')).toMatchObject({
      ok: false,
      error: { from: 25 },
    });
    expect(decodeFilePayload('data:,a%2')).toMatchObject({ ok: false, error: { from: 7 } });
  });
});
