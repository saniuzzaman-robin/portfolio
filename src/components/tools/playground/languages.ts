import type { EditorLanguage } from '@/components/tools/workbench/editor-languages';
import type { RunOptions, RunOutcome } from '@/lib/tools/playground/types';
import { JAVASCRIPT_SAMPLE, TYPESCRIPT_SAMPLE } from './samples';

/** Executes one run of source code. */
export type Runtime = (code: string, options: RunOptions) => Promise<RunOutcome>;

/** Each runtime is loaded on first use, so its code (and any engine) stays in its own chunk. */
export const RUNTIMES = {
  javascript: async (): Promise<Runtime> => (await import('./run-javascript')).runJavaScript,
  typescript: async (): Promise<Runtime> => (await import('./run-typescript')).runTypeScript,
} satisfies Record<string, () => Promise<Runtime>>;

export type RuntimeId = keyof typeof RUNTIMES;

export type PlaygroundLanguage = {
  editor: EditorLanguage;
  /** Name of the code in stack traces. */
  fileName: string;
  /** What the open-file picker accepts. */
  accept: string;
  sample: string;
  runtime: RuntimeId;
};

/** Languages in the language switcher, in display order. Labels live in the tool's messages. */
export const LANGUAGES = {
  javascript: {
    editor: 'javascript',
    fileName: 'main.js',
    accept: '.js,.mjs,.cjs,text/javascript',
    sample: JAVASCRIPT_SAMPLE,
    runtime: 'javascript',
  },
  typescript: {
    editor: 'typescript',
    fileName: 'main.ts',
    accept: '.ts,.mts,.cts,text/typescript',
    sample: TYPESCRIPT_SAMPLE,
    runtime: 'typescript',
  },
} satisfies Record<string, PlaygroundLanguage>;

export type LanguageId = keyof typeof LANGUAGES;

export const LANGUAGE_IDS = Object.keys(LANGUAGES) as LanguageId[];

export const isLanguageId = (value: unknown): value is LanguageId =>
  LANGUAGE_IDS.includes(value as LanguageId);
