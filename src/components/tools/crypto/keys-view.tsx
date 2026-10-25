'use client';

import { useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { KEY_TYPES, KEY_TYPE_LABELS, generateKeyPair } from '@/lib/tools/crypto/keypair';
import { supportsEd25519 } from '@/lib/tools/jwt/sign';
import { CodeEditor } from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  Segmented,
  ToolHeader,
  ToolbarDivider,
  ToolbarSelect,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { downloadFile } from '@/components/tools/workbench/file';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { useKeyFormat, useKeyType, type KeyFormat } from './state';

const FILES: Record<KeyFormat, { suffix: string; type: string }> = {
  pem: { suffix: '.pem', type: 'application/x-pem-file' },
  jwk: { suffix: '.jwk.json', type: 'application/json' },
};

/** RSA, EC and Ed25519 key pairs from Web Crypto, as PEM or JWK. Never persisted. */
export function KeysView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'crypto'>();
  const [type, setType] = useKeyType();
  const [format, setFormat] = useKeyFormat();
  const [run, setRun] = useState(0);
  const edSupported = useAsyncResult(supportsEd25519).value !== false;
  const available = edSupported ? type : type === 'ed25519' ? null : type;

  // `run` changes the request (and so generates again) when a new pair is asked for.
  const request = useMemo(() => (available ? { type: available, run } : null), [available, run]);
  const task = useMemo(() => request && (() => generateKeyPair(request.type)), [request]);
  const job = useAsyncResult(task);
  const pair = task ? job.value : undefined;

  const types = KEY_TYPES.filter((value) => value !== 'ed25519' || edSupported);
  const privateText = pair ? (format === 'pem' ? pair.privatePem : pair.privateJwk) : '';
  const publicText = pair ? (format === 'pem' ? pair.publicPem : pair.publicJwk) : '';
  const language = format === 'jwk' ? 'json' : 'plain';
  const placeholder = job.pending ? t.generating : '';

  const pane = (title: string, text: string, filename: string) => (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading
        actions={
          <>
            <IconAction
              icon={Download}
              label={fmt(t.downloadKey, { name: title })}
              disabled={!text}
              onClick={() =>
                downloadFile(text, `${filename}${FILES[format].suffix}`, FILES[format].type)
              }
            />
            <CopyButton getText={() => text} disabled={!text} />
          </>
        }
      >
        {title}
      </PartHeading>
      <CodeEditor
        value={text}
        label={title}
        language={language}
        readOnly
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="crypto"
        actions={
          <IconAction
            icon={RefreshCw}
            label={t.regenerate}
            onClick={() => setRun(run + 1)}
            disabled={job.pending || !available}
          />
        }
      >
        {picker}
        <ToolbarDivider />
        <ToolbarSelect
          label={t.keyType}
          value={type}
          onChange={setType}
          options={types.map((value) => ({ value, label: KEY_TYPE_LABELS[value] }))}
        />
        <Segmented
          label={t.keyFormat}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'pem', label: t.pem },
            { value: 'jwk', label: t.jwk },
          ]}
        />
      </ToolHeader>
      <SplitPane
        id="crypto-keys"
        first={pane(t.privateKey, privateText, 'private-key')}
        second={pane(t.publicKey, publicText, 'public-key')}
      />
      <p className="shrink-0 border-t border-line bg-surface px-3 py-1.5 text-[11px] text-fg-subtle">
        {t.keysHint} {t.secretsNotSaved}
      </p>
      <StatusBar>
        {!available && (
          <StatusItem tone="warning" className="font-sans">
            {t.ed25519Unsupported}
          </StatusItem>
        )}
        {job.error && (
          <StatusItem tone="danger" title={job.error} className="font-sans">
            {fmt(t.generateFailed, { message: job.error })}
          </StatusItem>
        )}
        {job.pending && <StatusItem className="shrink-0">{t.generating}</StatusItem>}
        {pair && (
          <StatusItem title={pair.thumbprint}>
            {t.thumbprint}: {pair.thumbprint}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}
