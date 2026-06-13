'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton, ToolTabs } from '@/components/tools/tool-shell';
import { Braces, Zap } from 'lucide-react';

export default function JSONPage() {
  const [mode, setMode] = useState<'format' | 'minify' | 'diff'>('format');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ valid: boolean; keys?: number }>({});

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
    setStats({});
    setOutput('');

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
        const obj1 = JSON.stringify(JSON.parse(input1), null, 2);
        const obj2 = JSON.stringify(JSON.parse(input2), null, 2);

        // Simple diff: highlight changes
        const lines1 = obj1.split('\n');
        const lines2 = obj2.split('\n');

        const diffOutput = lines1
          .map((line, i) => {
            if (lines2[i] !== line) {
              return `- ${line}\n+ ${lines2[i] || ''}`;
            }
            return line;
          })
          .join('\n');

        setOutput(diffOutput);
        setStats({ valid: true });
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
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <ToolPanel label="JSON Input 1" accent="secondary" action={<CopyButton text={input1} accent="secondary" />}>
                <ToolTextarea
                  value={input1}
                  onChange={setInput1}
                  placeholder="Paste first JSON…"
                  rows={12}
                  accent="secondary"
                />
              </ToolPanel>
              <ToolPanel label="JSON Input 2" accent="secondary" action={<CopyButton text={input2} accent="secondary" />}>
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
            <ToolPanel label={mode === 'minify' ? 'JSON Input' : 'Raw JSON'} accent="secondary" action={<CopyButton text={input1} accent="secondary" />}>
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
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm btn-neon-purple disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            {mode === 'format' ? 'Format' : mode === 'minify' ? 'Minify' : 'Compare'}
          </button>
        </div>

        {error && <div className="text-red-400 text-sm font-mono mb-4">{error}</div>}

        {output && (
          <ToolPanel label={mode === 'diff' ? 'Diff Output' : mode === 'minify' ? 'Minified' : 'Formatted'} accent="secondary" action={<CopyButton text={output} accent="secondary" />}>
            <ToolTextarea value={output} readOnly placeholder="" rows={14} accent="secondary" />
          </ToolPanel>
        )}

        {stats.valid && (
          <div className="mt-4 text-xs text-neutral-60 font-space-grotesk">
            <span>JSON valid ✓</span>
            {stats.keys !== undefined && <span className="ml-4">• {stats.keys} top-level keys</span>}
          </div>
        )}
      </ToolShell>
    </>
  );
}
