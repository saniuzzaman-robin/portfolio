'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  CopyButton,
  ToolTabs,
  ToolActionButton,
  ToolError,
} from '@/components/tools/tool-shell';
import { Clock } from 'lucide-react';

export default function TimestampPage() {
  const [mode, setMode] = useState<'unix-to-human' | 'human-to-unix'>('unix-to-human');
  const [unixInput, setUnixInput] = useState('');
  const [humanInput, setHumanInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const input = mode === 'unix-to-human' ? unixInput : humanInput;

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
      >
        {/* Mode tabs */}
        <ToolTabs
          tabs={['unix-to-human', 'human-to-unix']}
          active={mode}
          onChange={(t) => setMode(t as 'unix-to-human' | 'human-to-unix')}
        />

        <div className="mt-6 mb-6 grid gap-4 md:grid-cols-2">
          {mode === 'unix-to-human' ? (
            <ToolPanel
              label="Unix Timestamp"
              action={<CopyButton text={unixInput} />}
            >
              <input
                type="text"
                value={unixInput}
                onChange={(e) => setUnixInput(e.target.value)}
                placeholder="Enter Unix timestamp (seconds)…"
                className="bg-midnight-100 border-tertiary-40/30 text-midnight-950 focus:border-tertiary-50/60 placeholder-midnight-500 w-full rounded-sm border px-4 py-2 font-mono text-sm transition-colors focus:outline-none"
              />
            </ToolPanel>
          ) : (
            <ToolPanel
              label="Human Date"
              action={<CopyButton text={humanInput} />}
            >
              <input
                type="text"
                value={humanInput}
                onChange={(e) => setHumanInput(e.target.value)}
                placeholder="e.g., 2024-12-25 or Jan 1, 2025…"
                className="bg-midnight-100 border-tertiary-40/30 text-midnight-950 focus:border-tertiary-50/60 placeholder-midnight-500 w-full rounded-sm border px-4 py-2 font-mono text-sm transition-colors focus:outline-none"
              />
            </ToolPanel>
          )}

          <ToolPanel
            label="Output"
            action={<CopyButton text={output} />}
          >
            <div className="text-midnight-500 bg-midnight-100 border-midnight-200 rounded-sm border px-4 py-2 font-mono text-sm">
              {output || 'Result appears here…'}
            </div>
          </ToolPanel>
        </div>

        {/* Action button */}
        <div className="mb-6">
          <ToolActionButton
            onClick={convert}
            disabled={!input.trim()}
            icon={Clock}
            label="Convert"
          />
        </div>

        {error && <ToolError message={error} />}

        {/* Quick picks */}
        {mode === 'unix-to-human' && (
          <div className="mt-6">
            <p className="text-midnight-500 mb-3 font-sans text-xs tracking-widest uppercase lg:text-sm">
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
                  aria-label={`Quick pick: ${item.label}`}
                  className="text-midnight-500 hover:text-tertiary-50 hover:border-tertiary-50/30 border-midnight-200 rounded-sm border px-3 py-1.5 font-sans text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
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
