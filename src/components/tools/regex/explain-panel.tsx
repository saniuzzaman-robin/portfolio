'use client';

import type { Quantifier, RegexToken } from '@/lib/tools/regex/explain';
import type { ToolMessages } from '@/i18n/tools/en';
import { useToolMessages } from '@/i18n/tools/provider';
import { fmt } from '@/i18n/dictionary';
import { cn } from '@/lib/cn';
import { GroupSwatch } from './parts';

type Strings = ToolMessages['regex'];

const INDENT_PX = 14;

/** `U+00E9 “é”`, or the character's name for invisible ones. */
function describeChar(code: number, name: string | null): string {
  const hex = `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
  if (name) return `${name} (${hex})`;
  const printable = code > 0x20 && code !== 0x7f && !(code >= 0x80 && code <= 0xa0);
  return printable ? `${hex} “${String.fromCodePoint(code)}”` : hex;
}

function describeQuantifier({ min, max, lazy }: Quantifier, t: Strings): string {
  let quantity: string;
  if (min === 0 && max === null) quantity = t.quantifiers.zeroOrMore;
  else if (min === 1 && max === null) quantity = t.quantifiers.oneOrMore;
  else if (min === 0 && max === 1) quantity = t.quantifiers.optional;
  else if (max === null) quantity = fmt(t.quantifiers.atLeast, { min });
  else if (min === max) quantity = fmt(t.quantifiers.exactly, { min });
  else quantity = fmt(t.quantifiers.between, { min, max });
  return lazy ? fmt(t.quantifiers.lazy, { quantity }) : quantity;
}

function describe(token: RegexToken, t: Strings): string {
  const tokens = t.tokens;
  switch (token.kind) {
    case 'literal':
      return fmt(tokens.literal, { text: token.text });
    case 'members':
      return fmt(tokens.members, { text: token.text });
    case 'any':
      return token.dotAll ? tokens.anyDotAll : tokens.any;
    case 'classEscape':
      return tokens.classEscapes[token.escape];
    case 'char':
      return fmt(tokens.char, {
        char: describeChar(token.code, token.name && tokens.charNames[token.name]),
      });
    case 'property': {
      const property = token.value ? `${token.name}=${token.value}` : token.name;
      return fmt(token.negated ? tokens.notProperty : tokens.property, { property });
    }
    case 'assertion':
      return tokens.assertions[token.assertion];
    case 'backreference':
      return fmt(tokens.backreference, { ref: token.ref });
    case 'class':
      return token.negated ? tokens.negatedClass : tokens.class;
    case 'range':
      return fmt(tokens.range, {
        first: describeChar(token.first, null),
        last: describeChar(token.last, null),
      });
    case 'setOperation':
      return tokens.setOperations[token.operation];
    case 'strings':
      return fmt(tokens.strings, { items: token.items.map((item) => `“${item}”`).join(', ') });
    case 'group': {
      if (token.group === 'capture') {
        const index = token.index ?? 0;
        return token.name
          ? fmt(tokens.groups.namedCapture, { index, name: token.name })
          : fmt(tokens.groups.capture, { index });
      }
      if (token.group === 'modifiers') {
        const flags = [token.enable && `+${token.enable}`, token.disable && `−${token.disable}`]
          .filter(Boolean)
          .join(' ');
        return fmt(tokens.groups.modifiers, { flags });
      }
      return tokens.groups[token.group];
    }
    case 'alternation':
      return tokens.alternation;
    case 'invalid':
      return tokens.invalid;
  }
}

/** One row per token, indented by nesting; clicking a row selects that part of the pattern. */
export function ExplainPanel({
  tokens,
  onSelect,
}: {
  tokens: RegexToken[];
  onSelect: (from: number, to: number) => void;
}) {
  const t = useToolMessages<'regex'>();
  if (tokens.length === 0) return <p className="p-3 text-xs text-fg-subtle">{t.explainEmpty}</p>;
  return (
    <ol aria-label={t.panels.explain} className="min-h-0 flex-1 overflow-auto py-1 text-xs">
      {tokens.map((token, index) => (
        <li key={index}>
          <button
            type="button"
            onClick={() => onSelect(token.from, token.to)}
            style={{ paddingInlineStart: 12 + token.depth * INDENT_PX }}
            className="flex w-full cursor-pointer items-baseline gap-3 py-1 pe-3 text-start hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
          >
            <code
              dir="ltr"
              className={cn(
                'flex max-w-[45%] shrink-0 items-center gap-1.5 truncate font-mono text-[12px] [font-variant-ligatures:none]',
                token.kind === 'invalid' ? 'text-danger' : 'text-primary-text'
              )}
            >
              {token.kind === 'group' && token.index !== null && (
                <GroupSwatch index={token.index} />
              )}
              <span className="truncate">{token.label}</span>
            </code>
            <span dir="auto" className={token.kind === 'invalid' ? 'text-danger' : 'text-fg'}>
              {describe(token, t)}
              {token.quantifier && (
                <span className="text-fg-subtle"> · {describeQuantifier(token.quantifier, t)}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
