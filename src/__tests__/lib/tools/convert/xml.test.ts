import { describe, it, expect } from 'vitest';
import { jsonToXml, xmlToJson } from '@/lib/tools/convert/xml';
import { parseJson, type JsonNode } from '@/lib/tools/json/parse';
import { stringifyJson } from '@/lib/tools/json/format';

const json = (text: string): JsonNode => {
  const parsed = parseJson(text);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.value;
};
const toJson = async (text: string, inferTypes = true) => {
  const result = await xmlToJson(text, { attributePrefix: '@_', inferTypes });
  if (!result.ok) throw new Error(result.error.message);
  return JSON.parse(stringifyJson(result.value));
};
const toXml = async (text: string, indent: 2 | 4 | 'tab' = 2) =>
  jsonToXml(json(text), { attributePrefix: '@_', indent });

describe('xmlToJson', () => {
  it('maps attributes, repeated elements and mixed text', async () => {
    expect(
      await toJson(
        '<?xml version="1.0"?><root id="7"><item>a</item><item>b</item><t lang="en">hi</t><e/></root>',
        false
      )
    ).toEqual({
      '?xml': { '@_version': '1.0' },
      root: { '@_id': '7', item: ['a', 'b'], t: { '@_lang': 'en', '#text': 'hi' }, e: '' },
    });
  });

  it('infers JSON types, keeping number lexemes and leaving 007 and hex as text', async () => {
    const result = await xmlToJson(
      '<r v="1.0"><a>3.50</a><b>007</b><c>0x1F</c><d>12345678901234567890</d><e>true</e></r>',
      { attributePrefix: '@_', inferTypes: true }
    );
    expect(result.ok && stringifyJson(result.value)).toBe(
      '{"r":{"a":3.50,"b":"007","c":"0x1F","d":12345678901234567890,"e":true,"@_v":1.0}}'
    );
  });

  it('keeps every value a string without type inference', async () => {
    expect(await toJson('<r n="1"><a>2</a></r>', false)).toEqual({ r: { '@_n': '1', a: '2' } });
  });

  it('reports well-formedness errors at their position', async () => {
    const source = '<a>\n<b></a>';
    expect(await xmlToJson(source, { attributePrefix: '@_', inferTypes: true })).toMatchObject({
      ok: false,
      error: {
        message: "Expected closing tag 'b' (opened in line 2, col 1) instead of closing tag 'a'.",
        from: 7,
      },
    });
  });
});

describe('jsonToXml', () => {
  it('uses a single top-level key as the root and adds a declaration', async () => {
    expect(
      (
        await toXml(
          '{"note":{"@_id":1,"to":"Tove","tags":["a","b"],"body":{"#text":"Hi & bye","@_lang":"en"},"none":null}}'
        )
      ).text
    ).toBe(
      `<?xml version="1.0" encoding="UTF-8"?>
<note id="1">
  <to>Tove</to>
  <tags>a</tags>
  <tags>b</tags>
  <body lang="en">Hi &amp; bye</body>
  <none/>
</note>
`
    );
  });

  it('wraps several keys, arrays and scalars in <root>', async () => {
    expect((await toXml('{"a":1,"b":2}')).text).toContain(
      '<root>\n  <a>1</a>\n  <b>2</b>\n</root>'
    );
    expect((await toXml('[1,[2,3]]')).text).toContain(
      '<root>\n  <item>1</item>\n  <item>\n    <item>2</item>\n    <item>3</item>\n  </item>\n</root>'
    );
    expect((await toXml('"x"')).text).toContain('<root>x</root>');
  });

  it('keeps number lexemes and indents with tabs', async () => {
    expect((await toXml('{"n":{"big":12345678901234567890,"f":1.10}}', 'tab')).text).toContain(
      '<n>\n\t<big>12345678901234567890</big>\n\t<f>1.10</f>\n</n>'
    );
  });

  it('rewrites invalid names and warns at the key', async () => {
    const result = await toXml('{"r":{"first name":1,"2x":2}}');
    expect(result.text).toContain('<first_name>1</first_name>');
    expect(result.text).toContain('<_2x>2</_2x>');
    expect(result.warnings).toEqual([
      {
        message: '“first name” is not a valid XML name; written as “first_name”.',
        from: 6,
        to: 18,
      },
      { message: '“2x” is not a valid XML name; written as “_2x”.', from: 21, to: 25 },
    ]);
  });

  it('round-trips with xmlToJson', async () => {
    const source =
      '<?xml version="1.0" encoding="UTF-8"?>\n<a x="1">\n  <b>t</b>\n  <b>u</b>\n</a>\n';
    const parsed = await xmlToJson(source, { attributePrefix: '@_', inferTypes: false });
    if (!parsed.ok) throw new Error(parsed.error.message);
    const written = await jsonToXml(parsed.value, { attributePrefix: '@_', indent: 2 });
    expect(written.text).toBe(source);
  });
});
