'use client';

import { ToolbarSelect } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { MODES, useMode } from './state';
import { IdsView } from './ids-view';
import { InspectView } from './inspect-view';
import { PasswordView } from './password-view';

/** ID generation, ID inspection and passwords in one page: the picker chooses the view. */
export function GenerateTool() {
  const t = useToolMessages<'generate'>();
  const [mode, setMode] = useMode();
  const picker = (
    <ToolbarSelect
      label={t.tool}
      value={mode}
      onChange={setMode}
      options={MODES.map((value) => ({ value, label: t.modes[value] }))}
    />
  );
  if (mode === 'inspect') return <InspectView picker={picker} />;
  if (mode === 'password') return <PasswordView picker={picker} />;
  return <IdsView picker={picker} />;
}
