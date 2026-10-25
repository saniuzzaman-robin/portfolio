import { describe, it, expect } from 'vitest';
import { parseColor } from '@/lib/tools/color/parse';
import {
  COLOR_FORMATS,
  colorName,
  formatColor,
  gamutOf,
  tintsAndShades,
  toHex,
} from '@/lib/tools/color/format';
import {
  inGamut,
  labToLch,
  rgbToOklab,
  rgbToP3,
  p3ToRgb,
  toGamut,
  type Color,
} from '@/lib/tools/color/convert';
import { apcaContrast, apcaLevel, wcagContrast } from '@/lib/tools/color/contrast';
import { NAMED_COLORS } from '@/lib/tools/color/named';

function parse(text: string): Color {
  const result = parseColor(text);
  if (!result.ok) throw new Error(result.message);
  return result.color;
}

const formats = (text: string, legacy = false) =>
  Object.fromEntries(
    COLOR_FORMATS.map((format) => [format, formatColor(parse(text), format, { legacy })])
  );

describe('parseColor', () => {
  it.each([
    ['#f00', '#ff0000'],
    ['F00', '#ff0000'],
    ['#ff000080', '#ff0000'],
    ['RED', '#ff0000'],
    ['rebeccapurple', '#663399'],
    ['rgb(255,0,0)', '#ff0000'],
    ['rgba(100%, 50%, 0%, .5)', '#ff8000'],
    ['rgb(300 -20 0)', '#ff0000'],
    ['hsl(120deg 100% 25%)', '#008000'],
    ['hsla(240, 100%, 50%, 0.3)', '#0000ff'],
    ['hsl(0.5turn 100 50)', '#00ffff'],
    ['hwb(0 0% 0%)', '#ff0000'],
    ['hwb(0 60% 60%)', '#808080'],
    ['oklch(62.7955% 0.257683 29.2339)', '#ff0000'],
    ['oklab(0.627955 0.224863 0.125846)', '#ff0000'],
    ['oklch(1 0 none)', '#ffffff'],
    ['lab(54.2905% 80.8049 69.891)', '#ff0000'],
    ['lch(54.2905 106.8372 40.8526)', '#ff0000'],
    ['color(srgb 1 0.5 0)', '#ff8000'],
    ['color(srgb-linear 1 0.215861 0)', '#ff8000'],
    ['color(xyz-d65 0.95046 1 1.08906)', '#ffffff'],
    ['color(xyz-d50 0.96422 1 0.82521)', '#ffffff'],
    ['device-cmyk(0% 100% 100% 0%)', '#ff0000'],
    ['device-cmyk(0 0 0 0.5)', '#808080'],
  ])('%s', (input, hex) => {
    expect(toHex(parse(input))).toBe(hex);
  });

  it('reads alpha in every syntax', () => {
    expect(parse('#ff000080').alpha).toBeCloseTo(128 / 255);
    expect(parse('rgb(0 0 0 / 25%)').alpha).toBe(0.25);
    expect(parse('rgba(0, 0, 0, 0.4)').alpha).toBe(0.4);
    expect(parse('transparent')).toEqual({ rgb: [0, 0, 0], alpha: 0 });
  });

  it.each([
    ['', 'Enter a color'],
    ['#12', 'A hex color has 3, 4, 6 or 8 digits'],
    ['nope', 'Not a color: "nope"'],
    ['foo(1 2 3)', 'Unknown color function foo()'],
    ['rgb(1 2)', 'rgb() needs 3 values, got 2'],
    ['rgb(1, 2 / 3)', 'Mix of commas and slashes in rgb()'],
    ['hsl(10% 50% 50%)', 'Invalid value "10%" in hsl()'],
    ['rgb(1 2 3 / x)', 'Invalid alpha "x" in rgb()'],
    ['color(rec2020 1 0 0)', 'Unsupported color space "rec2020" in color()'],
  ])('rejects %j', (input, message) => {
    expect(parseColor(input)).toEqual({ ok: false, message });
  });

  it('has all 148 named colors', () => {
    expect(NAMED_COLORS.size).toBe(148);
  });
});

describe('formatColor', () => {
  it('writes every format', () => {
    expect(formats('red')).toEqual({
      hex: '#ff0000',
      hex8: '#ff0000ff',
      rgb: 'rgb(255 0 0)',
      hsl: 'hsl(0 100% 50%)',
      hwb: 'hwb(0 0% 0%)',
      oklch: 'oklch(62.8% 0.25768 29.23)',
      oklab: 'oklab(62.8% 0.22486 0.12585)',
      cmyk: 'device-cmyk(0% 100% 100% 0%)',
    });
    expect(formats('rgb(0 0 255 / 0.5)', true)).toMatchObject({
      hex8: '#0000ff80',
      rgb: 'rgba(0, 0, 255, 0.5)',
      hsl: 'hsla(240, 100%, 50%, 0.5)',
      hwb: 'hwb(240 0% 0% / 0.5)',
    });
    expect(formatColor(parse('white'), 'oklch', { legacy: false })).toBe('oklch(100% 0 0)');
  });

  it('round-trips 8-bit colors through every format', () => {
    for (let i = 0; i < 500; i++) {
      const hex = `#${Math.floor(Math.random() * 0x1000000)
        .toString(16)
        .padStart(6, '0')}`;
      for (const format of COLOR_FORMATS) {
        expect([format, toHex(parse(formatColor(parse(hex), format, { legacy: false })))]).toEqual([
          format,
          hex,
        ]);
      }
    }
  });

  it('names exact named colors only', () => {
    expect(colorName(parse('#00ffff'))).toBe('aqua');
    expect(colorName(parse('#00fffe'))).toBeUndefined();
    expect(colorName(parse('#00ffff80'))).toBeUndefined();
  });
});

describe('gamut', () => {
  it('classifies sRGB, P3 and wider colors', () => {
    expect(gamutOf(parse('#ff0000'))).toBe('srgb');
    expect(gamutOf(parse('color(display-p3 1 0 0)'))).toBe('p3');
    expect(gamutOf(parse('oklch(0.7 0.4 150)'))).toBe('wider');
  });

  it('converts P3 both ways', () => {
    const rgb = p3ToRgb([1, 0, 0]);
    rgbToP3(rgb).forEach((value, i) => expect(value).toBeCloseTo([1, 0, 0][i], 9));
  });

  it('maps out-of-gamut colors into sRGB at the same lightness and hue', () => {
    const color = parse('oklch(0.7 0.4 150)');
    const mapped = toGamut(color.rgb);
    expect(inGamut(mapped)).toBe(true);
    const [l, c, h] = labToLch(rgbToOklab(mapped));
    expect(l).toBeCloseTo(0.7, 1);
    expect(h).toBeCloseTo(150, -1);
    expect(c).toBeLessThan(0.4);
    expect(toGamut([0.2, 0.4, 0.6])).toEqual([0.2, 0.4, 0.6]);
  });

  it('builds tints and shades around the color', () => {
    const steps = tintsAndShades(parse('#3366cc'));
    expect(steps).toHaveLength(9);
    expect(toHex(steps[4].color)).toBe('#3366cc');
    expect(steps.map((step) => step.mix)).toEqual([0.8, 0.6, 0.4, 0.2, 0, 0.2, 0.4, 0.6, 0.8]);
    const lightness = steps.map((step) => rgbToOklab(step.color.rgb)[0]);
    for (let i = 1; i < lightness.length; i++) expect(lightness[i]).toBeLessThan(lightness[i - 1]);
  });
});

describe('contrast', () => {
  it('WCAG 2 ratio', () => {
    expect(wcagContrast(parse('black'), parse('white'))).toBeCloseTo(21, 6);
    expect(wcagContrast(parse('white'), parse('black'))).toBeCloseTo(21, 6);
    expect(wcagContrast(parse('#777'), parse('#fff'))).toBeCloseTo(4.48, 2);
    expect(wcagContrast(parse('#000'), parse('#000'))).toBe(1);
  });

  it('blends translucent text over the background', () => {
    expect(wcagContrast(parse('rgb(0 0 0 / 0)'), parse('white'))).toBeCloseTo(1, 6);
    expect(wcagContrast(parse('rgb(0 0 0 / 0.5)'), parse('white'))).toBeCloseTo(
      wcagContrast(parse('#808080'), parse('white')),
      1
    );
  });

  it('APCA Lc matches the reference implementation', () => {
    expect(apcaContrast(parse('#888'), parse('#fff'))).toBeCloseTo(63.056469930209424, 6);
    expect(apcaContrast(parse('#fff'), parse('#888'))).toBeCloseTo(-68.54146436644962, 6);
    expect(apcaContrast(parse('#000'), parse('#fff'))).toBeCloseTo(106.04067321268862, 6);
    expect(apcaContrast(parse('#fff'), parse('#000'))).toBeCloseTo(-107.88473318309848, 6);
    expect(apcaContrast(parse('#777'), parse('#777'))).toBe(0);
    expect(apcaLevel(63)).toBe('contentText');
    expect(apcaLevel(-80)).toBe('bodyText');
    expect(apcaLevel(10)).toBeNull();
  });
});
