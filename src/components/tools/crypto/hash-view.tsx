'use client';

import { useMemo, useState } from 'react';
import { Check, Eraser, FileText, KeyRound, ListChecks } from 'lucide-react';
import {
  HASH_ALGORITHMS,
  digestMatches,
  formatDigest,
  hashAll,
  hashBits,
  hashLabel,
  supportsHmac,
  type HashAlgorithm,
} from '@/lib/tools/crypto/hash';
import { textBytes, type TextEncoding } from '@/lib/tools/crypto/bytes';
import { formatBytes } from '@/lib/tools/bytes';
import { CodeEditor, type CursorInfo } from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  FileOpenButton,
  IconAction,
  RunButton,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { OptionsPopover, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { DropZone } from '@/components/tools/workbench/drop-zone';
import { useFileLoader } from '@/components/tools/workbench/file';
import {
  CursorStatus,
  StaleStatus,
  StatusBar,
  StatusItem,
} from '@/components/tools/workbench/status-bar';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  useRunInput,
} from '@/components/tools/workbench/use-run';
import { PartHeading, StateBadge } from '@/components/tools/jwt/parts';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { SecretPanel, TextField } from './parts';
import { useDigestFormat, useHashAlgorithms, useHashInput, useHmacEnabled } from './state';

/** The whole file is read into memory (Web Crypto can't stream), so keep it well below RAM limits. */
const MAX_FILE_BYTES = 512 * 1024 * 1024;
/** From this size, stale results are hidden and progress is shown instead. */
const LARGE_INPUT_BYTES = 4 * 1024 * 1024;

const encoder = new TextEncoder();

type PickedFile = { id: number; name: string; bytes: Uint8Array<ArrayBuffer> };
let nextFileId = 0;
type HmacFields = { key: string; encoding: TextEncoding };

function digestName(algorithm: HashAlgorithm, hmac: boolean): string {
  return hmac ? `HMAC-${hashLabel(algorithm)}` : hashLabel(algorithm);
}

/** Text or a file on one side; every selected digest (or HMAC) on the other. */
export function HashView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'crypto'>();
  const locale = useLocale();
  const [text, setText] = useHashInput();
  const [algorithms, setAlgorithms] = useHashAlgorithms();
  const [format, setFormat] = useDigestFormat();
  const [hmacEnabled, setHmacOn] = useHmacEnabled();
  const [hmac, setHmac] = useState<HmacFields>({ key: '', encoding: 'utf8' });
  const [expected, setExpected] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [progress, setProgress] = useState<{ data: Uint8Array; done: number } | null>(null);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  // The file as of the last run (bytes stay out of the snapshot, which is compared as JSON).
  const [appliedFile, setAppliedFile] = useState<PickedFile | null>(null);
  const draft = {
    algorithms: HASH_ALGORITHMS.filter((algorithm) => algorithms.includes(algorithm)),
    format,
    hmac: hmacEnabled ? hmac : null,
    file: file && { id: file.id, name: file.name },
  };
  const { value: live, settings: applied, run, ran, stale } = useRunInput(text, '', draft);
  // Everything waits for Hash; opening or removing a file is explicit, so it runs right away.
  const apply = (nextText = text, nextFile = file) => {
    setFile(nextFile);
    setAppliedFile(nextFile);
    run(nextText, '', {
      ...draft,
      file: nextFile && { id: nextFile.id, name: nextFile.name },
    });
  };
  const loader = useFileLoader(
    'bytes',
    (bytes, picked) => apply(text, { id: ++nextFileId, name: picked.name, bytes }),
    MAX_FILE_BYTES
  );

  const textData = useMemo(() => encoder.encode(live), [live]);
  const data = appliedFile?.bytes ?? textData;
  const selected = applied.algorithms;
  const hmacOn = applied.hmac !== null;
  const key = useMemo(
    () => (applied.hmac ? textBytes(applied.hmac.key, applied.hmac.encoding) : null),
    [applied.hmac]
  );
  const keyError = key && !key.ok ? key.error.message : null;
  const hmacKey = key?.ok ? key.value : undefined;
  const hmacKeyMissing = ran && applied.hmac !== null && !applied.hmac.key;
  // The key field flags a malformed key as it is typed; hashing waits for the run.
  const draftKey = useMemo(
    () => (hmacEnabled ? textBytes(hmac.key, hmac.encoding) : null),
    [hmacEnabled, hmac.key, hmac.encoding]
  );
  const draftKeyError = draftKey && !draftKey.ok ? draftKey.error.message : null;

  const idle = !ran;
  const task = useMemo(() => {
    if (idle || keyError || hmacKeyMissing || selected.length === 0) return null;
    const onProgress =
      data.length > LARGE_INPUT_BYTES ? (done: number) => setProgress({ data, done }) : undefined;
    return (signal: AbortSignal) => hashAll(selected, data, { hmacKey, signal, onProgress });
  }, [idle, selected, data, hmacKey, keyError, hmacKeyMissing]);
  const hashing = useAsyncResult(task);
  // While typing, keep the previous digests on screen; for big inputs show progress instead.
  const digests = hashing.value ?? (data.length > LARGE_INPUT_BYTES ? undefined : hashing.latest);
  const percent =
    hashing.pending && progress?.data === data
      ? Math.floor((progress.done / data.length) * 100)
      : null;

  const rows = selected.map((algorithm) => {
    const applies = !hmacOn || supportsHmac(algorithm);
    const digest = applies ? digests?.[algorithm] : undefined;
    return {
      algorithm,
      name: digestName(algorithm, hmacOn && applies),
      applies,
      value: digest ? formatDigest(digest, applied.format) : '',
      matched: digest !== undefined && digestMatches(expected, digest),
    };
  });
  const match = rows.find((row) => row.matched);
  const allText = rows
    .filter((row) => row.value)
    .map((row) => `${row.name}  ${row.value}`)
    .join('\n');

  const toggleAlgorithm = (algorithm: HashAlgorithm, on: boolean) =>
    setAlgorithms((previous) =>
      on ? [...previous, algorithm] : previous.filter((entry) => entry !== algorithm)
    );

  const inputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DropZone onFile={(picked) => void loader.load(picked)}>
        {file ? (
          <div className="m-auto flex max-w-xs flex-col items-center gap-3 p-6 text-center">
            <FileText className="size-8 text-fg-subtle" aria-hidden />
            <p className="text-sm font-medium break-all text-fg">
              <bdi>{file.name}</bdi>
            </p>
            <p className="text-xs text-fg-subtle">{formatBytes(file.bytes.length, locale)}</p>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="btn btn-secondary h-8 px-4 text-xs"
            >
              {t.hashText}
            </button>
          </div>
        ) : (
          <CodeEditor
            value={text}
            onChange={setText}
            label={common.input}
            placeholder={t.hashPlaceholder}
            onCursor={setCursor}
            autoFocus
          />
        )}
      </DropZone>
      {hmacEnabled && (
        <SecretPanel>
          <TextField
            label={t.hmacKey}
            value={hmac.key}
            onChange={(value) => setHmac({ ...hmac, key: value })}
            placeholder={t.hmacKeyPlaceholder}
            invalid={draftKeyError !== null || hmacKeyMissing}
          >
            <Segmented
              label={t.keyEncoding}
              value={hmac.encoding}
              onChange={(encoding) => setHmac({ ...hmac, encoding })}
              options={[
                { value: 'utf8', label: t.utf8 },
                { value: 'hex', label: t.hex },
                { value: 'base64', label: t.base64 },
              ]}
            />
          </TextField>
        </SecretPanel>
      )}
    </div>
  );

  const outputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-line bg-surface p-2 text-xs">
        <TextField
          label={t.expected}
          value={expected}
          onChange={setExpected}
          placeholder={t.expectedPlaceholder}
        />
      </div>
      {rows.length === 0 || idle ? (
        <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">
          {rows.length === 0
            ? t.noAlgorithms
            : fmt(common.runHint, { action: t.hash, shortcut: RUN_SHORTCUT })}
        </p>
      ) : (
        <ul className={cn('min-h-0 flex-1 overflow-auto', stale && STALE_OUTPUT_CLASS)}>
          {rows.map((row) => (
            <li
              key={row.algorithm}
              className={cn('border-b border-line', row.matched && 'bg-success/10')}
            >
              <PartHeading
                actions={
                  <CopyButton
                    getText={() => row.value}
                    disabled={!row.value}
                    label={fmt(t.copyDigest, { name: row.name })}
                  />
                }
              >
                <span className="inline-flex items-center gap-2">
                  {row.name}
                  <span className="font-normal tracking-normal normal-case">
                    {fmt(t.bits, { bits: hashBits(row.algorithm) })}
                  </span>
                  {row.matched && (
                    <StateBadge tone="success">
                      <Check className="size-3" aria-hidden />
                      {fmt(t.matches, { name: row.name })}
                    </StateBadge>
                  )}
                </span>
              </PartHeading>
              <p
                dir="ltr"
                className={cn(
                  'px-3 py-2 text-start font-mono text-xs break-all select-all',
                  row.applies ? 'text-fg' : 'text-fg-subtle'
                )}
              >
                {row.applies ? row.value || '…' : t.noHmac}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="crypto"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void loader.load(picked)} />
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => {
                setText('');
                apply('', null);
                loader.clearError();
              }}
              disabled={!file && !text}
            />
            <ToolbarDivider />
            <CopyButton getText={() => allText} disabled={!allText} label={t.copyAll} />
            <RunButton label={t.hash} onRun={() => apply()} pending={stale} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <Segmented
          label={t.outputFormat}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'hex', label: t.hexLower },
            { value: 'HEX', label: t.hexUpper },
            { value: 'base64', label: t.base64 },
          ]}
        />
        <ToolbarDivider />
        <IconAction
          icon={KeyRound}
          label={t.hmac}
          pressed={hmacEnabled}
          onClick={() => setHmacOn(!hmacEnabled)}
        />
        <OptionsPopover label={t.algorithms} icon={ListChecks}>
          {HASH_ALGORITHMS.map((algorithm) => (
            <Toggle
              key={algorithm}
              label={hashLabel(algorithm)}
              checked={algorithms.includes(algorithm)}
              onChange={(on) => toggleAlgorithm(algorithm, on)}
            />
          ))}
        </OptionsPopover>
      </ToolHeader>
      <SplitPane id="crypto-hash" first={inputPane} second={outputPane} />
      <StatusBar>
        {stale && <StaleStatus action={t.hash} onRun={() => apply()} />}
        {loader.error && <StatusItem tone="danger">{loader.error}</StatusItem>}
        {(keyError ?? draftKeyError) && (
          <StatusItem tone="danger" title={keyError ?? draftKeyError!} className="font-sans">
            {t.hmacKey}: {keyError ?? draftKeyError}
          </StatusItem>
        )}
        {hmacKeyMissing && (
          <StatusItem tone="danger" className="font-sans">
            {t.hmacKeyRequired}
          </StatusItem>
        )}
        {ran && selected.length === 0 && (
          <StatusItem tone="danger" className="font-sans">
            {t.noAlgorithms}
          </StatusItem>
        )}
        {hashing.error && (
          <StatusItem tone="danger" title={hashing.error} className="font-sans">
            {hashing.error}
          </StatusItem>
        )}
        {percent !== null && (
          <StatusItem className="shrink-0">{fmt(t.hashing, { percent })}</StatusItem>
        )}
        {expected.trim() && digests && (
          <StatusItem tone={match ? 'success' : 'danger'} className="font-sans">
            {match ? fmt(t.matches, { name: match.name }) : t.noMatch}
          </StatusItem>
        )}
        <StatusItem className="shrink-0">{formatBytes(data.length, locale)}</StatusItem>
        {!file && (
          <div className="hidden sm:contents">
            <CursorStatus cursor={cursor} />
          </div>
        )}
      </StatusBar>
    </>
  );
}
