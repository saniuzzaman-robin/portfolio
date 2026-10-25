'use client';

import { ToolbarSelect } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { MODES, useMode } from './state';
import { CaseView } from './case-view';
import { CountView } from './count-view';
import { EscapeView } from './escape-view';
import { LinesView } from './lines-view';
import { LoremView } from './lorem-view';

/** Case conversion, line tools, counters, string escaping and lorem ipsum in one page. */
export function TextTool() {
  const t = useToolMessages<'text'>();
  const [mode, setMode] = useMode();
  const picker = (
    <ToolbarSelect
      label={t.tool}
      value={mode}
      onChange={setMode}
      options={MODES.map((value) => ({ value, label: t.modes[value] }))}
    />
  );
  if (mode === 'lines') return <LinesView picker={picker} />;
  if (mode === 'count') return <CountView picker={picker} />;
  if (mode === 'escape') return <EscapeView picker={picker} />;
  if (mode === 'lorem') return <LoremView picker={picker} />;
  return <CaseView picker={picker} />;
}
