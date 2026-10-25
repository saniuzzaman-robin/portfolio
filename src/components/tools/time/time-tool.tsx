'use client';

import { ToolbarSelect } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { MODES, useMode } from './state';
import { ConvertView } from './convert-view';
import { CronView } from './cron-view';
import { DiffView } from './diff-view';

/** Epoch/date conversion, date differences and cron in one page: the picker chooses the view. */
export function TimeTool() {
  const t = useToolMessages<'time'>();
  const [mode, setMode] = useMode();
  const picker = (
    <ToolbarSelect
      label={t.tool}
      value={mode}
      onChange={setMode}
      options={MODES.map((value) => ({ value, label: t.modes[value] }))}
    />
  );
  if (mode === 'diff') return <DiffView picker={picker} />;
  if (mode === 'cron') return <CronView picker={picker} />;
  return <ConvertView picker={picker} />;
}
