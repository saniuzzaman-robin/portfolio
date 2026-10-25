import { describe, it, expect } from 'vitest';
import {
  csvToJson,
  detectDelimiter,
  flattenNode,
  jsonToCsv,
  parseCsv,
  type CsvReadOptions,
} from '@/lib/tools/convert/csv';
import { parseJson, type JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';

const json = (text: string): JsonNode => {
  const parsed = parseJson(text);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.value;
};
const fields = (text: string, delimiter = ',') => {
  const parsed = parseCsv(text, delimiter);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.rows.map((row) => row.fields);
};
const READ: CsvReadOptions = { delimiter: 'auto', header: true, inferTypes: true, nest: true };
const toJson = (text: string, options: Partial<CsvReadOptions> = {}) => {
  const result = csvToJson(text, { ...READ, ...options });
  if (!result.ok) throw new Error(result.error.message);
  return JSON.parse(stringifyJson(result.value));
};

describe('parseCsv (RFC 4180)', () => {
  it('splits plain fields and accepts CRLF, LF and CR record ends', () => {
    expect(fields('a,b\r\nc,d\ne,f\rg,h')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
      ['e', 'f'],
      ['g', 'h'],
    ]);
  });

  it('keeps delimiters, doubled quotes and line breaks inside quoted fields', () => {
    expect(fields('"a,b","say ""hi""","line 1\r\nline 2"\n')).toEqual([
      ['a,b', 'say "hi"', 'line 1\r\nline 2'],
    ]);
  });

  it('keeps empty fields, including a trailing one', () => {
    expect(fields('a,,c,\n,,\n')).toEqual([
      ['a', '', 'c', ''],
      ['', '', ''],
    ]);
  });

  it('skips a BOM and blank lines but keeps a quoted empty record', () => {
    expect(fields('\ufeffa,b\n\n\nc,d\n""\n')).toEqual([['a', 'b'], ['c', 'd'], ['']]);
  });

  it('keeps a quote inside an unquoted field as text', () => {
    expect(fields('5" disk,ok')).toEqual([['5" disk', 'ok']]);
  });

  it('reports an unterminated quote at the opening quote', () => {
    expect(parseCsv('a,"b\nc', ',')).toEqual({
      ok: false,
      error: { message: 'Unterminated quoted field', from: 2, to: 6 },
    });
  });

  it('reports text after a closing quote', () => {
    expect(parseCsv('"a"b,c', ',')).toMatchObject({ ok: false, error: { from: 3, to: 4 } });
  });

  it('records the offset where each row starts', () => {
    const parsed = parseCsv('a\n"b\nb"\nc', ',');
    expect(parsed.ok && parsed.rows.map((row) => row.offset)).toEqual([0, 2, 8]);
  });
});

describe('detectDelimiter', () => {
  it('picks the delimiter that splits rows consistently', () => {
    expect(detectDelimiter('a;b;c\n1;2,5;3\n')).toBe(';');
    expect(detectDelimiter('a\tb\n1\t2\n')).toBe('\t');
    expect(detectDelimiter('a|b\n1|2\n')).toBe('|');
    expect(detectDelimiter('name,note\nx,"a;b;c;d"\n')).toBe(',');
  });

  it('falls back to a comma for a single column', () => {
    expect(detectDelimiter('one\ntwo\n')).toBe(',');
  });
});

describe('csvToJson', () => {
  it('turns rows into objects keyed by the header and infers JSON types', () => {
    expect(toJson('id,name,zip,active,score,none\n1,Ada,007,true,1.5e3,null\n')).toEqual([
      { id: 1, name: 'Ada', zip: '007', active: true, score: 1500, none: null },
    ]);
  });

  it('keeps big numbers exactly as written', () => {
    const result = csvToJson('n\n12345678901234567890\n', READ);
    expect(result.ok && stringifyJson(result.value)).toBe('[{"n":12345678901234567890}]');
  });

  it('keeps every value a string without type inference', () => {
    expect(toJson('a,b\n1,true\n', { inferTypes: false })).toEqual([{ a: '1', b: 'true' }]);
  });

  it('nests dotted columns into objects and arrays', () => {
    expect(toJson('id,address.city,tags.0,tags.1\n1,Oslo,a,b\n')).toEqual([
      { id: 1, address: { city: 'Oslo' }, tags: ['a', 'b'] },
    ]);
    expect(toJson('address.city\nOslo\n', { nest: false })).toEqual([{ 'address.city': 'Oslo' }]);
  });

  it('keeps a clashing dotted column flat', () => {
    expect(toJson('a,a.b\n1,2\n')).toEqual([{ a: 1, 'a.b': 2 }]);
  });

  it('names blank and repeated headers uniquely', () => {
    expect(toJson('a,,a\n1,2,3\n')).toEqual([{ a: 1, field2: 2, a_2: 3 }]);
  });

  it('warns about ragged rows, naming extra fields and nulling missing ones', () => {
    const result = csvToJson('a,b\n1\n1,2,3\n', READ);
    expect(result.ok && JSON.parse(stringifyJson(result.value))).toEqual([
      { a: 1, b: null },
      { a: 1, b: 2, field3: 3 },
    ]);
    expect(result.ok && result.warnings).toEqual([
      { message: 'Row 2 has 1 fields; the header has 2.', from: 4, to: 4 },
      { message: 'Row 3 has 3 fields; the header has 2.', from: 6, to: 6 },
    ]);
  });

  it('returns arrays of rows without a header', () => {
    expect(toJson('1,a\n2,b\n', { header: false })).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
  });

  it('reads TSV with auto-detection', () => {
    expect(toJson('a\tb\nx,y\tz\n')).toEqual([{ a: 'x,y', b: 'z' }]);
  });
});

describe('jsonToCsv', () => {
  const write = (text: string, options = {}) => {
    const result = jsonToCsv(json(text), {
      delimiter: ',',
      header: true,
      flatten: true,
      ...options,
    });
    if (!result.ok) throw new Error(result.message);
    return result.text;
  };

  it('writes objects with the union of their keys in first-seen order', () => {
    expect(write('[{"a":1,"b":"x"},{"c":true,"a":null}]')).toBe('a,b,c\n1,x,\n,,true\n');
  });

  it('quotes fields with delimiters, quotes and line breaks', () => {
    expect(write('[{"a":"x,y","b":"say \\"hi\\"","c":"1\\n2"}]')).toBe(
      'a,b,c\n"x,y","say ""hi""","1\n2"\n'
    );
    expect(write('[{"a":"x;y","b":"x,y"}]', { delimiter: ';' })).toBe('a;b\n"x;y";x,y\n');
  });

  it('flattens nested values to dotted columns, or writes them as JSON', () => {
    const source = '[{"id":1,"address":{"city":"Oslo"},"tags":["a","b"],"none":{}}]';
    expect(write(source)).toBe('id,address.city,tags.0,tags.1,none\n1,Oslo,a,b,{}\n');
    expect(write(source, { flatten: false })).toBe(
      'id,address,tags,none\n1,"{""city"":""Oslo""}","[""a"",""b""]",{}\n'
    );
  });

  it('keeps number lexemes', () => {
    expect(write('[{"n":12345678901234567890,"f":1.10}]')).toBe('n,f\n12345678901234567890,1.10\n');
  });

  it('writes arrays of arrays as rows, single objects as one row and scalars in a value column', () => {
    expect(write('[[1,"a"],[2,"b,c"]]')).toBe('1,a\n2,"b,c"\n');
    expect(write('{"a":1}')).toBe('a\n1\n');
    expect(write('[1,"x"]')).toBe('value\n1\nx\n');
  });

  it('omits the header on request', () => {
    expect(write('[{"a":1}]', { header: false })).toBe('1\n');
  });

  it('rejects a scalar', () => {
    expect(jsonToCsv(json('42'), { delimiter: ',', header: true, flatten: true }).ok).toBe(false);
  });

  it('round-trips through csvToJson', () => {
    const source = '[{"id":1,"user":{"name":"A, B","tags":["x","y"]},"note":"line\\nbreak"}]';
    const result = csvToJson(write(source), READ);
    expect(result.ok && JSON.parse(stringifyJson(result.value))).toEqual(JSON.parse(source));
  });
});

describe('flattenNode', () => {
  it('lists every leaf with its dotted path', () => {
    expect(flattenNode(json('{"a":{"b":[1,{"c":null}]},"d":[]}')).map(([key]) => key)).toEqual([
      'a.b.0',
      'a.b.1.c',
      'd',
    ]);
  });
});
