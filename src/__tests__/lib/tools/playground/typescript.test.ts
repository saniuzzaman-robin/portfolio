// @vitest-environment node
// The compiler runs in a worker in the browser; here it runs directly against the real libs.
import { beforeAll, describe, it, expect } from 'vitest';
import { createCompiler, type Compiler } from '@/lib/tools/playground/typescript';
import { readTypeScriptLibs, type TypeScriptLibs } from '@/lib/tools/playground/ts-libs';

let libs: TypeScriptLibs;
let compile: Compiler;

beforeAll(() => {
  libs = readTypeScriptLibs();
  compile = createCompiler(libs);
  // The first compile parses every lib file.
  compile('', 'warmup.ts');
}, 60_000);

function errorsOf(code: string) {
  const result = compile(code, 'main.ts');
  if (result.ok) throw new Error('Expected the code to be rejected.');
  return result.errors;
}

describe('readTypeScriptLibs', () => {
  it('reads the root libs and everything they reference', () => {
    expect(libs.roots).toEqual([
      'lib.esnext.d.ts',
      'lib.webworker.d.ts',
      'lib.webworker.iterable.d.ts',
      'lib.webworker.asynciterable.d.ts',
    ]);
    for (const name of [...libs.roots, 'lib.es5.d.ts', 'lib.es2015.promise.d.ts']) {
      expect(libs.files[name], name).toBeTypeOf('string');
    }
    expect(libs.files).not.toHaveProperty('lib.dom.d.ts');
  });
});

describe('createCompiler', () => {
  it('emits JavaScript without types or a source map comment', () => {
    const result = compile('const greeting: string = "hi";\nconsole.log(greeting);', 'main.ts');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.js).toContain('const greeting = "hi";');
    expect(result.js).not.toContain(': string');
    expect(result.js).not.toContain('sourceMappingURL');
  });

  it('maps generated lines back to source lines', () => {
    const code = [
      'interface Point {',
      '  x: number;',
      '}',
      'const p: Point = { x: 1 };',
      'console.log(p.x);',
    ].join('\n');
    const result = compile(code, 'main.ts');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const lines = result.js.split('\n');
    expect(result.lineMap).toHaveLength(lines.length);
    expect(result.lineMap[lines.indexOf('const p = { x: 1 };')]).toBe(4);
    expect(result.lineMap[lines.indexOf('console.log(p.x);')]).toBe(5);
  });

  it('reports type errors with 1-based positions', () => {
    expect(errorsOf('const ok = 1;\nconst s: string = 1;')).toEqual([
      { message: "Type 'number' is not assignable to type 'string'.", line: 2, column: 7 },
    ]);
  });

  it('reports syntax errors', () => {
    const [error] = errorsOf('const = 1;');
    expect(error).toMatchObject({ line: 1, column: 7 });
  });

  it('checks strictly', () => {
    const [error] = errorsOf('function twice(n) {\n  return n * 2;\n}');
    expect(error).toMatchObject({ line: 1, column: 16 });
    expect(error.message).toContain("implicitly has an 'any' type");
  });

  it('allows top-level await without imports or exports', () => {
    expect(compile('await Promise.resolve(1);', 'main.ts').ok).toBe(true);
  });

  it('knows the worker globals but not the DOM', () => {
    expect(compile('postMessage(structuredClone({ a: 1 }));', 'main.ts').ok).toBe(true);
    const [error] = errorsOf('document.title = "x";');
    expect(error.message).toContain("Cannot find name 'document'");
  });

  it('compiles each run on its own', () => {
    expect(compile('const s: string = 1;', 'main.ts').ok).toBe(false);
    expect(compile('const s: string = "1";', 'main.ts').ok).toBe(true);
  });
});
