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
          setOutput(
            `Protocol: ${url.protocol}\nHostname: ${url.hostname}\nPathname: ${url.pathname}\nSearch: ${url.search}`
          );
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
            className="hover:bg-primary-20 font-poppins border-primary-30 flex cursor-pointer items-center gap-2 rounded-sm border px-6 py-2.5 text-xs font-bold tracking-widest uppercase disabled:cursor-not-allowed disabled:opacity-40 lg:text-sm"
          >
            <Zap className="h-4 w-4" />
            {mode === 'encode' ? 'Encode' : mode === 'decode' ? 'Decode' : 'Parse'}
          </button>
        </div>

        {error && <div className="mb-4 font-mono text-sm text-red-400">{error}</div>}

        {output && (
          <ToolPanel
            label={mode === 'parse' ? 'URL Components' : 'Result'}
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            <div className="text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 px-4 py-3 font-mono text-sm break-all">
              {output}
            </div>
          </ToolPanel>
        )}

        {Object.keys(params).length > 0 && (
          <div className="mt-6">
            <h3 className="font-poppins text-neutral-90 mb-4 text-sm font-bold">
              Query Parameters
            </h3>
            <div className="space-y-3">
              {Object.entries(params).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-neutral-10/40 grid grid-cols-2 gap-3 rounded-sm border border-white/5 p-3"
                >
                  <div>
                    <span className="text-neutral-60 font-poppins text-[10px] tracking-widest uppercase">
                      Key
                    </span>
                    <div className="text-neutral-80 font-mono text-sm break-all">{key}</div>
                  </div>
                  <div>
                    <span className="text-neutral-60 font-poppins text-[10px] tracking-widest uppercase">
                      Value
                    </span>
                    <div className="text-neutral-80 font-mono text-sm break-all">{value}</div>
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
