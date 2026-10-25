import { EditorView } from '@codemirror/view';

/**
 * Diff colors from the site's tokens, replacing `@codemirror/merge`'s defaults. Selectors mirror
 * the package's base theme so these win on order at equal specificity.
 */
export const mergeTheme = EditorView.theme({
  '&.cm-merge-a .cm-changedLine, & .cm-deletedChunk': { backgroundColor: 'var(--diff-del)' },
  '&.cm-merge-b .cm-changedLine, & .cm-inlineChangedLine': { backgroundColor: 'var(--diff-add)' },
  '&.cm-merge-a .cm-changedText, & .cm-deletedChunk .cm-deletedText': {
    background: 'var(--diff-del-strong)',
    borderRadius: '2px',
  },
  '&.cm-merge-b .cm-changedText': { background: 'var(--diff-add-strong)', borderRadius: '2px' },
  '&.cm-merge-a .cm-changedLineGutter, & .cm-deletedLineGutter': { background: 'var(--danger)' },
  '&.cm-merge-b .cm-changedLineGutter': { background: 'var(--success)' },
  '& .cm-collapsedLines': {
    color: 'var(--fg-muted)',
    background: 'var(--surface-2)',
    borderBlock: '1px solid var(--line)',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
  },
  '& .cm-collapsedLines:hover': { color: 'var(--fg)' },
});

/** Side-by-side editors grow with their content; the merge view around them scrolls. */
export const splitEditorTheme = EditorView.theme({ '&': { height: 'auto' } });
