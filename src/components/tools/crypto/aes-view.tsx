'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, Dices, Eraser } from 'lucide-react';
import {
  AES_MODES,
  KEY_SOURCES,
  MAX_ITERATIONS,
  OPENSSL_KDFS,
  decryptAes,
  encryptAes,
  ivLength,
  opensslCommand,
  randomHex,
  usesIterations,
  type AesSecrets,
  type AesSettings,
  type DecryptResult,
  type EncryptResult,
  type KeySource,
} from '@/lib/tools/crypto/aes';
import { encodeHex } from '@/lib/tools/encode/hex';
import { formatBytes, utf8Length } from '@/lib/tools/bytes';
import { CodeEditor, type CursorInfo } from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  RunButton,
  Segmented,
  ToolHeader,
  ToolbarDivider,
  ToolbarSelect,
} from '@/components/tools/workbench/toolbar';
import { OptionsPopover, SelectField } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
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
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { NumberField, SecretPanel, TextField } from './parts';
import { useAesDirection, useAesSettings } from './state';

const encoder = new TextEncoder();
const strictUtf8 = new TextDecoder('utf-8', { fatal: true });

const SAMPLE_PLAINTEXT = 'Hello, World! 👋';
const NO_SECRETS: AesSecrets = { passphrase: '', key: '', iv: '' };

type Output = { text: string; hex: boolean };

function decodeOutput(bytes: Uint8Array): Output {
  try {
    return { text: strictUtf8.decode(bytes), hex: false };
  } catch {
    return { text: encodeHex(bytes), hex: true };
  }
}

/** Encrypt or decrypt with AES-GCM/CBC/CTR, keyed by a passphrase or a raw key and IV. */
export function AesView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'crypto'>();
  const locale = useLocale();
  const [direction, setDirection] = useAesDirection();
  const [settings, setSettings] = useAesSettings();
  // Plaintext and ciphertext can be sensitive too, so neither is persisted.
  const [input, setInput] = useState(SAMPLE_PLAINTEXT);
  const [secrets, setSecrets] = useState(NO_SECRETS);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, run, ran, stale } = useRunInput(input);
  const replaceInput = (next: string) => {
    setInput(next);
    run(next);
  };

  const { source, mode } = settings;
  const encrypting = direction === 'encrypt';
  const missingSecret =
    source === 'raw' ? !secrets.key.trim() || !secrets.iv.trim() : !secrets.passphrase;

  const task = useMemo(() => {
    if (!ran || missingSecret || (!encrypting && !live.trim())) return null;
    return (): Promise<EncryptResult | DecryptResult> =>
      encrypting
        ? encryptAes(encoder.encode(live), settings, secrets)
        : decryptAes(live, settings, secrets);
  }, [ran, missingSecret, encrypting, live, settings, secrets]);
  const running = useAsyncResult(task);
  const result = task ? (running.value ?? running.latest) : undefined;
  const failure = result && !result.ok ? result : null;
  const output: Output | null = !result?.ok
    ? null
    : 'output' in result
      ? { text: result.output, hex: false }
      : decodeOutput(result.bytes);

  const update = (patch: Partial<AesSettings>) => setSettings({ ...settings, ...patch });
  const changeSource = (next: KeySource) =>
    // openssl enc has no GCM, so moving to the OpenSSL format picks CBC.
    update({ source: next, mode: next === 'openssl' && mode === 'GCM' ? 'CBC' : mode });

  const swap = () => {
    if (!output || output.hex) return;
    // Reusing the result is explicit, so it runs right away.
    replaceInput(output.text);
    setDirection(encrypting ? 'decrypt' : 'encrypt');
  };

  const format =
    source === 'pbkdf2' ? t.formatPbkdf2 : source === 'openssl' ? t.formatOpenssl : t.formatRaw;
  const command = opensslCommand(settings, direction);
  const runLabel = encrypting ? t.encrypt : t.decrypt;
  const placeholder = missingSecret
    ? source === 'raw'
      ? t.enterKey
      : t.enterPassphrase
    : !ran
      ? fmt(common.runHint, { action: runLabel, shortcut: RUN_SHORTCUT })
      : failure
        ? t.errorPlaceholder
        : t.outputPlaceholder;

  const inputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CodeEditor
        value={input}
        onChange={setInput}
        label={common.input}
        wrap
        placeholder={encrypting ? t.plaintextPlaceholder : t.ciphertextPlaceholder}
        onCursor={setCursor}
        autoFocus
      />
      <SecretPanel>
        {source === 'raw' ? (
          <>
            <TextField
              label={t.key}
              value={secrets.key}
              onChange={(key) => setSecrets({ ...secrets, key })}
              placeholder={t.keyPlaceholder}
              invalid={failure?.field === 'key'}
            >
              <IconAction
                icon={Dices}
                label={t.generateKey}
                onClick={() => setSecrets({ ...secrets, key: randomHex(settings.keyBits / 8) })}
              />
            </TextField>
            <TextField
              label={t.iv}
              value={secrets.iv}
              onChange={(iv) => setSecrets({ ...secrets, iv })}
              placeholder={fmt(t.ivPlaceholder, { bytes: ivLength(mode) })}
              invalid={failure?.field === 'iv'}
            >
              <IconAction
                icon={Dices}
                label={t.generateIv}
                onClick={() => setSecrets({ ...secrets, iv: randomHex(ivLength(mode)) })}
              />
            </TextField>
          </>
        ) : (
          <TextField
            label={t.passphrase}
            value={secrets.passphrase}
            onChange={(passphrase) => setSecrets({ ...secrets, passphrase })}
            placeholder={t.passphrasePlaceholder}
            invalid={failure?.field === 'passphrase'}
          />
        )}
      </SecretPanel>
    </div>
  );

  const outputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CodeEditor
        value={output?.text ?? ''}
        label={common.output}
        readOnly
        wrap
        placeholder={placeholder}
        className={cn(stale && STALE_OUTPUT_CLASS)}
      />
      <div className="shrink-0 space-y-1.5 border-t border-line bg-surface p-2 text-[11px] text-fg-subtle">
        <p>
          {format}
          {mode === 'GCM' && ` ${t.gcmTag}`}
        </p>
        {command && (
          <div className="flex items-center gap-2">
            <span className="shrink-0">{t.command}</span>
            <code dir="ltr" className="min-w-0 flex-1 truncate font-mono text-fg">
              {command}
            </code>
            <CopyButton getText={() => command} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="crypto"
        actions={
          <>
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => replaceInput('')}
              disabled={!input}
            />
            <IconAction
              icon={ArrowLeftRight}
              label={t.useOutput}
              onClick={swap}
              disabled={!output || output.hex}
              className="rtl:-scale-x-100"
            />
            <ToolbarDivider />
            <CopyButton getText={() => output?.text ?? ''} disabled={!output} />
            <RunButton label={runLabel} onRun={() => run()} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <Segmented
          label={t.direction}
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'encrypt', label: t.encrypt },
            { value: 'decrypt', label: t.decrypt },
          ]}
        />
        <ToolbarDivider />
        <ToolbarSelect
          label={t.keySource}
          value={source}
          onChange={changeSource}
          options={KEY_SOURCES.map((value) => ({ value, label: t.sources[value] }))}
        />
        <ToolbarSelect
          label={t.cipherMode}
          value={mode}
          onChange={(next) => update({ mode: next })}
          options={AES_MODES.filter((value) => source !== 'openssl' || value !== 'GCM').map(
            (value) => ({ value, label: `AES-${value}` })
          )}
        />
        <OptionsPopover>
          {source !== 'raw' && (
            <SelectField
              label={t.keySize}
              value={String(settings.keyBits) as '128' | '256'}
              onChange={(bits) => update({ keyBits: bits === '128' ? 128 : 256 })}
              options={[
                { value: '256', label: fmt(t.keyBits, { bits: 256 }) },
                { value: '128', label: fmt(t.keyBits, { bits: 128 }) },
              ]}
            />
          )}
          {source === 'openssl' && (
            <SelectField
              label={t.opensslKdf}
              value={settings.opensslKdf}
              onChange={(opensslKdf) => update({ opensslKdf })}
              options={OPENSSL_KDFS.map((value) => ({ value, label: t.kdfs[value] }))}
            />
          )}
          {usesIterations(settings) && (
            <NumberField
              label={t.iterations}
              value={settings.iterations}
              onChange={(iterations) => update({ iterations })}
              min={1}
              max={MAX_ITERATIONS}
              hint={t.iterationsHint}
            />
          )}
          <SelectField
            label={t.cipherEncoding}
            value={settings.encoding}
            onChange={(encoding) => update({ encoding })}
            options={[
              { value: 'base64', label: t.base64 },
              { value: 'hex', label: t.hex },
            ]}
          />
        </OptionsPopover>
      </ToolHeader>
      <SplitPane id="crypto-aes" first={inputPane} second={outputPane} />
      <StatusBar>
        {stale && <StaleStatus action={runLabel} onRun={() => run()} />}
        {failure && (
          <StatusItem tone="danger" title={failure.error} className="font-sans">
            {failure.error}
          </StatusItem>
        )}
        {running.error && (
          <StatusItem tone="danger" title={running.error} className="font-sans">
            {running.error}
          </StatusItem>
        )}
        {running.pending && <StatusItem className="shrink-0">{t.working}</StatusItem>}
        {output?.hex && (
          <StatusItem tone="warning" className="font-sans">
            {t.notText}
          </StatusItem>
        )}
        {output && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {fmt(t.sizeChange, {
              from: formatBytes(utf8Length(live), locale),
              to: formatBytes(
                output.hex ? output.text.length / 2 : utf8Length(output.text),
                locale
              ),
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
