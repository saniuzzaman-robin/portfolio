import { describe, it, expect } from 'vitest';
import { decodeJwt, type DecodeResult } from '@/lib/tools/jwt/decode';
import {
  claimTimeState,
  looksLikeMilliseconds,
  readClaims,
  relativeTime,
  tokenTimeStatus,
} from '@/lib/tools/jwt/claims';
import { SAMPLE_PAYLOAD, SAMPLE_TOKEN } from '@/lib/tools/jwt/sample';

const b64url = (text: string) => Buffer.from(text).toString('base64url');
const token = (header: string, payload: string, signature = 'c2ln') =>
  `${b64url(header)}.${b64url(payload)}.${signature}`;

const ok = (result: DecodeResult) => {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
};
const error = (result: DecodeResult) => {
  if (result.ok) throw new Error('Expected an error');
  return result.error;
};

// RFC 7515 Appendix A.1: the header contains a CRLF, so the signing input must be the raw text.
const RFC_7515_A1 =
  'eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

describe('decodeJwt', () => {
  it('decodes the header, payload and signature', () => {
    const decoded = ok(decodeJwt(SAMPLE_TOKEN));
    expect(decoded.alg).toBe('HS256');
    expect(decoded.kid).toBeNull();
    expect(decoded.headerText).toBe('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
    expect(decoded.payloadText).toBe(SAMPLE_PAYLOAD);
    expect(decoded.signature).toHaveLength(32);
    expect(decoded.signingInput).toBe(SAMPLE_TOKEN.slice(0, SAMPLE_TOKEN.lastIndexOf('.')));
    expect(decoded.warnings).toEqual([]);
  });

  it('keeps the signing input exactly as written (RFC 7515 A.1)', () => {
    const decoded = ok(decodeJwt(RFC_7515_A1));
    expect(decoded.alg).toBe('HS256');
    expect(decoded.signingInput).toBe(RFC_7515_A1.split('.').slice(0, 2).join('.'));
    expect(decoded.payloadText).toContain('"http://example.com/is_root": true');
  });

  it('ignores "Bearer " and surrounding whitespace, and reports part offsets', () => {
    const input = `  Bearer ${SAMPLE_TOKEN}\n`;
    const { spans } = ok(decodeJwt(input));
    const start = input.indexOf('eyJ');
    expect(spans.header.from).toBe(start);
    expect(input.slice(spans.header.from, spans.header.to)).toBe(SAMPLE_TOKEN.split('.')[0]);
    expect(input.slice(spans.payload.from, spans.payload.to)).toBe(SAMPLE_TOKEN.split('.')[1]);
    expect(input.slice(spans.signature.from, spans.signature.to)).toBe(SAMPLE_TOKEN.split('.')[2]);
  });

  it('keeps big numbers exactly', () => {
    const decoded = ok(decodeJwt(token('{"alg":"HS256"}', '{"id":12345678901234567890}')));
    expect(decoded.payloadText).toContain('12345678901234567890');
  });

  it('rejects encrypted tokens (JWE) with a clear message', () => {
    expect(error(decodeJwt('a.b.c.d.e')).message).toMatch(/encrypted token \(JWE/);
  });

  it('points at the extra part when there are too many dots', () => {
    const input = `${SAMPLE_TOKEN}.extra`;
    const issue = error(decodeJwt(input));
    expect(issue.message).toMatch(/3 parts.*4/);
    expect(issue.from).toBe(SAMPLE_TOKEN.length);
  });

  it('rejects too few parts, empty input and internal whitespace', () => {
    expect(error(decodeJwt('abc.def')).message).toMatch(/this one has 2/);
    expect(error(decodeJwt('   ')).message).toBe('Paste a token.');
    const withBreak = `${SAMPLE_TOKEN.slice(0, 10)}\n${SAMPLE_TOKEN.slice(10)}`;
    expect(error(decodeJwt(withBreak))).toMatchObject({ from: 10, to: 11 });
  });

  it('locates invalid base64 characters', () => {
    const [header, payload] = SAMPLE_TOKEN.split('.');
    const input = `${header}.${payload.slice(0, 5)}!${payload.slice(6)}.sig`;
    const issue = error(decodeJwt(input));
    expect(issue.message).toMatch(/payload is not valid base64url/);
    expect(issue.from).toBe(header.length + 1 + 5);
  });

  it('reports JSON errors over the whole part', () => {
    const input = token('{"alg":', '{}');
    const issue = error(decodeJwt(input));
    expect(issue.message).toMatch(/header is not valid JSON/);
    expect(issue).toMatchObject({ from: 0, to: input.indexOf('.') });
    expect(error(decodeJwt(token('[1]', '{}'))).message).toBe('The header must be a JSON object.');
    expect(error(decodeJwt(token('{}', '"text"'))).message).toBe(
      'The payload must be a JSON object.'
    );
  });

  it('rejects non-UTF-8 parts', () => {
    const bad = Buffer.from([0x7b, 0xff, 0x7d]).toString('base64url');
    expect(error(decodeJwt(`${bad}.${b64url('{}')}.`)).message).toMatch(/header is not UTF-8/);
  });

  it('warns about standard base64 and duplicate claims', () => {
    const header = Buffer.from('{"alg":"none"}').toString('base64'); // ends with "="
    const decoded = ok(decodeJwt(`${header}.${b64url('{"a":1,"a":2}')}.`));
    expect(decoded.warnings.map((warning) => warning.message)).toEqual([
      expect.stringMatching(/header uses standard base64/),
      expect.stringMatching(/In the payload: .*a/),
    ]);
  });

  it('accepts an empty signature (alg none)', () => {
    const decoded = ok(decodeJwt(`${token('{"alg":"none"}', '{}', '')}`));
    expect(decoded.alg).toBe('none');
    expect(decoded.signature).toHaveLength(0);
  });
});

describe('claims', () => {
  const claimsOf = (payload: string) => readClaims(ok(decodeJwt(token('{}', payload))).payload);

  it('reads claims with their time values', () => {
    expect(claimsOf('{"sub":"x","aud":["a","b"],"exp":1700000000.5,"iat":"soon","n":1}')).toEqual([
      { name: 'sub', text: 'x', time: null },
      { name: 'aud', text: '["a","b"]', time: null },
      { name: 'exp', text: '1700000000.5', time: 1700000000.5 },
      { name: 'iat', text: 'soon', time: null },
      { name: 'n', text: '1', time: null },
    ]);
  });

  it('compares time claims with now (RFC 7519 §4.1)', () => {
    expect(claimTimeState('exp', 100, 99)).toBe('valid');
    expect(claimTimeState('exp', 100, 100)).toBe('expired');
    expect(claimTimeState('nbf', 100, 99)).toBe('notYetValid');
    expect(claimTimeState('nbf', 100, 100)).toBe('valid');
    expect(claimTimeState('iat', 100, 99)).toBe('future');
    expect(claimTimeState('iat', 100, 100)).toBeNull();
  });

  it('summarizes the token window, using the last duplicate', () => {
    expect(tokenTimeStatus(claimsOf('{"exp":100}'), 100)).toBe('expired');
    expect(tokenTimeStatus(claimsOf('{"exp":100,"exp":200}'), 150)).toBe('valid');
    expect(tokenTimeStatus(claimsOf('{"nbf":200,"exp":300}'), 150)).toBe('notYetValid');
    expect(tokenTimeStatus(claimsOf('{"iat":1}'), 150)).toBe('noExpiry');
  });

  it('spots millisecond timestamps', () => {
    expect(looksLikeMilliseconds(1767225600)).toBe(false);
    expect(looksLikeMilliseconds(1767225600000)).toBe(true);
  });

  it('picks the largest whole unit for relative times', () => {
    expect(relativeTime(100, 100)).toEqual({ value: 0, unit: 'second' });
    expect(relativeTime(130, 100)).toEqual({ value: 30, unit: 'second' });
    expect(relativeTime(100 + 86_399, 100)).toEqual({ value: 23, unit: 'hour' });
    expect(relativeTime(100 - 3 * 86_400, 100)).toEqual({ value: -3, unit: 'day' });
    expect(relativeTime(4102444800, 1767225600)).toEqual({ value: 74, unit: 'year' });
  });
});
