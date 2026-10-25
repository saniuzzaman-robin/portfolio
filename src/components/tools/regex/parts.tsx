'use client';

import { cn } from '@/lib/cn';

/** Group colors, matching the `cm-mark-group-*` underlines in the editor. */
const GROUP_COLORS = ['bg-code-string', 'bg-code-number', 'bg-code-property', 'bg-code-keyword'];

export function GroupSwatch({ index, className }: { index: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-3 w-1 shrink-0 rounded-full',
        GROUP_COLORS[(index - 1) % 4],
        className
      )}
    />
  );
}

export function groupMarkClass(index: number): string {
  return `cm-mark-group-${((index - 1) % 4) + 1}`;
}

/** Shows line breaks and tabs inside matched text, which would otherwise be invisible. */
export function visible(text: string): string {
  return text.replace(/\r/g, '␍').replace(/\n/g, '↵').replace(/\t/g, '⇥');
}

/** Inserts `token` over the input's selection (or at the end) and puts the caret after it. */
export function insertAtCaret(
  input: HTMLInputElement | null,
  value: string,
  token: string,
  onChange: (next: string) => void
) {
  const start = input?.selectionStart ?? value.length;
  const end = input?.selectionEnd ?? value.length;
  onChange(value.slice(0, start) + token + value.slice(end));
  requestAnimationFrame(() => {
    input?.focus();
    input?.setSelectionRange(start + token.length, start + token.length);
  });
}
