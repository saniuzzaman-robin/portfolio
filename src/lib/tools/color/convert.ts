/*
 * Color space math from CSS Color 4 (§ 18, "Sample code for color conversions"). Every color is
 * held as extended sRGB: gamma-encoded, 0–1 inside the sRGB gamut and beyond it outside, so wide
 * gamut inputs (display-p3, oklch…) convert back without loss. Only display output is mapped
 * into the gamut.
 */

export type Vec3 = [number, number, number];
type Matrix = [Vec3, Vec3, Vec3];

/** `rgb` is extended, gamma-encoded sRGB; `alpha` is 0–1. */
export type Color = { rgb: Vec3; alpha: number };

function multiply(m: Matrix, [x, y, z]: Vec3): Vec3 {
  return [
    m[0][0] * x + m[0][1] * y + m[0][2] * z,
    m[1][0] * x + m[1][1] * y + m[1][2] * z,
    m[2][0] * x + m[2][1] * y + m[2][2] * z,
  ];
}

/** Inverses are computed rather than copied, so each pair is consistent to the last digit. */
function invert(m: Matrix): Matrix {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const A = e * i - f * h;
  const B = f * g - d * i;
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [
    [A / det, (c * h - b * i) / det, (b * f - c * e) / det],
    [B / det, (a * i - c * g) / det, (c * d - a * f) / det],
    [C / det, (b * g - a * h) / det, (a * e - b * d) / det],
  ];
}

const LIN_SRGB_TO_XYZ: Matrix = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
];
const XYZ_TO_LIN_SRGB = invert(LIN_SRGB_TO_XYZ);

const LIN_P3_TO_XYZ: Matrix = [
  [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
  [35783 / 156275, 247089 / 357200, 198249 / 2500400],
  [0, 32229 / 714400, 5220557 / 5000800],
];
const XYZ_TO_LIN_P3 = invert(LIN_P3_TO_XYZ);

/** Bradford chromatic adaptation between the D65 (sRGB, OKLab) and D50 (CIE Lab) white points. */
const D65_TO_D50: Matrix = [
  [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
  [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
  [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
];
const D50_TO_D65 = invert(D65_TO_D50);
const D50_WHITE: Vec3 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];

/** Björn Ottosson's OKLab matrices: linear sRGB → LMS, and cube-rooted LMS → OKLab. */
const LIN_SRGB_TO_LMS: Matrix = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];
const LMS_TO_LIN_SRGB = invert(LIN_SRGB_TO_LMS);
const LMS_TO_OKLAB: Matrix = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];
const OKLAB_TO_LMS = invert(LMS_TO_OKLAB);

/** sRGB transfer function, mirrored for negative values (extended sRGB). Also used by P3. */
export function toLinear(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.04045 ? c / 12.92 : Math.sign(c) * ((abs + 0.055) / 1.055) ** 2.4;
}

export function fromLinear(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.0031308 ? c * 12.92 : Math.sign(c) * (1.055 * abs ** (1 / 2.4) - 0.055);
}

const mapVec = (v: Vec3, f: (c: number) => number): Vec3 => [f(v[0]), f(v[1]), f(v[2])];

export const linearSrgbToRgb = (linear: Vec3): Vec3 => mapVec(linear, fromLinear);
export const rgbToLinearSrgb = (rgb: Vec3): Vec3 => mapVec(rgb, toLinear);

export const xyzD65ToRgb = (xyz: Vec3): Vec3 => linearSrgbToRgb(multiply(XYZ_TO_LIN_SRGB, xyz));
export const rgbToXyzD65 = (rgb: Vec3): Vec3 => multiply(LIN_SRGB_TO_XYZ, rgbToLinearSrgb(rgb));
export const xyzD50ToRgb = (xyz: Vec3): Vec3 => xyzD65ToRgb(multiply(D50_TO_D65, xyz));

export const p3ToRgb = (p3: Vec3): Vec3 =>
  xyzD65ToRgb(multiply(LIN_P3_TO_XYZ, mapVec(p3, toLinear)));
export const rgbToP3 = (rgb: Vec3): Vec3 =>
  mapVec(multiply(XYZ_TO_LIN_P3, rgbToXyzD65(rgb)), fromLinear);

export function rgbToOklab(rgb: Vec3): Vec3 {
  return multiply(LMS_TO_OKLAB, mapVec(multiply(LIN_SRGB_TO_LMS, rgbToLinearSrgb(rgb)), Math.cbrt));
}

export function oklabToRgb(lab: Vec3): Vec3 {
  const lms = mapVec(multiply(OKLAB_TO_LMS, lab), (c) => c ** 3);
  return linearSrgbToRgb(multiply(LMS_TO_LIN_SRGB, lms));
}

/** Below this chroma the hue is meaningless (and printed as 0). */
const ACHROMATIC = 0.00005;

export function labToLch([l, a, b]: Vec3): Vec3 {
  const c = Math.hypot(a, b);
  const h = c < ACHROMATIC ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return [l, c, h];
}

export function lchToLab([l, c, h]: Vec3): Vec3 {
  const radians = (h * Math.PI) / 180;
  return [l, c * Math.cos(radians), c * Math.sin(radians)];
}

/** CIE Lab (D50, L 0–100) → sRGB. */
export function cieLabToRgb([l, a, b]: Vec3): Vec3 {
  const kappa = 24389 / 27;
  const epsilon = 216 / 24389;
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const xyz: Vec3 = [
    fx ** 3 > epsilon ? fx ** 3 : (116 * fx - 16) / kappa,
    l > kappa * epsilon ? fy ** 3 : l / kappa,
    fz ** 3 > epsilon ? fz ** 3 : (116 * fz - 16) / kappa,
  ];
  return xyzD50ToRgb([xyz[0] * D50_WHITE[0], xyz[1], xyz[2] * D50_WHITE[2]]);
}

export const normalizeHue = (h: number) => ((h % 360) + 360) % 360;

/** HSL (h in degrees, s and l 0–1) → sRGB, as in CSS Color 4. */
export function hslToRgb([h, s, l]: Vec3): Vec3 {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

/** Hue of an sRGB color, 0 when it has none. */
function hueOf([r, g, b]: Vec3, max: number, delta: number): number {
  if (delta < 1e-7) return 0;
  const h =
    max === r
      ? (g - b) / delta + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return normalizeHue(h * 60);
}

export function rgbToHsl(rgb: Vec3): Vec3 {
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const l = (max + min) / 2;
  const delta = max - min;
  const s = delta < 1e-7 || l <= 0 || l >= 1 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return [hueOf(rgb, max, delta), s, l];
}

/** HWB (whiteness and blackness 0–1); when they add up past 1 the result is a gray. */
export function hwbToRgb([h, w, b]: Vec3): Vec3 {
  if (w + b >= 1) {
    const gray = w / (w + b);
    return [gray, gray, gray];
  }
  return hslToRgb([h, 1, 0.5]).map((c) => c * (1 - w - b) + w) as Vec3;
}

export function rgbToHwb(rgb: Vec3): Vec3 {
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  return [hueOf(rgb, max, max - min), min, 1 - max];
}

/** HSV (h in degrees, s and v 0–1), for the picker's square. */
export function hsvToRgb([h, s, v]: Vec3): Vec3 {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5), f(3), f(1)];
}

export function rgbToHsv(rgb: Vec3): Vec3 {
  const max = Math.max(...rgb);
  const delta = max - Math.min(...rgb);
  return [hueOf(rgb, max, delta), max <= 0 ? 0 : delta / max, max];
}

/** Room for floating-point noise from round trips through other spaces. */
const GAMUT_EPSILON = 1e-5;

export function inGamut(rgb: Vec3): boolean {
  return rgb.every((c) => c >= -GAMUT_EPSILON && c <= 1 + GAMUT_EPSILON);
}

export function inP3Gamut(rgb: Vec3): boolean {
  return inGamut(rgbToP3(rgb));
}

const clip = (rgb: Vec3): Vec3 => mapVec(rgb, (c) => Math.min(1, Math.max(0, c)));
const deltaEOK = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * The CSS Color 4 gamut mapping (§ 13.2): lowers OKLCH chroma at constant lightness and hue
 * until clipping the result would no longer be noticeable (ΔEOK under 0.02).
 */
export function toGamut(rgb: Vec3): Vec3 {
  if (inGamut(rgb)) return clip(rgb);
  const [l, c, h] = labToLch(rgbToOklab(rgb));
  if (l >= 1) return [1, 1, 1];
  if (l <= 0) return [0, 0, 0];
  const JND = 0.02;
  const EPSILON = 0.0001;
  const at = (chroma: number) => lchToLab([l, chroma, h]);
  let clipped = clip(rgb);
  if (deltaEOK(rgbToOklab(clipped), at(c)) < JND) return clipped;
  let min = 0;
  let max = c;
  let minInGamut = true;
  while (max - min > EPSILON) {
    const chroma = (min + max) / 2;
    const current = oklabToRgb(at(chroma));
    if (minInGamut && inGamut(current)) {
      min = chroma;
      continue;
    }
    clipped = clip(current);
    const delta = deltaEOK(rgbToOklab(clipped), at(chroma));
    if (delta < JND) {
      if (JND - delta < EPSILON) break;
      minInGamut = false;
      min = chroma;
    } else {
      max = chroma;
    }
  }
  return clipped;
}

/** `color-mix(in oklab, a, b t)`: `t` is how much of `b` (0–1). Alpha is interpolated too. */
export function mixOklab(a: Color, b: Color, t: number): Color {
  const x = rgbToOklab(a.rgb);
  const y = rgbToOklab(b.rgb);
  const lab = x.map((value, i) => value + (y[i] - value) * t) as Vec3;
  return { rgb: oklabToRgb(lab), alpha: a.alpha + (b.alpha - a.alpha) * t };
}
