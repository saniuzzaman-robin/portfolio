'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import {
  ESCAPE_TARGETS,
  JS_QUOTES,
  escapeText,
  unescapeText,
  type JsQuote,
} from '@/lib/tools/text/escape';
import { formatted, type FormatResult } from '@/lib/tools/format/types';
import { positionAt } from '@/lib/tools/json/parse';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
  type EditorDiagnostic,
} from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  IconAction,
  RunButton,
  Segmented,
  ToolHeader,
  ToolbarDivider,
  ToolbarSelect,
} from '@/components/tools/workbench/toolbar';
import { OptionsPopover, SelectField, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import {
  CursorStatus,
  StaleStatus,
  StatusBar,
  StatusItem,
  ValidityStatus,
} from '@/components/tools/workbench/status-bar';
import { RUN_SHORTCUT, STALE_OUTPUT_CLASS } from '@/components/tools/workbench/use-run';
import { cn } from '@/lib/cn';
import { fmt } from '@/i18n/dictionary';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import type { ToolMessages } from '@/i18n/tools/en';
import { InputActions, InputPane, useInput } from './parts';
import { useDirection, useEscapeOptions, useEscapeTarget } from './state';

const QUOTE_KEYS: Record<JsQuote, keyof ToolMessages['text']['jsQuotes']> = {
  "'": 'single',
  '"': 'double',
  '`': 'backtick',
};

/** Escapes text for a string literal or pattern in six languages, and back. */
export function EscapeView({ picker }: { picker: React.ReactNode }) {
  const common = useToolCommon();
  const t = useToolMessages<'text'>();
  const inputRef = useRef<CodeEditorHandle>(null);
  const [target, setTarget] = useEscapeTarget();
  const [direction, setDirection] = useDirection();
  const [options, setOptions] = useEscapeOptions();
  const input = useInput({ target, direction, options });
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live, settings: applied, run, ran, stale } = input.runner;

  const appliedEscaping = applied.direction === 'escape';
  const result = useMemo(
    (): FormatResult =>
      appliedEscaping
        ? formatted(escapeText(live, applied.target, applied.options))
        : unescapeText(live, applied.target, applied.options),
    [appliedEscaping, live, applied.target, applied.options]
  );
  const escaping = direction === 'escape';
  const runLabel = t.directions[direction];
  const output = result.ok ? result.text : '';
  const error = result.ok ? null : result.error;
  const diagnostics = useMemo(
    (): EditorDiagnostic[] => (error ? [{ ...error, severity: 'error' }] : []),
    [error]
  );

  const quoting = target !== 'regex';
  const showOptions = (escaping && quoting) || target === 'sql';

  const swap = () => {
    const next = appliedEscaping ? 'unescape' : 'escape';
    input.setInput(output);
    setDirection(next);
    run(output, '', { target, direction: next, options });
  };

  const outputPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CodeEditor
        value={output}
        label={common.output}
        readOnly
        wrap={input.wrap}
        placeholder={
          !ran
            ? fmt(common.runHint, { action: runLabel, shortcut: RUN_SHORTCUT })
            : error
              ? t.invalidPlaceholder
              : t.outputPlaceholder
        }
        className={cn(stale && STALE_OUTPUT_CLASS)}
      />
      <p className="shrink-0 border-t border-line bg-surface px-3 py-1.5 text-[11px] text-fg-subtle">
        {t.targetHints[applied.target]}
      </p>
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="text"
        actions={
          <>
            <InputActions input={input} />
            {showOptions && (
              <OptionsPopover>
                {escaping && quoting && (
                  <Toggle
                    label={target === 'csv' || target === 'shell' ? t.alwaysQuote : t.quotes}
                    checked={options.quotes}
                    onChange={(quotes) => setOptions({ ...options, quotes })}
                  />
                )}
                {escaping && target === 'javascript' && (
                  <SelectField
                    label={t.jsQuote}
                    value={QUOTE_KEYS[options.jsQuote]}
                    onChange={(key) => {
                      const jsQuote = JS_QUOTES.find((quote) => QUOTE_KEYS[quote] === key);
                      if (jsQuote) setOptions({ ...options, jsQuote });
                    }}
                    options={JS_QUOTES.map((quote) => ({
                      value: QUOTE_KEYS[quote],
                      label: t.jsQuotes[QUOTE_KEYS[quote]],
                    }))}
                  />
                )}
                {escaping && (target === 'json' || target === 'javascript') && (
                  <Toggle
                    label={t.ascii}
                    hint={t.asciiHint}
                    checked={options.ascii}
                    onChange={(ascii) => setOptions({ ...options, ascii })}
                  />
                )}
                {target === 'sql' && (
                  <Toggle
                    label={t.sqlBackslashes}
                    hint={t.sqlBackslashesHint}
                    checked={options.sqlBackslashes}
                    onChange={(sqlBackslashes) => setOptions({ ...options, sqlBackslashes })}
                  />
                )}
              </OptionsPopover>
            )}
            <ToolbarDivider />
            <IconAction
              icon={ArrowLeftRight}
              label={common.swap}
              onClick={swap}
              disabled={!output}
            />
            <CopyButton getText={() => output} disabled={!output} />
            <RunButton label={runLabel} onRun={() => run()} pending={stale} />
          </>
        }
      >
        {picker}
        <ToolbarDivider />
        <ToolbarSelect
          label={t.target}
          value={target}
          onChange={setTarget}
          options={ESCAPE_TARGETS.map((value) => ({ value, label: t.targets[value] }))}
        />
        <Segmented
          label={t.direction}
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'escape', label: t.directions.escape },
            { value: 'unescape', label: t.directions.unescape },
          ]}
        />
      </ToolHeader>
      <SplitPane
        id="text-escape"
        first={
          <InputPane
            input={input}
            onCursor={setCursor}
            diagnostics={diagnostics}
            editorRef={inputRef}
          />
        }
        second={outputPane}
      />
      <StatusBar>
        {stale && <StaleStatus action={runLabel} onRun={() => run()} />}
        {ran && live === '' && (
          <StatusItem tone="danger" className="font-sans">
            {fmt(common.enterInput, { action: runLabel })}
          </StatusItem>
        )}
        {input.file.error && <StatusItem tone="danger">{input.file.error}</StatusItem>}
        {live !== '' && (
          <ValidityStatus
            error={error && { message: error.message, ...positionAt(live, error.from) }}
            onReveal={error ? () => inputRef.current?.reveal(error.from, error.to) : undefined}
          />
        )}
        <div className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </div>
      </StatusBar>
    </>
  );
}
