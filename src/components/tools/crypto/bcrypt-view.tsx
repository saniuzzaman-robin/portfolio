'use client';

import { useId, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck, ShieldX } from 'lucide-react';
import {
  BCRYPT_MAX_BYTES,
  BCRYPT_MIN_COST,
  parseBcryptHash,
  type BcryptParts,
} from '@/lib/tools/crypto/bcrypt';
import { utf8Length } from '@/lib/tools/bytes';
import {
  CopyButton,
  IconAction,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { useDebouncedValue } from '@/components/tools/workbench/use-live-input';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { DetailList, SecretPanel, TextField } from './parts';
import { runBcrypt } from './run-bcrypt';
import { BCRYPT_SLIDER_MAX, useBcryptAction, useBcryptCost } from './state';

/** Wait for a pause in typing: every keystroke would otherwise start a slow hash. */
const TYPING_DELAY_MS = 250;

/** bcrypt hash and verify; the work runs in a worker. */
export function BcryptView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'crypto'>();
  const [action, setAction] = useBcryptAction();
  const [cost, setCost] = useBcryptCost();
  const [password, setPassword] = useState('');
  const [hash, setHash] = useState('');
  const [run, setRun] = useState(0);
  const typedPassword = useDebouncedValue(password, TYPING_DELAY_MS);
  const typedHash = useDebouncedValue(hash, TYPING_DELAY_MS);

  const parsed = useMemo(() => (typedHash.trim() ? parseBcryptHash(typedHash) : null), [typedHash]);
  // `run` changes the request (and so restarts the job) when a new salt is asked for.
  const request = useMemo(() => {
    if (!typedPassword) return null;
    if (action === 'hash') return { kind: 'hash', password: typedPassword, cost, run } as const;
    return parsed?.ok
      ? ({ kind: 'compare', password: typedPassword, hash: typedHash } as const)
      : null;
  }, [action, typedPassword, cost, run, parsed, typedHash]);
  const task = useMemo(
    () =>
      request &&
      ((signal: AbortSignal) =>
        request.kind === 'hash'
          ? runBcrypt({ kind: 'hash', password: request.password, cost: request.cost }, signal)
          : runBcrypt(request, signal)),
    [request]
  );
  const job = useAsyncResult(task);
  const response = task ? job.value : undefined;
  const failure = response && !response.ok ? response.error : (job.error ?? null);
  const hashed = response?.ok && response.kind === 'hash' ? response.hash : null;
  const match = response?.ok && response.kind === 'compare' ? response.match : null;
  const hashedParts = useMemo(() => {
    const result = hashed ? parseBcryptHash(hashed) : null;
    return result?.ok ? result.value : null;
  }, [hashed]);

  const passwordBytes = utf8Length(password);
  const tooLong = passwordBytes > BCRYPT_MAX_BYTES;

  const inputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3 text-xs">
        <TextField
          label={t.password}
          value={password}
          onChange={setPassword}
          placeholder={action === 'hash' ? t.passwordPlaceholder : t.checkPasswordPlaceholder}
        />
        {action === 'hash' ? (
          <CostSlider value={cost} onChange={setCost} />
        ) : (
          <TextField
            label={t.bcryptHash}
            value={hash}
            onChange={setHash}
            placeholder={t.bcryptHashPlaceholder}
            invalid={parsed?.ok === false}
          />
        )}
      </div>
      <SecretPanel />
    </div>
  );

  const outputPane =
    action === 'hash' ? (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PartHeading
          actions={
            <>
              <IconAction
                icon={RefreshCw}
                label={t.newSalt}
                onClick={() => setRun(run + 1)}
                disabled={job.pending}
              />
              <CopyButton getText={() => hashed ?? ''} disabled={!hashed} />
            </>
          }
        >
          {t.bcryptHash}
        </PartHeading>
        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
          <p
            dir="ltr"
            className={cn(
              'text-start font-mono text-sm break-all select-all',
              hashed ? 'text-fg' : 'text-fg-subtle'
            )}
          >
            {hashed ?? (job.pending ? t.working : t.bcryptPlaceholder)}
          </p>
          {hashedParts && <HashParts parts={hashedParts} />}
        </div>
      </div>
    ) : (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PartHeading>{t.verify}</PartHeading>
        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
          {match === null ? (
            <p className="text-xs text-fg-subtle">
              {job.pending ? t.working : t.verifyPlaceholder}
            </p>
          ) : (
            <p
              className={cn(
                'flex items-center gap-2 text-sm font-semibold',
                match ? 'text-success' : 'text-danger'
              )}
            >
              {match ? (
                <ShieldCheck className="size-5" aria-hidden />
              ) : (
                <ShieldX className="size-5" aria-hidden />
              )}
              {match ? t.passwordMatches : t.passwordMismatch}
            </p>
          )}
          {parsed?.ok && <HashParts parts={parsed.value} />}
        </div>
      </div>
    );

  return (
    <>
      <ToolHeader slug="crypto">
        {picker}
        <ToolbarDivider />
        <Segmented
          label={t.action}
          value={action}
          onChange={setAction}
          options={[
            { value: 'hash', label: t.hash },
            { value: 'verify', label: t.verify },
          ]}
        />
      </ToolHeader>
      <SplitPane id="crypto-bcrypt" first={inputPane} second={outputPane} />
      <StatusBar>
        {action === 'verify' && parsed && !parsed.ok && (
          <StatusItem tone="danger" title={parsed.error} className="font-sans">
            {parsed.error}
          </StatusItem>
        )}
        {failure && (
          <StatusItem tone="danger" title={failure} className="font-sans">
            {failure}
          </StatusItem>
        )}
        {tooLong && (
          <StatusItem tone="warning" className="font-sans">
            {fmt(t.tooLong, { bytes: passwordBytes })}
          </StatusItem>
        )}
        {job.pending && <StatusItem className="shrink-0">{t.working}</StatusItem>}
        {match !== null && (
          <StatusItem tone={match ? 'success' : 'danger'} className="font-sans">
            {match ? t.passwordMatches : t.passwordMismatch}
          </StatusItem>
        )}
      </StatusBar>
    </>
  );
}

function CostSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const t = useToolMessages<'crypto'>();
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="w-24 shrink-0 text-fg-subtle">
          {t.cost}
        </label>
        <input
          id={id}
          type="range"
          min={BCRYPT_MIN_COST}
          max={BCRYPT_SLIDER_MAX}
          step={1}
          value={value}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          className="min-w-0 flex-1 cursor-pointer accent-primary"
        />
        <output htmlFor={id} className="w-6 text-end font-mono text-fg">
          {value}
        </output>
      </div>
      <p className="ps-26 text-fg-subtle">{fmt(t.costHint, { cost: value })}</p>
    </div>
  );
}

function HashParts({ parts }: { parts: BcryptParts }) {
  const t = useToolMessages<'crypto'>();
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-semibold tracking-wide text-fg-muted uppercase">
        {t.hashParts}
      </h3>
      <DetailList
        rows={[
          [t.version, `$${parts.version}$`],
          [t.cost, String(parts.cost)],
          [t.salt, parts.salt],
          [t.checksum, parts.checksum],
        ]}
      />
    </section>
  );
}
