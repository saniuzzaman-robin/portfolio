'use client';

import { useCallback, useState } from 'react';
import { formatBytes } from '@/lib/tools/bytes';
import { fmt } from '@/i18n/dictionary';
import { useLocale } from '@/i18n/use-locale';
import { useToolCommon } from '@/i18n/tools/provider';

/** Text editors become sluggish far below this; binary tools can pass their own limit. */
export const DEFAULT_MAX_FILE_BYTES = 25 * 1024 * 1024;

type ReadAs = 'text' | 'bytes';
type Content<R extends ReadAs> = R extends 'text' ? string : Uint8Array<ArrayBuffer>;

/**
 * Reads a picked or dropped file with a size limit. Failures become a localized `error`
 * (shown in the status bar) instead of throwing.
 */
export function useFileLoader<R extends ReadAs>(
  readAs: R,
  onLoad: (content: Content<R>, file: File) => void,
  maxBytes = DEFAULT_MAX_FILE_BYTES
) {
  const common = useToolCommon();
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (file: File) => {
      if (file.size > maxBytes) {
        setError(
          fmt(common.fileTooLarge, { name: file.name, size: formatBytes(maxBytes, locale) })
        );
        return;
      }
      try {
        const content =
          readAs === 'text' ? await file.text() : new Uint8Array(await file.arrayBuffer());
        setError(null);
        onLoad(content as Content<R>, file);
      } catch (cause) {
        console.error(`Reading "${file.name}" failed:`, cause);
        setError(fmt(common.fileReadFailed, { name: file.name }));
      }
    },
    [readAs, onLoad, maxBytes, common, locale]
  );

  return { load, error, clearError: useCallback(() => setError(null), []) };
}

/** Saves `data` as a file via a temporary object URL. */
export function downloadFile(data: BlobPart, filename: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // Revoke after the click has been handled; revoking synchronously can cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
