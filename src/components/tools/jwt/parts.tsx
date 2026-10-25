'use client';

import { useId } from 'react';
import type { AlgorithmFamily } from '@/lib/tools/jwt/algorithms';
import type { JwtPart } from '@/lib/tools/jwt/decode';
import type { KeyUse, SecretEncoding } from '@/lib/tools/jwt/keys';
import { CodeEditor } from '@/components/tools/workbench/code-editor';
import { Segmented } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

/** What the user typed to sign or verify with. Kept in memory only: never persisted. */
export type KeyFields = { secret: string; encoding: SecretEncoding; key: string };

/** Same colors as the token's parts in the editor (see `jwt-language.ts`). */
const PART_DOTS: Record<JwtPart, string> = {
  header: 'bg-code-keyword',
  payload: 'bg-code-property',
  signature: 'bg-code-string',
};

/** Section title bar inside a pane, with an optional colored dot matching the token part. */
export function PartHeading({
  part,
  actions,
  children,
}: {
  part?: JwtPart;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-7 shrink-0 items-center gap-2 border-b border-line bg-surface ps-3 pe-1">
      {part && <span aria-hidden className={cn('size-2 shrink-0 rounded-full', PART_DOTS[part])} />}
      <h2 className="min-w-0 flex-1 truncate text-[11px] font-semibold tracking-wide text-fg-muted uppercase">
        {children}
      </h2>
      {actions}
    </div>
  );
}

/** Editor line height and vertical padding, from `editor-theme.ts` (13px × 1.6, 6px + 6px). */
const LINE_PX = 13 * 1.6;
const PADDING_PX = 14;
const MAX_LINES = 400;

/** Read-only JSON sized to its content, for stacking several in one scrolling column. */
export function JsonBlock({ value, label }: { value: string; label: string }) {
  const lines = Math.min(value.split('\n').length, MAX_LINES);
  return (
    <div
      className="flex shrink-0 border-b border-line"
      style={{ height: lines * LINE_PX + PADDING_PX }}
    >
      <CodeEditor value={value} label={label} language="json" readOnly />
    </div>
  );
}

export type Tone = 'success' | 'danger' | 'warning' | 'muted';

const BADGE_TONES: Record<Tone, string> = {
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  muted: 'bg-surface-2 text-fg-muted',
};

export function StateBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-px text-[10px] font-semibold',
        BADGE_TONES[tone]
      )}
    >
      {children}
    </span>
  );
}

/** Strip under the editors holding the secret or key input. */
export function KeyPanel({
  title,
  aside,
  children,
}: {
  title?: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const t = useToolMessages<'jwt'>();
  return (
    <section
      aria-label={title}
      className="shrink-0 space-y-2 border-t border-line bg-surface p-2 text-xs"
    >
      {(title || aside) && (
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {title && <h2 className="font-medium text-fg-muted">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
      <p className="text-[11px] text-fg-subtle">{t.keysNotSaved}</p>
    </section>
  );
}

const INPUT_CLASSES =
  'w-full min-w-0 rounded-md border border-line bg-surface-2 px-2 font-mono text-xs text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring';

/** A secret (HS*) or a PEM/JWK key (everything else), depending on the algorithm family. */
export function KeyInput({
  family,
  usage,
  value,
  onChange,
}: {
  family: AlgorithmFamily;
  usage: KeyUse;
  value: KeyFields;
  onChange: (value: KeyFields) => void;
}) {
  const t = useToolMessages<'jwt'>();
  const id = useId();
  const typing = { spellCheck: false, autoCapitalize: 'off', autoComplete: 'off', dir: 'ltr' };

  if (family === 'hmac') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="shrink-0 text-fg-subtle">
          {t.secret}
        </label>
        <input
          id={id}
          value={value.secret}
          onChange={(event) => onChange({ ...value, secret: event.target.value })}
          placeholder={usage === 'verify' ? t.secretPlaceholder : t.signSecretPlaceholder}
          className={cn(INPUT_CLASSES, 'h-7 flex-1 basis-48')}
          {...typing}
        />
        <Segmented
          label={t.secretEncoding}
          value={value.encoding}
          onChange={(encoding) => onChange({ ...value, encoding })}
          options={[
            { value: 'utf8', label: t.utf8 },
            { value: 'base64', label: t.base64 },
          ]}
        />
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-fg-subtle">
        {usage === 'verify' ? t.publicKey : t.privateKey}
      </label>
      <textarea
        id={id}
        value={value.key}
        onChange={(event) => onChange({ ...value, key: event.target.value })}
        placeholder={usage === 'verify' ? t.publicKeyPlaceholder : t.privateKeyPlaceholder}
        rows={5}
        className={cn(INPUT_CLASSES, 'block h-24 resize-y py-1.5 text-[11px] leading-snug')}
        {...typing}
      />
    </div>
  );
}
