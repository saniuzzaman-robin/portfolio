'use client';

import { useId, useMemo } from 'react';
import { ArrowUpDown, CircleAlert, FileDown, ImageDown } from 'lucide-react';
import { CONTENT_TYPES, buildPayload } from '@/lib/tools/qr/content';
import {
  EC_LEVELS,
  createQr,
  darkRuns,
  qrPath,
  qrToSvg,
  type QrMatrix,
  type RenderOptions,
} from '@/lib/tools/qr/qr';
import { parseColor } from '@/lib/tools/color/parse';
import { formatColor, toHex } from '@/lib/tools/color/format';
import { apcaContrast, wcagContrast } from '@/lib/tools/color/contrast';
import type { Color } from '@/lib/tools/color/convert';
import { formatBytes, utf8Length } from '@/lib/tools/bytes';
import {
  CopyButton,
  IconAction,
  Segmented,
  ToolHeader,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { downloadFile } from '@/components/tools/workbench/file';
import { useDebouncedValue } from '@/components/tools/workbench/use-live-input';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { NumberField } from '@/components/tools/crypto/parts';
import { PartHeading } from '@/components/tools/jwt/parts';
import { Note, SelectRow } from '@/components/tools/time/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { ContentForm } from './content-form';
import {
  MARGIN_RANGE,
  SIZE_RANGE,
  SPEC_MARGIN,
  useAppearance,
  useContentType,
  useQrFields,
  type Appearance,
} from './state';

const TYPING_DELAY_MS = 120;
/** Below this WCAG ratio, phone cameras start missing modules. */
const MIN_CONTRAST = 4;

const hexOf = (color: Color) =>
  formatColor(color, color.alpha < 1 ? 'hex8' : 'hex', { legacy: false });

function parsed(text: string): Color | null {
  const result = parseColor(text);
  return result.ok ? result.color : null;
}

/** Draws the code at exactly `pixels` square, with module edges rounded to whole pixels. */
function renderPng(matrix: QrMatrix, options: RenderOptions, pixels: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = pixels;
  canvas.height = pixels;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('Canvas 2D is not available'));
  const side = matrix.size + options.margin * 2;
  const scale = pixels / side;
  const edge = (modules: number) => Math.round(modules * scale);
  context.fillStyle = options.background;
  context.fillRect(0, 0, pixels, pixels);
  context.fillStyle = options.foreground;
  for (const [row, start, length] of darkRuns(matrix)) {
    const x = edge(start + options.margin);
    const y = edge(row + options.margin);
    context.fillRect(
      x,
      y,
      edge(start + options.margin + length) - x,
      edge(row + options.margin + 1) - y
    );
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))),
      'image/png'
    )
  );
}

function ColorField({
  label,
  value,
  onChange,
  pickerLabel,
  invalidText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  pickerLabel: string;
  invalidText: string;
}) {
  const id = useId();
  const color = parsed(value);
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="w-24 shrink-0 text-fg-subtle">
          {label}
        </label>
        <input
          type="color"
          aria-label={pickerLabel}
          value={color ? toHex({ ...color, alpha: 1 }) : '#000000'}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-9 shrink-0 cursor-pointer rounded-md border border-line bg-surface-2 p-0.5"
        />
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!color || undefined}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          dir="ltr"
          className="h-7 w-full min-w-0 flex-1 basis-32 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger"
        />
      </div>
      {!color && <Note tone="danger">{invalidText}</Note>}
    </div>
  );
}

/** QR codes for text, URLs, Wi-Fi, contacts and email, with SVG and PNG downloads. */
export function QrCodeTool() {
  const t = useToolMessages<'qr-code'>();
  const locale = useLocale();
  const [type, setType] = useContentType();
  const [fields, setFields] = useQrFields();
  const [appearance, setAppearance] = useAppearance();
  const update = (patch: Partial<Appearance>) => setAppearance({ ...appearance, ...patch });

  const payload = useMemo(() => buildPayload(type, fields), [type, fields]);
  const text = useDebouncedValue(payload.text, TYPING_DELAY_MS);
  const level = appearance.level;
  const task = useMemo(() => (text ? () => createQr(text, level) : null), [text, level]);
  const { value: current, latest, error: loadError } = useAsyncResult(task);
  // Keep the previous code on screen while the next one is computed.
  const result = text ? (current ?? latest) : undefined;
  const matrix = result?.ok ? result.matrix : null;
  const tooBig = current && !current.ok ? current.message : null;

  const foreground = parsed(appearance.foreground);
  const background = parsed(appearance.background);
  const colors: RenderOptions | null =
    foreground && background
      ? { foreground: hexOf(foreground), background: hexOf(background), margin: appearance.margin }
      : null;
  const ratio = foreground && background ? wcagContrast(foreground, background) : null;
  const inverted = foreground && background ? apcaContrast(foreground, background) < 0 : false;
  const sizeOk =
    Number.isInteger(appearance.size) &&
    appearance.size >= SIZE_RANGE.min &&
    appearance.size <= SIZE_RANGE.max;
  const marginOk =
    Number.isInteger(appearance.margin) &&
    appearance.margin >= MARGIN_RANGE.min &&
    appearance.margin <= MARGIN_RANGE.max;
  const shown = matrix && colors && marginOk ? { matrix, colors } : null;
  // Downloads wait until the code matches the current content (typing is debounced).
  const exportable =
    shown && sizeOk && current?.ok && text === payload.text
      ? { matrix: current.matrix, colors: shown.colors }
      : null;
  const numbers = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  const downloadSvg = () => {
    if (!exportable) return;
    downloadFile(
      qrToSvg(exportable.matrix, exportable.colors, appearance.size),
      'qr-code.svg',
      'image/svg+xml'
    );
  };
  const downloadPng = () => {
    if (!exportable) return;
    renderPng(exportable.matrix, exportable.colors, appearance.size).then(
      (blob) => downloadFile(blob, 'qr-code.png', 'image/png'),
      (error: unknown) => console.error('PNG export failed:', error)
    );
  };

  const formPane = (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto">
      <section>
        <PartHeading>{t.content}</PartHeading>
        <div className="space-y-3 p-3 text-xs">
          <ContentForm type={type} fields={fields} onChange={setFields} />
          {payload.warnings.map((warning) => (
            <Note key={warning} tone="warning">
              {t.warnings[warning]}
            </Note>
          ))}
        </div>
      </section>
      <section>
        <PartHeading
          actions={
            <IconAction
              icon={ArrowUpDown}
              label={t.swapColors}
              onClick={() =>
                update({ foreground: appearance.background, background: appearance.foreground })
              }
            />
          }
        >
          {t.appearance}
        </PartHeading>
        <div className="space-y-3 p-3 text-xs">
          <SelectRow
            label={t.errorCorrection}
            value={appearance.level}
            onChange={(value) => update({ level: value })}
            options={EC_LEVELS.map((value) => ({ value, label: t.levels[value] }))}
          />
          <Note>{t.levelHint}</Note>
          <ColorField
            label={t.foreground}
            value={appearance.foreground}
            onChange={(value) => update({ foreground: value })}
            pickerLabel={fmt(t.pickColor, { name: t.foreground })}
            invalidText={t.invalidColor}
          />
          <ColorField
            label={t.background}
            value={appearance.background}
            onChange={(value) => update({ background: value })}
            pickerLabel={fmt(t.pickColor, { name: t.background })}
            invalidText={t.invalidColor}
          />
          {ratio !== null && ratio < MIN_CONTRAST && (
            <Note tone="warning">{fmt(t.lowContrast, { ratio: numbers.format(ratio) })}</Note>
          )}
          {inverted && <Note tone="warning">{t.inverted}</Note>}
          <NumberField
            label={t.size}
            value={appearance.size}
            onChange={(size) => update({ size })}
            min={SIZE_RANGE.min}
            max={SIZE_RANGE.max}
            hint={fmt(t.sizeHint, SIZE_RANGE)}
          />
          <NumberField
            label={t.margin}
            value={appearance.margin}
            onChange={(margin) => update({ margin })}
            min={MARGIN_RANGE.min}
            max={MARGIN_RANGE.max}
            hint={fmt(t.marginHint, { ...MARGIN_RANGE, spec: SPEC_MARGIN })}
          />
          {marginOk && appearance.margin < SPEC_MARGIN && (
            <Note tone="warning">{fmt(t.marginWarning, { spec: SPEC_MARGIN })}</Note>
          )}
        </div>
      </section>
    </div>
  );

  const side = shown ? shown.matrix.size + shown.colors.margin * 2 : 0;
  const previewPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
      <PartHeading>{t.preview}</PartHeading>
      <div className="flex flex-1 items-center justify-center p-4">
        {shown ? (
          <svg
            viewBox={`0 0 ${side} ${side}`}
            role="img"
            aria-label={t.previewLabel}
            shapeRendering="crispEdges"
            className="aspect-square w-full max-w-80 rounded-md border border-line"
          >
            <rect width={side} height={side} fill={shown.colors.background} />
            <path d={qrPath(shown.matrix, shown.colors.margin)} fill={shown.colors.foreground} />
          </svg>
        ) : (
          <p className="text-xs text-fg-subtle">
            {tooBig ? fmt(t.tooBig, { level }) : loadError ? t.loadFailed : t.empty}
          </p>
        )}
      </div>
      {payload.text && (
        <section className="shrink-0">
          <PartHeading actions={<CopyButton getText={() => payload.text} label={t.copyPayload} />}>
            {t.payload}
          </PartHeading>
          <pre
            dir="ltr"
            className="max-h-40 overflow-auto p-3 text-start font-mono text-[11px] break-all whitespace-pre-wrap text-fg-muted select-all"
          >
            {payload.text}
          </pre>
        </section>
      )}
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="qr-code"
        actions={
          <>
            <IconAction
              icon={FileDown}
              label={t.downloadSvg}
              onClick={downloadSvg}
              disabled={!exportable}
            />
            <IconAction
              icon={ImageDown}
              label={t.downloadPng}
              onClick={downloadPng}
              disabled={!exportable}
            />
          </>
        }
      >
        <Segmented
          label={t.content}
          value={type}
          onChange={setType}
          options={CONTENT_TYPES.map((value) => ({ value, label: t.types[value] }))}
        />
      </ToolHeader>
      <SplitPane id="qr-code" first={formPane} second={previewPane} defaultRatio={0.45} />
      <StatusBar>
        {tooBig ? (
          <StatusItem tone="danger" title={tooBig}>
            <CircleAlert className="size-3 shrink-0" aria-hidden />
            <span className="truncate font-sans">{fmt(t.tooBig, { level })}</span>
          </StatusItem>
        ) : (
          matrix && (
            <StatusItem tone="success" className="shrink-0">
              {fmt(t.versionStatus, { version: matrix.version, size: matrix.size })}
            </StatusItem>
          )
        )}
        {payload.text && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {formatBytes(utf8Length(payload.text), locale)}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
