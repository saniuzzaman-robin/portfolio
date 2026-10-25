export const FORMAT_LANGUAGES = [
  'html',
  'css',
  'scss',
  'less',
  'javascript',
  'typescript',
  'json',
  'xml',
  'sql',
  'yaml',
  'markdown',
  'graphql',
] as const;
export type FormatLanguage = (typeof FORMAT_LANGUAGES)[number];

export const isFormatLanguage = (value: unknown): value is FormatLanguage =>
  FORMAT_LANGUAGES.includes(value as FormatLanguage);

type LanguageInfo = {
  /** Untranslated technical name. */
  label: string;
  /** File extensions (first one is used for downloads). */
  extensions: string[];
  mime: string;
  /** Whether a minifier exists for it (beautify always does). */
  minify: boolean;
};

export const LANGUAGES: Record<FormatLanguage, LanguageInfo> = {
  html: { label: 'HTML', extensions: ['html', 'htm', 'xhtml'], mime: 'text/html', minify: true },
  css: { label: 'CSS', extensions: ['css'], mime: 'text/css', minify: true },
  scss: { label: 'SCSS', extensions: ['scss'], mime: 'text/x-scss', minify: true },
  less: { label: 'Less', extensions: ['less'], mime: 'text/x-less', minify: true },
  javascript: {
    label: 'JavaScript',
    extensions: ['js', 'mjs', 'cjs', 'jsx'],
    mime: 'text/javascript',
    minify: true,
  },
  typescript: {
    label: 'TypeScript',
    extensions: ['ts', 'mts', 'cts', 'tsx'],
    mime: 'text/x-typescript',
    minify: false,
  },
  json: { label: 'JSON', extensions: ['json', 'jsonc'], mime: 'application/json', minify: true },
  xml: {
    label: 'XML',
    extensions: ['xml', 'svg', 'xsl', 'xslt', 'rss', 'atom', 'plist', 'csproj'],
    mime: 'application/xml',
    minify: true,
  },
  sql: { label: 'SQL', extensions: ['sql'], mime: 'application/sql', minify: false },
  yaml: { label: 'YAML', extensions: ['yaml', 'yml'], mime: 'application/yaml', minify: false },
  markdown: {
    label: 'Markdown',
    extensions: ['md', 'markdown', 'mdown'],
    mime: 'text/markdown',
    minify: false,
  },
  graphql: {
    label: 'GraphQL',
    extensions: ['graphql', 'gql'],
    mime: 'application/graphql',
    minify: false,
  },
};

/** Language implied by a file name's extension (`"styles.SCSS"` → `scss`). */
export function languageForFile(name: string): FormatLanguage | undefined {
  const extension = name.toLowerCase().split('.').pop();
  if (!extension || !name.includes('.')) return undefined;
  return FORMAT_LANGUAGES.find((language) => LANGUAGES[language].extensions.includes(extension));
}

/** Dialects understood by sql-formatter, with their untranslated product names. */
export const SQL_DIALECTS = {
  sql: 'Standard SQL',
  bigquery: 'BigQuery',
  clickhouse: 'ClickHouse',
  db2: 'Db2',
  db2i: 'Db2 for IBM i',
  duckdb: 'DuckDB',
  hive: 'Hive',
  mariadb: 'MariaDB',
  mysql: 'MySQL',
  n1ql: 'N1QL (Couchbase)',
  plsql: 'PL/SQL (Oracle)',
  postgresql: 'PostgreSQL',
  redshift: 'Redshift',
  singlestoredb: 'SingleStoreDB',
  snowflake: 'Snowflake',
  spark: 'Spark SQL',
  sqlite: 'SQLite',
  tidb: 'TiDB',
  transactsql: 'T-SQL (SQL Server)',
  trino: 'Trino / Presto',
} as const;
export type SqlDialect = keyof typeof SQL_DIALECTS;

export const isSqlDialect = (value: unknown): value is SqlDialect =>
  typeof value === 'string' && Object.hasOwn(SQL_DIALECTS, value);

export const KEYWORD_CASES = ['preserve', 'upper', 'lower'] as const;
export type KeywordCase = (typeof KEYWORD_CASES)[number];
