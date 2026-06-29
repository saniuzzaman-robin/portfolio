'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  CopyButton,
  ToolTabs,
  ToolActionButton,
  ToolError,
} from '@/components/tools/tool-shell';
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
      setError(
        mode === 'decode'
          ? 'Invalid Base64 string'
          : 'Encoding failed' + (e instanceof Error ? ': ' + e.message : '')
      );
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
      >
        {/* Mode tabs + controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <ToolTabs
            tabs={['encode', 'decode']}
            active={mode}
            onChange={(t) => setMode(t as 'encode' | 'decode')}
          />
          <button
            onClick={swapMode}
            aria-label="Swap encode and decode modes"
            className="font-sans text-midnight-500 hover:text-primary-50 hover:border-primary-50/30 rounded-sm border border-midnight-200 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
          >
            ⇄ Swap
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ToolPanel
            label={mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
            action={<CopyButton text={input} />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Paste Base64 to decode…'}
              rows={14}
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            action={<CopyButton text={output} />}
          >
            {error ? (
              <ToolError message={error} />
            ) : (
              <ToolTextarea
                value={output}
                readOnly
                placeholder="Output appears here after processing…"
                rows={14}
              />
            )}
          </ToolPanel>
        </div>

        {/* Action button + stats */}
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <ToolActionButton
            onClick={process}
            disabled={!input.trim()}
            icon={Zap}
            label={mode === 'encode' ? 'Encode' : 'Decode'}
          />

          {output && !error && (
            <div className="text-midnight-500 font-sans flex flex-wrap gap-6 text-xs lg:text-sm">
              <span>
                Input: <strong className="text-midnight-950">{input.length} chars</strong>
              </span>
              <span>
                Output: <strong className="text-midnight-950">{output.length} chars</strong>
              </span>
              {mode === 'encode' && (
                <span>
                  Size increase:{' '}
                  <strong className="text-primary-50">
                    +{Math.round(((output.length - input.length) / input.length) * 100)}%
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>
      </ToolShell>
    </>
  );
}
