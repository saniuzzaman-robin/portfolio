'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Random } from '@/lib/tools/generate/random';
import {
  AMBIGUOUS,
  CHARSET_KEYS,
  PASSPHRASE_MAX_WORDS,
  PASSPHRASE_MIN_WORDS,
  PASSPHRASE_SEPARATORS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  generatePassphrase,
  generatePassword,
  strengthOf,
  type PassphraseSeparator,
  type Strength,
} from '@/lib/tools/generate/password';
import {
  CopyButton,
  IconAction,
  Segmented,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { SelectField, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { PartHeading } from '@/components/tools/jwt/parts';
import { useToolMessages } from '@/i18n/tools/provider';
import type { ToolMessages } from '@/i18n/tools/en';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { RangeField, useFormatNumber } from './parts';
import { usePassphraseOptions, usePasswordKind, usePasswordOptions } from './state';

type SeparatorKey = keyof ToolMessages['generate']['separators'];

const SEPARATOR_KEYS: Record<PassphraseSeparator, SeparatorKey> = {
  '-': 'hyphen',
  ' ': 'space',
  '.': 'period',
  _: 'underscore',
  '': 'none',
};

const STRENGTHS: Record<Strength, { segments: number; bar: string; text: string }> = {
  weak: { segments: 1, bar: 'bg-danger', text: 'text-danger' },
  fair: { segments: 2, bar: 'bg-warning', text: 'text-warning' },
  strong: { segments: 3, bar: 'bg-success', text: 'text-success' },
  veryStrong: { segments: 4, bar: 'bg-success', text: 'text-success' },
};

let random: Random | null = null;
const getRandom = () => (random ??= new Random());

/** Passwords and diceware-style passphrases with their entropy. Never persisted. */
export function PasswordView({ picker }: { picker: React.ReactNode }) {
  const t = useToolMessages<'generate'>();
  const formatNumber = useFormatNumber();
  const [kind, setKind] = usePasswordKind();
  const [passwordOptions, setPasswordOptions] = usePasswordOptions();
  const [passphraseOptions, setPassphraseOptions] = usePassphraseOptions();
  const [run, setRun] = useState(0);

  // `run` changes the request (and so generates again) when a new password is asked for.
  const request = useMemo(
    () => ({ kind, passwordOptions, passphraseOptions, run }),
    [kind, passwordOptions, passphraseOptions, run]
  );
  // Generated in an effect, never during render: the server must not produce a password.
  const task = useMemo(
    () => async () =>
      request.kind === 'password'
        ? generatePassword(getRandom(), request.passwordOptions)
        : generatePassphrase(getRandom(), request.passphraseOptions),
    [request]
  );
  const job = useAsyncResult(task);
  const result = job.value ?? job.latest;
  const password = result?.ok ? result.password : null;
  const strength = result?.ok ? strengthOf(result.bits) : null;

  const error =
    result && !result.ok
      ? result.error === 'noCharsets'
        ? t.noCharsets
        : result.error === 'length'
          ? fmt(t.badLength, { min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH })
          : fmt(t.badWords, { min: PASSPHRASE_MIN_WORDS, max: PASSPHRASE_MAX_WORDS })
      : null;

  const settingsPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3 text-xs">
        {kind === 'password' ? (
          <>
            <RangeField
              label={t.length}
              value={passwordOptions.length}
              onChange={(length) => setPasswordOptions((previous) => ({ ...previous, length }))}
              min={PASSWORD_MIN_LENGTH}
              max={PASSWORD_MAX_LENGTH}
            />
            {CHARSET_KEYS.map((key) => (
              <Toggle
                key={key}
                label={t.charsets[key]}
                checked={passwordOptions[key]}
                onChange={(checked) =>
                  setPasswordOptions((previous) => ({ ...previous, [key]: checked }))
                }
              />
            ))}
            <Toggle
              label={t.excludeAmbiguous}
              hint={fmt(t.excludeAmbiguousHint, { chars: [...AMBIGUOUS].join(' ') })}
              checked={passwordOptions.excludeAmbiguous}
              onChange={(excludeAmbiguous) =>
                setPasswordOptions((previous) => ({ ...previous, excludeAmbiguous }))
              }
            />
            <p className="text-fg-subtle">{t.passwordHint}</p>
          </>
        ) : (
          <>
            <RangeField
              label={t.words}
              value={passphraseOptions.words}
              onChange={(words) => setPassphraseOptions((previous) => ({ ...previous, words }))}
              min={PASSPHRASE_MIN_WORDS}
              max={PASSPHRASE_MAX_WORDS}
            />
            <SelectField
              label={t.separator}
              value={SEPARATOR_KEYS[passphraseOptions.separator]}
              onChange={(key) => {
                const separator = PASSPHRASE_SEPARATORS.find(
                  (value) => SEPARATOR_KEYS[value] === key
                );
                if (separator !== undefined) {
                  setPassphraseOptions((previous) => ({ ...previous, separator }));
                }
              }}
              options={PASSPHRASE_SEPARATORS.map((value) => ({
                value: SEPARATOR_KEYS[value],
                label: t.separators[SEPARATOR_KEYS[value]],
              }))}
            />
            <Toggle
              label={t.capitalize}
              checked={passphraseOptions.capitalize}
              onChange={(capitalize) =>
                setPassphraseOptions((previous) => ({ ...previous, capitalize }))
              }
            />
            <Toggle
              label={t.addNumber}
              hint={t.addNumberHint}
              checked={passphraseOptions.number}
              onChange={(number) => setPassphraseOptions((previous) => ({ ...previous, number }))}
            />
            <p className="text-fg-subtle">{t.wordlistHint}</p>
          </>
        )}
      </div>
      <p className="shrink-0 border-t border-line bg-surface px-3 py-1.5 text-[11px] text-fg-subtle">
        {t.notSaved}
      </p>
    </div>
  );

  const outputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PartHeading
        actions={
          <>
            <IconAction icon={RefreshCw} label={t.regenerate} onClick={() => setRun(run + 1)} />
            <CopyButton getText={() => password ?? ''} disabled={!password} />
          </>
        }
      >
        {kind === 'password' ? t.password : t.passphrase}
      </PartHeading>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
        <p
          dir="ltr"
          className={cn(
            'text-start font-mono text-lg break-all select-all',
            password ? 'text-fg' : 'text-sm text-fg-subtle'
          )}
        >
          {password ?? error ?? ''}
        </p>
        {result?.ok && strength && (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-fg-subtle">{t.strength}</span>
              <span className={cn('font-semibold', STRENGTHS[strength].text)}>
                {t.strengths[strength]}
              </span>
            </div>
            <div aria-hidden className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((segment) => (
                <span
                  key={segment}
                  className={cn(
                    'h-1.5 rounded-full',
                    segment <= STRENGTHS[strength].segments
                      ? STRENGTHS[strength].bar
                      : 'bg-surface-2'
                  )}
                />
              ))}
            </div>
            <p className="text-fg-subtle">{fmt(t.entropy, { bits: formatNumber(result.bits) })}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ToolHeader slug="generate">
        {picker}
        <ToolbarDivider />
        <Segmented
          label={t.passwordKind}
          value={kind}
          onChange={setKind}
          options={[
            { value: 'password', label: t.password },
            { value: 'passphrase', label: t.passphrase },
          ]}
        />
      </ToolHeader>
      <SplitPane id="generate-password" first={settingsPane} second={outputPane} />
      <StatusBar>
        {error && (
          <StatusItem tone="danger" className="font-sans">
            {error}
          </StatusItem>
        )}
        {result?.ok && strength && (
          <>
            <StatusItem className="shrink-0">
              {fmt(t.entropy, { bits: formatNumber(result.bits) })}
            </StatusItem>
            <StatusItem
              tone={strength === 'weak' ? 'danger' : strength === 'fair' ? 'warning' : 'success'}
            >
              {t.strengths[strength]}
            </StatusItem>
          </>
        )}
      </StatusBar>
    </>
  );
}
