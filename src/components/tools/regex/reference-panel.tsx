'use client';

import { FLAGS, type RegexFlag } from '@/lib/tools/regex/flags';
import { REFERENCE, type ReferenceSection } from '@/lib/tools/regex/reference';
import { useToolMessages } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

const SECTIONS = Object.keys(REFERENCE) as ReferenceSection[];

const ENTRY_CLASSES =
  'flex w-full cursor-pointer items-baseline gap-3 rounded-md px-2 py-1 text-start hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid pb-3">
      <h3 className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-fg-muted uppercase">
        {title}
      </h3>
      <ul>{children}</ul>
    </section>
  );
}

function Entry({
  token,
  description,
  onClick,
  pressed,
}: {
  token: string;
  description: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <li>
      <button type="button" onClick={onClick} aria-pressed={pressed} className={ENTRY_CLASSES}>
        <code
          dir="ltr"
          className={cn(
            'w-24 shrink-0 font-mono text-[12px] [font-variant-ligatures:none]',
            pressed === false ? 'text-fg-subtle' : 'text-primary-text'
          )}
        >
          {token}
        </code>
        <span dir="auto" className="text-fg">
          {description}
        </span>
      </button>
    </li>
  );
}

/** Cheat sheet: entries insert their syntax into the pattern (or replacement); flags toggle. */
export function ReferencePanel({
  flags,
  onToggleFlag,
  onInsert,
}: {
  flags: string;
  onToggleFlag: (flag: RegexFlag) => void;
  onInsert: (token: string, target: 'pattern' | 'replacement') => void;
}) {
  const t = useToolMessages<'regex'>();
  // Typed so that every cheat-sheet entry must have a description in the tool strings.
  const described: { [S in ReferenceSection]: Record<keyof (typeof REFERENCE)[S], string> } =
    t.reference;
  return (
    <div className="@container min-h-0 flex-1 overflow-auto p-2 text-xs">
      <p className="px-2 pb-3 text-fg-subtle">{t.referenceHint}</p>
      <div className="gap-4 @lg:columns-2">
        {SECTIONS.map((section) => {
          const descriptions: Record<string, string> = described[section];
          const entries: Record<string, string> = REFERENCE[section];
          return (
            <Section key={section} title={t.referenceSections[section]}>
              {Object.entries(entries).map(([key, token]) => (
                <Entry
                  key={key}
                  token={token}
                  description={descriptions[key]}
                  onClick={() =>
                    onInsert(token, section === 'replacement' ? 'replacement' : 'pattern')
                  }
                />
              ))}
            </Section>
          );
        })}
        <Section title={t.referenceSections.flags}>
          {FLAGS.map((flag) => (
            <Entry
              key={flag}
              token={flag}
              description={t.flagNames[flag]}
              pressed={flags.includes(flag)}
              onClick={() => onToggleFlag(flag)}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}
