import type { Plugin } from 'prettier';
import { parseJson } from '@/lib/tools/json/parse';
import { stringifyJson, type JsonIndent } from '@/lib/tools/json/format';
import { minifyCss } from './css-minify';
import { minifyHtml } from './html-minify';
import { minifyJs } from './js-minify';
import { formatXml, minifyXml } from './xml';
import { LANGUAGES, type FormatLanguage, type KeywordCase, type SqlDialect } from './languages';
import { failed, formatted, offsetAt, type FormatResult } from './types';

export type FormatMode = 'beautify' | 'minify';

export type FormatOptions = {
  indent: JsonIndent;
  printWidth: number;
  sqlDialect: SqlDialect;
  keywordCase: KeywordCase;
  /** Minify: shorten local names in JS (including inline scripts). */
  mangle: boolean;
  /** Minify HTML: also minify inline CSS, JS and JSON. */
  minifyInline: boolean;
};

/**
 * Beautifies or minifies `code`. Syntax errors come back as `{ ok: false }` with their position;
 * a rejection means a formatter failed to load.
 */
export async function runFormat(
  code: string,
  language: FormatLanguage,
  mode: FormatMode,
  options: FormatOptions
): Promise<FormatResult> {
  if (mode === 'minify' && LANGUAGES[language].minify) return minify(code, language, options);
  return beautify(code, language, options);
}

async function beautify(
  code: string,
  language: FormatLanguage,
  options: FormatOptions
): Promise<FormatResult> {
  switch (language) {
    case 'json': {
      const parsed = parseJson(code);
      if (!parsed.ok) return { ok: false, error: parsed.error };
      return formatted(`${stringifyJson(parsed.value, { indent: options.indent })}\n`);
    }
    case 'xml':
      return formatXml(code, options.indent);
    case 'sql':
      return formatSql(code, options);
    default:
      return formatWithPrettier(code, language, options);
  }
}

async function minify(
  code: string,
  language: FormatLanguage,
  options: FormatOptions
): Promise<FormatResult> {
  switch (language) {
    case 'json': {
      const parsed = parseJson(code);
      return parsed.ok
        ? formatted(stringifyJson(parsed.value))
        : { ok: false, error: parsed.error };
    }
    case 'xml':
      return minifyXml(code);
    case 'css':
    case 'scss':
    case 'less':
      return minifyCss(code, { lineComments: language !== 'css' });
    case 'javascript':
      return minifyJs(code, { mangle: options.mangle });
    case 'html':
      return minifyHtml(code, { inline: options.minifyInline, mangle: options.mangle });
    default:
      return beautify(code, language, options);
  }
}

type PluginName =
  'babel' | 'estree' | 'typescript' | 'postcss' | 'html' | 'markdown' | 'yaml' | 'graphql';

const PLUGINS: Record<PluginName, () => Promise<Plugin>> = {
  babel: () => import('prettier/plugins/babel'),
  estree: () => import('prettier/plugins/estree') as Promise<Plugin>,
  typescript: () => import('prettier/plugins/typescript'),
  postcss: () => import('prettier/plugins/postcss'),
  html: () => import('prettier/plugins/html'),
  markdown: () => import('prettier/plugins/markdown'),
  yaml: () => import('prettier/plugins/yaml'),
  graphql: () => import('prettier/plugins/graphql'),
};

type PrettierLanguage = Exclude<FormatLanguage, 'json' | 'xml' | 'sql'>;

/** Parser and plugins per language; HTML also loads the ones for its embedded CSS and JS. */
const PRETTIER: Record<PrettierLanguage, { parser: string; plugins: PluginName[] }> = {
  html: { parser: 'html', plugins: ['html', 'postcss', 'babel', 'estree'] },
  css: { parser: 'css', plugins: ['postcss'] },
  scss: { parser: 'scss', plugins: ['postcss'] },
  less: { parser: 'less', plugins: ['postcss'] },
  javascript: { parser: 'babel', plugins: ['babel', 'estree'] },
  typescript: { parser: 'typescript', plugins: ['typescript', 'estree'] },
  yaml: { parser: 'yaml', plugins: ['yaml'] },
  markdown: { parser: 'markdown', plugins: ['markdown'] },
  graphql: { parser: 'graphql', plugins: ['graphql'] },
};

type PrettierError = Error & { loc: { start: { line: number; column: number } } };

const isPrettierError = (error: unknown): error is PrettierError =>
  error instanceof Error && typeof (error as Partial<PrettierError>).loc?.start?.line === 'number';

async function formatWithPrettier(
  code: string,
  language: PrettierLanguage,
  options: FormatOptions
): Promise<FormatResult> {
  const { parser, plugins: names } = PRETTIER[language];
  const [{ format }, ...plugins] = await Promise.all([
    import('prettier/standalone'),
    ...names.map((name) => PLUGINS[name]()),
  ]);
  try {
    const text = await format(code, {
      parser,
      plugins,
      printWidth: options.printWidth,
      tabWidth: options.indent === 'tab' ? 2 : options.indent,
      useTabs: options.indent === 'tab',
    });
    return formatted(text);
  } catch (error) {
    if (!isPrettierError(error)) throw error;
    const { line, column } = error.loc.start;
    // Prettier appends "(line:col)" and a code frame, and postcss prefixes "CssSyntaxError: ".
    const message = error.message
      .split('\n')[0]
      .replace(/\s*\(\d+:\d+\)$/, '')
      .replace(/^\w+Error: /, '');
    const from = offsetAt(code, line, column);
    return failed(message, from, from + 1);
  }
}

const SQL_POSITION = /\s*at line (\d+) column (\d+)\.?$/;

async function formatSql(code: string, options: FormatOptions): Promise<FormatResult> {
  const { format } = await import('sql-formatter');
  try {
    const text = format(code, {
      language: options.sqlDialect,
      tabWidth: options.indent === 'tab' ? 2 : options.indent,
      useTabs: options.indent === 'tab',
      keywordCase: options.keywordCase,
    });
    return formatted(text ? `${text}\n` : '');
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    // "Parse error: Unexpected "$$" at line 3 column 2." followed by the parser's state dump.
    const first = error.message.split('\n')[0];
    const position = SQL_POSITION.exec(first);
    if (!position) throw error;
    const from = offsetAt(code, Number(position[1]), Number(position[2]));
    return failed(first.replace(SQL_POSITION, ''), from, from + 1);
  }
}
