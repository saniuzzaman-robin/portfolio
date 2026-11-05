import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { EditorState, Prec, type Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { bracketColors } from './bracket-colors';

/**
 * Auto-closes brackets and quotes: typing `{` inserts `{}`, typing the closer steps over it,
 * Backspace deletes an empty pair and a selection is wrapped. Only code modes get it.
 */
function withPairs(load: () => Promise<Extension>, brackets?: string[]) {
  return async (): Promise<Extension> => [
    await load(),
    closeBrackets(),
    bracketColors,
    Prec.high(keymap.of(closeBracketsKeymap)),
    // JSON strings are double-quoted only, so a single quote must not pair.
    brackets ? EditorState.languageData.of(() => [{ closeBrackets: { brackets } }]) : [],
  ];
}

/**
 * Syntax support per editor mode, each fetched only when an editor first uses it.
 * Add a language by adding a loader that dynamically imports its `@codemirror/lang-*` package.
 */
const LOADERS = {
  plain: async (): Promise<Extension> => [],
  json: withPairs(
    async () => [
      (await import('@codemirror/lang-json')).json(),
      (await import('./json-completion')).jsonCompletion,
    ],
    ['(', '[', '{', '"']
  ),
  html: withPairs(async () => (await import('@codemirror/lang-html')).html()),
  css: withPairs(async () => (await import('@codemirror/lang-css')).css()),
  javascript: withPairs(async () =>
    (await import('@codemirror/lang-javascript')).javascript({ jsx: true })
  ),
  typescript: withPairs(async () =>
    (await import('@codemirror/lang-javascript')).javascript({ jsx: true, typescript: true })
  ),
  xml: withPairs(async () => (await import('@codemirror/lang-xml')).xml()),
  sql: withPairs(async () => (await import('@codemirror/lang-sql')).sql()),
  yaml: withPairs(async () => (await import('@codemirror/lang-yaml')).yaml()),
  markdown: withPairs(async () => (await import('@codemirror/lang-markdown')).markdown()),
  jwt: async (): Promise<Extension> =>
    (await import('@/components/tools/jwt/jwt-language')).jwtLanguage,
} satisfies Record<string, () => Promise<Extension>>;

export type EditorLanguage = keyof typeof LOADERS;

export function loadLanguage(language: EditorLanguage): Promise<Extension> {
  return LOADERS[language]();
}
