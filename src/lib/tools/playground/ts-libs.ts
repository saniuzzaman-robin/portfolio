import { readFileSync } from 'node:fs';
import path from 'node:path';

/** The `.d.ts` files the playground compiler type-checks against, served as one JSON file. */
export type TypeScriptLibs = {
  /** The libs named in the compiler's `lib` option. */
  roots: string[];
  /** Every lib file the roots reference, directly or not, by file name. */
  files: Record<string, string>;
};

/** Code runs in a module worker: the latest language features plus the worker's globals. */
const ROOT_LIBS = ['esnext', 'webworker', 'webworker.iterable', 'webworker.asynciterable'];

const LIB_REFERENCE = /^\/\/\/\s*<reference\s+lib="([^"]+)"/gm;

const libFileName = (name: string) => `lib.${name.toLowerCase()}.d.ts`;

/** Reads the root libs and every lib they reference from the installed `typescript` package. */
export function readTypeScriptLibs(): TypeScriptLibs {
  const roots = ROOT_LIBS.map(libFileName);
  const files: Record<string, string> = {};
  const pending = [...roots];
  for (let name = pending.pop(); name !== undefined; name = pending.pop()) {
    if (name in files) continue;
    let text: string;
    try {
      // A literal path, so the build traces only this folder.
      text = readFileSync(
        path.join(process.cwd(), 'node_modules', 'typescript', 'lib', name),
        'utf8'
      );
    } catch (error) {
      throw new Error(
        `Reading the TypeScript lib "${name}" from node_modules/typescript/lib failed. Check that the installed typescript package still ships it.`,
        { cause: error }
      );
    }
    files[name] = text;
    for (const [, reference] of text.matchAll(LIB_REFERENCE)) pending.push(libFileName(reference));
  }
  return { roots, files };
}
