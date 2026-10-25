'use client';

import { ToolbarSelect } from '@/components/tools/workbench/toolbar';
import { useToolMessages } from '@/i18n/tools/provider';
import { MODES, useMode } from './state';
import { HashView } from './hash-view';
import { AesView } from './aes-view';
import { BcryptView } from './bcrypt-view';
import { KeysView } from './keys-view';

/** Hashing, AES, bcrypt and key pairs in one page: the picker chooses the view. */
export function CryptoTool() {
  const t = useToolMessages<'crypto'>();
  const [mode, setMode] = useMode();
  const picker = (
    <ToolbarSelect
      label={t.tool}
      value={mode}
      onChange={setMode}
      options={MODES.map((value) => ({ value, label: t.modes[value] }))}
    />
  );
  if (mode === 'aes') return <AesView picker={picker} />;
  if (mode === 'bcrypt') return <BcryptView picker={picker} />;
  if (mode === 'keys') return <KeysView picker={picker} />;
  return <HashView picker={picker} />;
}
