import { failed, formatted, type FormatResult } from './types';

export type JsMinifyOptions = {
  /** Rename local variables and functions to short names. */
  mangle: boolean;
};

export type TerserParseError = Error & { line: number; col: number; pos: number };

export const isParseError = (error: unknown): error is TerserParseError =>
  error instanceof Error && typeof (error as Partial<TerserParseError>).pos === 'number';

/**
 * Minifies JavaScript with terser (loaded on first use). License comments (`/*!`, `@license`,
 * `@preserve`) are kept and `</script` is escaped, so the output can be inlined in HTML.
 */
export async function minifyJs(code: string, options: JsMinifyOptions): Promise<FormatResult> {
  const { minify } = await import('terser');
  try {
    const result = await minify(code, {
      compress: true,
      mangle: options.mangle,
      format: { comments: 'some' },
    });
    return formatted(result.code ?? '');
  } catch (error) {
    if (isParseError(error)) return failed(error.message, error.pos, error.pos + 1);
    throw error;
  }
}
