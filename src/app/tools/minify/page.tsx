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
import { Minimize2, Maximize2, Zap as ZapIcon } from 'lucide-react';

export default function MinifyPage() {
  const [language, setLanguage] = useState<'html' | 'css' | 'js' | 'json'>('html');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const process = (mode: 'minify' | 'format') => {
    setError('');
    setOutput('');

    if (!input.trim()) return;

    try {
      let result = '';
      if (mode === 'minify') {
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
      } else {
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
      >
        <ToolTabs
          tabs={['html', 'css', 'js', 'json']}
          active={language}
          onChange={(l) => setLanguage(l as 'html' | 'css' | 'js' | 'json')}
        />

        <div className="mt-6 mb-6">
          <ToolPanel
            label="Input"
            action={<CopyButton text={input} />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={`Paste ${language.toUpperCase()} code…`}
              rows={12}
            />
          </ToolPanel>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <ToolActionButton
            onClick={() => process('minify')}
            disabled={!input.trim()}
            icon={Minimize2}
            label="Minify"
          />
          <ToolSecondaryButton
            onClick={() => process('format')}
            disabled={!input.trim()}
            icon={Maximize2}
            label="Format"
          />
        </div>

        <ToolError message={error} />

        {output && (
          <ToolPanel
            label="Output"
            action={<CopyButton text={output} />}
          >
            <ToolTextarea value={output} readOnly rows={12} />
          </ToolPanel>
        )}

        {output && !error && (
          <div className="text-midnight-500 font-sans mt-4 flex flex-wrap gap-6 text-xs lg:text-sm">
            <span>
              Input: <strong className="text-midnight-950">{input.length} chars</strong>
            </span>
            <span>
              Output: <strong className="text-midnight-950">{output.length} chars</strong>
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
