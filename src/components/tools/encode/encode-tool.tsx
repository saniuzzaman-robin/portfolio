'use client';

import { ToolbarSelect } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { MODES, useMode } from './state';
import { TextCodecView } from './text-codec-view';
import { FileView } from './file-view';
import { UrlPartsView } from './url-parts-view';

/** One page for every codec: the picker chooses which view (and toolbar) is shown. */
export function EncodeTool() {
  const t = useToolMessages<'encode'>();
  const [mode, setMode] = useMode();
  const picker = (
    <ToolbarSelect
      label={t.mode}
      value={mode}
      onChange={setMode}
      options={MODES.map((value) => ({ value, label: t.modes[value] }))}
    />
  );
  if (mode === 'file') return <FileView picker={picker} />;
  if (mode === 'urlParts') return <UrlPartsView picker={picker} />;
  return <TextCodecView codec={mode} picker={picker} onMode={setMode} />;
}
