'use client';

import { useState, useRef } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, CopyButton } from '@/components/tools/tool-shell';
import { Palette, Zap } from 'lucide-react';

export default function ColorPage() {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState('#3B82F6');
  const [shades, setShades] = useState<string[]>([]);
  const [showConversions, setShowConversions] = useState(false);

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
    return `#${[r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`.toUpperCase();
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

  const generatePalette = () => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const palette = [];
    for (let i = 10; i <= 90; i += 10) {
      const f = i / 100;
      const r = Math.round(rgb.r + (255 - rgb.r) * f);
      const g = Math.round(rgb.g + (255 - rgb.g) * f);
      const b = Math.round(rgb.b + (255 - rgb.b) * f);
      palette.push(rgbToHex(r, g, b));
    }

    setShades(palette);
    setShowConversions(true);
  };

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  return (
    <>
      <Navigation />
      <ToolShell
        title="Color Converter"
        subtitle="HEX, RGB & HSL"
        description="Convert between HEX, RGB, and HSL color formats. Includes visual picker, palette generator, and shade variations."
        icon={Palette}
        accent="tertiary"
      >
        {/* Color input grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* HEX Input */}
          <ToolPanel label="HEX" accent="tertiary" action={<CopyButton text={hex} accent="tertiary" />}>
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="#000000"
              className="w-full px-4 py-2 text-sm font-mono bg-neutral-15/40 border border-tertiary-40/30 rounded-sm text-neutral-90 placeholder-neutral-50 focus:outline-none focus:border-tertiary-50/60 transition-colors uppercase"
            />
          </ToolPanel>

          {/* RGB Input */}
          {rgb && (
            <ToolPanel label="RGB" accent="tertiary" action={<CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} accent="tertiary" />}>
              <div className="px-4 py-2 text-sm font-mono text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </div>
            </ToolPanel>
          )}

          {/* HSL Input */}
          {hsl && (
            <ToolPanel label="HSL" accent="tertiary" action={<CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} accent="tertiary" />}>
              <div className="px-4 py-2 text-sm font-mono text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
            </ToolPanel>
          )}
        </div>

        {/* Color Picker */}
        <div className="flex items-end gap-4 mb-6">
          <div>
            <label className="block text-xs font-space-grotesk font-bold uppercase tracking-widest text-neutral-60 mb-2">
              Color Picker
            </label>
            <input
              ref={pickerRef}
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-16 h-12 rounded-sm cursor-pointer border border-white/10"
            />
          </div>

          <div
            className="w-20 h-12 rounded-sm border border-white/10"
            style={{ background: hex }}
          />

          <button
            onClick={generatePalette}
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm btn-neon-cyan"
          >
            <Zap className="w-4 h-4" />
            Generate Palette
          </button>
        </div>

        {/* Palette shades */}
        {shades.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-space-grotesk font-bold text-neutral-90 mb-4">Shade Palette</h3>
            <div className="grid md:grid-cols-5 gap-3">
              {shades.map((shade, i) => (
                <div
                  key={i}
                  className="group cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(shade);
                  }}
                >
                  <div
                    className="w-full h-20 rounded-sm border border-white/10 group-hover:border-white/30 transition-all"
                    style={{ background: shade }}
                  />
                  <div className="text-[10px] font-mono text-neutral-60 group-hover:text-neutral-80 text-center mt-2 transition-colors">
                    {shade}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversions display */}
        {showConversions && rgb && hsl && (
          <div className="mt-8 p-4 bg-neutral-10/40 rounded-sm border border-white/5">
            <h4 className="text-xs font-space-grotesk font-bold uppercase tracking-widest text-neutral-60 mb-3">All Formats</h4>
            <div className="space-y-2 text-xs font-mono text-neutral-70">
              <div>HEX: {hex}</div>
              <div>RGB: rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
              <div>HSL: hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
            </div>
          </div>
        )}
      </ToolShell>
    </>
  );
}
