'use client';

import { useMemo, useRef, useState } from 'react';
import { Eraser, PenLine, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { decodeJwt, type DecodedJwt } from '@/lib/tools/jwt/decode';
import { algorithmInfo, isJwsAlgorithm } from '@/lib/tools/jwt/algorithms';
import { verifyJwt } from '@/lib/tools/jwt/sign';
import { readClaims } from '@/lib/tools/jwt/claims';
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
  IconAction,
  RunButton,
  ToolHeader,
  ToolbarDivider,
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
  type useRunInput,
} from '@/components/tools/workbench/use-run';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { ClaimsTable, TokenTimeStatusItem } from './claims-table';
import {
  JsonBlock,
  KeyInput,
  KeyPanel,
  PartHeading,
  StateBadge,
  type KeyFields,
  type Tone,
} from './parts';

type SignatureStatus = { tone: Tone; text: string; icon: typeof ShieldCheck };

/** Token on one side; header, payload and claims on the other; signature check underneath. */
export function DecodeView({
  picker,
  token,
  onToken,
  keys,
  onKeys,
  runner,
  onEdit,
}: {
  picker: React.ReactNode;
  token: string;
  onToken: (token: string) => void;
  keys: KeyFields;
  onKeys: (keys: KeyFields) => void;
  /** The token as of the last Decode (owned by the tool, so the encoder can hand one over). */
  runner: ReturnType<typeof useRunInput<KeyFields>>;
  /** Opens the token's header and payload in the encoder. */
  onEdit: (decoded: DecodedJwt) => void;
}) {
  const common = useToolCommon();
  const t = useToolMessages<'jwt'>();
  const locale = useLocale();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, settings: appliedKeys, run, ran, stale } = runner;

  const hasInput = live.trim() !== '';
  const result = useMemo(() => (hasInput ? decodeJwt(live) : null), [hasInput, live]);
  const decoded = result?.ok ? result.value : null;
  const error = result && !result.ok ? result.error : null;
  const claims = useMemo(() => (decoded ? readClaims(decoded.payload) : []), [decoded]);

  const alg = decoded?.alg ?? null;
  const family = isJwsAlgorithm(alg) ? algorithmInfo(alg).family : null;
  const keyText = family === 'hmac' ? appliedKeys.secret : appliedKeys.key;
  // Unknown or missing algorithms still "verify", so the lib can explain why they can't be checked.
  const task = useMemo(
    () =>
      decoded && alg !== 'none' && (keyText || !family)
        ? () => verifyJwt(decoded, keyText, { secretEncoding: appliedKeys.encoding })
        : null,
    [decoded, alg, family, keyText, appliedKeys.encoding]
  );
  const verification = useAsyncResult(task);

  const diagnostics = useMemo((): EditorDiagnostic[] => {
    if (error) return [{ ...error, severity: 'error' }];
    return decoded?.warnings.map((warning) => ({ ...warning, severity: 'warning' })) ?? [];
  }, [error, decoded]);

  const signature = ((): SignatureStatus | null => {
    if (!decoded) return null;
    if (alg === 'none') return { tone: 'warning', text: t.unsecured, icon: ShieldAlert };
    if (!task) return { tone: 'muted', text: t.enterKey, icon: ShieldAlert };
    if (verification.pending) return { tone: 'muted', text: t.checking, icon: ShieldAlert };
    const outcome = verification.value;
    if (!outcome) return { tone: 'danger', text: verification.error ?? '', icon: ShieldX };
    if (!outcome.ok) return { tone: 'danger', text: outcome.error, icon: ShieldX };
    return outcome.valid
      ? { tone: 'success', text: t.verified, icon: ShieldCheck }
      : { tone: 'danger', text: t.invalidSignature, icon: ShieldX };
  })();
  const keyWarning = verification.value?.ok ? verification.value.warning : undefined;
  const tokenWarning = decoded?.warnings[0];

  const inputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CodeEditor
        ref={inputRef}
        value={token}
        onChange={onToken}
        label={t.token}
        language="jwt"
        wrap
        placeholder={t.tokenPlaceholder}
        diagnostics={diagnostics}
        onCursor={setCursor}
        autoFocus
      />
      {decoded && signature && (
        <KeyPanel
          title={t.verify}
          aside={
            <>
              {alg && (
                <bdi dir="ltr" className="font-mono font-semibold text-code-keyword">
                  {alg}
                </bdi>
              )}
              <StateBadge tone={signature.tone}>
                <signature.icon className="size-3" aria-hidden />
                <span className="whitespace-normal">{signature.text}</span>
              </StateBadge>
            </>
          }
        >
          {family && <KeyInput family={family} usage="verify" value={keys} onChange={onKeys} />}
        </KeyPanel>
      )}
    </div>
  );

  const outputPane = decoded ? (
    <div className={cn('min-h-0 min-w-0 flex-1 overflow-auto', stale && STALE_OUTPUT_CLASS)}>
      <PartHeading
        part="header"
        actions={
          <CopyButton
            getText={() => decoded.headerText}
            label={fmt(t.copyPart, { part: t.header })}
          />
        }
      >
        {t.header}
      </PartHeading>
      <JsonBlock value={decoded.headerText} label={t.header} />
      <PartHeading
        part="payload"
        actions={
          <CopyButton
            getText={() => decoded.payloadText}
            label={fmt(t.copyPart, { part: t.payload })}
          />
        }
      >
        {t.payload}
      </PartHeading>
      <JsonBlock value={decoded.payloadText} label={t.payload} />
      <PartHeading>{t.claims}</PartHeading>
      <ClaimsTable claims={claims} />
    </div>
  ) : (
    <p className="m-auto max-w-xs p-6 text-center text-xs text-fg-subtle">
      {!ran
        ? fmt(common.runHint, { action: t.decode, shortcut: RUN_SHORTCUT })
        : error
          ? t.invalidPlaceholder
          : t.decodedPlaceholder}
    </p>
  );

  return (
    <>
      <ToolHeader
        slug="jwt"
        actions={
          <>
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => {
                onToken('');
                run('');
              }}
              disabled={!token}
            />
            <ToolbarDivider />
            <IconAction
              icon={PenLine}
              label={t.editAndSign}
              onClick={() => decoded && onEdit(decoded)}
              disabled={!decoded}
            />
            <CopyButton getText={() => token.trim()} disabled={!token.trim()} />
            <RunButton label={t.decode} onRun={() => run()} pending={stale} />
          </>
        }
      >
        {picker}
      </ToolHeader>
      <SplitPane id="jwt" first={inputPane} second={outputPane} />
      <StatusBar>
        {error && (
          <ValidityStatus
            error={{ message: error.message, ...positionAt(live, error.from) }}
            onReveal={() => inputRef.current?.reveal(error.from, error.to)}
          />
        )}
        {decoded && (
          <>
            {alg && <StatusItem className="shrink-0">{alg}</StatusItem>}
            <TokenTimeStatusItem claims={claims} />
            {signature && (
              <StatusItem tone={signature.tone} title={signature.text}>
                <signature.icon className="size-3 shrink-0" aria-hidden />
                <span className="truncate font-sans">{signature.text}</span>
              </StatusItem>
            )}
            {keyWarning && (
              <StatusItem tone="warning" title={keyWarning} className="font-sans">
                {keyWarning}
              </StatusItem>
            )}
            {tokenWarning && (
              <StatusItem
                tone="warning"
                title={tokenWarning.message}
                className="font-sans"
                onClick={() => inputRef.current?.reveal(tokenWarning.from, tokenWarning.to)}
              >
                {tokenWarning.message}
              </StatusItem>
            )}
          </>
        )}
        {stale && <StaleStatus action={t.decode} onRun={() => run()} />}
        {ran && !hasInput && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: t.decode })}
          </StatusItem>
        )}
        {hasInput && (
          <StatusItem className="shrink-0 max-sm:hidden">
            {formatBytes(utf8Length(live.trim()), locale)}
          </StatusItem>
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
