'use client';

import { useMemo, useRef, useState } from 'react';
import { Download, Eraser, FileDown, FileUp, TextWrap } from 'lucide-react';
import { encodeBase64, toDataUri } from '@/lib/tools/encode/base64';
import { decodeFilePayload } from '@/lib/tools/encode/file';
import { encodeHex } from '@/lib/tools/encode/hex';
import {
  detectFileType,
  extensionFor,
  isPreviewableImage,
  type FileType,
} from '@/lib/tools/encode/mime';
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
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  useRunInput,
} from '@/components/tools/workbench/use-run';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { useDirection, useEncodeInput, useWrap } from './state';

/** Base64 grows files by a third; past this the output editor would get sluggish. */
const MAX_FILE_BYTES = 10 * 1024 * 1024;
/** The output editor shows at most this much; copy and download always use the full text. */
const OUTPUT_PREVIEW_CHARS = 1024 * 1024;
/** How many leading bytes the details panel shows as hex. */
const HEAD_BYTES = 32;
const FALLBACK_MIME = 'application/octet-stream';

type OutputFormat = 'base64' | 'dataUri';
const isOutputFormat = (value: unknown): value is OutputFormat =>
  value === 'base64' || value === 'dataUri';

type PickedFile = { name: string; type: string; bytes: Uint8Array };

/** Base64 ↔ file: encode a picked file, or decode base64/a data URI back into a file. */
export function FileView({ picker }: { picker: React.ReactNode }) {
  const [direction] = useDirection();
  return direction === 'encode' ? <FileEncoder picker={picker} /> : <FileDecoder picker={picker} />;
}

function DirectionSwitch() {
  const t = useToolMessages<'encode'>();
  const [direction, setDirection] = useDirection();
  return (
    <Segmented
      label={t.direction}
      value={direction}
      onChange={setDirection}
      options={[
        { value: 'encode', label: t.encode },
        { value: 'decode', label: t.decode },
      ]}
    />
  );
}

function FileEncoder({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'encode'>();
  const locale = useLocale();
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [format, setFormat] = usePersistentState<OutputFormat>(
    'encode:fileOutput',
    'base64',
    isOutputFormat
  );
  const [wrap, setWrap] = useWrap();
  const loader = useFileLoader(
    'bytes',
    (bytes, file) => setPicked({ name: file.name, type: file.type, bytes }),
    MAX_FILE_BYTES
  );

  const detected = useMemo(() => (picked ? detectFileType(picked.bytes) : null), [picked]);
  const mime = detected?.mime || picked?.type || FALLBACK_MIME;
  const output = useMemo(() => {
    if (!picked) return '';
    return format === 'dataUri' ? toDataUri(picked.bytes, mime) : encodeBase64(picked.bytes);
  }, [picked, format, mime]);
  const truncated = output.length > OUTPUT_PREVIEW_CHARS;

  const load = (file: File) => void loader.load(file);

  const inputPane = (
    <DropZone onFile={load}>
      {picked ? (
        <FileDetails
          name={picked.name}
          bytes={picked.bytes}
          declared={picked.type || null}
          detected={detected}
        />
      ) : (
        <EmptyFile onFile={load} />
      )}
    </DropZone>
  );

  const outputPane = (
    <CodeEditor
      value={truncated ? output.slice(0, OUTPUT_PREVIEW_CHARS) : output}
      label={common.output}
      readOnly
      wrap={wrap}
      placeholder={t.dropHere}
    />
  );

  return (
    <>
      <ToolHeader
        slug="encode"
        actions={
          <>
            <FileOpenButton onFile={load} />
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => setPicked(null)}
              disabled={!picked}
            />
            <ToolbarDivider />
            <IconAction
              icon={TextWrap}
              label={common.wrap}
              pressed={wrap}
              onClick={() => setWrap(!wrap)}
            />
            <ToolbarDivider />
            <CopyButton getText={() => output} disabled={!output} />
            <IconAction
              icon={Download}
              label={common.download}
              disabled={!output}
              onClick={() => downloadFile(output, `${picked?.name ?? 'file'}.base64.txt`)}
            />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <DirectionSwitch />
        <ToolbarDivider />
        <Segmented
          label={t.outputFormat}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'base64', label: t.base64Output },
            { value: 'dataUri', label: t.dataUriOutput },
          ]}
        />
      </ToolHeader>
      <SplitPane id="encode-file" first={inputPane} second={outputPane} />
      <StatusBar>
        {loader.error && <StatusItem tone="danger">{loader.error}</StatusItem>}
        {truncated && (
          <StatusItem tone="warning">
            {fmt(t.truncated, { size: formatBytes(OUTPUT_PREVIEW_CHARS, locale) })}
          </StatusItem>
        )}
        {picked && (
          <StatusItem className="shrink-0">
            {fmt(t.sizeChange, {
              from: formatBytes(picked.bytes.length, locale),
              to: formatBytes(output.length, locale),
            })}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}

function FileDecoder({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'encode'>();
  const locale = useLocale();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [input, setInput] = useEncodeInput();
  const [wrap, setWrap] = useWrap();
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, run, ran, stale } = useRunInput(input);
  // Opening a file or clearing is explicit, so the new input runs right away.
  const replaceInput = (next: string) => {
    setInput(next);
    run(next);
  };
  const loader = useFileLoader('text', replaceInput);

  const hasInput = live.trim() !== '';
  const result = useMemo(() => (hasInput ? decodeFilePayload(live) : null), [hasInput, live]);
  const decoded = result?.ok ? result.value : null;
  const error = result && !result.ok ? result.error : null;
  const diagnostics = useMemo(
    (): EditorDiagnostic[] => (error ? [{ ...error, severity: 'error' }] : []),
    [error]
  );

  const download = () => {
    if (!decoded) return;
    const mime = decoded.detected?.mime ?? decoded.declared ?? FALLBACK_MIME;
    downloadFile(decoded.bytes, `decoded.${extensionFor(mime)}`, mime);
  };

  const inputPane = (
    <DropZone onFile={(picked) => void loader.load(picked)}>
      <CodeEditor
        ref={inputRef}
        value={input}
        onChange={setInput}
        label={common.input}
        wrap={wrap}
        placeholder={t.filePlaceholder}
        diagnostics={diagnostics}
        onCursor={setCursor}
        autoFocus
      />
    </DropZone>
  );

  const outputPane = decoded ? (
    <FileDetails
      bytes={decoded.bytes}
      declared={decoded.declared}
      detected={decoded.detected}
      onDownload={download}
      className={cn(stale && STALE_OUTPUT_CLASS)}
    />
  ) : (
    <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">
      {!ran
        ? fmt(common.runHint, { action: t.decode, shortcut: RUN_SHORTCUT })
        : error
          ? t.invalidPlaceholder
          : t.fileOutputPlaceholder}
    </p>
  );

  return (
    <>
      <ToolHeader
        slug="encode"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void loader.load(picked)} />
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
            <ToolbarDivider />
            <IconAction
              icon={FileDown}
              label={t.downloadFile}
              onClick={download}
              disabled={!decoded}
            />
            <RunButton label={t.decode} onRun={() => run()} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <DirectionSwitch />
      </ToolHeader>
      <SplitPane id="encode-file" first={inputPane} second={outputPane} />
      <StatusBar>
        {hasInput && (
          <ValidityStatus
            error={error && { message: error.message, ...positionAt(live, error.from) }}
            onReveal={error ? () => inputRef.current?.reveal(error.from, error.to) : undefined}
          />
        )}
        {stale && <StaleStatus action={t.decode} onRun={() => run()} />}
        {loader.error && <StatusItem tone="danger">{loader.error}</StatusItem>}
        {decoded && (
          <StatusItem className="shrink-0">
            {fmt(t.sizeChange, {
              from: formatBytes(utf8Length(live), locale),
              to: formatBytes(decoded.bytes.length, locale),
            })}
          </StatusItem>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}

function EmptyFile({ onFile }: { onFile: (file: File) => void }) {
  const t = useToolMessages<'encode'>();
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="m-auto flex max-w-xs flex-col items-center gap-3 p-6 text-center">
      <FileUp className="size-8 text-fg-subtle" aria-hidden />
      <p className="text-sm font-medium text-fg">{t.dropHere}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn btn-secondary h-8 px-4 text-xs"
      >
        {t.chooseFile}
      </button>
      <input
        ref={inputRef}
        type="file"
        hidden
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
      <p className="text-xs text-fg-subtle">
        {fmt(t.maxSize, { size: formatBytes(MAX_FILE_BYTES, locale) })}
      </p>
    </div>
  );
}

/** Preview (for images), type, size and leading bytes of a file. */
function FileDetails({
  name,
  bytes,
  declared,
  detected,
  onDownload,
  className,
}: {
  name?: string;
  bytes: Uint8Array;
  declared: string | null;
  detected: FileType | null;
  onDownload?: () => void;
  className?: string;
}) {
  const t = useToolMessages<'encode'>();
  const locale = useLocale();
  const mime = detected?.mime ?? declared ?? '';
  const preview = useMemo(
    () => (isPreviewableImage(mime) ? toDataUri(bytes, mime) : null),
    [bytes, mime]
  );
  const head = encodeHex(bytes.subarray(0, HEAD_BYTES), { separator: 'space' });

  const rows: [string, React.ReactNode][] = [
    ...(name ? [[t.fileName, <bdi key="name">{name}</bdi>] as [string, React.ReactNode]] : []),
    [t.fileSize, formatBytes(bytes.length, locale)],
    [t.declaredType, declared || t.unknownType],
    [t.detectedType, detected ? `${detected.mime} (.${detected.extension})` : t.unknownType],
    [
      t.firstBytes,
      <span key="head" dir="ltr" className="font-mono break-all">
        {head}
        {bytes.length > HEAD_BYTES && ' …'}
      </span>,
    ],
  ];

  return (
    <div className={cn('min-h-0 flex-1 space-y-4 overflow-auto p-4 text-xs', className)}>
      {preview && (
        <figure className="flex justify-center rounded-md border border-line bg-surface-2 p-3">
          {/* A data: URI built from local bytes; next/image can't optimize it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={t.preview} className="max-h-64 max-w-full object-contain" />
        </figure>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-fg-subtle">{label}</dt>
            <dd className="min-w-0 text-fg">{value}</dd>
          </div>
        ))}
      </dl>
      {onDownload && (
        <button type="button" onClick={onDownload} className="btn btn-secondary h-8 px-4 text-xs">
          <FileDown className="size-3.5" aria-hidden />
          {t.downloadFile}
        </button>
      )}
    </div>
  );
}
