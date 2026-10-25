/** What a QR code can carry, and the text payload scanners expect for each. */

export const CONTENT_TYPES = ['text', 'url', 'wifi', 'vcard', 'email'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const WIFI_SECURITY = ['WPA', 'WEP', 'nopass'] as const;
export type WifiSecurity = (typeof WIFI_SECURITY)[number];

export type QrFields = {
  text: string;
  url: string;
  wifi: { ssid: string; password: string; security: WifiSecurity; hidden: boolean };
  vcard: {
    firstName: string;
    lastName: string;
    org: string;
    title: string;
    phone: string;
    email: string;
    url: string;
    address: string;
    note: string;
  };
  email: { to: string; subject: string; body: string };
};

export const EMPTY_FIELDS: QrFields = {
  text: '',
  url: '',
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
  vcard: {
    firstName: '',
    lastName: '',
    org: '',
    title: '',
    phone: '',
    email: '',
    url: '',
    address: '',
    note: '',
  },
  email: { to: '', subject: '', body: '' },
};

const isStringRecord = (value: unknown, keys: string[]): boolean =>
  typeof value === 'object' &&
  value !== null &&
  keys.every((key) => typeof (value as Record<string, unknown>)[key] === 'string');

/** Validates persisted fields (shape only; any strings are acceptable). */
export function isQrFields(value: unknown): value is QrFields {
  const fields = value as QrFields | null;
  return (
    typeof fields === 'object' &&
    fields !== null &&
    typeof fields.text === 'string' &&
    typeof fields.url === 'string' &&
    isStringRecord(fields.wifi, ['ssid', 'password']) &&
    WIFI_SECURITY.includes(fields.wifi.security) &&
    typeof fields.wifi.hidden === 'boolean' &&
    isStringRecord(fields.vcard, Object.keys(EMPTY_FIELDS.vcard)) &&
    isStringRecord(fields.email, Object.keys(EMPTY_FIELDS.email))
  );
}

/** `WIFI:` fields escape `\ ; , : "` with a backslash (the ZXing / Android convention). */
const wifiEscape = (value: string) => value.replace(/([\\;,:"])/g, '\\$1');

/** vCard 3.0 text values (RFC 2426 §5): backslash, comma, semicolon and newlines. */
const vcardEscape = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/([,;])/g, '\\$1');

export type Payload = { text: string; warnings: PayloadWarning[] };
export type PayloadWarning = 'schemeAdded' | 'wepInsecure' | 'missingSsid' | 'missingRecipient';

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function wifiPayload({ ssid, password, security, hidden }: QrFields['wifi']): Payload {
  const warnings: PayloadWarning[] = [];
  if (!ssid) warnings.push('missingSsid');
  if (security === 'WEP') warnings.push('wepInsecure');
  const parts = [`T:${security}`, `S:${wifiEscape(ssid)}`];
  if (security !== 'nopass') parts.push(`P:${wifiEscape(password)}`);
  if (hidden) parts.push('H:true');
  return { text: `WIFI:${parts.join(';')};;`, warnings };
}

function vcardPayload(card: QrFields['vcard']): Payload {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  const full = [card.firstName, card.lastName].filter(Boolean).join(' ');
  lines.push(`N:${vcardEscape(card.lastName)};${vcardEscape(card.firstName)};;;`);
  lines.push(`FN:${vcardEscape(full || card.org)}`);
  if (card.org) lines.push(`ORG:${vcardEscape(card.org)}`);
  if (card.title) lines.push(`TITLE:${vcardEscape(card.title)}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:${vcardEscape(card.phone)}`);
  if (card.email) lines.push(`EMAIL:${vcardEscape(card.email)}`);
  if (card.url) lines.push(`URL:${vcardEscape(card.url)}`);
  // ADR is structured; a free-form address goes in the street field.
  if (card.address) lines.push(`ADR:;;${vcardEscape(card.address)};;;;`);
  if (card.note) lines.push(`NOTE:${vcardEscape(card.note)}`);
  lines.push('END:VCARD');
  return { text: lines.join('\r\n'), warnings: [] };
}

function emailPayload({ to, subject, body }: QrFields['email']): Payload {
  const query = [
    subject && `subject=${encodeURIComponent(subject)}`,
    body && `body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`,
  ].filter(Boolean);
  // Addresses keep `@` and commas readable; everything else is percent-encoded (RFC 6068).
  const recipients = to
    .split(',')
    .map((address) => encodeURIComponent(address.trim()).replace(/%40/g, '@'))
    .filter(Boolean)
    .join(',');
  return {
    text: `mailto:${recipients}${query.length ? `?${query.join('&')}` : ''}`,
    warnings: recipients ? [] : ['missingRecipient'],
  };
}

/** The text to encode for `type`; empty when there is nothing to encode yet. */
export function buildPayload(type: ContentType, fields: QrFields): Payload {
  switch (type) {
    case 'text':
      return { text: fields.text, warnings: [] };
    case 'url': {
      const url = fields.url.trim();
      if (!url || SCHEME.test(url)) return { text: url, warnings: [] };
      return { text: `https://${url}`, warnings: ['schemeAdded'] };
    }
    case 'wifi':
      return fields.wifi.ssid || fields.wifi.password
        ? wifiPayload(fields.wifi)
        : { text: '', warnings: [] };
    case 'vcard':
      return Object.values(fields.vcard).some(Boolean)
        ? vcardPayload(fields.vcard)
        : { text: '', warnings: [] };
    case 'email':
      return Object.values(fields.email).some(Boolean)
        ? emailPayload(fields.email)
        : { text: '', warnings: [] };
  }
}
