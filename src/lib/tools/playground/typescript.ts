import ts from 'typescript';
import { sourceLineMap } from './source-map';
import type { TypeScriptLibs } from './ts-libs';
import type { SourceError } from './types';

/** Where the compiler's worker fetches the lib files; the version keeps caches apart. */
export const TYPESCRIPT_LIB_URL = `/typescript-lib.json?v=${ts.version}`;

export type CompileResult =
  { ok: true; js: string; lineMap: number[] } | { ok: false; errors: SourceError[] };

/** Compiles one file to JavaScript, or returns its errors (syntax and type errors alike). */
export type Compiler = (code: string, fileName: string) => CompileResult;

/** Files live at the root of an in-memory file system; libs are looked up there too. */
const ROOT = '/';

const SOURCE_MAPPING_URL = /\n\/\/# sourceMappingURL=.*\s*$/;

/**
 * An in-memory TypeScript compiler with strict checking against `libs`. Lib files are parsed on
 * the first compile and reused, so later compiles only parse and check the user's file.
 */
export function createCompiler(libs: TypeScriptLibs): Compiler {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    // Top-level await needs a module, even when the code has no imports or exports.
    moduleDetection: ts.ModuleDetectionKind.Force,
    lib: libs.roots,
    types: [],
    strict: true,
    skipLibCheck: true,
    sourceMap: true,
    newLine: ts.NewLineKind.LineFeed,
  };
  const libFiles = new Map<string, ts.SourceFile>();

  return (code, fileName) => {
    const userPath = ROOT + fileName;
    const libName = (path: string) => (path.startsWith(ROOT) ? path.slice(ROOT.length) : path);
    const outputs = new Map<string, string>();
    const host: ts.CompilerHost = {
      getSourceFile: (path, languageVersion) => {
        if (path === userPath) return ts.createSourceFile(path, code, languageVersion);
        const name = libName(path);
        const text = libs.files[name];
        if (text === undefined) return undefined;
        let file = libFiles.get(name);
        if (!file) {
          file = ts.createSourceFile(path, text, languageVersion);
          libFiles.set(name, file);
        }
        return file;
      },
      getDefaultLibFileName: () => ROOT + 'lib.d.ts',
      getDefaultLibLocation: () => ROOT,
      writeFile: (path, text) => outputs.set(path, text),
      getCurrentDirectory: () => ROOT,
      getDirectories: () => [],
      getCanonicalFileName: (path) => path,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      fileExists: (path) => path === userPath || libName(path) in libs.files,
      readFile: (path) => (path === userPath ? code : libs.files[libName(path)]),
      directoryExists: (path) => path === ROOT,
    };

    const program = ts.createProgram({ rootNames: [userPath], options, host });
    const source = program.getSourceFile(userPath);
    const errors = ts
      .getPreEmitDiagnostics(program, source)
      .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
      .map((diagnostic): SourceError => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (diagnostic.file?.fileName !== userPath || diagnostic.start === undefined) {
          return { message };
        }
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        return { message, line: line + 1, column: character + 1 };
      });
    if (errors.length > 0) return { ok: false, errors };

    const emitted = program.emit(source);
    const js = [...outputs].find(([path]) => path.endsWith('.js'))?.[1];
    const map = [...outputs].find(([path]) => path.endsWith('.js.map'))?.[1];
    if (emitted.emitSkipped || js === undefined || map === undefined) {
      throw new Error(`The TypeScript compiler emitted no JavaScript for ${fileName}.`);
    }
    const output = js.replace(SOURCE_MAPPING_URL, '\n');
    const { mappings } = JSON.parse(map) as { mappings: string };
    return { ok: true, js: output, lineMap: sourceLineMap(mappings, output.split('\n').length) };
  };
}
