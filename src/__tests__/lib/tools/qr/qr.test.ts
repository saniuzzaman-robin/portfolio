import { describe, it, expect } from 'vitest';
import { EMPTY_FIELDS, buildPayload, isQrFields, type QrFields } from '@/lib/tools/qr/content';
import { createQr, darkRuns, qrToSvg, type QrMatrix } from '@/lib/tools/qr/qr';

const fields = (overrides: Partial<QrFields>): QrFields => ({ ...EMPTY_FIELDS, ...overrides });

describe('buildPayload', () => {
  it('passes text through and adds a scheme to bare URLs', () => {
    expect(buildPayload('text', fields({ text: 'hello\nworld' })).text).toBe('hello\nworld');
    expect(buildPayload('url', fields({ url: 'example.com/a?b=1' }))).toEqual({
      text: 'https://example.com/a?b=1',
      warnings: ['schemeAdded'],
    });
    expect(buildPayload('url', fields({ url: ' http://example.com ' }))).toEqual({
      text: 'http://example.com',
      warnings: [],
    });
    expect(buildPayload('url', fields({ url: 'tel:+4712345678' })).text).toBe('tel:+4712345678');
  });

  it('builds escaped Wi-Fi payloads', () => {
    const wifi = (overrides: Partial<QrFields['wifi']>) =>
      buildPayload('wifi', fields({ wifi: { ...EMPTY_FIELDS.wifi, ...overrides } }));
    expect(wifi({ ssid: 'Home', password: 'p@ss' }).text).toBe('WIFI:T:WPA;S:Home;P:p@ss;;');
    expect(wifi({ ssid: 'My;Net', password: 'a\\b:c,"d"', hidden: true }).text).toBe(
      'WIFI:T:WPA;S:My\\;Net;P:a\\\\b\\:c\\,\\"d\\";H:true;;'
    );
    expect(wifi({ ssid: 'Cafe', password: 'ignored', security: 'nopass' }).text).toBe(
      'WIFI:T:nopass;S:Cafe;;'
    );
    expect(wifi({ ssid: 'Old', security: 'WEP' }).warnings).toEqual(['wepInsecure']);
    expect(wifi({ password: 'x' }).warnings).toContain('missingSsid');
    expect(wifi({}).text).toBe('');
  });

  it('builds vCard 3.0 with escaped values and CRLF lines', () => {
    const vcard = buildPayload(
      'vcard',
      fields({
        vcard: {
          ...EMPTY_FIELDS.vcard,
          firstName: 'Ada',
          lastName: 'Lovelace',
          org: 'Analytical Engines, Ltd',
          phone: '+44 20 0000 0000',
          note: 'line 1\nline 2; more',
        },
      })
    ).text;
    expect(vcard.split('\r\n')).toEqual([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Lovelace;Ada;;;',
      'FN:Ada Lovelace',
      'ORG:Analytical Engines\\, Ltd',
      'TEL;TYPE=CELL:+44 20 0000 0000',
      'NOTE:line 1\\nline 2\\; more',
      'END:VCARD',
    ]);
    expect(buildPayload('vcard', EMPTY_FIELDS).text).toBe('');
  });

  it('builds RFC 6068 mailto URIs', () => {
    const email = (overrides: Partial<QrFields['email']>) =>
      buildPayload('email', fields({ email: { ...EMPTY_FIELDS.email, ...overrides } }));
    expect(email({ to: 'a@example.com', subject: 'Hi & bye', body: 'L1\nL2' }).text).toBe(
      'mailto:a@example.com?subject=Hi%20%26%20bye&body=L1%0D%0AL2'
    );
    expect(email({ to: 'a@x.org, b@y.org' }).text).toBe('mailto:a@x.org,b@y.org');
    expect(email({ subject: 'No one' }).warnings).toEqual(['missingRecipient']);
  });

  it('validates persisted fields', () => {
    expect(isQrFields(EMPTY_FIELDS)).toBe(true);
    expect(isQrFields({ ...EMPTY_FIELDS, wifi: { ...EMPTY_FIELDS.wifi, security: 'WPA3' } })).toBe(
      false
    );
    expect(isQrFields({ ...EMPTY_FIELDS, vcard: { firstName: 'x' } })).toBe(false);
    expect(isQrFields(null)).toBe(false);
  });
});

describe('createQr', () => {
  it('picks the smallest version and draws finder patterns', async () => {
    const result = await createQr('HELLO', 'M');
    if (!result.ok) throw new Error(result.message);
    const { matrix } = result;
    expect(matrix.version).toBe(1);
    expect(matrix.size).toBe(21);
    const at = (row: number, col: number) => matrix.dark[row * matrix.size + col];
    // Each 7×7 finder: dark border, light ring, dark 3×3 centre.
    for (const [top, left] of [
      [0, 0],
      [0, 14],
      [14, 0],
    ]) {
      expect(at(top, left)).toBe(true);
      expect(at(top + 1, left + 1)).toBe(false);
      expect(at(top + 3, left + 3)).toBe(true);
      expect(at(top + 6, left + 6)).toBe(true);
    }
    // Timing pattern alternates along row 6.
    expect([8, 9, 10, 11, 12].map((col) => at(6, col))).toEqual([true, false, true, false, true]);
  });

  it('grows with higher error correction and reports overflow', async () => {
    const text = 'x'.repeat(100);
    const low = await createQr(text, 'L');
    const high = await createQr(text, 'H');
    if (!low.ok || !high.ok) throw new Error('expected both to fit');
    expect(high.matrix.version).toBeGreaterThan(low.matrix.version);
    const tooBig = await createQr('x'.repeat(3000), 'H');
    expect(tooBig.ok).toBe(false);
  });
});

describe('qrToSvg', () => {
  const matrix: QrMatrix = {
    size: 3,
    version: 1,
    dark: [true, true, false, false, false, false, true, false, true],
  };

  it('merges horizontal runs', () => {
    expect(darkRuns(matrix)).toEqual([
      [0, 0, 2],
      [2, 0, 1],
      [2, 2, 1],
    ]);
  });

  it('renders a scalable SVG with the quiet zone', () => {
    const svg = qrToSvg(matrix, { margin: 1, foreground: '#000', background: '#fff' }, 120);
    expect(svg).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5" width="120" height="120" shape-rendering="crispEdges">' +
        '<rect width="5" height="5" fill="#fff"/>' +
        '<path d="M1 1h2v1h-2zM1 3h1v1h-1zM3 3h1v1h-1z" fill="#000"/></svg>'
    );
    expect(qrToSvg(matrix, { margin: 0, foreground: '"><x', background: '#fff' }, 10)).toContain(
      'fill="&quot;>&lt;x"'
    );
  });
});
