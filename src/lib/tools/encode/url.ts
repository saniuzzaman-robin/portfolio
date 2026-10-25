import { ByteSink, fail, type CodecIssue, type CodecResult, type DecodedBytes } from './types';

/**
 * - `component`: one value (query param, path segment) — like `encodeURIComponent`.
 * - `uri`: a whole URL, keeping its structure (`:/?#&=`…) — like `encodeURI`.
 * - `form`: `application/x-www-form-urlencoded`, spaces as `+` (HTML forms, `URLSearchParams`).
 */
export type UrlEncoding = 'component' | 'uri' | 'form';

// Escapes that `decodeURI` keeps encoded, because decoding them would change the URL's structure.
const RESERVED = new Set(';/?:@&=+$,#'.split('').map((char) => char.charCodeAt(0)));

/** Index of the first unpaired UTF-16 surrogate, or -1 (those can't be encoded as UTF-8). */
export function loneSurrogate(text: string): number {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) i++;
      else return i;
    } else if (code >= 0xdc00 && code <= 0xdfff) return i;
  }
  return -1;
}

export function surrogateIssue(index: number): CodecIssue {
  return {
    message: 'Unpaired UTF-16 surrogate: this character cannot be encoded.',
    from: index,
    to: index + 1,
  };
}

const percent = (char: string) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`;

export function encodeUrl(text: string, mode: UrlEncoding): CodecResult {
  const lone = loneSurrogate(text);
  if (lone >= 0) return { ok: false, error: surrogateIssue(lone) };
  if (mode === 'uri') return { ok: true, value: encodeURI(text) };
  const encoded = encodeURIComponent(text);
  if (mode === 'component') return { ok: true, value: encoded };
  // The form serializer leaves only alphanumerics and `*-._` unescaped.
  return { ok: true, value: encoded.replace(/[!'()~]/g, percent).replace(/%20/g, '+') };
}

const HEX_PAIR = /^[0-9a-f]{2}$/i;

/** Percent-decodes to bytes (literal characters become their UTF-8 bytes). */
export function decodeUrlBytes(
  text: string,
  mode: UrlEncoding,
  track = false
): CodecResult<DecodedBytes> {
  const sink = new ByteSink(text.length * 3, track);
  const encoder = new TextEncoder();
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '%') {
      const pair = text.slice(i + 1, i + 3);
      if (!HEX_PAIR.test(pair)) {
        return fail('“%” must be followed by two hex digits.', i, Math.min(text.length, i + 3));
      }
      const byte = parseInt(pair, 16);
      if (mode === 'uri' && RESERVED.has(byte)) {
        for (let k = 0; k < 3; k++) sink.push(text.charCodeAt(i + k), i);
      } else sink.push(byte, i);
      i += 2;
    } else if (char === '+' && mode === 'form') {
      sink.push(0x20, i);
    } else {
      const code = text.codePointAt(i)!;
      const unit = code > 0xffff ? text.slice(i, i + 2) : char;
      for (const byte of encoder.encode(unit)) sink.push(byte, i);
      if (code > 0xffff) i++;
    }
  }
  return { ok: true, value: sink.result() };
}

/** Lenient decode for display (query params): malformed escapes are left as they are. */
export function decodeComponentLenient(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    return text;
  }
}

/** The editable pieces of a URL. `query` and `hash` are raw (still percent-encoded). */
export type UrlParts = {
  protocol: string;
  /** Whether `//` follows the scheme (always for http(s), ftp, ws(s), file). */
  slashes: boolean;
  username: string;
  password: string;
  hostname: string;
  port: string;
  pathname: string;
  query: string;
  hash: string;
};

export type QueryParam = { key: string; value: string };

export function parseUrl(text: string): CodecResult<UrlParts> {
  const trimmed = text.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return fail(
      'Not a valid absolute URL (it needs a scheme such as https://).',
      0,
      Math.max(1, text.length)
    );
  }
  const afterScheme = trimmed.slice(url.protocol.length);
  return {
    ok: true,
    value: {
      protocol: url.protocol.replace(/:$/, ''),
      slashes: url.host !== '' || afterScheme.startsWith('//'),
      username: url.username,
      password: url.password,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      query: url.search.replace(/^\?/, ''),
      hash: url.hash.replace(/^#/, ''),
    },
  };
}

export function buildUrl(parts: UrlParts): string {
  const auth = parts.username
    ? `${parts.username}${parts.password ? `:${parts.password}` : ''}@`
    : '';
  const port = parts.port ? `:${parts.port}` : '';
  const path =
    parts.slashes && parts.pathname && !parts.pathname.startsWith('/')
      ? `/${parts.pathname}`
      : parts.pathname;
  return [
    `${parts.protocol}:`,
    parts.slashes ? `//${auth}${parts.hostname}${port}` : '',
    path,
    parts.query ? `?${parts.query}` : '',
    parts.hash ? `#${parts.hash}` : '',
  ].join('');
}

export function parseQuery(query: string): QueryParam[] {
  return query
    .split('&')
    .filter((piece) => piece !== '')
    .map((piece) => {
      const eq = piece.indexOf('=');
      const key = eq < 0 ? piece : piece.slice(0, eq);
      const value = eq < 0 ? '' : piece.slice(eq + 1);
      return { key: decodeComponentLenient(key), value: decodeComponentLenient(value) };
    });
}

export function buildQuery(params: QueryParam[]): string {
  return params
    .filter((param) => param.key !== '' || param.value !== '')
    .map((param) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
    .join('&');
}
