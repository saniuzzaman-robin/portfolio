/**
 * CodeMirror wiring, loaded as one lazy chunk by `code-editor.tsx` so pages without an editor
 * never download it.
 */
import {
  Annotation,
  Compartment,
  EditorSelection,
  EditorState,
  StateEffect,
  StateField,
} from '@codemirror/state';
import type { Extension, Range } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  WidgetType,
  type DecorationSet,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder as placeholderText,
  rectangularSelection,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint';
import { editorTheme, highlightStyle } from './editor-theme';

export type CursorInfo = { line: number; col: number; selected: number };

/** A highlighted range (e.g. a regex match); an empty range draws a thin caret instead. */
export type EditorMark = { from: number; to: number; className: string };

export type EditorOptions = {
  value: string;
  readOnly: boolean;
  wrap: boolean;
  placeholder: string;
  label: string;
  /** Selection to restore (e.g. carried over from the fallback textarea). */
  selection?: { anchor: number; head: number };
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onCursor: (cursor: CursorInfo) => void;
  /** The 0-based, fractional source line at the top of the viewport, on every scroll. */
  onScrollLine: (line: number) => void;
};

export type EditorController = {
  setValue(value: string): void;
  setLanguage(language: Extension): void;
  setReadOnly(readOnly: boolean): void;
  setWrap(wrap: boolean): void;
  setPlaceholder(text: string): void;
  setDiagnostics(diagnostics: Diagnostic[]): void;
  setMarks(marks: EditorMark[]): void;
  /** Selects `from..to` (clamped to the document) and scrolls it into view. */
  reveal(from: number, to?: number): void;
  /** Scrolls so the 0-based, fractional `line` is at the top (the inverse of `onScrollLine`). */
  scrollToLine(line: number): void;
  focus(): void;
  destroy(): void;
};

/** Marks transactions that sync the `value` prop in, so they aren't echoed back as edits. */
export const External = Annotation.define<boolean>();

function cursorOf(state: EditorState): CursorInfo {
  const head = state.selection.main.head;
  const line = state.doc.lineAt(head);
  const selected = state.selection.ranges.reduce((sum, range) => sum + range.to - range.from, 0);
  return { line: line.number, col: head - line.from + 1, selected };
}

export function readOnlyExtension(readOnly: boolean): Extension {
  // Read-only documents stay focusable so their text can be selected, searched and copied.
  return [
    EditorState.readOnly.of(readOnly),
    EditorView.contentAttributes.of({ 'aria-readonly': String(readOnly) }),
  ];
}

/** Editing, highlighting and keys shared by every editor surface, including the diff views. */
export function coreExtensions(label: string): Extension {
  return [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    rectangularSelection(),
    indentOnInput(),
    bracketMatching(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    syntaxHighlighting(highlightStyle),
    editorTheme,
    EditorState.tabSize.of(2),
    EditorView.contentAttributes.of({ 'aria-label': label, spellcheck: 'false' }),
    // Escape, then Tab, moves focus out of the editor (CodeMirror's built-in escape hatch).
    keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, ...foldKeymap, indentWithTab]),
  ];
}

/**
 * The edit that turns `current` into `next`, touching only the changed middle so the cursor and
 * scroll position survive; null when they are equal.
 */
export function minimalChange(
  current: string,
  next: string
): { from: number; to: number; insert: string } | null {
  if (next === current) return null;
  let start = 0;
  const max = Math.min(next.length, current.length);
  while (start < max && next.charCodeAt(start) === current.charCodeAt(start)) start++;
  let end = 0;
  while (
    end < max - start &&
    next.charCodeAt(next.length - 1 - end) === current.charCodeAt(current.length - 1 - end)
  ) {
    end++;
  }
  return { from: start, to: current.length - end, insert: next.slice(start, next.length - end) };
}

const setMarksEffect = StateEffect.define<DecorationSet>();

/** Marks set from outside; they follow edits until the next `setMarks` replaces them. */
const marksField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(marks, tr) {
    let next = marks.map(tr.changes);
    for (const effect of tr.effects) if (effect.is(setMarksEffect)) next = effect.value;
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

class EmptyMarkWidget extends WidgetType {
  constructor(readonly className: string) {
    super();
  }
  eq(other: EmptyMarkWidget) {
    return other.className === this.className;
  }
  toDOM() {
    const span = document.createElement('span');
    span.className = `cm-mark-empty ${this.className}`;
    return span;
  }
}

const markDecorations = new Map<string, Decoration>();
const emptyDecorations = new Map<string, Decoration>();

function markDecoration(className: string, empty: boolean): Decoration {
  const cache = empty ? emptyDecorations : markDecorations;
  let decoration = cache.get(className);
  if (!decoration) {
    decoration = empty
      ? Decoration.widget({ widget: new EmptyMarkWidget(className), side: 1 })
      : Decoration.mark({ class: className });
    cache.set(className, decoration);
  }
  return decoration;
}

export function createEditor(parent: HTMLElement, options: EditorOptions): EditorController {
  const language = new Compartment();
  const readOnly = new Compartment();
  const wrap = new Compartment();
  const placeholder = new Compartment();
  let current = options.value;

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: options.value,
      selection: options.selection
        ? EditorSelection.single(
            Math.min(options.selection.anchor, options.value.length),
            Math.min(options.selection.head, options.value.length)
          )
        : undefined,
      extensions: [
        lineNumbers(),
        lintGutter(),
        marksField,
        foldGutter(),
        highlightActiveLineGutter(),
        coreExtensions(options.label),
        language.of([]),
        readOnly.of(readOnlyExtension(options.readOnly)),
        wrap.of(options.wrap ? EditorView.lineWrapping : []),
        placeholder.of(options.placeholder ? placeholderText(options.placeholder) : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            current = update.state.doc.toString();
            if (!update.transactions.some((tr) => tr.annotation(External))) {
              options.onChange(current);
            }
          }
          if (update.docChanged || update.selectionSet) options.onCursor(cursorOf(update.state));
        }),
      ],
    }),
  });

  options.onCursor(cursorOf(view.state));
  if (options.autoFocus) view.focus();

  const scroller = view.scrollDOM;
  /** How far the top of the document is scrolled above the top of the viewport. */
  const scrolledBy = () => scroller.getBoundingClientRect().top - view.documentTop;
  const onScroll = () => {
    const height = Math.max(0, scrolledBy());
    const block = view.lineBlockAtHeight(height);
    const fraction = block.height > 0 ? Math.min(1, (height - block.top) / block.height) : 0;
    options.onScrollLine(view.state.doc.lineAt(block.from).number - 1 + Math.max(0, fraction));
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });

  return {
    setValue(value) {
      const change = minimalChange(current, value);
      if (change) view.dispatch({ changes: change, annotations: External.of(true) });
    },
    setLanguage(extension) {
      view.dispatch({ effects: language.reconfigure(extension) });
    },
    setReadOnly(value) {
      view.dispatch({ effects: readOnly.reconfigure(readOnlyExtension(value)) });
    },
    setWrap(value) {
      view.dispatch({ effects: wrap.reconfigure(value ? EditorView.lineWrapping : []) });
    },
    setPlaceholder(text) {
      view.dispatch({ effects: placeholder.reconfigure(text ? placeholderText(text) : []) });
    },
    setDiagnostics(diagnostics) {
      const length = view.state.doc.length;
      const clamped = diagnostics.map((d) => ({
        ...d,
        from: Math.min(Math.max(0, d.from), length),
        to: Math.min(Math.max(d.from, d.to), length),
      }));
      view.dispatch(setDiagnostics(view.state, clamped));
    },
    setMarks(marks) {
      const length = view.state.doc.length;
      const ranges: Range<Decoration>[] = [];
      for (const mark of marks) {
        const from = Math.min(Math.max(0, mark.from), length);
        const to = Math.min(Math.max(from, mark.to), length);
        const decoration = markDecoration(mark.className, from === to);
        ranges.push(from === to ? decoration.range(from) : decoration.range(from, to));
      }
      view.dispatch({ effects: setMarksEffect.of(Decoration.set(ranges, true)) });
    },
    reveal(from, to = from) {
      const length = view.state.doc.length;
      const anchor = Math.min(Math.max(0, from), length);
      const head = Math.min(Math.max(anchor, to), length);
      view.dispatch({
        selection: EditorSelection.single(anchor, head),
        effects: EditorView.scrollIntoView(anchor, { y: 'center' }),
      });
      view.focus();
    },
    scrollToLine(line) {
      const doc = view.state.doc;
      const index = Math.min(Math.max(0, Math.floor(line)), doc.lines - 1);
      const block = view.lineBlockAt(doc.line(index + 1).from);
      const fraction = Math.min(1, Math.max(0, line - index));
      scroller.scrollTop += block.top + fraction * block.height - scrolledBy();
    },
    focus() {
      view.focus();
    },
    destroy() {
      scroller.removeEventListener('scroll', onScroll);
      view.destroy();
    },
  };
}
