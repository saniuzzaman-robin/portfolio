'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton, ToolTabs } from '@/components/tools/tool-shell';
import { Binary, Zap } from 'lucide-react';

export default function Base64Page() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const process = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch (e) {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed');
      setOutput('');
    }
  };

  const swapMode = () => {
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
    setInput(output);
    setOutput('');
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Base64"
        subtitle="Encoder / Decoder"
        description="Encode any text to Base64 or decode Base64 back to plain text. Handles Unicode strings correctly."
        icon={Binary}
        accent="primary"
      >
        {/* Mode tabs + controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <ToolTabs
            tabs={['encode', 'decode']}
            active={mode}
            onChange={(t) => setMode(t as 'encode' | 'decode')}
            accent="primary"
          />
          <button
            onClick={swapMode}
            className="text-[10px] font-space-grotesk font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm border border-white/10 text-neutral-60 hover:text-primary-50 hover:border-primary-50/30 transition-all duration-200"
          >
            ⇄ Swap
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ToolPanel
            label={mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
            accent="primary"
            action={<CopyButton text={input} accent="primary" />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Paste Base64 to decode…'}
              rows={14}
              accent="primary"
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            {error ? (
              <div className="px-4 py-3 text-sm font-mono text-red-400">{error}</div>
            ) : (
              <ToolTextarea value={output} readOnly placeholder="Output appears here after processing…" rows={14} accent="secondary" />
            )}
          </ToolPanel>
        </div>

        {/* Action button + stats */}
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <button
            onClick={process}
            disabled={!input.trim()}
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm btn-neon-green disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>

          {output && !error && (
            <div className="flex flex-wrap gap-6 text-xs text-neutral-60 font-space-grotesk">
              <span>Input: <strong className="text-neutral-80">{input.length} chars</strong></span>
              <span>Output: <strong className="text-neutral-80">{output.length} chars</strong></span>
              {mode === 'encode' && (
                <span>Size increase: <strong className="text-primary-50">
                  +{Math.round(((output.length - input.length) / input.length) * 100)}%
                </strong></span>
              )}
            </div>
          )}
        </div>
      </ToolShell>
    </>
  );
}
