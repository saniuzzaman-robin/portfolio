/** QR matrices from `qrcode` (loaded on demand) and our own SVG rendering of them. */

export const EC_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export type EcLevel = (typeof EC_LEVELS)[number];

export type QrMatrix = {
  /** Modules per side, without the quiet zone. */
  size: number;
  version: number;
  /** Row-major; true = dark module. */
  dark: boolean[];
};

export type QrResult = { ok: true; matrix: QrMatrix } | { ok: false; message: string };

/**
 * Encodes `text` (as UTF-8 bytes, or a denser mode when the text allows) at the smallest version
 * that fits. Too much data comes back as an error value; a rejection only means the library
 * chunk failed to load.
 */
export async function createQr(text: string, level: EcLevel): Promise<QrResult> {
  const { create } = await import('qrcode');
  try {
    const code = create(text, { errorCorrectionLevel: level });
    const { size } = code.modules;
    const dark: boolean[] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) dark.push(Boolean(code.modules.get(row, col)));
    }
    return { ok: true, matrix: { size, version: code.version, dark } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export type RenderOptions = {
  /** Quiet zone in modules (the spec asks for 4). */
  margin: number;
  foreground: string;
  background: string;
};

/** Horizontal runs of dark modules, as `[row, start, length]`. */
export function darkRuns(matrix: QrMatrix): [number, number, number][] {
  const runs: [number, number, number][] = [];
  for (let row = 0; row < matrix.size; row++) {
    let col = 0;
    while (col < matrix.size) {
      if (!matrix.dark[row * matrix.size + col]) {
        col++;
        continue;
      }
      const start = col;
      while (col < matrix.size && matrix.dark[row * matrix.size + col]) col++;
      runs.push([row, start, col - start]);
    }
  }
  return runs;
}

/** SVG path data for the dark modules, in module units, offset by the quiet zone. */
export function qrPath(matrix: QrMatrix, margin: number): string {
  return darkRuns(matrix)
    .map(([row, start, length]) => `M${start + margin} ${row + margin}h${length}v1h-${length}z`)
    .join('');
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * A standalone SVG: one path of module-sized runs on a background rect, in module units so it
 * scales crisply. `pixels` sets the width/height attributes.
 */
export function qrToSvg(matrix: QrMatrix, options: RenderOptions, pixels: number): string {
  const side = matrix.size + options.margin * 2;
  const path = qrPath(matrix, options.margin);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${pixels}" height="${pixels}" shape-rendering="crispEdges">`,
    `<rect width="${side}" height="${side}" fill="${escapeAttribute(options.background)}"/>`,
    path ? `<path d="${path}" fill="${escapeAttribute(options.foreground)}"/>` : '',
    '</svg>',
  ].join('');
}
