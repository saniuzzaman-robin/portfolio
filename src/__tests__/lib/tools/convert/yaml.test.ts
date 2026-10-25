import { describe, it, expect } from 'vitest';
import { load, loadAll } from 'js-yaml';
import { jsonToYaml, yamlToJson } from '@/lib/tools/convert/yaml';
import { parseJson, type JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';

const json = (text: string): JsonNode => {
  const parsed = parseJson(text);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.value;
};
const toYaml = (text: string, indent = 2, multiDocument = false) =>
  jsonToYaml(json(text), indent, multiDocument);

describe('jsonToYaml', () => {
  it('writes block mappings and sequences', () => {
    expect(
      toYaml('{"name":"app","ports":[80,443],"db":{"host":"localhost","pool":{"max":5}}}')
    ).toBe(
      `name: app
ports:
  - 80
  - 443
db:
  host: localhost
  pool:
    max: 5
`
    );
  });

  it('puts the first key of an object item on the dash line', () => {
    expect(toYaml('[{"a":1,"b":[true,null]},[1,[2]],{},[]]')).toBe(
      `- a: 1
  b:
    - true
    - null
- - 1
  - - 2
- {}
- []
`
    );
  });

  it('indents nested mappings by the chosen unit', () => {
    expect(toYaml('{"a":{"b":{"c":1}}}', 4)).toBe('a:\n    b:\n        c: 1\n');
  });

  it('keeps number lexemes, including big integers', () => {
    expect(toYaml('{"big":12345678901234567890,"f":1.10,"e":1E+5,"z":-0}')).toBe(
      'big: 12345678901234567890\nf: 1.10\ne: 1E+5\nz: -0\n'
    );
  });

  it('quotes strings a YAML reader would take for something else', () => {
    const tricky = [
      'yes',
      'No',
      'on',
      'OFF',
      'y',
      'null',
      'true',
      '~',
      '',
      ' lead',
      'trail ',
      '123',
      '1.5',
      '0x1F',
      '.inf',
      '2024-01-01',
      '- item',
      'a: b',
      'a #b',
      '#c',
      '@at',
      '*ref',
      '&anchor',
      '!tag',
      '|',
      '>',
      '%',
      '`',
      '[x]',
      '{x}',
      'key:',
      '"q"',
      "'s'",
      '?',
      'tab\there',
      'nul\u0000',
      'bell\u0007',
      'nel\u0085',
      'ls\u2028',
      'bom\ufeff',
      'emoji 🎉',
      'Ünïcödé',
    ];
    const source = JSON.stringify(Object.fromEntries(tricky.map((text, index) => [text, index])));
    const values = JSON.stringify(tricky);
    expect(load(toYaml(source))).toEqual(JSON.parse(source));
    expect(load(toYaml(values))).toEqual(tricky);
  });

  it('leaves plain-safe strings unquoted', () => {
    expect(
      toYaml('["hello world","/usr/bin","http://x.dev/a?b","v1.2.3","snake_case","Ünïcode"]')
    ).toBe('- hello world\n- /usr/bin\n- "http://x.dev/a?b"\n- v1.2.3\n- snake_case\n- Ünïcode\n');
  });

  it('writes multi-line strings as literal blocks with the right chomping', () => {
    const source = '{"keep":"a\\nb\\n\\n","clip":"a\\n  b\\n","strip":"a\\nb","list":["x\\ny"]}';
    const yaml = toYaml(source);
    expect(yaml).toBe(
      `keep: |+
  a
  b

clip: |
  a
    b
strip: |-
  a
  b
list:
  - |-
    x
    y
`
    );
    expect(load(yaml)).toEqual(JSON.parse(source));
  });

  it('quotes multi-line strings a literal block cannot hold', () => {
    expect(toYaml('{"a":" lead\\nx","b":"\\nfirst","c":"cr\\r\\nlf"}')).toBe(
      'a: " lead\\nx"\nb: "\\nfirst"\nc: "cr\\r\\nlf"\n'
    );
  });

  it('writes scalars and empty containers at the top level', () => {
    expect(toYaml('"yes"')).toBe('"yes"\n');
    expect(toYaml('42')).toBe('42\n');
    expect(toYaml('{}')).toBe('{}\n');
  });

  it('writes one document per item with multiDocument', () => {
    const yaml = toYaml('[{"a":1},{"b":2}]', 2, true);
    expect(yaml).toBe('---\na: 1\n---\nb: 2\n');
    expect(loadAll(yaml)).toEqual([{ a: 1 }, { b: 2 }]);
  });
});

describe('yamlToJson', () => {
  const read = async (text: string) => {
    const result = await yamlToJson(text);
    if (!result.ok) throw new Error(result.error.message);
    return result;
  };

  it('reads YAML 1.2 core types and resolves aliases', async () => {
    const { value } = await read('a: yes\nb: 0o17\nc: ~\nd: 2001-12-14\ne: &x {k: 1}\nf: *x\n');
    expect(JSON.parse(stringifyJson(value))).toEqual({
      a: 'yes',
      b: 15,
      c: null,
      d: '2001-12-14',
      e: { k: 1 },
      f: { k: 1 },
    });
  });

  it('turns several documents into an array', async () => {
    const { value } = await read('---\na: 1\n---\nb: 2\n');
    expect(stringifyJson(value)).toBe('[{"a":1},{"b":2}]');
  });

  it('warns about values JSON cannot hold and integers past 2^53', async () => {
    const { value, warnings } = await read('a: .inf\nb: 12345678901234567890\n');
    expect(stringifyJson(value)).toBe('{"a":null,"b":12345678901234567000}');
    expect(warnings.map((warning) => warning.message)).toEqual([
      'Infinity has no JSON equivalent; written as null.',
      '12345678901234567000 is beyond 2^53 and may have lost precision while parsing.',
    ]);
  });

  it('reports syntax errors and duplicate keys with their offset', async () => {
    expect(await yamlToJson('a: [1, 2\nb: 3')).toMatchObject({ ok: false, error: { from: 9 } });
    const duplicate = await yamlToJson('a: 1\na: 2\n');
    expect(duplicate.ok).toBe(false);
  });

  it('round-trips with jsonToYaml', async () => {
    const source = '{"s":"multi\\nline","n":[1,2.5,-3],"o":{"yes":"no","":null},"e":[]}';
    const { value } = await read(toYaml(source));
    expect(JSON.parse(stringifyJson(value))).toEqual(JSON.parse(source));
  });
});
