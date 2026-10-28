import { readTypeScriptLibs } from '@/lib/tools/playground/ts-libs';

// Built once: the lib files only change with the typescript package.
export const dynamic = 'force-static';

/** The lib `.d.ts` files for the code playground's TypeScript compiler (fetched by its worker). */
export function GET() {
  return Response.json(readTypeScriptLibs());
}
