import {
  inGamut,
  inP3Gamut,
  labToLch,
  mixOklab,
  rgbToHsl,
  rgbToHwb,
  rgbToOklab,
  toGamut,
  type Color,
  type Vec3,
} from './convert';
import { nameOfHex } from './named';

export const COLOR_FORMATS = [
  'hex',
  'hex8',
  'rgb',
  'hsl',
  'hwb',
  'oklch',
  'oklab',
  'cmyk',
] as const;
export type ColorFormat = (typeof COLOR_FORMATS)[number];

export type FormatColorOptions = {
  /** `rgba(255, 0, 0, 0.5)` instead of `rgb(255 0 0 / 0.5)` (rgb and hsl only). */
  legacy: boolean;
};

/** Rounds to `digits` decimals without trailing zeros or "-0". */
function num(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

const percent = (value: number, digits = 2) => `${num(value * 100, digits)}%`;

/** The sRGB values to display: gamut-mapped, so out-of-gamut colors stay faithful in hue. */
export function displayRgb(color: Color): Vec3 {
  return toGamut(color.rgb);
}

/** 0–255 channels of the displayed color. */
export function rgb8(color: Color): Vec3 {
  return displayRgb(color).map((c) => Math.round(c * 255)) as Vec3;
}

const byteHex = (value: number) => value.toString(16).padStart(2, '0');

/** `#rrggbb` (alpha dropped). */
export function toHex(color: Color): string {
  return `#${rgb8(color).map(byteHex).join('')}`;
}

function modern(name: string, parts: string[], alpha: number): string {
  return `${name}(${parts.join(' ')}${alpha < 1 ? ` / ${num(alpha, 3)}` : ''})`;
}

function legacy(name: string, parts: string[], alpha: number): string {
  return alpha < 1
    ? `${name}a(${[...parts, num(alpha, 3)].join(', ')})`
    : `${name}(${parts.join(', ')})`;
}

export function formatColor(
  color: Color,
  format: ColorFormat,
  options: FormatColorOptions
): string {
  const { alpha } = color;
  const write = options.legacy ? legacy : modern;
  switch (format) {
    case 'hex':
      return toHex(color);
    case 'hex8':
      return toHex(color) + byteHex(Math.round(alpha * 255));
    case 'rgb':
      return write('rgb', rgb8(color).map(String), alpha);
    case 'hsl': {
      const [h, s, l] = rgbToHsl(displayRgb(color));
      return write('hsl', [num(h, 2), percent(s), percent(l)], alpha);
    }
    case 'hwb': {
      const [h, w, b] = rgbToHwb(displayRgb(color));
      return modern('hwb', [num(h, 2), percent(w), percent(b)], alpha);
    }
    // OKLab and OKLCH can express every color, so they show the original, unmapped. This
    // precision is the least that brings every 8-bit color back exactly.
    case 'oklch': {
      const [l, c, h] = labToLch(rgbToOklab(color.rgb));
      return modern('oklch', [percent(l, 2), num(c, 5), num(h, 2)], alpha);
    }
    case 'oklab': {
      const [l, a, b] = rgbToOklab(color.rgb);
      return modern('oklab', [percent(l, 2), num(a, 5), num(b, 5)], alpha);
    }
    case 'cmyk': {
      const [r, g, b] = displayRgb(color);
      const k = 1 - Math.max(r, g, b);
      const ink = (c: number) => (k >= 1 ? 0 : (1 - c - k) / (1 - k));
      return modern(
        'device-cmyk',
        [ink(r), ink(g), ink(b), k].map((v) => percent(v, 1)),
        alpha
      );
    }
  }
}

/** Which gamut a color fits: sRGB (any screen), Display P3 (most recent screens) or wider. */
export type Gamut = 'srgb' | 'p3' | 'wider';

export function gamutOf(color: Color): Gamut {
  if (inGamut(color.rgb)) return 'srgb';
  return inP3Gamut(color.rgb) ? 'p3' : 'wider';
}

/** The CSS name of an opaque, in-gamut color with exactly that value, if it has one. */
export function colorName(color: Color): string | undefined {
  if (color.alpha < 1 || !inGamut(color.rgb)) return undefined;
  return nameOfHex(toHex(color).slice(1));
}

const WHITE: Color = { rgb: [1, 1, 1], alpha: 1 };
const BLACK: Color = { rgb: [0, 0, 0], alpha: 1 };

export type ScaleStep = { color: Color; mix: number; toward: 'white' | 'black' | null };

/**
 * Tints and shades: the color mixed in OKLab with white (lightest first), itself, then with
 * black. `steps` per side, evenly spaced: 4 gives 80/60/40/20% white, base, 20…80% black.
 */
export function tintsAndShades(color: Color, steps = 4): ScaleStep[] {
  const opaque = { ...color, alpha: 1 };
  const amounts = Array.from({ length: steps }, (_, i) => (i + 1) / (steps + 1));
  return [
    ...[...amounts]
      .reverse()
      .map((mix) => ({ color: mixOklab(opaque, WHITE, mix), mix, toward: 'white' as const })),
    { color: opaque, mix: 0, toward: null },
    ...amounts.map((mix) => ({
      color: mixOklab(opaque, BLACK, mix),
      mix,
      toward: 'black' as const,
    })),
  ];
}
