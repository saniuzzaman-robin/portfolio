import {
  TYPESCRIPT_LIB_URL,
  createCompiler,
  type CompileResult,
  type Compiler,
} from '@/lib/tools/playground/typescript';
import type { TypeScriptLibs } from '@/lib/tools/playground/ts-libs';

export type WorkerRequest = { id: number; code: string; fileName: string };
export type WorkerResponse = { id: number; result: CompileResult } | { id: number; error: string };

/** The compiler and its parsed libs stay loaded for the next run. */
let compiler: Promise<Compiler> | null = null;

async function loadCompiler(): Promise<Compiler> {
  const response = await fetch(TYPESCRIPT_LIB_URL);
  if (!response.ok) {
    throw new Error(`Loading the TypeScript libs failed (HTTP ${response.status}).`);
  }
  return createCompiler((await response.json()) as TypeScriptLibs);
}

/* Compiling runs here: the compiler is large and a type check can take a while. */
self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const { id, code, fileName } = event.data;
  let response: WorkerResponse;
  try {
    const loading = (compiler ??= loadCompiler());
    // A failed load is retried on the next run.
    loading.catch(() => {
      if (compiler === loading) compiler = null;
    });
    response = { id, result: (await loading)(code, fileName) };
  } catch (error) {
    response = { id, error: error instanceof Error ? error.message : String(error) };
  }
  self.postMessage(response);
});
