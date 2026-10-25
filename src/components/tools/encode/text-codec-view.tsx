'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, Download, Eraser, Lightbulb, TextWrap } from 'lucide-react';
import { SYMMETRIC, runCodec, type CodecOptions, type TextCodec } from '@/lib/tools/encode/codecs';
import { detectEncoding } from '@/lib/tools/encode/detect';
import { positionAt } from '@/lib/tools/json/parse';
import { formatBytes, utf8Length } from '@/lib/tools/bytes';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  FileOpenButton,
  IconAction,
  RunButton,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { OptionsPopover, SelectField, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { DropZone } from '@/components/tools/workbench/drop-zone';
import { downloadFile, useFileLoader } from '@/components/tools/workbench/file';
import {
  CursorStatus,
  StaleStatus,
  StatusBar,
  StatusItem,
  ValidityStatus,
} from '@/components/tools/workbench/status-bar';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  useRunInput,
} from '@/components/tools/workbench/use-run';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import type { ToolMessages } from '@/i18n/tools/en';
import { cn } from '@/lib/cn';
import { useCodecOptions, useDirection, useEncodeInput, useWrap, type Mode } from './state';

type EncodeMessages = ToolMessages['encode'];

const NO_DIAGNOSTICS: EditorDiagnostic[] = [];

/** Codecs with settings in the options popover (URL and ROT have theirs in the toolbar). */
const HAS_OPTIONS: ReadonlySet<TextCodec> = new Set([
  'base64',
  'base32',
  'hex',
  'binary',
  'html',
  'unicode',
]);

/** Text in, text out: every codec except File and the URL parser. */
export function TextCodecView({
  codec,
  picker,
  onMode,
}: {
  codec: TextCodec;
  picker: React.ReactNode;
  onMode: (mode: Mode) => void;
}) {
  const common = useToolCommon();
  const t = useToolMessages<'encode'>();
  const locale = useLocale();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [input, setInput] = useEncodeInput();
  const [storedDirection, setDirection] = useDirection();
  const [options, setOptions] = useCodecOptions();
  const [wrap, setWrap] = useWrap();
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, run, ran, stale } = useRunInput(input);
  // Opening a file or reusing the result is explicit, so the new input runs right away.
  const replaceInput = (next: string) => {
    setInput(next);
    run(next);
  };
  const file = useFileLoader('text', replaceInput);

  const symmetric = SYMMETRIC.has(codec);
  const direction = symmetric ? 'encode' : storedDirection;
  const hasInput = live !== '';

  const result = useMemo(
    () => (hasInput ? runCodec(codec, direction, live, options) : null),
    [hasInput, codec, direction, live, options]
  );
  const output = result?.ok ? result.value : '';
  const error = result && !result.ok ? result.error : null;
  const warning = result?.ok ? result.warning : undefined;

  // Offer a better codec when encoding text that already looks encoded, or when decoding fails.
  const detection = useMemo(
    () => ((!symmetric && direction === 'encode') || error ? detectEncoding(live) : null),
    [symmetric, direction, error, live]
  );
  const suggestion =
    detection && !(detection === codec && direction === 'decode') ? detection : null;

  const diagnostics = useMemo(
    (): EditorDiagnostic[] => (error ? [{ ...error, severity: 'error' }] : NO_DIAGNOSTICS),
    [error]
  );

  const swap = () => {
    replaceInput(output);
    if (!symmetric) setDirection(direction === 'encode' ? 'decode' : 'encode');
  };

  const setCodecOptions = <K extends keyof CodecOptions>(key: K, value: CodecOptions[K]) =>
    setOptions({ ...options, [key]: value });

  const size = (text: string) => formatBytes(utf8Length(text), locale);
  const placeholder =
    direction === 'decode'
      ? fmt(t.decodePlaceholder, { name: t.modes[codec] })
      : codec === 'punycode'
        ? t.domainPlaceholder
        : t.encodePlaceholder;
  const runLabel = symmetric ? common.run : direction === 'encode' ? t.encode : t.decode;

  const inputPane = (
    <DropZone onFile={(picked) => void file.load(picked)}>
      <CodeEditor
        ref={inputRef}
        value={input}
        onChange={setInput}
        label={common.input}
        wrap={wrap}
        placeholder={placeholder}
        diagnostics={diagnostics}
        onCursor={setCursor}
        autoFocus
      />
    </DropZone>
  );

  const outputPane = (
    <CodeEditor
      value={output}
      label={common.output}
      readOnly
      wrap={wrap}
      placeholder={
        !ran
          ? fmt(common.runHint, { action: runLabel, shortcut: RUN_SHORTCUT })
          : error
            ? t.invalidPlaceholder
            : t.outputPlaceholder
      }
      className={cn(stale && STALE_OUTPUT_CLASS)}
    />
  );

  return (
    <>
      <ToolHeader
        slug="encode"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void file.load(picked)} />
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => replaceInput('')}
              disabled={!input}
            />
            <ToolbarDivider />
            <IconAction
              icon={TextWrap}
              label={common.wrap}
              pressed={wrap}
              onClick={() => setWrap(!wrap)}
            />
            {HAS_OPTIONS.has(codec) && (
              <OptionsPopover>
                <CodecOptionsPanel
                  codec={codec}
                  options={options}
                  onChange={setCodecOptions}
                  t={t}
                />
              </OptionsPopover>
            )}
            <ToolbarDivider />
            <IconAction
              icon={ArrowLeftRight}
              label={symmetric ? common.swap : t.swapDirection}
              onClick={swap}
              disabled={!output}
            />
            <CopyButton getText={() => output} disabled={!output} />
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!output}
              onClick={() => downloadFile(output, `${direction}d.txt`)}
            />
            <RunButton label={runLabel} onRun={() => run()} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        {codec === 'rot' ? (
          <Segmented
            label={t.rotVariant}
            value={String(options.rot.variant) as '13' | '47'}
            onChange={(value) => setCodecOptions('rot', { variant: value === '47' ? 47 : 13 })}
            options={[
              { value: '13', label: 'ROT13' },
              { value: '47', label: 'ROT47' },
            ]}
          />
        ) : (
          <Segmented
            label={t.direction}
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'encode', label: t.encode },
              { value: 'decode', label: t.decode },
            ]}
          />
        )}
        {codec === 'url' && (
          <>
            <ToolbarDivider />
            <Segmented
              label={t.urlMode}
              value={options.url.mode}
              onChange={(mode) => setCodecOptions('url', { mode })}
              options={[
                { value: 'component', label: t.urlComponent },
                { value: 'uri', label: t.urlUri },
                { value: 'form', label: t.urlForm },
              ]}
            />
          </>
        )}
      </ToolHeader>
      <SplitPane id="encode" first={inputPane} second={outputPane} />
      <StatusBar>
        {hasInput && (direction === 'decode' || error) && (
          <ValidityStatus
            error={error && { message: error.message, ...positionAt(live, error.from) }}
            onReveal={error ? () => inputRef.current?.reveal(error.from, error.to) : undefined}
          />
        )}
        {warning && (
          <StatusItem tone="warning" title={warning}>
            {warning}
          </StatusItem>
        )}
        {stale && <StaleStatus action={runLabel} onRun={() => run()} />}
        {file.error && <StatusItem tone="danger">{file.error}</StatusItem>}
        {suggestion && (
          <StatusItem
            tone="warning"
            className="shrink-0"
            onClick={() => {
              onMode(suggestion);
              setDirection('decode');
            }}
          >
            <Lightbulb className="size-3 shrink-0" aria-hidden />
            {fmt(t.suggestion, { name: t.modes[suggestion] })}
          </StatusItem>
        )}
        {hasInput && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {output ? fmt(t.sizeChange, { from: size(live), to: size(output) }) : size(live)}
          </StatusItem>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}

function CodecOptionsPanel({
  codec,
  options,
  onChange,
  t,
}: {
  codec: TextCodec;
  options: CodecOptions;
  onChange: <K extends keyof CodecOptions>(key: K, value: CodecOptions[K]) => void;
  t: EncodeMessages;
}) {
  const note = <p className="text-fg-subtle">{t.encodingOptions}</p>;
  switch (codec) {
    case 'base64': {
      const value = options.base64;
      return (
        <>
          {note}
          <Toggle
            label={t.urlSafe}
            hint={t.urlSafeHint}
            checked={value.urlSafe}
            onChange={(urlSafe) => onChange('base64', { ...value, urlSafe })}
          />
          <Toggle
            label={t.padding}
            hint={t.paddingHint}
            checked={value.padding}
            onChange={(padding) => onChange('base64', { ...value, padding })}
          />
          <SelectField
            label={t.lineLength}
            value={String(value.lineLength) as '0' | '64' | '76'}
            onChange={(length) =>
              onChange('base64', { ...value, lineLength: Number(length) as 0 | 64 | 76 })
            }
            options={[
              { value: '0', label: t.lineNone },
              { value: '76', label: t.lineMime },
              { value: '64', label: t.linePem },
            ]}
          />
          <p className="text-fg-subtle">{t.decodeAccepts}</p>
        </>
      );
    }
    case 'base32':
      return (
        <>
          {note}
          <Toggle
            label={t.padding}
            hint={t.paddingHint}
            checked={options.base32.padding}
            onChange={(padding) => onChange('base32', { padding })}
          />
        </>
      );
    case 'hex': {
      const value = options.hex;
      return (
        <>
          {note}
          <SelectField
            label={t.separator}
            value={value.separator}
            onChange={(separator) => onChange('hex', { ...value, separator })}
            options={[
              { value: 'none', label: t.separatorNone },
              { value: 'space', label: t.separatorSpace },
              { value: 'colon', label: t.separatorColon },
            ]}
          />
          <Toggle
            label={t.uppercase}
            checked={value.upper}
            onChange={(upper) => onChange('hex', { ...value, upper })}
          />
        </>
      );
    }
    case 'binary':
      return (
        <>
          {note}
          <Toggle
            label={t.spaced}
            checked={options.binary.spaced}
            onChange={(spaced) => onChange('binary', { spaced })}
          />
        </>
      );
    case 'html': {
      const value = options.html;
      return (
        <>
          {note}
          <SelectField
            label={t.entityScope}
            value={value.scope}
            onChange={(scope) => onChange('html', { ...value, scope })}
            options={[
              { value: 'specials', label: t.entitySpecials },
              { value: 'nonAscii', label: t.entityNonAscii },
            ]}
          />
          <SelectField
            label={t.entityFormat}
            value={value.format}
            onChange={(format) => onChange('html', { ...value, format })}
            options={[
              { value: 'named', label: `${t.entityNamed} (&eacute;)` },
              { value: 'decimal', label: `${t.entityDecimal} (&#233;)` },
              { value: 'hex', label: `${t.entityHex} (&#xE9;)` },
            ]}
          />
        </>
      );
    }
    case 'unicode': {
      const value = options.unicode;
      return (
        <>
          {note}
          <SelectField
            label={t.escapeStyle}
            value={value.style}
            onChange={(style) => onChange('unicode', { ...value, style })}
            options={[
              { value: 'utf16', label: t.styleUtf16 },
              { value: 'codePoint', label: t.styleCodePoint },
            ]}
          />
          <Toggle
            label={t.escapeAll}
            hint={t.escapeAllHint}
            checked={value.all}
            onChange={(all) => onChange('unicode', { ...value, all })}
          />
        </>
      );
    }
    default:
      return null;
  }
}
