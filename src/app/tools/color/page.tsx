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
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {/* HEX Input */}
          <ToolPanel
            label="HEX"
            accent="tertiary"
            action={<CopyButton text={hex} accent="tertiary" />}
          >
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="#000000"
              className="bg-neutral-15/40 border-tertiary-40/30 text-neutral-90 focus:border-tertiary-50/60 w-full rounded-sm border px-4 py-2 font-mono text-sm uppercase placeholder-neutral-50 transition-colors focus:outline-none"
            />
          </ToolPanel>

          {/* RGB Input */}
          {rgb && (
            <ToolPanel
              label="RGB"
              accent="tertiary"
              action={<CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} accent="tertiary" />}
            >
              <div className="text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 px-4 py-2 font-mono text-sm">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </div>
            </ToolPanel>
          )}

          {/* HSL Input */}
          {hsl && (
            <ToolPanel
              label="HSL"
              accent="tertiary"
              action={<CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} accent="tertiary" />}
            >
              <div className="text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 px-4 py-2 font-mono text-sm">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
            </ToolPanel>
          )}
        </div>

        {/* Color Picker */}
        <div className="mb-6 flex items-end gap-4">
          <div>
            <label className="font-space-grotesk text-neutral-60 mb-2 block text-xs font-bold tracking-widest uppercase">
              Color Picker
            </label>
            <input
              ref={pickerRef}
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-12 w-16 cursor-pointer rounded-sm border border-white/10"
            />
          </div>

          <div
            className="h-12 w-20 rounded-sm border border-white/10"
            style={{ background: hex }}
          />

          <button
            onClick={generatePalette}
            className="font-space-grotesk flex cursor-pointer items-center gap-2 rounded-sm border border-purple-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap className="h-4 w-4" />
            Generate Palette
          </button>
        </div>

        {/* Palette shades */}
        {shades.length > 0 && (
          <div className="mt-6">
            <h3 className="font-space-grotesk text-neutral-90 mb-4 text-sm font-bold">
              Shade Palette
            </h3>
            <div className="grid gap-3 md:grid-cols-5">
              {shades.map((shade, i) => (
                <div
                  key={i}
                  className="group cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(shade);
                  }}
                >
                  <div
                    className="h-20 w-full rounded-sm border border-white/10 transition-all group-hover:border-white/30"
                    style={{ background: shade }}
                  />
                  <div className="text-neutral-60 group-hover:text-neutral-80 mt-2 text-center font-mono text-[10px] transition-colors">
                    {shade}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversions display */}
        {showConversions && rgb && hsl && (
          <div className="bg-neutral-10/40 mt-8 rounded-sm border border-white/5 p-4">
            <h4 className="font-space-grotesk text-neutral-60 mb-3 text-xs font-bold tracking-widest uppercase">
              All Formats
            </h4>
            <div className="text-neutral-70 space-y-2 font-mono text-xs">
              <div>HEX: {hex}</div>
              <div>
                RGB: rgb({rgb.r}, {rgb.g}, {rgb.b})
              </div>
              <div>
                HSL: hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
            </div>
          </div>
        )}
      </ToolShell>
    </>
  );
}
