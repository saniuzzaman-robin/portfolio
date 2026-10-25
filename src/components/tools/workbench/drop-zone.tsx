'use client';

import { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { useToolCommon } from '@/i18n/tools/provider';
import { cn } from '@/lib/cn';

function hasFiles(event: React.DragEvent) {
  return event.dataTransfer.types.includes('Files');
}

/**
 * Accepts a dropped file anywhere over its children. Handlers run in the capture phase so the
 * editor underneath never inserts the file's raw contents itself; text drags pass through.
 */
export function DropZone({
  onFile,
  className,
  children,
}: {
  /** The drop event comes along so callers can tell where the file landed. */
  onFile: (file: File, event: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const common = useToolCommon();
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave fire for every child element; count them to know when we really left.
  const depth = useRef(0);

  return (
    <div
      className={cn('relative flex min-h-0 min-w-0 flex-1 flex-col', className)}
      onDragEnterCapture={(event) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        depth.current++;
        setDragging(true);
      }}
      onDragOverCapture={(event) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeaveCapture={(event) => {
        if (!hasFiles(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDropCapture={(event) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        event.stopPropagation();
        depth.current = 0;
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file, event);
      }}
    >
      {children}
      {dragging && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-primary/10 text-sm font-medium text-primary-text outline-2 -outline-offset-4 outline-primary backdrop-blur-[1px] outline-dashed"
        >
          <FileUp className="size-6" />
          {common.dropFile}
        </div>
      )}
    </div>
  );
}
