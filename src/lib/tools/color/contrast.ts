import { toLinear, type Color, type Vec3 } from './convert';
import { rgb8 } from './format';

/**
 * Contrast is measured on the colors as displayed (gamut-mapped, 8 bits per channel), so the
 * numbers match other checkers for the same hex values. A translucent text color is blended
 * over the background first; a translucent background is assumed to sit on white.
 */
function blend(top: Vec3, alpha: number, bottom: Vec3): Vec3 {
  return top.map((c, i) => c * alpha + bottom[i] * (1 - alpha)) as Vec3;
}

function onScreen(text: Color, background: Color): { text: Vec3; background: Vec3 } {
  const unit = (color: Color) => rgb8(color).map((c) => c / 255) as Vec3;
  const bg = blend(unit(background), background.alpha, [1, 1, 1]);
  return { text: blend(unit(text), text.alpha, bg), background: bg };
}

/** WCAG 2.x relative luminance. */
function luminance([r, g, b]: Vec3): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio, 1–21. */
export function wcagContrast(text: Color, background: Color): number {
  const colors = onScreen(text, background);
  const a = luminance(colors.text);
  const b = luminance(colors.background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** WCAG 2.2 thresholds: 1.4.3 (AA), 1.4.6 (AAA) and 1.4.11 (non-text). */
export const WCAG_LEVELS = {
  aaLarge: 3,
  aa: 4.5,
  aaaLarge: 4.5,
  aaa: 7,
  ui: 3,
} as const;
export type WcagLevel = keyof typeof WCAG_LEVELS;

/** APCA-W3 0.0.98G-4g constants. */
const APCA = {
  exponent: 2.4,
  coefficients: [0.2126729, 0.7151522, 0.072175],
  normBg: 0.56,
  normText: 0.57,
  revText: 0.62,
  revBg: 0.65,
  blackThreshold: 0.022,
  blackClamp: 1.414,
  scale: 1.14,
  offset: 0.027,
  deltaYMin: 0.0005,
  lowClip: 0.1,
};

function apcaY(rgb: Vec3): number {
  return rgb.reduce((sum, c, i) => sum + APCA.coefficients[i] * c ** APCA.exponent, 0);
}

const softClamp = (y: number) =>
  y > APCA.blackThreshold ? y : y + (APCA.blackThreshold - y) ** APCA.blackClamp;

/**
 * APCA lightness contrast (Lc), about −108 to 106: positive for dark text on a light
 * background, negative for light text on dark. Unlike the WCAG ratio, the order matters.
 */
export function apcaContrast(text: Color, background: Color): number {
  const colors = onScreen(text, background);
  const textY = softClamp(apcaY(colors.text));
  const backgroundY = softClamp(apcaY(colors.background));
  if (Math.abs(backgroundY - textY) < APCA.deltaYMin) return 0;
  if (backgroundY > textY) {
    const sapc = (backgroundY ** APCA.normBg - textY ** APCA.normText) * APCA.scale;
    return sapc < APCA.lowClip ? 0 : (sapc - APCA.offset) * 100;
  }
  const sapc = (backgroundY ** APCA.revBg - textY ** APCA.revText) * APCA.scale;
  return sapc > -APCA.lowClip ? 0 : (sapc + APCA.offset) * 100;
}

/** APCA's suggested minimum |Lc| per use (from the "bronze" readability guidance). */
export const APCA_LEVELS = [
  ['bodyText', 75],
  ['contentText', 60],
  ['largeText', 45],
  ['spotText', 30],
  ['nonText', 15],
] as const;
export type ApcaLevel = (typeof APCA_LEVELS)[number][0];

/** The most demanding use this Lc is enough for, or null below 15. */
export function apcaLevel(lc: number): ApcaLevel | null {
  return APCA_LEVELS.find(([, min]) => Math.abs(lc) >= min)?.[0] ?? null;
}
