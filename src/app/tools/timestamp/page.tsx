'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, CopyButton, ToolTabs } from '@/components/tools/tool-shell';
import { Clock, Zap } from 'lucide-react';

export default function TimestampPage() {
  const [mode, setMode] = useState<'unix-to-human' | 'human-to-unix'>('unix-to-human');
  const [unixInput, setUnixInput] = useState('');
  const [humanInput, setHumanInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const convert = () => {
    setError('');
    setOutput('');

    try {
      if (mode === 'unix-to-human') {
        if (!unixInput.trim()) return;
        const ts = parseInt(unixInput, 10);
        if (isNaN(ts)) {
          setError('Invalid Unix timestamp');
          return;
        }
        const date = new Date(ts * 1000);
        setOutput(date.toLocaleString());
      } else {
        if (!humanInput.trim()) return;
        const date = new Date(humanInput);
        if (isNaN(date.getTime())) {
          setError('Invalid date format');
          return;
        }
        const unix = Math.floor(date.getTime() / 1000);
        setOutput(unix.toString());
      }
    } catch (e) {
      setError('Conversion failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const quickPick = (type: 'now' | 'tomorrow' | 'week' | 'month') => {
    const d = new Date();
    if (type === 'tomorrow') d.setDate(d.getDate() + 1);
    if (type === 'week') d.setDate(d.getDate() + 7);
    if (type === 'month') d.setMonth(d.getMonth() + 1);

    const unix = Math.floor(d.getTime() / 1000);
    setUnixInput(unix.toString());
    setMode('unix-to-human');
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Timestamp Converter"
        subtitle="Unix ↔ Human Date"
        description="Convert between Unix timestamps and human-readable dates with timezone support and quick presets."
        icon={Clock}
        accent="tertiary"
      >
        {/* Mode tabs */}
        <ToolTabs
          tabs={['unix-to-human', 'human-to-unix']}
          active={mode}
          onChange={(t) => setMode(t as 'unix-to-human' | 'human-to-unix')}
          accent="tertiary"
        />

        <div className="mt-6 mb-6 grid gap-4 md:grid-cols-2">
          {mode === 'unix-to-human' ? (
            <ToolPanel
              label="Unix Timestamp"
              accent="tertiary"
              action={<CopyButton text={unixInput} accent="tertiary" />}
            >
              <input
                type="text"
                value={unixInput}
                onChange={(e) => setUnixInput(e.target.value)}
                placeholder="Enter Unix timestamp (seconds)…"
                className="bg-neutral-15/40 border-tertiary-40/30 text-neutral-90 focus:border-tertiary-50/60 w-full rounded-sm border px-4 py-2 font-mono text-sm placeholder-neutral-50 transition-colors focus:outline-none"
              />
            </ToolPanel>
          ) : (
            <ToolPanel
              label="Human Date"
              accent="tertiary"
              action={<CopyButton text={humanInput} accent="tertiary" />}
            >
              <input
                type="text"
                value={humanInput}
                onChange={(e) => setHumanInput(e.target.value)}
                placeholder="e.g., 2024-12-25 or Jan 1, 2025…"
                className="bg-neutral-15/40 border-tertiary-40/30 text-neutral-90 focus:border-tertiary-50/60 w-full rounded-sm border px-4 py-2 font-mono text-sm placeholder-neutral-50 transition-colors focus:outline-none"
              />
            </ToolPanel>
          )}

          <ToolPanel
            label="Output"
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            <div className="text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 px-4 py-2 font-mono text-sm">
              {output || 'Result appears here…'}
            </div>
          </ToolPanel>
        </div>

        {/* Action button */}
        <div className="mb-6">
          <button
            onClick={convert}
            disabled={!unixInput.trim() && !humanInput.trim()}
            className="font-space-grotesk flex cursor-pointer items-center gap-2 rounded-sm border border-purple-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40 lg:text-sm"
          >
            <Zap className="h-4 w-4" />
            Convert
          </button>
        </div>

        {error && <div className="mb-4 font-mono text-sm text-red-400">{error}</div>}

        {/* Quick picks */}
        {mode === 'unix-to-human' && (
          <div className="mt-6">
            <p className="text-neutral-60 font-space-grotesk mb-3 text-xs tracking-widest uppercase lg:text-sm">
              Quick picks
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Now', fn: () => quickPick('now') },
                { label: 'Tomorrow', fn: () => quickPick('tomorrow') },
                { label: '+7 days', fn: () => quickPick('week') },
                { label: '+30 days', fn: () => quickPick('month') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.fn}
                  className="font-space-grotesk text-neutral-60 hover:text-tertiary-50 hover:border-tertiary-50/30 rounded-sm border border-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </ToolShell>
    </>
  );
}
