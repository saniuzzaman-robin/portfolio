import type { Extension } from '@codemirror/state';

/**
 * Syntax support per editor mode, each fetched only when an editor first uses it.
 * Add a language by adding a loader that dynamically imports its `@codemirror/lang-*` package.
 */
const LOADERS = {
  plain: async (): Promise<Extension> => [],
  json: async (): Promise<Extension> => (await import('@codemirror/lang-json')).json(),
  html: async (): Promise<Extension> => (await import('@codemirror/lang-html')).html(),
  css: async (): Promise<Extension> => (await import('@codemirror/lang-css')).css(),
  javascript: async (): Promise<Extension> =>
    (await import('@codemirror/lang-javascript')).javascript({ jsx: true }),
  typescript: async (): Promise<Extension> =>
    (await import('@codemirror/lang-javascript')).javascript({ jsx: true, typescript: true }),
  xml: async (): Promise<Extension> => (await import('@codemirror/lang-xml')).xml(),
  sql: async (): Promise<Extension> => (await import('@codemirror/lang-sql')).sql(),
  yaml: async (): Promise<Extension> => (await import('@codemirror/lang-yaml')).yaml(),
  markdown: async (): Promise<Extension> => (await import('@codemirror/lang-markdown')).markdown(),
  jwt: async (): Promise<Extension> =>
    (await import('@/components/tools/jwt/jwt-language')).jwtLanguage,
} satisfies Record<string, () => Promise<Extension>>;

export type EditorLanguage = keyof typeof LOADERS;

export function loadLanguage(language: EditorLanguage): Promise<Extension> {
  return LOADERS[language]();
}
