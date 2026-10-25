// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { runFormat, type FormatOptions } from '@/lib/tools/format/format';
import { languageForFile } from '@/lib/tools/format/languages';
import { offsetAt } from '@/lib/tools/format/types';

const OPTIONS: FormatOptions = {
  indent: 2,
  printWidth: 80,
  sqlDialect: 'sql',
  keywordCase: 'preserve',
  mangle: true,
  minifyInline: true,
};

describe('runFormat: beautify', () => {
  it('formats JavaScript, TypeScript and CSS with prettier', async () => {
    expect(await runFormat('const a={b:1,c:[1,2]}', 'javascript', 'beautify', OPTIONS)).toEqual({
      ok: true,
      warnings: [],
      text: 'const a = { b: 1, c: [1, 2] };\n',
    });
    expect(
      await runFormat('let a:number=1', 'typescript', 'beautify', { ...OPTIONS, indent: 4 })
    ).toMatchObject({ text: 'let a: number = 1;\n' });
    expect(await runFormat('a{color:red}', 'scss', 'beautify', OPTIONS)).toMatchObject({
      text: 'a {\n  color: red;\n}\n',
    });
  });

  it('formats embedded CSS and JS inside HTML', async () => {
    const result = await runFormat(
      '<div><script>let a=1</script><style>a{color:red}</style></div>',
      'html',
      'beautify',
      OPTIONS
    );
    expect(result).toMatchObject({
      text: '<div>\n  <script>\n    let a = 1;\n  </script>\n  <style>\n    a {\n      color: red;\n    }\n  </style>\n</div>\n',
    });
  });

  it('formats YAML, Markdown and GraphQL', async () => {
    expect(await runFormat('a:   1\nb:\n    - x', 'yaml', 'beautify', OPTIONS)).toMatchObject({
      text: 'a: 1\nb:\n  - x\n',
    });
    expect(await runFormat('#  Title\n*  item', 'markdown', 'beautify', OPTIONS)).toMatchObject({
      text: '# Title\n\n- item\n',
    });
    expect(await runFormat('{user(id:1){name}}', 'graphql', 'beautify', OPTIONS)).toMatchObject({
      text: '{\n  user(id: 1) {\n    name\n  }\n}\n',
    });
  });

  it('uses tabs and the print width', async () => {
    const code = 'function f(){return [aaaaaaaaaa, bbbbbbbbbb, cccccccccc]}';
    expect(
      await runFormat(code, 'javascript', 'beautify', { ...OPTIONS, indent: 'tab', printWidth: 40 })
    ).toMatchObject({
      text: 'function f() {\n\treturn [\n\t\taaaaaaaaaa,\n\t\tbbbbbbbbbb,\n\t\tcccccccccc,\n\t];\n}\n',
    });
  });

  it('formats SQL in the chosen dialect and keyword case', async () => {
    const result = await runFormat('select a, b from t where x = $1', 'sql', 'beautify', {
      ...OPTIONS,
      sqlDialect: 'postgresql',
      keywordCase: 'upper',
    });
    expect(result).toMatchObject({
      text: 'SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = $1\n',
    });
  });

  it('keeps big numbers in JSON', async () => {
    expect(await runFormat('{"id":9007199254740993}', 'json', 'beautify', OPTIONS)).toMatchObject({
      text: '{\n  "id": 9007199254740993\n}\n',
    });
  });

  it('turns single-quoted JS object literals into strict JSON', async () => {
    const code = "{ name: 'it\\'s', \"q\": 'say \"hi\"', list: [1, 2,], // note\n}";
    expect(await runFormat(code, 'json', 'beautify', OPTIONS)).toMatchObject({
      text: '{\n  "name": "it\'s",\n  "q": "say \\"hi\\"",\n  "list": [\n    1,\n    2\n  ]\n}\n',
    });
  });
});

describe('runFormat: minify', () => {
  it('minifies JavaScript with terser, mangling only when asked', async () => {
    const code = 'function add(first, second) { return first + second; }\nadd(1, 2);';
    expect(await runFormat(code, 'javascript', 'minify', OPTIONS)).toMatchObject({
      text: 'function add(d,n){return d+n}add(1,2);',
    });
    expect(
      await runFormat(code, 'javascript', 'minify', { ...OPTIONS, mangle: false })
    ).toMatchObject({ text: 'function add(first,second){return first+second}add(1,2);' });
  });

  it('keeps license comments and handles modules', async () => {
    const code = '/*! MIT */\nimport x from "y";\nexport const z = x + 1;';
    expect(await runFormat(code, 'javascript', 'minify', OPTIONS)).toMatchObject({
      text: '/*! MIT */\nimport x from"y";export const z=x+1;',
    });
  });

  it('minifies single-quoted JS object literals into strict JSON', async () => {
    expect(await runFormat("{ a: 'x', b: [1, 2,], }", 'json', 'minify', OPTIONS)).toMatchObject({
      text: '{"a":"x","b":[1,2]}',
    });
  });

  it('minifies JSON and CSS', async () => {
    expect(await runFormat('{ "a": [1, 2] }', 'json', 'minify', OPTIONS)).toMatchObject({
      text: '{"a":[1,2]}',
    });
    expect(await runFormat('a { b: c; }', 'less', 'minify', OPTIONS)).toMatchObject({
      text: 'a{b:c}',
    });
  });

  it('falls back to beautify for languages without a minifier', async () => {
    expect(await runFormat('a:   1', 'yaml', 'minify', OPTIONS)).toMatchObject({ text: 'a: 1\n' });
  });
});

describe('runFormat: errors', () => {
  it('maps prettier errors to offsets', async () => {
    const code = 'let a = 1;\nlet b = (2;';
    const result = await runFormat(code, 'javascript', 'beautify', OPTIONS);
    expect(result).toMatchObject({
      ok: false,
      error: { message: 'Unexpected token, expected ","' },
    });
    expect(!result.ok && code.slice(result.error.from)).toBe(';');
  });

  it('maps terser errors to offsets', async () => {
    const result = await runFormat('let a = ;', 'javascript', 'minify', OPTIONS);
    expect(result).toMatchObject({
      ok: false,
      error: { message: 'Unexpected token: punc (;)', from: 8 },
    });
  });

  it('maps sql-formatter errors to offsets and drops the parser dump', async () => {
    const code = 'SELECT\n a,\n $$';
    const result = await runFormat(code, 'sql', 'beautify', {
      ...OPTIONS,
      sqlDialect: 'postgresql',
    });
    expect(result).toMatchObject({ ok: false, error: { message: 'Parse error: Unexpected "$$"' } });
    expect(!result.ok && code.slice(result.error.from)).toBe('$$');
  });

  it('reports JSON errors from the JSON parser', async () => {
    expect(await runFormat('{"a": }', 'json', 'beautify', OPTIONS)).toMatchObject({
      ok: false,
      error: { from: 6 },
    });
  });
});

describe('helpers', () => {
  it('offsetAt converts 1-based line/column, for every line ending', () => {
    const text = 'ab\ncd\r\nef\rgh';
    expect(offsetAt(text, 1, 1)).toBe(0);
    expect(offsetAt(text, 2, 2)).toBe(4);
    expect(offsetAt(text, 3, 1)).toBe(7);
    expect(offsetAt(text, 4, 2)).toBe(11);
    expect(offsetAt(text, 9, 9)).toBe(text.length);
  });

  it('languageForFile maps extensions', () => {
    expect(languageForFile('styles.SCSS')).toBe('scss');
    expect(languageForFile('icon.svg')).toBe('xml');
    expect(languageForFile('query.sql')).toBe('sql');
    expect(languageForFile('README')).toBeUndefined();
    expect(languageForFile('archive.zip')).toBeUndefined();
  });
});
