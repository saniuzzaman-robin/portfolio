'use client';

import { FLAGS, splitLiteral, toggleFlag } from '@/lib/tools/regex/flags';
import { useToolMessages } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

const INPUT_CLASSES =
  'h-8 min-w-0 flex-1 basis-48 rounded-md border border-line bg-surface-2 px-2 font-mono text-[13px] [font-variant-ligatures:none] text-fg outline-none placeholder:font-sans placeholder:text-xs placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-danger';

/** `/pattern/flags` row, plus the replacement row in replace mode. Always left-to-right. */
export function PatternBar({
  pattern,
  onPattern,
  flags,
  onFlags,
  invalid,
  replacement,
  onReplacement,
  showReplacement,
  patternRef,
  replacementRef,
}: {
  pattern: string;
  onPattern: (pattern: string) => void;
  flags: string;
  onFlags: (flags: string) => void;
  invalid: boolean;
  replacement: string;
  onReplacement: (replacement: string) => void;
  showReplacement: boolean;
  patternRef: React.Ref<HTMLInputElement>;
  replacementRef: React.Ref<HTMLInputElement>;
}) {
  const t = useToolMessages<'regex'>();

  // Pasting a whole literal like `/a+/gi` over the pattern fills in the flags too.
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const replacesAll = input.selectionStart === 0 && input.selectionEnd === input.value.length;
    const literal = replacesAll ? splitLiteral(event.clipboardData.getData('text')) : null;
    if (!literal) return;
    event.preventDefault();
    onPattern(literal.pattern);
    onFlags(literal.flags);
  };

  return (
    <div dir="ltr" className="shrink-0 space-y-1.5 border-b border-line bg-surface px-2 py-1.5">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
        <span aria-hidden className="font-mono text-sm text-fg-subtle">
          /
        </span>
        <input
          ref={patternRef}
          value={pattern}
          onChange={(event) => onPattern(event.target.value)}
          onPaste={handlePaste}
          aria-label={t.pattern}
          aria-invalid={invalid || undefined}
          placeholder={t.patternPlaceholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoFocus
          className={INPUT_CLASSES}
        />
        <span aria-hidden className="font-mono text-sm text-fg-subtle">
          /
        </span>
        <div role="group" aria-label={t.flags} className="flex shrink-0 items-center gap-0.5">
          {FLAGS.map((flag) => {
            const on = flags.includes(flag);
            return (
              <button
                key={flag}
                type="button"
                aria-pressed={on}
                aria-label={`${flag}: ${t.flagNames[flag]}`}
                title={t.flagNames[flag]}
                onClick={() => onFlags(toggleFlag(flags, flag))}
                className={cn(
                  'inline-flex size-7 cursor-pointer items-center justify-center rounded-md font-mono text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  on
                    ? 'bg-surface-2 text-primary-text shadow-[inset_0_0_0_1px_var(--line-strong)]'
                    : 'text-fg-subtle hover:text-fg'
                )}
              >
                {flag}
              </button>
            );
          })}
        </div>
      </div>
      {showReplacement && (
        <div className="flex items-center gap-1">
          <span aria-hidden className="w-2.5 shrink-0 font-mono text-sm text-fg-subtle">
            →
          </span>
          <input
            ref={replacementRef}
            value={replacement}
            onChange={(event) => onReplacement(event.target.value)}
            aria-label={t.replacement}
            placeholder={t.replacementPlaceholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className={INPUT_CLASSES}
          />
        </div>
      )}
    </div>
  );
}
