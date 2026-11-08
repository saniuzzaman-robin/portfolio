'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Info, X } from 'lucide-react';
import { useDictionary } from '@/i18n/provider';
import { IconAction } from './toolbar';

const ToolInfoContext = createContext<(() => void) | null>(null);

/**
 * Holds the tool's guide in a modal dialog opened from the header's info button, so the page
 * needs no scrolling section below the workbench. The guide arrives as server-rendered
 * `children`, which keeps its text in the HTML even while the dialog is closed.
 */
export function ToolInfo({
  title,
  guide,
  children,
}: {
  title: string;
  guide: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useDictionary();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <ToolInfoContext.Provider value={() => setOpen(true)}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="tool-info-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the backdrop lands on the <dialog> itself, not on its content.
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/50"
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-line bg-surface px-5 py-4">
          <h2 id="tool-info-title" className="font-heading text-lg font-semibold text-fg">
            {t.tools.guide.about}: {title}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.tools.guide.close}
            className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="px-5 py-5">{guide}</div>
      </dialog>
    </ToolInfoContext.Provider>
  );
}

/** Header button that opens the tool's info dialog; renders nothing outside a `ToolInfo`. */
export function ToolInfoButton() {
  const { t } = useDictionary();
  const openInfo = useContext(ToolInfoContext);
  if (!openInfo) return null;
  return <IconAction icon={Info} label={t.tools.guide.about} onClick={openInfo} />;
}
