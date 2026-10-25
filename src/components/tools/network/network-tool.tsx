'use client';

import { ToolbarSelect } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { MODES, useMode } from './state';
import { CalculatorView } from './calculator-view';
import { ListView } from './list-view';
import { SplitView } from './split-view';

/** CIDR calculator, subnet splitter, and contains/overlap checks over a list of blocks. */
export function NetworkTool() {
  const t = useToolMessages<'network'>();
  const [mode, setMode] = useMode();
  const picker = (
    <ToolbarSelect
      label={t.tool}
      value={mode}
      onChange={setMode}
      options={MODES.map((value) => ({ value, label: t.modes[value] }))}
    />
  );
  if (mode === 'split') return <SplitView picker={picker} />;
  if (mode === 'list') return <ListView picker={picker} />;
  return <CalculatorView picker={picker} />;
}
