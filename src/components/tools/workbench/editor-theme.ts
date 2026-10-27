import { EditorView } from '@codemirror/view';
import { HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Editor chrome built from the site's CSS tokens, so theme switches restyle it without
 * reconfiguring CodeMirror.
 */
export const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: 'var(--fg)',
    backgroundColor: 'transparent',
    fontSize: '13px',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-content': { padding: '6px 0', caretColor: 'var(--primary-text)' },
  '.cm-line': { padding: '0 12px 0 6px' },
  '.cm-gutters': {
    backgroundColor: 'var(--surface)',
    color: 'var(--fg-subtle)',
    border: 'none',
    borderRight: '1px solid var(--line)',
  },
  // Room for three digits (plus padding) so side-by-side editors keep equal gutters.
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 6px 0 10px', minWidth: 'calc(3ch + 16px)' },
  '.cm-foldGutter .cm-gutterElement': { padding: '0 4px 0 0', cursor: 'pointer' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--primary) 6%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--fg)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--primary-text)', borderLeftWidth: '2px' },
  '.cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--primary) 16%, transparent)',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection':
    { backgroundColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' },
  '.cm-selectionMatch': { backgroundColor: 'color-mix(in srgb, var(--accent) 18%, transparent)' },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--primary) 22%, transparent)',
    outline: '1px solid color-mix(in srgb, var(--primary) 50%, transparent)',
  },
  '&.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--danger) 25%, transparent)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--surface-2)',
    border: '1px solid var(--line-strong)',
    borderRadius: '4px',
    color: 'var(--fg-muted)',
    padding: '0 4px',
  },
  '.cm-placeholder': { color: 'var(--fg-subtle)' },
  '.cm-specialChar': { color: 'var(--danger)' },
  '.cm-panels': { backgroundColor: 'var(--surface)', color: 'var(--fg)' },
  '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--line)' },
  '.cm-panels.cm-panels-bottom': { borderTop: '1px solid var(--line)' },
  '.cm-panel.cm-search': { fontFamily: 'var(--font-sans)', fontSize: '12px', padding: '4px 8px' },
  '.cm-panel.cm-search label': { fontSize: '12px', color: 'var(--fg-muted)' },
  '.cm-textfield': {
    backgroundColor: 'var(--surface-2)',
    border: '1px solid var(--line-strong)',
    borderRadius: '4px',
    color: 'var(--fg)',
    fontSize: '12px',
  },
  '.cm-button': {
    backgroundImage: 'none',
    backgroundColor: 'var(--surface-2)',
    border: '1px solid var(--line-strong)',
    borderRadius: '4px',
    color: 'var(--fg)',
    fontSize: '12px',
  },
  '.cm-searchMatch': { backgroundColor: 'color-mix(in srgb, var(--warning) 25%, transparent)' },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'color-mix(in srgb, var(--warning) 50%, transparent)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--elevated)',
    border: '1px solid var(--line-strong)',
    borderRadius: '6px',
    color: 'var(--fg)',
    boxShadow: 'var(--shadow-pop)',
    overflow: 'hidden',
  },
  // Highlights set through `CodeEditor`'s `marks` (regex matches and their groups).
  '.cm-mark-match': {
    backgroundColor: 'color-mix(in srgb, var(--primary) 22%, transparent)',
    borderRadius: '2px',
  },
  '.cm-mark-match-alt': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 24%, transparent)',
    borderRadius: '2px',
  },
  '.cm-mark-group-1': { boxShadow: 'inset 0 -2px 0 var(--code-string)' },
  '.cm-mark-group-2': { boxShadow: 'inset 0 -2px 0 var(--code-number)' },
  '.cm-mark-group-3': { boxShadow: 'inset 0 -2px 0 var(--code-property)' },
  '.cm-mark-group-4': { boxShadow: 'inset 0 -2px 0 var(--code-keyword)' },
  '.cm-mark-empty': {
    display: 'inline-block',
    width: '0',
    height: '1.2em',
    verticalAlign: 'text-bottom',
    outline: '1px solid var(--primary-text)',
  },
  '.cm-diagnostic': { fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '4px 8px' },
  '.cm-diagnostic-error': { borderLeft: '3px solid var(--danger)' },
  '.cm-diagnostic-warning': { borderLeft: '3px solid var(--warning)' },
  '.cm-diagnostic-info': { borderLeft: '3px solid var(--accent)' },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--danger)',
    textUnderlineOffset: '3px',
  },
  '.cm-lintRange-warning': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--warning)',
    textUnderlineOffset: '3px',
  },
  '.cm-lintRange-info': {
    backgroundImage: 'none',
    textDecoration: 'underline dotted var(--accent)',
    textUnderlineOffset: '3px',
  },
});

export const highlightStyle = HighlightStyle.define([
  {
    tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.operatorKeyword, t.modifier],
    color: 'var(--code-keyword)',
  },
  { tag: [t.string, t.special(t.string), t.character, t.regexp], color: 'var(--code-string)' },
  { tag: [t.number, t.bool, t.null, t.atom, t.unit], color: 'var(--code-number)' },
  {
    tag: [t.propertyName, t.definition(t.propertyName), t.attributeName],
    color: 'var(--code-property)',
  },
  { tag: [t.tagName, t.typeName, t.className, t.namespace], color: 'var(--code-keyword)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--accent)' },
  {
    tag: [t.comment, t.lineComment, t.blockComment],
    color: 'var(--fg-subtle)',
    fontStyle: 'italic',
  },
  {
    tag: [t.punctuation, t.separator, t.bracket, t.angleBracket, t.squareBracket, t.brace, t.paren],
    color: 'var(--code-punct)',
  },
  { tag: [t.operator, t.meta], color: 'var(--fg-muted)' },
  { tag: t.heading, color: 'var(--fg)', fontWeight: '700' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: [t.link, t.url], color: 'var(--primary-text)', textDecoration: 'underline' },
  { tag: t.invalid, color: 'var(--danger)' },
]);
