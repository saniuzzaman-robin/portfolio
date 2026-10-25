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
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useTextInput, useWrap } from './state';

/** The shared text input and its file loader, for views that read `text:input`. */
export function useInput() {
  const [input, setInput] = useTextInput();
  const [wrap, setWrap] = useWrap();
  const file = useFileLoader('text', setInput);
  return { input, setInput, wrap, setWrap, file };
}

type Input = ReturnType<typeof useInput>;

/** Open, clear and wrap: the toolbar actions every input-driven view starts with. */
export function InputActions({ input }: { input: Input }) {
  const common = useToolCommon();
  return (
    <>
      <FileOpenButton onFile={(picked) => void input.file.load(picked)} accept="text/*" />
      <IconAction
        icon={Eraser}
        label={common.clear}
        onClick={() => input.setInput('')}
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
