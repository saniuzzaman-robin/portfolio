import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { EditorState, type Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { collectKeys } from '@/lib/tools/json/keys';

const LITERALS = ['true', 'false', 'null'].map((label) => ({ label, type: 'keyword' }));

/** Whether `pos` sits where an object key is expected, rather than a value. */
function expectsKey(context: CompletionContext, from: number): boolean {
  let node: ReturnType<typeof syntaxTree>['topNode'] | null = syntaxTree(
    context.state
  ).resolveInner(from, -1);
  while (node && node.name !== 'Object' && node.name !== 'Array') node = node.parent;
  if (node?.name !== 'Object') return false;
  const before = context.state.doc.sliceString(node.from, from).trimEnd();
  return !before.endsWith(':');
}

/** Whether the quote at `pos` opens a string, rather than closing the one before it. */
function opensString(context: CompletionContext, pos: number): boolean {
  const line = context.state.doc.lineAt(pos);
  const before = context.state.doc.sliceString(line.from, pos);
  return (before.match(/(?<!\\)"/g)?.length ?? 0) % 2 === 0;
}

function complete(context: CompletionContext): CompletionResult | null {
  const quoted = context.matchBefore(/"[^"\n]*/);
  if (quoted && opensString(context, quoted.from)) {
    if (!expectsKey(context, quoted.from)) return null;
    const keys = collectKeys(context.state.doc.toString());
    return {
      // After the opening quote, so typing filters on the key text itself.
      from: quoted.from + 1,
      options: keys.map((key) => ({
        label: key,
        type: 'property',
        apply: (view: EditorView, _completion: Completion, from: number, to: number) => {
          const { doc } = view.state;
          // The auto-closed quote after the caret belongs to the key being replaced.
          const end = doc.sliceString(to, to + 1) === '"' ? to + 1 : to;
          const insert = `${JSON.stringify(key)}${/^\s*:/.test(doc.sliceString(end, end + 20)) ? '' : ': '}`;
          const start = from - 1;
          view.dispatch({
            changes: { from: start, to: end, insert },
            selection: { anchor: start + insert.length },
            userEvent: 'input.complete',
          });
        },
      })),
    };
  }
  const word = context.matchBefore(/[A-Za-z]+/);
  if (!word && !context.explicit) return null;
  const from = word ? word.from : context.pos;
  if (expectsKey(context, from)) return null;
  return { from, options: LITERALS, validFor: /^[A-Za-z]*$/ };
}

/** Completes keys already used in the document and the `true`/`false`/`null` literals. */
export const jsonCompletion: Extension = [
  autocompletion({ icons: false }),
  EditorState.languageData.of(() => [{ autocomplete: complete }]),
];
