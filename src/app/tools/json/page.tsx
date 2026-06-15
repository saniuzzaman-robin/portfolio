'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  CopyButton,
  ToolTabs,
} from '@/components/tools/tool-shell';
import { Braces, Zap } from 'lucide-react';
import { computeDiff, type DiffEntry } from './diff';
import { SideBySideDiff } from './side-by-side-diff';

export default function JSONPage() {
  const [mode, setMode] = useState<'format' | 'minify' | 'diff'>('format');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [output, setOutput] = useState('');
  const [diffResult, setDiffResult] = useState<DiffEntry[] | null>(null);
  const [diffStats, setDiffStats] = useState<{
    added: number;
    removed: number;
    modified: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ valid: boolean; keys?: number }>({ valid: false });

  const validateJSON = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const process = () => {
    setError('');
    setStats({ valid: false });
    setOutput('');
    setDiffResult(null);
    setDiffStats(null);

    try {
      if (mode === 'format') {
        if (!validateJSON(input1)) {
          setError('Invalid JSON in input');
          return;
        }
        const parsed = JSON.parse(input1);
        const formatted = JSON.stringify(parsed, null, 2);
        setOutput(formatted);
        setStats({ valid: true, keys: Object.keys(parsed).length });
      } else if (mode === 'minify') {
        if (!validateJSON(input1)) {
          setError('Invalid JSON in input');
          return;
        }
        const minified = JSON.stringify(JSON.parse(input1));
        setOutput(minified);
        setStats({ valid: true });
      } else if (mode === 'diff') {
        if (!validateJSON(input1) || !validateJSON(input2)) {
          setError('Invalid JSON in one or both inputs');
          return;
        }
        const lines1 = JSON.stringify(JSON.parse(input1), null, 2).split('\n');
        const lines2 = JSON.stringify(JSON.parse(input2), null, 2).split('\n');
        const diff = computeDiff(lines1, lines2);
        const added = diff.filter((d) => d.type === 'insert').length;
        const removed = diff.filter((d) => d.type === 'delete').length;
        const modified = diff.filter((d) => d.type === 'modify').length;
        setDiffResult(diff);
        setDiffStats({ added, removed, modified });
      }
    } catch (e) {
      setError('Processing failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="JSON Tools"
        subtitle="Format, Minify & Diff"
        description="Validate, format with pretty-printing, minify for production, and compare two JSON documents side by side."
        icon={Braces}
        accent="secondary"
      >
        {/* Mode tabs */}
        <ToolTabs
          tabs={['format', 'minify', 'diff']}
          active={mode}
          onChange={(t) => setMode(t as 'format' | 'minify' | 'diff')}
          accent="secondary"
        />

        <div className="mt-6">
          {mode === 'diff' ? (
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <ToolPanel
                label="JSON Input 1"
                accent="secondary"
                action={<CopyButton text={input1} accent="secondary" />}
              >
                <ToolTextarea
                  value={input1}
                  onChange={setInput1}
                  placeholder="Paste first JSON…"
                  rows={12}
                  accent="secondary"
                />
              </ToolPanel>
              <ToolPanel
                label="JSON Input 2"
                accent="secondary"
                action={<CopyButton text={input2} accent="secondary" />}
              >
                <ToolTextarea
                  value={input2}
                  onChange={setInput2}
                  placeholder="Paste second JSON…"
                  rows={12}
                  accent="secondary"
                />
              </ToolPanel>
            </div>
          ) : (
            <ToolPanel
              label={mode === 'minify' ? 'JSON Input' : 'Raw JSON'}
              accent="secondary"
              action={<CopyButton text={input1} accent="secondary" />}
            >
              <ToolTextarea
                value={input1}
                onChange={setInput1}
                placeholder="Paste JSON here…"
                rows={12}
                accent="secondary"
              />
            </ToolPanel>
          )}
        </div>

        {/* Action button */}
        <div className="mt-6 mb-6">
          <button
            onClick={process}
            disabled={!input1.trim() || (mode === 'diff' && !input2.trim())}
            className="font-space-grotesk flex cursor-pointer items-center gap-2 rounded-sm border border-cyan-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap className="h-4 w-4" />
            {mode === 'format' ? 'Format' : mode === 'minify' ? 'Minify' : 'Compare'}
          </button>
        </div>

        {error && <div className="mb-4 font-mono text-sm text-red-400">{error}</div>}

        {mode === 'diff' && diffResult ? (
          <ToolPanel label="Diff Comparison" accent="secondary">
            <div className="px-4 py-3">
              <SideBySideDiff diff={diffResult} />
            </div>
          </ToolPanel>
        ) : (
          output && (
            <ToolPanel
              label={mode === 'minify' ? 'Minified' : 'Formatted'}
              accent="secondary"
              action={<CopyButton text={output} accent="secondary" />}
            >
              <ToolTextarea value={output} readOnly placeholder="" rows={14} accent="secondary" />
            </ToolPanel>
          )
        )}

        {mode === 'diff' && diffStats ? (
          <div className="text-neutral-60 font-space-grotesk mt-4 text-xs">
            <span>JSON valid ✓</span>
            {diffStats.modified > 0 && (
              <span className="ml-4">• {diffStats.modified} modified</span>
            )}
            {diffStats.removed > 0 && <span className="ml-4">• {diffStats.removed} removed</span>}
            {diffStats.added > 0 && <span className="ml-4">• {diffStats.added} added</span>}
          </div>
        ) : (
          stats.valid && (
            <div className="text-neutral-60 font-space-grotesk mt-4 text-xs">
              <span>JSON valid ✓</span>
              {stats.keys !== undefined && (
                <span className="ml-4">• {stats.keys} top-level keys</span>
              )}
            </div>
          )
        )}
      </ToolShell>
    </>
  );
}
