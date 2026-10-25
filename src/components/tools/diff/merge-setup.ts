/**
 * CodeMirror diff views, loaded as one lazy chunk by `merge-editor.tsx`: side by side
 * (`MergeView`, two editors) or unified (one editor showing the original's lines inline).
 */
import { ChangeSet, Compartment, EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLineGutter,
  lineNumbers,
  placeholder as placeholderText,
} from '@codemirror/view';
import {
  Change,
  MergeView,
  getOriginalDoc,
  goToNextChunk,
  goToPreviousChunk,
  originalDocChangeEffect,
  unifiedMergeView,
  type DiffConfig,
} from '@codemirror/merge';
import type { TextChange } from '@/lib/tools/diff/text';
import {
  External,
  coreExtensions,
  minimalChange,
  readOnlyExtension,
} from '@/components/tools/workbench/editor-setup';
import { mergeTheme, splitEditorTheme } from './merge-theme';

export type MergeLayout = 'split' | 'unified';
/** `a` is the original, `b` the changed text. */
export type Side = 'a' | 'b';

export type MergeOptions = {
  layout: MergeLayout;
  a: string;
  b: string;
  labels: Record<Side, string>;
  placeholders: Record<Side, string>;
  readOnly: boolean;
  wrap: boolean;
  /** Folds long unchanged stretches into a bar that expands on click. */
  collapse: boolean;
  /** Replaces the package's own diff, so whitespace, case and granularity options apply. */
  diff: (a: string, b: string) => readonly TextChange[];
  onChange: (side: Side, value: string) => void;
};

export type MergeController = {
  setDoc(side: Side, value: string): void;
  setLanguage(language: Extension): void;
  setReadOnly(readOnly: boolean): void;
  setWrap(wrap: boolean): void;
  setPlaceholders(placeholders: Record<Side, string>): void;
  /** Moves the selection to the next or previous change and scrolls to it. */
  goTo(direction: 'next' | 'previous'): boolean;
  destroy(): void;
};

/** Unchanged lines kept around each change, and the shortest stretch worth collapsing. */
const COLLAPSE = { margin: 3, minSize: 4 };

/** One editor's settings that can change without rebuilding the view. */
class Surface {
  readonly language = new Compartment();
  readonly readOnly = new Compartment();
  readonly wrap = new Compartment();
  readonly placeholder = new Compartment();
  readonly extensions: Extension;

  constructor(side: Side, options: MergeOptions, layoutTheme: Extension) {
    this.extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      coreExtensions(options.labels[side]),
      mergeTheme,
      layoutTheme,
      this.language.of([]),
      this.readOnly.of(readOnlyExtension(options.readOnly)),
      this.wrap.of(options.wrap ? EditorView.lineWrapping : []),
      this.placeholder.of(placeholderOf(options.placeholders[side])),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !update.transactions.some((tr) => tr.annotation(External))) {
          options.onChange(side, update.state.doc.toString());
        }
      }),
    ];
  }
}

const placeholderOf = (text: string): Extension => (text ? placeholderText(text) : []);

function setDocument(view: EditorView, value: string) {
  const change = minimalChange(view.state.doc.toString(), value);
  if (change) view.dispatch({ changes: change, annotations: External.of(true) });
}

export function createMerge(parent: HTMLElement, options: MergeOptions): MergeController {
  const diffConfig: DiffConfig = {
    override: (a, b) => options.diff(a, b).map((c) => new Change(c.fromA, c.toA, c.fromB, c.toB)),
  };
  const collapseUnchanged = options.collapse ? COLLAPSE : undefined;

  let views: Record<Side, EditorView | null>;
  let surfaces: Record<Side, Surface | null>;
  let setOriginal: (value: string) => void;
  let destroy: () => void;

  if (options.layout === 'split') {
    surfaces = {
      a: new Surface('a', options, splitEditorTheme),
      b: new Surface('b', options, splitEditorTheme),
    };
    const merge = new MergeView({
      parent,
      a: { doc: options.a, extensions: surfaces.a!.extensions },
      b: { doc: options.b, extensions: surfaces.b!.extensions },
      gutter: true,
      highlightChanges: true,
      collapseUnchanged,
      diffConfig,
    });
    views = { a: merge.a, b: merge.b };
    setOriginal = (value) => setDocument(merge.a, value);
    destroy = () => merge.destroy();
  } else {
    surfaces = { a: null, b: new Surface('b', options, []) };
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: options.b,
        extensions: [
          surfaces.b!.extensions,
          unifiedMergeView({
            original: options.a,
            mergeControls: false,
            gutter: true,
            highlightChanges: true,
            syntaxHighlightDeletions: true,
            collapseUnchanged,
            diffConfig,
          }),
        ],
      }),
    });
    views = { a: null, b: view };
    setOriginal = (value) => {
      const original = getOriginalDoc(view.state).toString();
      const change = minimalChange(original, value);
      if (!change) return;
      view.dispatch({
        effects: originalDocChangeEffect(view.state, ChangeSet.of(change, original.length)),
      });
    };
    destroy = () => view.destroy();
  }

  const each = (run: (view: EditorView, surface: Surface, side: Side) => void) => {
    for (const side of ['a', 'b'] as const) {
      const view = views[side];
      const surface = surfaces[side];
      if (view && surface) run(view, surface, side);
    }
  };

  return {
    setDoc(side, value) {
      if (side === 'a') setOriginal(value);
      else setDocument(views.b!, value);
    },
    setLanguage(language) {
      each((view, surface) => view.dispatch({ effects: surface.language.reconfigure(language) }));
    },
    setReadOnly(readOnly) {
      each((view, surface) =>
        view.dispatch({ effects: surface.readOnly.reconfigure(readOnlyExtension(readOnly)) })
      );
    },
    setWrap(wrap) {
      each((view, surface) =>
        view.dispatch({
          effects: surface.wrap.reconfigure(wrap ? EditorView.lineWrapping : []),
        })
      );
    },
    setPlaceholders(placeholders) {
      each((view, surface, side) =>
        view.dispatch({
          effects: surface.placeholder.reconfigure(placeholderOf(placeholders[side])),
        })
      );
    },
    goTo(direction) {
      const target = views.a?.hasFocus ? views.a : views.b!;
      return (direction === 'next' ? goToNextChunk : goToPreviousChunk)(target);
    },
    destroy,
  };
}
