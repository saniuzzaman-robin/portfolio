'use client';

import { useMemo, useRef, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import {
  JWS_ALGORITHMS,
  algorithmInfo,
  isJwsAlgorithm,
  keyDescription,
  type JwsAlgorithm,
} from '@/lib/tools/jwt/algorithms';
import { generateJwtKey, signJwt, supportsEd25519, withHeaderAlg } from '@/lib/tools/jwt/sign';
import { stringMember } from '@/lib/tools/jwt/decode';
import { parseJson, positionAt } from '@/lib/tools/json/parse';
import { formatBytes } from '@/lib/tools/bytes';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  RunButton,
  ToolHeader,
  ToolbarDivider,
  ToolbarSelect,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import {
  CursorStatus,
  StaleStatus,
  StatusBar,
  StatusItem,
  ValidityStatus,
} from '@/components/tools/workbench/status-bar';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import {
  RUN_SHORTCUT,
  STALE_OUTPUT_CLASS,
  type useRunInputs,
} from '@/components/tools/workbench/use-run';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { KeyInput, KeyPanel, PartHeading, type KeyFields } from './parts';

export type GeneratedPublicKey = { alg: JwsAlgorithm; pem: string };

const NO_DIAGNOSTICS: EditorDiagnostic[] = [];

/** The header's `alg`, when the header is a JSON object with one. */
function headerAlg(header: string): string | null {
  const parsed = parseJson(header);
  return parsed.ok && parsed.value.type === 'object' ? stringMember(parsed.value, 'alg') : null;
}

function keyFor(alg: string | null, keys: KeyFields): string {
  return isJwsAlgorithm(alg) && algorithmInfo(alg).family === 'hmac' ? keys.secret : keys.key;
}

/** Header and payload editors plus a key on one side, the signed token on the other. */
export function EncodeView({
  picker,
  header,
  onHeader,
  payload,
  onPayload,
  keys,
  onKeys,
  publicKey,
  onPublicKey,
  runner,
  onVerify,
}: {
  picker: React.ReactNode;
  header: string;
  onHeader: (header: string) => void;
  payload: string;
  onPayload: (payload: string) => void;
  keys: KeyFields;
  onKeys: (keys: KeyFields) => void;
  /** Public half of the last generated key pair, shown so signed tokens can be verified. */
  publicKey: GeneratedPublicKey | null;
  onPublicKey: (publicKey: GeneratedPublicKey | null) => void;
  /** Header and payload as of the last Sign (owned by the tool, so the decoder can hand some over). */
  runner: ReturnType<typeof useRunInputs<KeyFields>>;
  /** Opens the signed token in the decoder. */
  onVerify: (token: string, alg: JwsAlgorithm) => void;
}) {
  const common = useToolCommon();
  const t = useToolMessages<'jwt'>();
  const locale = useLocale();
  const headerRef = useRef<CodeEditorHandle>(null);
  const payloadRef = useRef<CodeEditorHandle>(null);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const { values, settings: signedKeys, run, ran, stale } = runner;
  const [signedHeader, signedPayload] = values;

  const rawAlg = useMemo(() => headerAlg(header), [header]);
  const alg = isJwsAlgorithm(rawAlg) ? rawAlg : null;
  const family = alg ? algorithmInfo(alg).family : null;
  // Signing uses the algorithm of the header that was signed, which may lag behind the editor.
  const signedAlg = useMemo(() => headerAlg(signedHeader), [signedHeader]);
  const keyText = keyFor(signedAlg, signedKeys);
  const edSupported = useAsyncResult(supportsEd25519).value !== false;

  const task = useMemo(
    () =>
      ran
        ? () =>
            signJwt(signedHeader, signedPayload, keyText, { secretEncoding: signedKeys.encoding })
        : null,
    [ran, signedHeader, signedPayload, keyText, signedKeys.encoding]
  );
  const signing = useAsyncResult(task);
  // While a new signature is computed, keep showing the previous result instead of flickering.
  const shown = task ? (signing.value ?? signing.latest) : undefined;
  const output = shown?.ok ? shown.token : '';
  const failure = shown && !shown.ok ? shown : null;
  const editorError = failure && failure.target !== 'key' ? failure : null;
  const warning = shown?.ok ? shown.warnings[0] : undefined;
  const generated =
    publicKey && alg && keyDescription(publicKey.alg) === keyDescription(alg) ? publicKey : null;

  const headerDiagnostics = useMemo(
    (): EditorDiagnostic[] =>
      editorError?.target === 'header'
        ? [{ ...editorError.error, severity: 'error' }]
        : NO_DIAGNOSTICS,
    [editorError]
  );
  const payloadDiagnostics = useMemo(
    (): EditorDiagnostic[] =>
      editorError?.target === 'payload'
        ? [{ ...editorError.error, severity: 'error' }]
        : NO_DIAGNOSTICS,
    [editorError]
  );

  const generate = () => {
    if (!alg) return;
    setGenerateError(null);
    generateJwtKey(alg).then(
      (key) => {
        if (key.kind === 'secret') {
          onKeys({ ...keys, secret: key.secret, encoding: 'base64' });
          onPublicKey(null);
        } else {
          onKeys({ ...keys, key: key.privateKey });
          onPublicKey({ alg, pem: key.publicKey });
        }
      },
      (error: unknown) => {
        console.error('Key generation failed:', error);
        setGenerateError(error instanceof Error ? error.message : String(error));
      }
    );
  };

  const algorithms = JWS_ALGORITHMS.filter((value) => value !== 'EdDSA' || edSupported);
  const algOptions: { value: JwsAlgorithm | ''; label: string }[] = [
    ...(alg ? [] : [{ value: '' as const, label: t.chooseAlgorithm }]),
    ...algorithms.map((value) => ({ value, label: value })),
  ];

  const inputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading part="header">{t.header}</PartHeading>
      <div className="flex h-32 shrink-0 border-b border-line">
        <CodeEditor
          ref={headerRef}
          value={header}
          onChange={onHeader}
          label={t.header}
          language="json"
          placeholder={t.headerPlaceholder}
          diagnostics={headerDiagnostics}
          onCursor={setCursor}
        />
      </div>
      <PartHeading part="payload">{t.payload}</PartHeading>
      <CodeEditor
        ref={payloadRef}
        value={payload}
        onChange={onPayload}
        label={t.payload}
        language="json"
        placeholder={t.payloadPlaceholder}
        diagnostics={payloadDiagnostics}
        onCursor={setCursor}
        autoFocus
      />
      <KeyPanel>
        {family && <KeyInput family={family} usage="sign" value={keys} onChange={onKeys} />}
      </KeyPanel>
    </div>
  );

  const outputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading>{t.token}</PartHeading>
      <CodeEditor
        value={output}
        label={t.token}
        language="jwt"
        readOnly
        wrap
        placeholder={
          !ran
            ? fmt(common.runHint, { action: t.sign, shortcut: RUN_SHORTCUT })
            : failure
              ? t.signErrorPlaceholder
              : t.signedPlaceholder
        }
        className={cn(stale && STALE_OUTPUT_CLASS)}
      />
      {generated && (
        <>
          <PartHeading
            actions={
              <CopyButton
                getText={() => generated.pem}
                label={fmt(t.copyPart, { part: t.generatedPublicKey })}
              />
            }
          >
            {t.generatedPublicKey}
          </PartHeading>
          <div className="flex h-44 shrink-0">
            <CodeEditor value={generated.pem} label={t.generatedPublicKey} readOnly />
          </div>
          <p className="shrink-0 border-t border-line px-3 py-1.5 text-[11px] text-fg-subtle">
            {t.generatedHint}
          </p>
        </>
      )}
    </div>
  );

  const editorText = editorError?.target === 'payload' ? signedPayload : signedHeader;
  const editorRef = editorError?.target === 'payload' ? payloadRef : headerRef;

  return (
    <>
      <ToolHeader
        slug="jwt"
        actions={
          <>
            <IconAction icon={KeyRound} label={t.generateKey} onClick={generate} disabled={!alg} />
            <ToolbarDivider />
            <IconAction
              icon={ShieldCheck}
              label={t.openInDecoder}
              onClick={() => isJwsAlgorithm(signedAlg) && onVerify(output, signedAlg)}
              disabled={!output || !isJwsAlgorithm(signedAlg)}
            />
            <CopyButton getText={() => output} disabled={!output} />
            <RunButton label={t.sign} onRun={() => run()} pending={stale} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <ToolbarSelect
          label={t.algorithm}
          value={alg ?? ''}
          onChange={(next) => {
            if (!next) return;
            const updated = withHeaderAlg(header, next);
            if (updated === null) return;
            onHeader(updated);
          }}
          options={algOptions}
        />
      </ToolHeader>
      <SplitPane id="jwt-encode" first={inputPane} second={outputPane} />
      <StatusBar>
        {editorError && (
          <ValidityStatus
            error={{
              message: editorError.error.message,
              ...positionAt(editorText, editorError.error.from),
            }}
            onReveal={() => editorRef.current?.reveal(editorError.error.from, editorError.error.to)}
          />
        )}
        {stale && <StaleStatus action={t.sign} onRun={() => run()} />}
        {failure?.target === 'key' && (
          <StatusItem tone="danger" title={failure.error.message} className="font-sans">
            {failure.error.message}
          </StatusItem>
        )}
        {alg === 'EdDSA' && !edSupported && (
          <StatusItem tone="warning" className="font-sans">
            {t.ed25519Unsupported}
          </StatusItem>
        )}
        {generateError && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(t.generateFailed, { message: generateError })}
          </StatusItem>
        )}
        {warning && (
          <StatusItem tone="warning" title={warning} className="font-sans">
            {warning}
          </StatusItem>
        )}
        {output && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {formatBytes(output.length, locale)}
          </StatusItem>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
