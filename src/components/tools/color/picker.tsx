'use client';

import { useRef } from 'react';
import type { Vec3 } from '@/lib/tools/color/convert';
import { useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';

/** Hue, saturation and value (0–360, 0–1, 0–1) plus alpha: what the picker edits. */
export type PickerValue = { hsv: Vec3; alpha: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const step = (event: React.KeyboardEvent) => (event.shiftKey ? 0.1 : 0.01);

const THUMB =
  'pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_3px_rgb(0_0_0/0.4)]';
const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Calls `onMove` with the pointer's position inside `element` (0–1 on each axis) while dragging. */
function usePointerDrag(onMove: (x: number, y: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (event: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    onMove(
      clamp01((event.clientX - rect.left) / rect.width),
      clamp01((event.clientY - rect.top) / rect.height)
    );
  };
  return {
    ref,
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus();
      move(event);
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event);
    },
  };
}

/** Saturation (x) and brightness (y) square for the current hue. */
function SaturationArea({
  value,
  onChange,
}: {
  value: PickerValue;
  onChange: (value: PickerValue) => void;
}) {
  const t = useToolMessages<'color'>();
  const [h, s, v] = value.hsv;
  const set = (saturation: number, brightness: number) =>
    onChange({ ...value, hsv: [h, clamp01(saturation), clamp01(brightness)] });
  const drag = usePointerDrag((x, y) => set(x, 1 - y));

  const onKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step(event), 0],
      ArrowRight: [step(event), 0],
      ArrowUp: [0, step(event)],
      ArrowDown: [0, -step(event)],
    };
    const delta = moves[event.key];
    if (!delta) return;
    event.preventDefault();
    set(s + delta[0], v + delta[1]);
  };

  return (
    <div
      {...drag}
      role="slider"
      tabIndex={0}
      aria-label={t.saturation}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(s * 100)}
      aria-valuetext={fmt(t.saturationValue, {
        saturation: Math.round(s * 100),
        brightness: Math.round(v * 100),
      })}
      onKeyDown={onKeyDown}
      className={cn('relative h-40 w-full cursor-crosshair touch-none rounded-md', FOCUS)}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h} 100% 50%))`,
      }}
    >
      <span className={THUMB} style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }} />
    </div>
  );
}

/** Horizontal slider over a gradient track (hue or opacity). */
function TrackSlider({
  label,
  value,
  max,
  onChange,
  valueText,
  track,
  checker,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  valueText: string;
  track: string;
  checker?: boolean;
}) {
  const set = (next: number) => onChange(Math.min(max, Math.max(0, next)));
  const drag = usePointerDrag((x) => set(x * max));
  const onKeyDown = (event: React.KeyboardEvent) => {
    const amount = step(event) * max;
    const keys: Record<string, number> = {
      ArrowLeft: value - amount,
      ArrowDown: value - amount,
      ArrowRight: value + amount,
      ArrowUp: value + amount,
      Home: 0,
      End: max,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    set(keys[event.key]);
  };
  return (
    <div className={cn('relative h-3 rounded-full', checker && 'bg-checker')}>
      <div
        {...drag}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        aria-valuetext={valueText}
        onKeyDown={onKeyDown}
        className={cn('absolute inset-0 cursor-pointer touch-none rounded-full', FOCUS)}
        style={{ background: track }}
      >
        <span className={cn(THUMB, 'top-1/2')} style={{ left: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

const HUE_TRACK =
  'linear-gradient(to right, #f00 0%, #ff0 16.67%, #0f0 33.33%, #0ff 50%, #00f 66.67%, #f0f 83.33%, #f00 100%)';

/** HSV picker with hue and opacity sliders; always laid out left to right. */
export function ColorPicker({
  value,
  onChange,
  opaqueCss,
}: {
  value: PickerValue;
  onChange: (value: PickerValue) => void;
  /** The current color without alpha, for the opacity track. */
  opaqueCss: string;
}) {
  const t = useToolMessages<'color'>();
  const [h, s, v] = value.hsv;
  return (
    <div dir="ltr" role="group" aria-label={t.picker} className="space-y-3">
      <SaturationArea value={value} onChange={onChange} />
      <TrackSlider
        label={t.hue}
        value={h}
        max={360}
        onChange={(hue) => onChange({ ...value, hsv: [hue, s, v] })}
        valueText={`${Math.round(h)}°`}
        track={HUE_TRACK}
      />
      <TrackSlider
        label={t.alpha}
        value={value.alpha * 100}
        max={100}
        onChange={(alpha) => onChange({ ...value, alpha: alpha / 100 })}
        valueText={`${Math.round(value.alpha * 100)}%`}
        track={`linear-gradient(to right, transparent, ${opaqueCss})`}
        checker
      />
    </div>
  );
}
