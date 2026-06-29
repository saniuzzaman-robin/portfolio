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
  ToolSecondaryButton,
  ToolError,
} from '@/components/tools/tool-shell';
import { Code2, ArrowRightLeft } from 'lucide-react';

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
        if (code > 127 || COMMON_ENTITIES[char]) {
          return COMMON_ENTITIES[char] || `&#${code};`;
        }
        return char;
      })
      .join('');
  } else {
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
  const [error, setError] = useState('');

  const process = () => {
    setError('');
    if (!input) {
      setOutput('');
      return;
    }
    try {
      const result =
        mode === 'encode' ? encodeHTMLEntities(input, encodeAll) : decodeHTMLEntities(input);
      setOutput(result);
    } catch (e) {
      const msg = 'Error processing text' + (e instanceof Error ? ': ' + e.message : '');
      setError(msg);
    }
  };

  const swapMode = () => {
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
    setInput(output);
    setOutput('');
    setError('');
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="HTML Entities"
        subtitle="Encode / Decode"
        description="Encode special characters to HTML entities or decode HTML entities back to text. Essential for safe HTML display."
        icon={Code2}
      >
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <ToolTabs
              tabs={['encode', 'decode']}
              active={mode}
              onChange={(t) => setMode(t as typeof mode)}
            />
            <ToolSecondaryButton
              onClick={swapMode}
              icon={ArrowRightLeft}
              label="Swap"
            />
            <ToolActionButton
              onClick={process}
              disabled={!input.trim()}
              icon={ArrowRightLeft}
              label="Process"
            />
          </div>

          {mode === 'encode' && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={encodeAll}
                onChange={(e) => setEncodeAll(e.target.checked)}
                className="accent-secondary-50 h-4 w-4"
              />
              <span className="text-midnight-950 text-sm">
                Encode all non-ASCII characters (including symbols like ©, €, etc.)
              </span>
            </label>
          )}
        </div>

        {error && <ToolError message={error} />}

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label={mode === 'encode' ? 'Plain Text' : 'HTML Entities'}
            action={<CopyButton text={input} />}
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
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'encode' ? 'HTML Entities' : 'Decoded Text'}
            action={<CopyButton text={output} />}
          >
            <ToolTextarea value={output} readOnly rows={12} />
          </ToolPanel>
        </div>

        <div className="bg-midnight-100 border-midnight-200 rounded-sm border p-4">
          <h3 className="text-midnight-950 mb-3 text-sm font-medium">Common HTML Entities</h3>
          <div className="grid gap-2 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(COMMON_ENTITIES).map(([char, entity]) => (
              <div key={entity} className="text-midnight-500 flex items-center gap-2 font-mono">
                <span className="text-secondary-50">{char}</span>
                <span>→</span>
                <code className="text-midnight-950">{entity}</code>
              </div>
            ))}
          </div>
        </div>
      </ToolShell>
    </>
  );
}
