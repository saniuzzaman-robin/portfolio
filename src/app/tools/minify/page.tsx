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
import { Zap as ZapIcon, Zap } from 'lucide-react';

export default function MinifyPage() {
  const [language, setLanguage] = useState<'html' | 'css' | 'js' | 'json'>('html');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const minify = () => {
    setError('');
    setOutput('');

    if (!input.trim()) return;

    try {
      let result = '';
      if (language === 'html') {
        result = input
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      } else if (language === 'css') {
        result = input
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}:;,])\s*/g, '$1')
          .trim();
      } else if (language === 'js') {
        result = input
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\s+/g, ' ')
          .trim();
      } else if (language === 'json') {
        result = JSON.stringify(JSON.parse(input));
      }

      setOutput(result);
    } catch (e) {
      setError('Processing failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const beautify = () => {
    setError('');
    setOutput('');

    if (!input.trim()) return;

    try {
      let result = '';

      if (language === 'json') {
        result = JSON.stringify(JSON.parse(input), null, 2);
      } else if (language === 'html' || language === 'css') {
        result = input
          .replace(/([{};])\s*/g, '$1\n  ')
          .replace(/\n\s*\n/g, '\n')
          .trim();
      } else if (language === 'js') {
        result = input
          .replace(/([{};])\s*/g, '$1\n  ')
          .replace(/;\s*/g, ';\n  ')
          .trim();
      }

      setOutput(result);
    } catch (e) {
      setError('Processing failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Code Minifier"
        subtitle="HTML, CSS, JS & JSON"
        description="Minify or beautify HTML, CSS, JavaScript, and JSON for production or readability. Remove comments and whitespace instantly."
        icon={ZapIcon}
        accent="secondary"
      >
        {/* Language selector */}
        <ToolTabs
          tabs={['html', 'css', 'js', 'json']}
          active={language}
          onChange={(l) => setLanguage(l as 'html' | 'css' | 'js' | 'json')}
          accent="secondary"
        />

        <div className="mt-6 mb-6">
          <ToolPanel
            label="Input"
            accent="secondary"
            action={<CopyButton text={input} accent="secondary" />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={`Paste ${language.toUpperCase()} code…`}
              rows={12}
              accent="secondary"
            />
          </ToolPanel>
        </div>

        {/* Action buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={minify}
            disabled={!input.trim()}
            className="font-poppins flex cursor-pointer items-center gap-2 rounded-sm border border-cyan-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 lg:text-sm"
          >
            <Zap className="h-4 w-4" />
            Minify
          </button>
          <button
            onClick={beautify}
            disabled={!input.trim()}
            className="font-poppins text-neutral-60 hover:text-secondary-50 hover:border-secondary-50/30 flex cursor-pointer items-center gap-2 rounded-sm border border-white/20 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 lg:text-sm"
          >
            Format
          </button>
        </div>

        {error && <div className="mb-4 font-mono text-sm text-red-400">{error}</div>}

        {output && (
          <ToolPanel
            label="Output"
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            <ToolTextarea value={output} readOnly rows={12} accent="secondary" />
          </ToolPanel>
        )}

        {output && !error && (
          <div className="text-neutral-60 font-poppins mt-4 flex flex-wrap gap-6 text-xs lg:text-sm">
            <span>
              Input: <strong className="text-neutral-80">{input.length} chars</strong>
            </span>
            <span>
              Output: <strong className="text-neutral-80">{output.length} chars</strong>
            </span>
            <span>
              Saved:{' '}
              <strong className="text-secondary-50">
                {Math.round(((input.length - output.length) / input.length) * 100)}%
              </strong>
            </span>
          </div>
        )}
      </ToolShell>
    </>
  );
}
