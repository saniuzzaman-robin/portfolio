import { RangeSetBuilder, type Extension } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

type Tree = ReturnType<typeof syntaxTree>;

const LEVELS = 4;
const OPENERS = new Set(['{', '[', '(']);
const CLOSERS = new Set(['}', ']', ')']);
/** Nesting depth needs the whole tree, so very large documents go without colors. */
const MAX_LENGTH = 300_000;

const marks = Array.from({ length: LEVELS }, (_, level) =>
  Decoration.mark({ class: `cm-bracket-${level}` })
);

function build(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  if (view.state.doc.length > MAX_LENGTH) return builder.finish();
  const { from: viewFrom, to: viewTo } = view.viewport;
  let depth = 0;
  // Brackets are tree tokens named after themselves, so strings and comments are skipped.
  syntaxTree(view.state).iterate({
    enter(node) {
      const name = node.name;
      if (OPENERS.has(name)) {
        if (node.from >= viewFrom && node.to <= viewTo) {
          builder.add(node.from, node.to, marks[depth % LEVELS]);
        }
        depth++;
      } else if (CLOSERS.has(name)) {
        depth = Math.max(0, depth - 1);
        if (node.from >= viewFrom && node.to <= viewTo) {
          builder.add(node.from, node.to, marks[depth % LEVELS]);
        }
      }
    },
  });
  return builder.finish();
}

/** Colors brackets by nesting depth, so matching pairs are easy to spot in deep documents. */
export const bracketColors: Extension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    tree: Tree;
    constructor(view: EditorView) {
      this.decorations = build(view);
      this.tree = syntaxTree(view.state);
    }
    update(update: ViewUpdate) {
      const tree = syntaxTree(update.state);
      // The parser finishes asynchronously, so a new tree can arrive without a document change.
      if (update.docChanged || update.viewportChanged || tree !== this.tree) {
        this.decorations = build(update.view);
        this.tree = tree;
      }
    }
  },
  { decorations: (plugin) => plugin.decorations }
);
