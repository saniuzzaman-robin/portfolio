'use client';

import { useId } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { Color } from '@/lib/tools/color/convert';
import { formatColor } from '@/lib/tools/color/format';
import {
  WCAG_LEVELS,
  apcaContrast,
  apcaLevel,
  wcagContrast,
  type WcagLevel,
} from '@/lib/tools/color/contrast';
import { IconAction } from '@/components/tools/workbench/toolbar';
import { PartHeading, StateBadge } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { Swatch } from './swatch';
import { useBackgroundInput, useParsedColor } from './state';

const LEVELS = Object.keys(WCAG_LEVELS) as WcagLevel[];

/** WCAG 2 ratio and APCA Lc of the current color as text on a chosen background. */
export function ContrastPanel({
  text,
  onSwap,
}: {
  text: Color;
  onSwap: (background: string) => void;
}) {
  const t = useToolMessages<'color'>();
  const locale = useLocale();
  const id = useId();
  const [input, setInput] = useBackgroundInput();
  const { result, color: background } = useParsedColor(input);
  const ratio = background ? wcagContrast(text, background) : null;
  const lc = background ? apcaContrast(text, background) : null;
  const level = lc === null ? null : apcaLevel(lc);
  const number = (value: number, digits: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);

  return (
    <section>
      <PartHeading
        actions={
          <IconAction
            icon={ArrowUpDown}
            label={t.swapColors}
            disabled={!result.ok}
            onClick={() => {
              onSwap(input);
              setInput(formatColor(text, text.alpha < 1 ? 'hex8' : 'hex', { legacy: false }));
            }}
          />
        }
      >
        {t.contrast}
      </PartHeading>
      <div className="space-y-3 p-3 text-xs">
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="w-24 shrink-0 text-fg-subtle">
            {t.background}
          </label>
          {background && <Swatch color={background} className="size-7 shrink-0 rounded-md" />}
          <input
            id={id}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            aria-invalid={!result.ok || undefined}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            dir="ltr"
            className="h-7 w-full min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger"
          />
        </div>
        {!result.ok && input.trim() !== '' && <p className="text-danger">{result.message}</p>}
        {background && ratio !== null && lc !== null && (
          <>
            <div
              className="space-y-1 rounded-md border border-line p-3"
              style={{
                background: formatColor(background, 'hex8', { legacy: false }),
                color: formatColor(text, 'hex8', { legacy: false }),
              }}
            >
              <p className="text-lg font-bold">{t.sampleLarge}</p>
              <p className="text-sm" dir="auto">
                {t.sample}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-fg-subtle">{t.ratio}</p>
                <p className="font-mono text-2xl font-semibold text-fg" dir="ltr">
                  {number(ratio, 2)}:1
                </p>
                <ul className="flex flex-wrap gap-1">
                  {LEVELS.map((key) => {
                    const pass = ratio >= WCAG_LEVELS[key];
                    return (
                      <li key={key}>
                        <StateBadge tone={pass ? 'success' : 'danger'}>
                          {fmt(pass ? t.passes : t.fails, { level: t.wcag[key] })}
                        </StateBadge>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-fg-subtle">{t.apca}</p>
                <p className="font-mono text-2xl font-semibold text-fg" dir="ltr">
                  Lc {number(lc, 1)}
                </p>
                <StateBadge
                  tone={
                    level === null
                      ? 'danger'
                      : level === 'nonText' || level === 'spotText'
                        ? 'warning'
                        : 'success'
                  }
                >
                  {level === null ? t.apcaNone : t.apcaLevels[level]}
                </StateBadge>
              </div>
            </div>
            <p className="text-[11px] text-fg-subtle">{t.contrastHint}</p>
          </>
        )}
      </div>
    </section>
  );
}
