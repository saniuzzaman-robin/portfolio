'use client';

import { useState, useRef } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, CopyButton } from '@/components/tools/tool-shell';
import { Palette, Zap, Copy, Check } from 'lucide-react';

export default function ColorPage() {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState('#3B82F6');
  const [palette, setPalette] = useState<string[]>([]);
  const [harmonies, setHarmonies] = useState<{ [key: string]: string }>({});
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [paletteFormat, setPaletteFormat] = useState<'hex-list' | 'css-vars' | 'json' | 'scss'>(
    'hex-list'
  );

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')}`.toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const rgbToCmyk = (
    r: number,
    g: number,
    b: number
  ): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  const generateColorHarmonies = (baseHex: string) => {
    const rgb = hexToRgb(baseHex);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const getHarmonyColor = (h: number): string => {
      const harmonyRgb = hslToRgb(h, hsl.s, hsl.l);
      return rgbToHex(harmonyRgb.r, harmonyRgb.g, harmonyRgb.b);
    };

    const harmonies: { [key: string]: string } = {
      complementary: getHarmonyColor((hsl.h + 180) % 360),
      triadic1: getHarmonyColor((hsl.h + 120) % 360),
      triadic2: getHarmonyColor((hsl.h + 240) % 360),
      analogous1: getHarmonyColor((hsl.h + 30) % 360),
      analogous2: getHarmonyColor((hsl.h - 30 + 360) % 360),
    };

    setHarmonies(harmonies);
  };

  const generatePalette = () => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const shades = [];
    // Darker shades
    for (let i = 90; i >= 10; i -= 10) {
      const f = i / 100;
      const r = Math.round(rgb.r * f);
      const g = Math.round(rgb.g * f);
      const b = Math.round(rgb.b * f);
      shades.push(rgbToHex(r, g, b));
    }
    // Lighter shades
    for (let i = 10; i <= 90; i += 10) {
      const f = i / 100;
      const r = Math.round(rgb.r + (255 - rgb.r) * f);
      const g = Math.round(rgb.g + (255 - rgb.g) * f);
      const b = Math.round(rgb.b + (255 - rgb.b) * f);
      shades.push(rgbToHex(r, g, b));
    }

    setPalette(shades);
    generateColorHarmonies(hex);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const generatePaletteCode = (format: 'hex-list' | 'css-vars' | 'json' | 'scss'): string => {
    switch (format) {
      case 'hex-list':
        return palette.join('\n');
      case 'css-vars':
        return palette.map((color, i) => `--color-${i + 1}: ${color};`).join('\n');
      case 'json':
        return JSON.stringify(palette, null, 2);
      case 'scss':
        return palette.map((color, i) => `$color-${i + 1}: ${color};`).join('\n');
      default:
        return palette.join('\n');
    }
  };

  const copyPaletteCode = () => {
    const code = generatePaletteCode(paletteFormat);
    copyToClipboard(code);
  };

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const cmyk = rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null;

  return (
    <>
      <Navigation />
      <ToolShell
        title="Color Converter"
        subtitle="HEX, RGB, HSL, CMYK & More"
        description="Advanced color tool with format conversions, palette generation, color harmony suggestions, and visual previews."
        icon={Palette}
        accent="secondary"
      >
        {/* Main color display */}
        <div className="mb-10 rounded-xl border border-white/10 bg-linear-to-b from-white/5 to-transparent p-6">
          <div className="grid items-end gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Color Picker */}
            <div className="md:col-span-1">
              <label className="font-poppins text-midnight-500 mb-3 block text-xs font-bold tracking-widest uppercase lg:text-sm">
                Pick Color
              </label>
              <div className="relative overflow-hidden rounded-xl shadow-xl">
                <input
                  ref={pickerRef}
                  type="color"
                  value={hex}
                  onChange={(e) => {
                    setHex(e.target.value);
                    generateColorHarmonies(e.target.value);
                  }}
                  className="h-28 w-full cursor-pointer border-0 transition-transform outline-none hover:scale-105"
                />
              </div>
            </div>

            {/* HEX Input */}
            <div className="md:col-span-1">
              <label className="font-poppins text-midnight-500 mb-3 block text-xs font-bold tracking-widest uppercase lg:text-sm">
                HEX Code
              </label>
              <button
                onClick={() => copyToClipboard(hex)}
                className="group relative w-full cursor-pointer"
              >
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value) || e.target.value.length === 0) {
                      setHex(e.target.value || hex);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        generateColorHarmonies(e.target.value);
                      }
                    }
                  }}
                  placeholder="#000000"
                  className="bg-midnight-100/40 text-midnight-900 w-full rounded-lg border-2 border-cyan-400/30 px-4 py-3 font-mono text-sm uppercase transition-colors group-hover:border-cyan-400/50 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none"
                />
                <Copy className="text-midnight-500 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100" />
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={generatePalette}
              className="font-poppins flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-cyan-600 bg-linear-to-r from-cyan-600/20 to-cyan-500/10 px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all hover:border-cyan-500 hover:from-cyan-600/30 hover:to-cyan-500/20 active:scale-95 md:col-span-1 lg:text-sm"
            >
              <Zap className="h-4 w-4" />
              Generate
            </button>
          </div>
        </div>

        {/* Format conversions grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* HEX */}
          <ToolPanel
            label="HEX"
            accent="secondary"
            action={<CopyButton text={hex} accent="secondary" />}
          >
            <div className="space-y-3">
              <button
                onClick={() => copyToClipboard(hex)}
                className="group relative w-full cursor-pointer"
              >
                <div className="text-midnight-900 bg-midnight-100/40 group-hover:bg-midnight-100/60 rounded-lg border-2 border-white/10 px-4 py-3 font-mono text-sm transition-all group-hover:border-white/30">
                  {hex}
                </div>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  {copiedColor === hex ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="text-midnight-500 h-4 w-4" />
                  )}
                </div>
              </button>
              <div
                className="h-12 rounded-lg border-2 border-white/10"
                style={{ background: hex }}
              />
            </div>
          </ToolPanel>

          {/* RGB */}
          {rgb && (
            <ToolPanel
              label="RGB"
              accent="secondary"
              action={<CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} accent="secondary" />}
            >
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                  className="group relative w-full cursor-pointer"
                >
                  <div className="text-midnight-700 bg-midnight-100/40 group-hover:bg-midnight-100/60 rounded-lg border-2 border-white/10 px-4 py-3 font-mono text-sm transition-all group-hover:border-white/30">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    {copiedColor === `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="text-midnight-500 h-4 w-4" />
                    )}
                  </div>
                </button>
                <div
                  className="h-12 rounded-lg border-2 border-white/10"
                  style={{ background: hex }}
                />
              </div>
            </ToolPanel>
          )}

          {/* HSL */}
          {hsl && (
            <ToolPanel
              label="HSL"
              accent="secondary"
              action={
                <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} accent="secondary" />
              }
            >
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                  className="group relative w-full cursor-pointer"
                >
                  <div className="text-midnight-700 bg-midnight-100/40 group-hover:bg-midnight-100/60 rounded-lg border-2 border-white/10 px-4 py-3 font-mono text-sm transition-all group-hover:border-white/30">
                    hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                  </div>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    {copiedColor === `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="text-midnight-500 h-4 w-4" />
                    )}
                  </div>
                </button>
                <div
                  className="h-12 rounded-lg border-2 border-white/10"
                  style={{ background: hex }}
                />
              </div>
            </ToolPanel>
          )}

          {/* CMYK */}
          {cmyk && (
            <ToolPanel
              label="CMYK"
              accent="secondary"
              action={
                <CopyButton
                  text={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
                  accent="secondary"
                />
              }
            >
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(`${cmyk.c}% ${cmyk.m}% ${cmyk.y}% ${cmyk.k}%`)}
                  className="group relative w-full cursor-pointer"
                >
                  <div className="text-midnight-700 bg-midnight-100/40 group-hover:bg-midnight-100/60 rounded-lg border-2 border-white/10 px-4 py-3 font-mono text-sm transition-all group-hover:border-white/30">
                    {cmyk.c}% {cmyk.m}% {cmyk.y}% {cmyk.k}%
                  </div>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    {copiedColor === `${cmyk.c}% ${cmyk.m}% ${cmyk.y}% ${cmyk.k}%` ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="text-midnight-500 h-4 w-4" />
                    )}
                  </div>
                </button>
                <div
                  className="h-12 rounded-lg border-2 border-white/10"
                  style={{ background: hex }}
                />
              </div>
            </ToolPanel>
          )}

          {/* Decimal RGB */}
          {rgb && (
            <ToolPanel
              label="Decimal"
              accent="secondary"
              action={
                <CopyButton text={`${rgb.r * 65536 + rgb.g * 256 + rgb.b}`} accent="secondary" />
              }
            >
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(`${rgb.r * 65536 + rgb.g * 256 + rgb.b}`)}
                  className="group relative w-full cursor-pointer"
                >
                  <div className="text-midnight-700 bg-midnight-100/40 group-hover:bg-midnight-100/60 rounded-lg border-2 border-white/10 px-4 py-3 font-mono text-sm transition-all group-hover:border-white/30">
                    {rgb.r * 65536 + rgb.g * 256 + rgb.b}
                  </div>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    {copiedColor === `${rgb.r * 65536 + rgb.g * 256 + rgb.b}` ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="text-midnight-500 h-4 w-4" />
                    )}
                  </div>
                </button>
                <div
                  className="h-12 rounded-lg border-2 border-white/10"
                  style={{ background: hex }}
                />
              </div>
            </ToolPanel>
          )}
        </div>

        {/* Color harmonies */}
        {Object.keys(harmonies).length > 0 && (
          <div className="mb-8">
            <h3 className="font-poppins text-midnight-900 mb-4 text-sm font-bold uppercase">
              Color Harmonies
            </h3>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
              {[
                { name: 'Base', color: hex },
                { name: 'Complementary', color: harmonies.complementary },
                { name: 'Triadic 1', color: harmonies.triadic1 },
                { name: 'Triadic 2', color: harmonies.triadic2 },
                { name: 'Analogous 1', color: harmonies.analogous1 },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => copyToClipboard(item.color)}
                  className="group cursor-pointer rounded-sm border border-white/10 transition-all hover:border-white/30"
                >
                  <div className="h-16 w-full rounded-t-sm" style={{ background: item.color }} />
                  <div className="bg-midnight-100/40 flex items-center justify-between rounded-b-sm px-2 py-2">
                    <div className="text-midnight-500 group-hover:text-midnight-950 font-mono text-[10px] transition-colors">
                      {item.color}
                    </div>
                    {copiedColor === item.color ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="text-midnight-500 group-hover:text-midnight-300 h-3 w-3" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Palette shades */}
        {palette.length > 0 && (
          <div className="mb-8">
            <h3 className="font-poppins text-midnight-900 mb-4 text-sm font-bold uppercase">
              Shade Palette
            </h3>
            <div className="grid gap-2 md:grid-cols-10">
              {palette.map((shade, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-sm border border-white/10 transition-all hover:border-white/30"
                >
                  <div className="h-12 w-full" style={{ background: shade }} />
                  <button
                    onClick={() => copyToClipboard(shade)}
                    className="group bg-midnight-100/40 hover:bg-midnight-100/60 relative w-full cursor-pointer px-2 py-1.5 text-center transition-all"
                  >
                    <div className="text-midnight-500 group-hover:text-midnight-950 font-mono text-[9px] transition-colors">
                      {shade}
                    </div>
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      {copiedColor === shade ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="text-midnight-500 h-3 w-3" />
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Copy Palette Code */}
            <div className="bg-midnight-100/40 mt-6 rounded-lg border border-white/10 p-4">
              <p className="font-poppins text-midnight-500 mb-3 text-xs font-bold tracking-widest uppercase lg:text-sm">
                Copy Palette Code
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {(['hex-list', 'css-vars', 'json', 'scss'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setPaletteFormat(fmt)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold uppercase transition-colors lg:text-sm ${
                      paletteFormat === fmt
                        ? 'border-cyan-500 bg-cyan-600/20 text-cyan-300'
                        : 'text-midnight-400 hover:text-midnight-300 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {fmt === 'hex-list'
                      ? 'List'
                      : fmt === 'css-vars'
                        ? 'CSS'
                        : fmt === 'json'
                          ? 'JSON'
                          : 'SCSS'}
                  </button>
                ))}
              </div>
              <div className="bg-midnight-100/60 text-midnight-400 mb-3 max-h-48 overflow-y-auto rounded-md border border-white/5 p-3 font-mono text-xs lg:text-sm">
                <pre className="whitespace-pre-wrap">{generatePaletteCode(paletteFormat)}</pre>
              </div>
              <button
                onClick={copyPaletteCode}
                className="font-poppins flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-cyan-600/50 bg-cyan-600/10 px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all hover:border-cyan-500 hover:bg-cyan-600/20 lg:text-sm"
              >
                {copiedColor === generatePaletteCode(paletteFormat) ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Palette Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info section */}
        <div className="bg-midnight-100/40 rounded-sm border border-white/5 p-4">
          <p className="font-poppins text-midnight-500 mb-2 text-xs font-bold tracking-widest uppercase lg:text-sm">
            ℹ Tips:
          </p>
          <ul className="text-midnight-700 space-y-1 text-xs lg:text-sm">
            <li>• Click any color preview to copy to clipboard</li>
            <li>• Use the color picker or enter HEX values directly</li>
            <li>• Palette shows darker and lighter variations of your color</li>
            <li>• Color harmonies help create complementary and triadic schemes</li>
          </ul>
        </div>
      </ToolShell>
    </>
  );
}
