'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton, ToolTabs } from '@/components/tools/tool-shell';
import { Link as LinkIcon, Zap } from 'lucide-react';

export default function URLPage() {
  const [mode, setMode] = useState<'encode' | 'decode' | 'parse'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});

  const process = () => {
    setError('');
    setOutput('');
    setParams({});

    if (!input.trim()) return;

    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else if (mode === 'decode') {
        setOutput(decodeURIComponent(input));
      } else if (mode === 'parse') {
        try {
          const url = new URL(input);
          const parsedParams: Record<string, string> = {};
          url.searchParams.forEach((value, key) => {
            parsedParams[key] = value;
          });

          setParams(parsedParams);
          setOutput(`Protocol: ${url.protocol}\nHostname: ${url.hostname}\nPathname: ${url.pathname}\nSearch: ${url.search}`);
        } catch {
          setError('Invalid URL format');
        }
      }
    } catch (e) {
      setError('Processing failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="URL Tools"
        subtitle="Encode, Decode & Parse"
        description="Encode/decode URLs and parse query parameters visually. Break down URL components instantly."
        icon={LinkIcon}
        accent="primary"
      >
        {/* Mode tabs */}
        <ToolTabs
          tabs={['encode', 'decode', 'parse']}
          active={mode}
          onChange={(t) => setMode(t as 'encode' | 'decode' | 'parse')}
          accent="primary"
        />

        <div className="mt-6 mb-6">
          <ToolPanel
            label={mode === 'parse' ? 'Full URL' : mode === 'encode' ? 'Plain Text' : 'Encoded URL'}
            accent="primary"
            action={<CopyButton text={input} accent="primary" />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={mode === 'parse' ? 'Paste full URL…' : 'Enter text…'}
              rows={8}
              accent="primary"
            />
          </ToolPanel>
        </div>

        {/* Action button */}
        <div className="mb-6">
          <button
            onClick={process}
            disabled={!input.trim()}
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm btn-neon-green disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            {mode === 'encode' ? 'Encode' : mode === 'decode' ? 'Decode' : 'Parse'}
          </button>
        </div>

        {error && <div className="text-red-400 text-sm font-mono mb-4">{error}</div>}

        {output && (
          <ToolPanel label={mode === 'parse' ? 'URL Components' : 'Result'} accent="secondary" action={<CopyButton text={output} accent="secondary" />}>
            <div className="px-4 py-3 font-mono text-sm text-neutral-70 break-all bg-neutral-10/40 rounded-sm border border-white/5">
              {output}
            </div>
          </ToolPanel>
        )}

        {Object.keys(params).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-space-grotesk font-bold text-neutral-90 mb-4">Query Parameters</h3>
            <div className="space-y-3">
              {Object.entries(params).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-3 p-3 bg-neutral-10/40 rounded-sm border border-white/5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-60 font-space-grotesk">Key</span>
                    <div className="font-mono text-sm text-neutral-80 break-all">{key}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-60 font-space-grotesk">Value</span>
                    <div className="font-mono text-sm text-neutral-80 break-all">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ToolShell>
    </>
  );
}
