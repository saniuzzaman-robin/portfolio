'use client';

import { useId, useMemo, useState, useSyncExternalStore } from 'react';
import { CircleAlert, Dices, Pipette } from 'lucide-react';
import { hsvToRgb, rgbToHsv, type Color } from '@/lib/tools/color/convert';
import {
  COLOR_FORMATS,
  colorName,
  displayRgb,
  formatColor,
  gamutOf,
  tintsAndShades,
  toHex,
} from '@/lib/tools/color/format';
import { Random } from '@/lib/tools/generate/random';
import { CopyButton, IconAction, ToolHeader } from '@/components/tools/workbench/toolbar';
import { OptionsPopover, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem, ValidityStatus } from '@/components/tools/workbench/status-bar';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { ColorPicker, type PickerValue } from './picker';
import { ContrastPanel } from './contrast-panel';
import { Swatch } from './swatch';
import { useColorInput, useLegacySyntax, useParsedColor } from './state';

/** Chromium's EyeDropper API (not in TypeScript's DOM types yet). */
type EyeDropperApi = { open(): Promise<{ sRGBHex: string }> };
type EyeDropperWindow = Window & { EyeDropper?: new () => EyeDropperApi };

const noSubscribe = () => () => {};
const hasEyeDropper = () => 'EyeDropper' in window;

let random: Random | null = null;
const getRandom = () => (random ??= new Random());

const hexOf = (color: Color) =>
  formatColor(color, color.alpha < 1 ? 'hex8' : 'hex', { legacy: false });

/** Converts, picks and checks colors: formats, contrast and a tint/shade scale. */
export function ColorTool() {
  const t = useToolMessages<'color'>();
  const locale = useLocale();
  const inputId = useId();
  const [input, setInput] = useColorInput();
  const [legacy, setLegacy] = useLegacySyntax();
  const { result, color } = useParsedColor(input);
  const eyeDropper = useSyncExternalStore(noSubscribe, hasEyeDropper, () => false);
  // What the picker last wrote: keeps its hue and saturation when the color is gray or black.
  const [picked, setPicked] = useState<{ text: string; value: PickerValue } | null>(null);

  const pickerValue: PickerValue =
    picked && picked.text === input
      ? picked.value
      : { hsv: color ? rgbToHsv(displayRgb(color)) : [0, 0, 0], alpha: color?.alpha ?? 1 };

  const onPick = (value: PickerValue) => {
    const text = hexOf({ rgb: hsvToRgb(value.hsv), alpha: value.alpha });
    setPicked({ text, value });
    setInput(text);
  };

  const pickFromScreen = async () => {
    const EyeDropper = (window as EyeDropperWindow).EyeDropper;
    if (!EyeDropper) return;
    try {
      setInput((await new EyeDropper().open()).sRGBHex);
    } catch (error) {
      // Escape cancels the picker with an AbortError; anything else is unexpected.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Eyedropper failed:', error);
      }
    }
  };

  const randomColor = () => {
    const bytes = getRandom().bytes(3);
    setInput(`#${[...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`);
  };

  const gamut = color ? gamutOf(color) : null;
  const name = color ? colorName(color) : undefined;
  const scale = useMemo(() => (color ? tintsAndShades(color) : []), [color]);
  const percent = new Intl.NumberFormat(locale, { style: 'percent' });

  const pickerPane = (
    <div className="min-h-0 min-w-0 flex-1 space-y-3 overflow-auto p-3 text-xs">
      <div className="space-y-1">
        <label htmlFor={inputId} className="font-medium text-fg">
          {t.input}
        </label>
        <div className="flex items-center gap-2">
          {color && (
            <Swatch color={color} className="size-9 shrink-0 rounded-md border border-line" />
          )}
          <input
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.inputPlaceholder}
            aria-invalid={!result.ok || undefined}
            aria-describedby={`${inputId}-hint`}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoFocus
            dir="ltr"
            className="h-9 w-full min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-2 font-mono text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger"
          />
        </div>
        <p id={`${inputId}-hint`} className="text-[11px] text-fg-subtle">
          {t.inputHint}
        </p>
      </div>
      {color && <Swatch color={color} className="h-16 w-full rounded-md border border-line" />}
      <ColorPicker
        value={pickerValue}
        onChange={onPick}
        opaqueCss={color ? toHex(color) : 'transparent'}
      />
      {gamut && gamut !== 'srgb' && (
        <p className="flex items-start gap-1.5 text-[11px] text-warning">
          <CircleAlert className="mt-px size-3 shrink-0" aria-hidden />
          <span>
            {t.gamuts[gamut]}. {t.gamutHint}
          </span>
        </p>
      )}
    </div>
  );

  const detailsPane = color ? (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto">
      <section>
        <PartHeading>{t.formats}</PartHeading>
        <dl className="divide-y divide-line">
          {COLOR_FORMATS.map((format) => {
            const value = formatColor(color, format, { legacy });
            return (
              <div key={format} className="flex items-center gap-2 ps-3 pe-1">
                <dt className="w-14 shrink-0 text-[11px] font-semibold text-fg-muted">
                  {t.formatLabels[format]}
                </dt>
                <dd
                  dir="ltr"
                  className="min-w-0 flex-1 py-1.5 text-start font-mono text-xs break-all text-fg select-all"
                >
                  {value}
                </dd>
                <CopyButton getText={() => value} />
              </div>
            );
          })}
        </dl>
      </section>
      <ContrastPanel text={color} onSwap={setInput} />
      <section>
        <PartHeading
          actions={
            <CopyButton
              getText={() => scale.map((step) => hexOf(step.color)).join('\n')}
              label={t.copyScale}
            />
          }
        >
          {t.scale}
        </PartHeading>
        <div dir="ltr" className="grid grid-cols-9 gap-1 p-3">
          {scale.map((step) => {
            const hex = hexOf(step.color);
            const label =
              step.toward === null
                ? t.baseColor
                : fmt(step.toward === 'white' ? t.tint : t.shade, {
                    percent: percent.format(step.mix),
                  });
            return (
              <button
                key={`${step.toward}-${step.mix}`}
                type="button"
                onClick={() => setInput(hex)}
                title={`${label} · ${hex}`}
                aria-label={fmt(t.useColor, { color: `${hex} (${label})` })}
                className={cn(
                  'h-10 cursor-pointer overflow-hidden rounded-md border border-line focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  step.toward === null && 'ring-2 ring-fg/60'
                )}
              >
                <Swatch color={step.color} className="size-full" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  ) : (
    <p className="p-3 text-xs text-fg-subtle">{t.empty}</p>
  );

  return (
    <>
      <ToolHeader
        slug="color"
        actions={
          <>
            {eyeDropper && (
              <IconAction
                icon={Pipette}
                label={t.eyedropper}
                onClick={() => void pickFromScreen()}
              />
            )}
            <IconAction icon={Dices} label={t.random} onClick={randomColor} />
            <OptionsPopover>
              <Toggle label={t.legacy} hint={t.legacyHint} checked={legacy} onChange={setLegacy} />
            </OptionsPopover>
            <CopyButton getText={() => (color ? hexOf(color) : '')} disabled={!color} />
          </>
        }
      />
      <SplitPane id="color" first={pickerPane} second={detailsPane} defaultRatio={0.4} />
      <StatusBar>
        {result.ok ? (
          <ValidityStatus error={null} />
        ) : (
          input.trim() !== '' && (
            <StatusItem tone="danger" title={result.message}>
              <CircleAlert className="size-3 shrink-0" aria-hidden />
              <span className="truncate font-sans">{result.message}</span>
            </StatusItem>
          )
        )}
        {result.ok && name && (
          <StatusItem className="shrink-0">{fmt(t.named, { name })}</StatusItem>
        )}
        {result.ok && gamut && (
          <StatusItem
            tone={gamut === 'srgb' ? 'muted' : 'warning'}
            className="shrink-0 max-sm:hidden"
          >
            {t.gamuts[gamut]}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
