'use client';

import { Eraser, TextWrap } from 'lucide-react';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import { DropZone } from '@/components/tools/workbench/drop-zone';
import { useFileLoader } from '@/components/tools/workbench/file';
import { FileOpenButton, IconAction } from '@/components/tools/workbench/toolbar';
import { useRunInput } from '@/components/tools/workbench/use-run';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useTextInput, useWrap } from './state';

/**
 * The shared text input and its file loader, for views that read `text:input`. `runner` holds the
 * input (and `settings`) as of the last run: nothing is processed until the view runs it.
 * Opening a file or clearing replaces the input explicitly, so those run right away.
 */
export function useInput<S = null>(settings: S = null as S) {
  const [input, setInput] = useTextInput();
  const [wrap, setWrap] = useWrap();
  const runner = useRunInput(input, '', settings);
  const replace = (next: string) => {
    setInput(next);
    runner.run(next);
  };
  const file = useFileLoader('text', replace);
  return { input, setInput, replace, runner, wrap, setWrap, file };
}

type Input = Pick<
  ReturnType<typeof useInput>,
  'input' | 'setInput' | 'replace' | 'wrap' | 'setWrap' | 'file'
>;

/** Open, clear and wrap: the toolbar actions every input-driven view starts with. */
export function InputActions({ input }: { input: Input }) {
  const common = useToolCommon();
  return (
    <>
      <FileOpenButton onFile={(picked) => void input.file.load(picked)} accept="text/*" />
      <IconAction
        icon={Eraser}
        label={common.clear}
        onClick={() => input.replace('')}
        disabled={!input.input}
      />
      <IconAction
        icon={TextWrap}
        label={common.wrap}
        pressed={input.wrap}
        onClick={() => input.setWrap(!input.wrap)}
      />
    </>
  );
}

export function InputPane({
  input,
  onCursor,
  diagnostics,
  editorRef,
}: {
  input: Input;
  onCursor?: (cursor: CursorInfo) => void;
  diagnostics?: EditorDiagnostic[];
  editorRef?: React.Ref<CodeEditorHandle>;
}) {
  const common = useToolCommon();
  const t = useToolMessages<'text'>();
  return (
    <DropZone onFile={(picked) => void input.file.load(picked)}>
      <CodeEditor
        ref={editorRef}
        value={input.input}
        onChange={input.setInput}
        label={common.input}
        wrap={input.wrap}
        placeholder={t.inputPlaceholder}
        diagnostics={diagnostics}
        onCursor={onCursor}
        autoFocus
      />
    </DropZone>
  );
}
