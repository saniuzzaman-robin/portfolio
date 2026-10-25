import type { JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';
import type { FormatIssue } from '@/lib/tools/format/types';
import {
  arrayNode,
  inferScalar,
  nullNode,
  objectNode,
  scalarText,
  setPath,
  stringNode,
  treeToNode,
  type Tree,
} from './nodes';

export const CSV_DELIMITERS = [',', ';', '\t', '|'] as const;
export type CsvDelimiter = (typeof CSV_DELIMITERS)[number];

export type CsvRow = { fields: string[]; offset: number };
export type CsvParse = { ok: true; rows: CsvRow[] } | { ok: false; error: FormatIssue };

/**
 * RFC 4180 parser: quoted fields may hold delimiters, `""` and line breaks; records end with
 * CRLF, LF or CR. A leading BOM is skipped and blank lines are ignored. A quote inside an
 * unquoted field is kept as text (common in the wild); text after a closing quote is an error.
 * `limit` stops after that many rows (used to sample for delimiter detection).
 */
export function parseCsv(text: string, delimiter: string, limit = Infinity): CsvParse {
  const rows: CsvRow[] = [];
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;

  while (i < text.length && rows.length < limit) {
    const offset = i;
    const fields: string[] = [];
    let atRowEnd = false;
    while (!atRowEnd) {
      let field = '';
      if (text[i] === '"') {
        const open = i++;
        for (;;) {
          const close = text.indexOf('"', i);
          if (close < 0) {
            return {
              ok: false,
              error: { message: 'Unterminated quoted field', from: open, to: text.length },
            };
          }
          field += text.slice(i, close);
          i = close + 1;
          if (text[i] !== '"') break;
          field += '"';
          i++;
        }
        if (i < text.length && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') {
          return {
            ok: false,
            error: { message: 'Unexpected text after a closing quote', from: i, to: i + 1 },
          };
        }
      } else {
        const start = i;
        while (i < text.length && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') {
          i++;
        }
        field = text.slice(start, i);
      }
      fields.push(field);
      if (text[i] === delimiter) {
        i++;
      } else {
        atRowEnd = true;
        if (text[i] === '\r') i++;
        if (text[i] === '\n') i++;
      }
    }
    if (fields.length > 1 || fields[0] !== '' || text[offset] === '"')
      rows.push({ fields, offset });
  }
  return { ok: true, rows };
}

/**
 * Picks the delimiter that splits the first rows into the same number of fields (more than one)
 * most consistently; ties go to more fields, then to the order of `CSV_DELIMITERS`.
 */
export function detectDelimiter(text: string): CsvDelimiter {
  let best: CsvDelimiter = ',';
  let bestScore = 0;
  for (const delimiter of CSV_DELIMITERS) {
    const parsed = parseCsv(text, delimiter, 20);
    if (!parsed.ok || parsed.rows.length === 0) continue;
    const width = parsed.rows[0].fields.length;
    if (width < 2) continue;
    const consistent = parsed.rows.filter((row) => row.fields.length === width).length;
    const score = consistent * 1000 + width;
    if (score > bestScore) {
      best = delimiter;
      bestScore = score;
    }
  }
  return best;
}

export type CsvReadOptions = {
  delimiter: CsvDelimiter | 'auto';
  /** The first row names the columns; rows become objects. Otherwise rows become arrays. */
  header: boolean;
  /** Turn numbers, `true`/`false` and `null` into JSON types. */
  inferTypes: boolean;
  /** Dotted column names (`address.city`, `tags.0`) become nested objects and arrays. */
  nest: boolean;
};

export type CsvToJson =
  { ok: true; value: JsonNode; warnings: FormatIssue[] } | { ok: false; error: FormatIssue };

export function csvToJson(text: string, options: CsvReadOptions): CsvToJson {
  const delimiter = options.delimiter === 'auto' ? detectDelimiter(text) : options.delimiter;
  const parsed = parseCsv(text, delimiter);
  if (!parsed.ok) return parsed;
  const cell = (field: string) => (options.inferTypes ? inferScalar(field) : stringNode(field));

  if (!options.header) {
    return {
      ok: true,
      value: arrayNode(parsed.rows.map((row) => arrayNode(row.fields.map(cell)))),
      warnings: [],
    };
  }

  const [head, ...body] = parsed.rows;
  const warnings: FormatIssue[] = [];
  const columns = uniqueColumns(head?.fields ?? []);
  const records = body.map((row, index) => {
    if (row.fields.length !== columns.length) {
      warnings.push({
        message: `Row ${index + 2} has ${row.fields.length} fields; the header has ${columns.length}.`,
        from: row.offset,
        to: row.offset,
      });
    }
    // Extra fields get positional names; missing ones are null.
    const width = Math.max(columns.length, row.fields.length);
    const entries = Array.from({ length: width }, (_, column): [string, JsonNode] => [
      columns[column] ?? `field${column + 1}`,
      column < row.fields.length ? cell(row.fields[column]) : nullNode(),
    ]);
    return options.nest ? nestEntries(entries) : objectNode(entries);
  });
  return { ok: true, value: arrayNode(records), warnings };
}

/** Blank names become `field<n>`; repeats get `_2`, `_3`… so no column is overwritten. */
function uniqueColumns(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name, index) => {
    const base = name === '' ? `field${index + 1}` : name;
    let unique = base;
    for (let suffix = 2; used.has(unique); suffix++) unique = `${base}_${suffix}`;
    used.add(unique);
    return unique;
  });
}

/** Builds nested values from dotted keys; a key that clashes with another stays flat. */
export function nestEntries(entries: [string, JsonNode][]): JsonNode {
  const tree: Tree = new Map();
  for (const [key, value] of entries) {
    if (!setPath(tree, key.split('.'), value) && !tree.has(key)) tree.set(key, value);
  }
  return treeToNode(tree);
}

/** Dotted keys for every leaf: `{a:{b:[1]}}` → `a.b.0`. Empty objects and arrays are leaves. */
export function flattenNode(node: JsonNode, prefix = ''): [string, JsonNode][] {
  const join = (key: string) => (prefix === '' ? key : `${prefix}.${key}`);
  if (node.type === 'object' && node.entries.length > 0) {
    return node.entries.flatMap((entry) => flattenNode(entry.value, join(entry.key)));
  }
  if (node.type === 'array' && node.items.length > 0) {
    return node.items.flatMap((item, index) => flattenNode(item, join(String(index))));
  }
  return [[prefix, node]];
}

export type CsvWriteOptions = {
  delimiter: CsvDelimiter;
  header: boolean;
  /** Nested values become dotted columns; otherwise they are written as JSON text. */
  flatten: boolean;
};

export type JsonToCsv = { ok: true; text: string } | { ok: false; message: string };

/**
 * Writes an array of objects (one row each, columns in first-seen order), an array of arrays
 * (rows as they are) or a single object (one row). Other array items go in a `value` column.
 */
export function jsonToCsv(node: JsonNode, options: CsvWriteOptions): JsonToCsv {
  const quote = (text: string) =>
    text.includes(options.delimiter) || /["\r\n]/.test(text)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  const cellText = (value: JsonNode) =>
    value.type === 'object' || value.type === 'array' ? stringifyJson(value) : scalarText(value);
  const line = (cells: string[]) => cells.map(quote).join(options.delimiter);

  if (
    node.type === 'array' &&
    node.items.length > 0 &&
    node.items.every((item) => item.type === 'array')
  ) {
    const rows = node.items.map((item) =>
      line(item.type === 'array' ? item.items.map(cellText) : [])
    );
    return { ok: true, text: `${rows.join('\n')}\n` };
  }
  if (node.type !== 'array' && node.type !== 'object') {
    return { ok: false, message: 'Expected an array of objects (or one object) to write as CSV.' };
  }

  const items = node.type === 'array' ? node.items : [node];
  const records = items.map((item): [string, JsonNode][] => {
    if (item.type !== 'object') return [['value', item]];
    if (options.flatten) return item.entries.length ? flattenNode(item) : [];
    return item.entries.map((entry): [string, JsonNode] => [entry.key, entry.value]);
  });
  const columns = [...new Set(records.flatMap((record) => record.map(([key]) => key)))];
  const rows = records.map((record) => {
    const values = new Map(record);
    return line(
      columns.map((column) => {
        const value = values.get(column);
        return value ? cellText(value) : '';
      })
    );
  });
  if (options.header) rows.unshift(line(columns));
  return { ok: true, text: rows.length ? `${rows.join('\n')}\n` : '' };
}
