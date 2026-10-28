import { isParseError } from '@/lib/tools/format/js-minify';
import type { SourceError } from './types';

/**
 * Locates a syntax error in a JavaScript module with terser's parser (loaded on first use).
 * Browsers say little about why a module worker failed to load, so this explains it after the
 * fact. Returns null when the code parses (the load failed for another reason, e.g. an import).
 */
export async function findSyntaxError(code: string): Promise<SourceError | null> {
  const { minify } = await import('terser');
  try {
    await minify(code, { module: true, compress: false, mangle: false });
    return null;
  } catch (error) {
    if (isParseError(error)) {
      return { message: error.message, line: error.line, column: error.col + 1 };
    }
    throw error;
  }
}
