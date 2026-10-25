import {
  cieLabToRgb,
  hslToRgb,
  hwbToRgb,
  lchToLab,
  linearSrgbToRgb,
  normalizeHue,
  oklabToRgb,
  p3ToRgb,
  xyzD50ToRgb,
  xyzD65ToRgb,
  type Color,
  type Vec3,
} from './convert';
import { NAMED_COLORS } from './named';

export type ParseColorResult = { ok: true; color: Color } | { ok: false; message: string };

const invalid = (message: string): ParseColorResult => ({ ok: false, message });

/** `none` reads as 0 (CSS "missing component"); hue units become degrees. */
type Token = { value: number; unit: '' | '%' | 'deg' | 'grad' | 'rad' | 'turn' | 'none' };

const TOKEN = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?$/i;

function readToken(text: string): Token | null {
  if (text.toLowerCase() === 'none') return { value: 0, unit: 'none' };
  const match = TOKEN.exec(text);
  if (!match) return null;
  return { value: Number(match[1]), unit: (match[2]?.toLowerCase() ?? '') as Token['unit'] };
}

const DEGREES: Record<string, number> = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };

/** A component: plain numbers as they are, percentages scaled so 100% = `full`. */
type Channel = { full: number } | 'hue';

function channelValue(token: Token, channel: Channel): number | null {
  if (token.unit === 'none') return 0;
  if (channel === 'hue') {
    if (token.unit === '%') return null;
    return normalizeHue(token.value * (token.unit ? DEGREES[token.unit] : 1));
  }
  if (token.unit === '%') return (token.value / 100) * channel.full;
  return token.unit === '' ? token.value : null;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const PERCENT: Channel = { full: 100 };
const UNIT: Channel = { full: 1 };

type ColorFunction = { channels: Channel[]; toRgb: (values: number[]) => Vec3 };

const FUNCTIONS: Record<string, ColorFunction> = {
  rgb: {
    channels: [{ full: 255 }, { full: 255 }, { full: 255 }],
    toRgb: (v) => [clamp(v[0] / 255), clamp(v[1] / 255), clamp(v[2] / 255)],
  },
  hsl: {
    channels: ['hue', PERCENT, PERCENT],
    toRgb: (v) => hslToRgb([v[0], clamp(v[1] / 100), clamp(v[2] / 100)]),
  },
  hwb: {
    channels: ['hue', PERCENT, PERCENT],
    toRgb: (v) => hwbToRgb([v[0], clamp(v[1] / 100), clamp(v[2] / 100)]),
  },
  lab: {
    channels: [PERCENT, { full: 125 }, { full: 125 }],
    toRgb: (v) => cieLabToRgb([clamp(v[0], 0, 100), v[1], v[2]]),
  },
  lch: {
    channels: [PERCENT, { full: 150 }, 'hue'],
    toRgb: (v) => cieLabToRgb(lchToLab([clamp(v[0], 0, 100), Math.max(0, v[1]), v[2]])),
  },
  oklab: {
    channels: [UNIT, { full: 0.4 }, { full: 0.4 }],
    toRgb: (v) => oklabToRgb([clamp(v[0]), v[1], v[2]]),
  },
  oklch: {
    channels: [UNIT, { full: 0.4 }, 'hue'],
    toRgb: (v) => oklabToRgb(lchToLab([clamp(v[0]), Math.max(0, v[1]), v[2]])),
  },
  'device-cmyk': {
    channels: [UNIT, UNIT, UNIT, UNIT],
    toRgb: (v) => {
      const [c, m, y, k] = v.map((value) => clamp(value));
      return [
        1 - Math.min(1, c * (1 - k) + k),
        1 - Math.min(1, m * (1 - k) + k),
        1 - Math.min(1, y * (1 - k) + k),
      ];
    },
  },
};
FUNCTIONS.rgba = FUNCTIONS.rgb;
FUNCTIONS.hsla = FUNCTIONS.hsl;
FUNCTIONS.cmyk = FUNCTIONS['device-cmyk'];

/** Predefined spaces for `color(<space> r g b)`. */
const SPACES: Record<string, (v: Vec3) => Vec3> = {
  srgb: (v) => v,
  'srgb-linear': linearSrgbToRgb,
  'display-p3': p3ToRgb,
  xyz: xyzD65ToRgb,
  'xyz-d65': xyzD65ToRgb,
  'xyz-d50': xyzD50ToRgb,
};

/** Splits `a b c / d` or `a, b, c, d` into components and the alpha (if any). */
function splitArguments(body: string): { parts: string[]; alpha?: string } | null {
  const trimmed = body.trim();
  if (trimmed.includes(',')) {
    if (trimmed.includes('/')) return null;
    return { parts: trimmed.split(',').map((part) => part.trim()) };
  }
  const [main, alpha, extra] = trimmed.split('/');
  if (extra !== undefined || (alpha !== undefined && alpha.trim() === '')) return null;
  return { parts: main.trim().split(/\s+/).filter(Boolean), alpha: alpha?.trim() };
}

function readAlpha(text: string | undefined): number | null {
  if (text === undefined) return 1;
  const token = readToken(text);
  if (!token || (token.unit !== '' && token.unit !== '%' && token.unit !== 'none')) return null;
  return clamp(token.unit === '%' ? token.value / 100 : token.value);
}

function parseHex(hex: string): ParseColorResult {
  const digits = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join('') : hex;
  const byte = (i: number) => parseInt(digits.slice(i * 2, i * 2 + 2), 16) / 255;
  return {
    ok: true,
    color: { rgb: [byte(0), byte(1), byte(2)], alpha: digits.length === 8 ? byte(3) : 1 },
  };
}

function parseFunction(name: string, body: string): ParseColorResult {
  const args = splitArguments(body);
  if (!args) return invalid(`Mix of commas and slashes in ${name}()`);
  let { parts, alpha } = args;

  let fn = FUNCTIONS[name];
  let space: ((v: Vec3) => Vec3) | undefined;
  if (name === 'color') {
    const spaceName = parts[0]?.toLowerCase() ?? '';
    space = SPACES[spaceName];
    if (!space) return invalid(`Unsupported color space "${parts[0] ?? ''}" in color()`);
    parts = parts.slice(1);
    fn = { channels: [UNIT, UNIT, UNIT], toRgb: (v) => space!(v as Vec3) };
  }
  if (!fn) return invalid(`Unknown color function ${name}()`);

  const count = fn.channels.length;
  // The legacy comma syntax puts alpha last instead of after a slash.
  if (alpha === undefined && parts.length === count + 1) alpha = parts.pop();
  if (parts.length !== count) {
    return invalid(`${name}() needs ${count} values, got ${parts.length}`);
  }
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    const token = readToken(parts[i]);
    const value = token && channelValue(token, fn.channels[i]);
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return invalid(`Invalid value "${parts[i]}" in ${name}()`);
    }
    values.push(value);
  }
  const alphaValue = readAlpha(alpha);
  if (alphaValue === null) return invalid(`Invalid alpha "${alpha}" in ${name}()`);
  return { ok: true, color: { rgb: fn.toRgb(values), alpha: alphaValue } };
}

/**
 * Any CSS color: hex (with or without `#`), a named color, `transparent`, `rgb()`, `hsl()`,
 * `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()` (srgb, srgb-linear, display-p3,
 * xyz) and `device-cmyk()`, in both the modern and the legacy comma syntax.
 */
export function parseColor(input: string): ParseColorResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  if (lower === '') return invalid('Enter a color');
  if (lower === 'transparent') return { ok: true, color: { rgb: [0, 0, 0], alpha: 0 } };
  const named = NAMED_COLORS.get(lower);
  if (named) return parseHex(named);

  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
  if (hex) return parseHex(hex[1].toLowerCase());
  if (text.startsWith('#')) return invalid('A hex color has 3, 4, 6 or 8 digits');

  const call = /^([a-z-]+)\(([^()]*)\)$/i.exec(text);
  if (call) return parseFunction(call[1].toLowerCase(), call[2]);
  return invalid(`Not a color: "${text}"`);
}
