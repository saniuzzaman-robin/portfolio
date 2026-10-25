import { parseJson } from '@/lib/tools/json/parse';
import { stringifyJson, type JsonIndent } from '@/lib/tools/json/format';
import { failed, formatted, type FormatResult } from '@/lib/tools/format/types';
import { csvToJson, jsonToCsv, type CsvDelimiter } from './csv';
import { inferShape, toTypeScript, toZod, typeName } from './infer';
import { lastKeyWins } from './nodes';
import { jsonToQuery, queryToJson } from './query';
import { jsonToXml, xmlToJson, type AttributePrefix } from './xml';
import { jsonToYaml, yamlToJson } from './yaml';

export const DATA_FORMATS = {
  json: { extension: 'json', mime: 'application/json' },
  yaml: { extension: 'yaml', mime: 'application/yaml' },
  csv: { extension: 'csv', mime: 'text/csv' },
  xml: { extension: 'xml', mime: 'application/xml' },
  query: { extension: 'txt', mime: 'text/plain' },
  typescript: { extension: 'ts', mime: 'text/typescript' },
  zod: { extension: 'ts', mime: 'text/typescript' },
} as const;
export type DataFormat = keyof typeof DATA_FORMATS;
/** Formats that can be read (TypeScript and Zod are output only). */
export type SourceFormat = Exclude<DataFormat, 'typescript' | 'zod'>;

/** Every conversion, as `<from>-<to>`, in menu order. */
export const CONVERSIONS = [
  'json-yaml',
  'yaml-json',
  'json-csv',
  'csv-json',
  'json-xml',
  'xml-json',
  'json-query',
  'query-json',
  'json-typescript',
  'json-zod',
] as const;
export type Conversion = (typeof CONVERSIONS)[number];

export const isConversion = (value: unknown): value is Conversion =>
  CONVERSIONS.includes(value as Conversion);

export const conversionFormats = (conversion: Conversion) =>
  conversion.split('-') as [SourceFormat, DataFormat];

/** The opposite direction, when there is one (JSON → TypeScript has none). */
export function reverseConversion(conversion: Conversion): Conversion | undefined {
  const [from, to] = conversionFormats(conversion);
  const reverse = `${to}-${from}`;
  return isConversion(reverse) ? reverse : undefined;
}

/** File extensions that pick the source format when a file is opened. */
const SOURCE_EXTENSIONS: Record<string, SourceFormat> = {
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  csv: 'csv',
  tsv: 'csv',
  xml: 'xml',
};

export function formatForFile(name: string): SourceFormat | undefined {
  const extension = /\.([^.]+)$/.exec(name)?.[1]?.toLowerCase();
  return extension ? SOURCE_EXTENSIONS[extension] : undefined;
}

export type ConvertOptions = {
  indent: JsonIndent;
  /** JSON → YAML: a top-level array becomes one document per item. */
  multiDocument: boolean;
  /** Reading CSV (`auto` detects it); writing CSV uses a comma for `auto`. */
  delimiter: CsvDelimiter | 'auto';
  /** CSV has a header row. */
  header: boolean;
  /** JSON → CSV flattens nested values to dotted columns; CSV → JSON nests them back. */
  flatten: boolean;
  /** CSV, XML and query values: numbers, booleans and null become JSON types. */
  inferTypes: boolean;
  attributePrefix: AttributePrefix;
  /** Name of the root type for TypeScript and Zod. */
  rootName: string;
};

/**
 * Converts `text` in one call. Errors come back as values with their offset in the input; a
 * rejection only means a parser library failed to load.
 */
export async function runConvert(
  text: string,
  conversion: Conversion,
  options: ConvertOptions
): Promise<FormatResult> {
  const [from, to] = conversionFormats(conversion);

  if (from !== 'json') {
    const read =
      from === 'yaml'
        ? await yamlToJson(text)
        : from === 'csv'
          ? csvToJson(text, { ...options, nest: options.flatten })
          : from === 'xml'
            ? await xmlToJson(text, options)
            : { ok: true as const, value: queryToJson(text, options.inferTypes), warnings: [] };
    if (!read.ok) return read;
    return formatted(`${stringifyJson(read.value, { indent: options.indent })}\n`, read.warnings);
  }

  const parsed = parseJson(text);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const root = lastKeyWins(parsed.value);
  const { warnings } = parsed;
  const rootName = typeName(options.rootName.trim() || 'Root');

  switch (to) {
    case 'yaml':
      return formatted(
        jsonToYaml(root, options.indent === 'tab' ? 2 : options.indent, options.multiDocument),
        warnings
      );
    case 'csv': {
      const delimiter = options.delimiter === 'auto' ? ',' : options.delimiter;
      const written = jsonToCsv(root, { ...options, delimiter });
      return written.ok
        ? formatted(written.text, warnings)
        : failed(written.message, root.from, root.to);
    }
    case 'xml': {
      const written = await jsonToXml(root, options);
      return formatted(written.text, [...warnings, ...written.warnings]);
    }
    case 'query': {
      const written = jsonToQuery(root);
      return written.ok
        ? formatted(written.text, warnings)
        : failed(written.message, root.from, root.to);
    }
    case 'typescript':
      return formatted(toTypeScript(inferShape(root), rootName), warnings);
    case 'zod':
      return formatted(toZod(inferShape(root), rootName), warnings);
    case 'json':
      return formatted(`${stringifyJson(root, { indent: options.indent })}\n`, warnings);
  }
}
