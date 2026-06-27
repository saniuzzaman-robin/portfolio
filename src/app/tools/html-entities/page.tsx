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
import { Code2 } from 'lucide-react';

const COMMON_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&apos;',
  ' ': '&nbsp;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
};

function encodeHTMLEntities(text: string, encodeAll: boolean = false): string {
  if (encodeAll) {
    return text
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);
        // Encode non-ASCII and special characters
        if (code > 127 || COMMON_ENTITIES[char]) {
          return COMMON_ENTITIES[char] || `&#${code};`;
        }
        return char;
      })
      .join('');
  } else {
    // Only encode essential characters
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export default function HTMLEntitiesPage() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encodeAll, setEncodeAll] = useState(false);

  const process = () => {
    if (!input) {
      setOutput('');
      return;
    }
    try {
      const result =
        mode === 'encode' ? encodeHTMLEntities(input, encodeAll) : decodeHTMLEntities(input);
      setOutput(result);
    } catch (e) {
      setOutput('Error processing text' + (e instanceof Error ? ': ' + e.message : ''));
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
        title="HTML Entities"
        subtitle="Encode / Decode"
        description="Encode special characters to HTML entities or decode HTML entities back to text. Essential for safe HTML display."
        icon={Code2}
        accent="secondary"
      >
        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <ToolTabs
              tabs={['encode', 'decode']}
              active={mode}
              onChange={(t) => setMode(t as typeof mode)}
              accent="secondary"
            />
            <button
              onClick={swapMode}
              className="font-poppins text-midnight-500 hover:text-secondary-50 hover:border-secondary-50/30 rounded-sm border border-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all"
            >
              ⇄ Swap
            </button>
            <button
              onClick={process}
              className="font-poppins bg-secondary-50 hover:bg-secondary-60 rounded-sm px-4 py-2 text-sm font-bold text-black transition-colors"
            >
              Process
            </button>
          </div>

          {mode === 'encode' && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={encodeAll}
                onChange={(e) => setEncodeAll(e.target.checked)}
                className="accent-secondary-50 h-4 w-4"
              />
              <span className="text-midnight-700 text-sm">
                Encode all non-ASCII characters (including symbols like ©, €, etc.)
              </span>
            </label>
          )}
        </div>

        {/* Input/Output */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label={mode === 'encode' ? 'Plain Text' : 'HTML Entities'}
            accent="primary"
            action={<CopyButton text={input} accent="primary" />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={
                mode === 'encode'
                  ? 'Enter text with special characters...'
                  : 'Paste HTML entities to decode...'
              }
              rows={12}
              accent="primary"
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'encode' ? 'HTML Entities' : 'Decoded Text'}
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            <ToolTextarea value={output} readOnly rows={12} accent="secondary" />
          </ToolPanel>
        </div>

        {/* Common entities reference */}
        <div className="bg-midnight-100 border-midnight-200 rounded-sm border p-4">
          <h3 className="text-midnight-700 mb-3 text-sm font-medium">Common HTML Entities</h3>
          <div className="grid gap-2 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(COMMON_ENTITIES).map(([char, entity]) => (
              <div key={entity} className="text-midnight-500 flex items-center gap-2 font-mono">
                <span className="text-secondary-50">{char}</span>
                <span>→</span>
                <code className="text-midnight-700">{entity}</code>
              </div>
            ))}
          </div>
        </div>
      </ToolShell>
    </>
  );
}
