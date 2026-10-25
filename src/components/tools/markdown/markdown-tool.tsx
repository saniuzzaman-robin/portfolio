'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Eraser, ImageOff, TextWrap, Download } from 'lucide-react';
import {
  DEFAULT_MARKDOWN_OPTIONS,
  SOURCE_LINE_ATTRIBUTE,
  documentTitle,
  isMarkdownOptions,
  renderMarkdown,
  standaloneHtml,
  type MarkdownOptions,
} from '@/lib/tools/markdown/render';
import { formatBytes, utf8Length } from '@/lib/tools/bytes';
import {
  CodeEditor,
  type CodeEditorHandle,
  type CursorInfo,
} from '@/components/tools/workbench/code-editor';
import {
  CopyButton,
  FileOpenButton,
  IconAction,
  ToolHeader,
  ToolbarDivider,
} from '@/components/tools/workbench/toolbar';
import { OptionsPopover, Toggle } from '@/components/tools/workbench/options-popover';
import { SplitPane } from '@/components/tools/workbench/split-pane';
import { DropZone } from '@/components/tools/workbench/drop-zone';
import { downloadFile, useFileLoader } from '@/components/tools/workbench/file';
import { CursorStatus, StatusBar, StatusItem } from '@/components/tools/workbench/status-bar';
import { usePersistentState } from '@/components/tools/workbench/use-persistent-state';
import { useLiveInput } from '@/components/tools/workbench/use-live-input';
import { useAsyncResult } from '@/components/tools/workbench/use-async-result';
import { useToolCommon, useToolMessages } from '@/i18n/tools/provider';
import { useLocale } from '@/i18n/use-locale';
import { fmt } from '@/i18n/dictionary';
import { SAMPLE } from './sample';

const ACCEPT = '.md,.markdown,.mdown,.mkd,.txt,text/markdown,text/plain';
const OPTION_KEYS = [
  'html',
  'linkify',
  'typographer',
  'breaks',
] as const satisfies (keyof MarkdownOptions)[];

type Pane = 'editor' | 'preview';
/** A preview block and where it sits in the scrolled content. */
type Anchor = { line: number; top: number };

/** Preview blocks tagged with their source line, in document order with increasing lines. */
function measureAnchors(container: HTMLElement): Anchor[] {
  const base = container.getBoundingClientRect().top - container.scrollTop;
  const anchors: Anchor[] = [{ line: 0, top: 0 }];
  for (const element of container.querySelectorAll<HTMLElement>(`[${SOURCE_LINE_ATTRIBUTE}]`)) {
    const line = Number(element.getAttribute(SOURCE_LINE_ATTRIBUTE));
    const top = element.getBoundingClientRect().top - base;
    const last = anchors[anchors.length - 1];
    if (line > last.line && top >= last.top) anchors.push({ line, top });
  }
  return anchors;
}

/** Linear interpolation from one anchor coordinate to the other. */
function interpolate(anchors: Anchor[], value: number, from: keyof Anchor, to: keyof Anchor) {
  let index = 0;
  while (index + 1 < anchors.length && anchors[index + 1][from] <= value) index++;
  const start = anchors[index];
  const end = anchors[index + 1];
  if (!end || end[from] === start[from]) return start[to];
  return start[to] + ((value - start[from]) / (end[from] - start[from])) * (end[to] - start[to]);
}

/** Markdown editor with a sanitized live preview, synced scrolling and HTML export. */
export function MarkdownTool() {
  const common = useToolCommon();
  const t = useToolMessages<'markdown'>();
  const locale = useLocale();
  const editorRef = useRef<CodeEditorHandle>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = usePersistentState('markdown:input', SAMPLE);
  const [options, setOptions] = usePersistentState(
    'markdown:options',
    DEFAULT_MARKDOWN_OPTIONS,
    isMarkdownOptions
  );
  const [wrap, setWrap] = usePersistentState('markdown:wrap', true);
  const [sync, setSync] = usePersistentState('markdown:sync', true);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const { value: live } = useLiveInput(input);
  const file = useFileLoader('text', (content) => setInput(content));

  const task = useMemo(
    () => async () => {
      const [preview, exported] = await Promise.all([
        renderMarkdown(live, options, 'preview'),
        renderMarkdown(live, options, 'export'),
      ]);
      return { preview, exported };
    },
    [live, options]
  );
  const { value: current, latest, error: loadError } = useAsyncResult(task);
  const rendered = current ?? latest;
  const previewHtml = rendered?.preview.html ?? '';
  const exportedHtml = rendered?.exported.html ?? '';
  const blocked = rendered?.preview.blockedImages ?? 0;

  // Synced scrolling: the pane the user is in drives, the other follows.
  const driver = useRef<Pane>('editor');
  const anchors = useRef<Anchor[] | null>(null);
  const drive = (pane: Pane) => () => {
    driver.current = pane;
  };
  const getAnchors = (container: HTMLElement) => (anchors.current ??= measureAnchors(container));

  useEffect(() => {
    anchors.current = null;
  }, [previewHtml]);

  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      anchors.current = null;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const onEditorScroll = (line: number) => {
    const container = previewRef.current;
    if (!sync || driver.current !== 'editor' || !container) return;
    container.scrollTop = interpolate(getAnchors(container), line, 'line', 'top');
  };

  const onPreviewScroll = () => {
    const container = previewRef.current;
    if (!sync || driver.current !== 'preview' || !container) return;
    editorRef.current?.scrollToLine(
      interpolate(getAnchors(container), container.scrollTop, 'top', 'line')
    );
  };

  const download = () =>
    downloadFile(
      standaloneHtml(exportedHtml, documentTitle(input) ?? t.untitled),
      'document.html',
      'text/html;charset=utf-8'
    );

  const driverEvents = (pane: Pane) => ({
    onPointerEnter: drive(pane),
    onWheel: drive(pane),
    onTouchStart: drive(pane),
    onFocus: drive(pane),
  });

  const editorPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" {...driverEvents('editor')}>
      <DropZone onFile={(picked) => void file.load(picked)}>
        <CodeEditor
          ref={editorRef}
          value={input}
          onChange={setInput}
          label={t.editor}
          language="markdown"
          wrap={wrap}
          placeholder={t.inputPlaceholder}
          onCursor={setCursor}
          onScrollLine={onEditorScroll}
          autoFocus
        />
      </DropZone>
    </div>
  );

  const previewPane = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" {...driverEvents('preview')}>
      {blocked > 0 && (
        <p className="flex shrink-0 items-start gap-1.5 border-b border-line bg-surface px-3 py-1.5 text-[11px] text-warning">
          <ImageOff className="mt-px size-3 shrink-0" aria-hidden />
          <span>
            {fmt(t.blockedImages, { count: blocked })} {t.blockedImagesHint}
          </span>
        </p>
      )}
      <div ref={previewRef} onScroll={onPreviewScroll} className="min-h-0 flex-1 overflow-auto">
        {previewHtml ? (
          <div
            role="document"
            aria-label={t.previewLabel}
            tabIndex={0}
            dir="auto"
            className="markdown-preview px-5 py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
            // Sanitized by DOMPurify in `renderMarkdown`.
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <p className="p-3 text-xs text-fg-subtle">{loadError ? t.loadFailed : t.empty}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ToolHeader
        slug="markdown"
        actions={
          <>
            <FileOpenButton onFile={(picked) => void file.load(picked)} accept={ACCEPT} />
            <IconAction
              icon={Eraser}
              label={common.clear}
              onClick={() => setInput('')}
              disabled={!input}
            />
            <ToolbarDivider />
            <IconAction
              icon={TextWrap}
              label={common.wrap}
              pressed={wrap}
              onClick={() => setWrap(!wrap)}
            />
            <IconAction
              icon={ArrowUpDown}
              label={t.syncScroll}
              pressed={sync}
              onClick={() => setSync(!sync)}
            />
            <OptionsPopover>
              {OPTION_KEYS.map((key) => (
                <Toggle
                  key={key}
                  label={t.options[key].label}
                  hint={t.options[key].hint}
                  checked={options[key]}
                  onChange={(checked) => setOptions({ ...options, [key]: checked })}
                />
              ))}
            </OptionsPopover>
            <ToolbarDivider />
            <CopyButton getText={() => exportedHtml} label={t.copyHtml} disabled={!exportedHtml} />
            <IconAction
              icon={Download}
              label={t.downloadHtml}
              onClick={download}
              disabled={!exportedHtml}
            />
          </>
        }
      />
      <SplitPane id="markdown" first={editorPane} second={previewPane} />
      <StatusBar>
        {file.error && (
          <StatusItem tone="danger" title={file.error}>
            <span className="truncate font-sans">{file.error}</span>
          </StatusItem>
        )}
        <span className="hidden sm:contents">
          <CursorStatus cursor={cursor} />
        </span>
        <StatusItem className="shrink-0">{formatBytes(utf8Length(input), locale)}</StatusItem>
      </StatusBar>
    </>
  );
}
