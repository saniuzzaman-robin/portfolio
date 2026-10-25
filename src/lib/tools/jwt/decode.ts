import { decodeBase64 } from '@/lib/tools/encode/base64';
import { utf8Decode } from '@/lib/tools/encode/utf8';
import { fail, type CodecIssue } from '@/lib/tools/encode/types';
import { parseJson, type JsonObject } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';

export type JwtPart = 'header' | 'payload' | 'signature';
export type Span = { from: number; to: number };
/** A problem in the token, as offsets into the input text (for the editor underline). */
export type JwtIssue = CodecIssue;

export type DecodedJwt = {
  header: JsonObject;
  payload: JsonObject;
  /** Pretty-printed with 2 spaces; numbers are kept exactly as written. */
  headerText: string;
  payloadText: string;
  /** The `alg` header parameter, when it is a string. */
  alg: string | null;
  /** The `kid` header parameter, when it is a string. */
  kid: string | null;
  signature: Uint8Array<ArrayBuffer>;
  /** `<header>.<payload>` exactly as it appears in the token: what the signature covers. */
  signingInput: string;
  /** Where each part is in the input text. */
  spans: Record<JwtPart, Span>;
  warnings: JwtIssue[];
};

export type DecodeResult = { ok: true; value: DecodedJwt } | { ok: false; error: JwtIssue };

const BEARER = /^\s*(?:Bearer\s+)?/i;
const NOT_BASE64URL = /[+/=]/;

/** Value of a top-level string member of a JSON object, or null. */
export function stringMember(object: JsonObject, key: string): string | null {
  const entry = object.entries.findLast((item) => item.key === key);
  return entry?.value.type === 'string' ? entry.value.value : null;
}

type Segment =
  { ok: true; value: JsonObject; warnings: JwtIssue[] } | { ok: false; error: JwtIssue };

function decodeSegment(text: string, span: Span, name: JwtPart): Segment {
  if (text === '') return fail(`The ${name} is empty.`, span.from, span.from + 1);
  const bytes = decodeBase64(text, true, span.from);
  if (!bytes.ok) {
    return {
      ok: false,
      error: {
        ...bytes.error,
        message: `The ${name} is not valid base64url: ${bytes.error.message}`,
      },
    };
  }
  const decoded = utf8Decode(bytes.value, span.to);
  if (!decoded.ok) {
    return {
      ok: false,
      error: {
        ...decoded.error,
        message: `The ${name} is not UTF-8 text: ${decoded.error.message}`,
      },
    };
  }
  const parsed = parseJson(decoded.value);
  if (!parsed.ok) {
    return fail(`The ${name} is not valid JSON: ${parsed.error.message}`, span.from, span.to);
  }
  if (parsed.value.type !== 'object') {
    return fail(`The ${name} must be a JSON object.`, span.from, span.to);
  }
  // Offsets inside the decoded JSON don't map back to base64 characters, so flag the whole part.
  const warnings = parsed.warnings.map((warning) => ({
    message: `In the ${name}: ${warning.message}`,
    ...span,
  }));
  return { ok: true, value: parsed.value, warnings };
}

function base64urlWarning(text: string, span: Span, name: JwtPart): JwtIssue | null {
  const match = NOT_BASE64URL.exec(text);
  if (!match) return null;
  const from = span.from + match.index;
  return {
    message: `The ${name} uses standard base64 (“+”, “/” or “=”); JWTs use base64url without padding.`,
    from,
    to: from + 1,
  };
}

/**
 * Splits and decodes a compact JWS (`header.payload.signature`). A leading "Bearer " and
 * surrounding whitespace are ignored. Errors point at the part of the input that caused them.
 */
export function decodeJwt(input: string): DecodeResult {
  const start = BEARER.exec(input)?.[0].length ?? 0;
  const end = input.trimEnd().length;
  if (end <= start) return fail('Paste a token.', 0, input.length);
  const token = input.slice(start, end);

  const space = /\s/.exec(token);
  if (space) {
    return fail(
      'A token can’t contain spaces or line breaks.',
      start + space.index,
      start + space.index + 1
    );
  }

  const parts = token.split('.');
  if (parts.length === 5) {
    return fail(
      'This is an encrypted token (JWE, 5 parts). Only the recipient’s private key can decrypt it.',
      start,
      end
    );
  }
  if (parts.length !== 3) {
    const message = `A JWT has 3 parts separated by dots; this one has ${parts.length}.`;
    if (parts.length < 3) return fail(message, start, end);
    const extraDot = start + parts[0].length + parts[1].length + parts[2].length + 2;
    return fail(message, extraDot, end);
  }

  const [headerText, payloadText, signatureText] = parts;
  const header = { from: start, to: start + headerText.length };
  const payload = { from: header.to + 1, to: header.to + 1 + payloadText.length };
  const signature = { from: payload.to + 1, to: end };
  const spans = { header, payload, signature };

  const decodedHeader = decodeSegment(headerText, header, 'header');
  if (!decodedHeader.ok) return decodedHeader;
  const decodedPayload = decodeSegment(payloadText, payload, 'payload');
  if (!decodedPayload.ok) return decodedPayload;
  const signatureBytes = decodeBase64(signatureText, false, signature.from);
  if (!signatureBytes.ok) {
    const { error } = signatureBytes;
    return {
      ok: false,
      error: { ...error, message: `The signature is not valid base64url: ${error.message}` },
    };
  }

  const warnings = [
    base64urlWarning(headerText, header, 'header'),
    base64urlWarning(payloadText, payload, 'payload'),
    base64urlWarning(signatureText, signature, 'signature'),
    ...decodedHeader.warnings,
    ...decodedPayload.warnings,
  ].filter((warning): warning is JwtIssue => warning !== null);

  return {
    ok: true,
    value: {
      header: decodedHeader.value,
      payload: decodedPayload.value,
      headerText: stringifyJson(decodedHeader.value, { indent: 2 }),
      payloadText: stringifyJson(decodedPayload.value, { indent: 2 }),
      alg: stringMember(decodedHeader.value, 'alg'),
      kid: stringMember(decodedHeader.value, 'kid'),
      signature: signatureBytes.value.bytes,
      signingInput: `${headerText}.${payloadText}`,
      spans,
      warnings,
    },
  };
}
