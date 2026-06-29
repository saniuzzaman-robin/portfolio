'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  ToolActionButton,
  ToolError,
  CopyButton,
} from '@/components/tools/tool-shell';
import { Wand2, Zap } from 'lucide-react';

export default function RegexPage() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState('g');
  const [matches, setMatches] = useState<Array<{ text: string; index: number }>>([]);
  const [error, setError] = useState('');

  const testRegex = () => {
    setError('');
    setMatches([]);

    if (!pattern.trim() || !testString.trim()) return;

    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches: Array<{ text: string; index: number }> = [];

      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({ text: match[0], index: match.index });
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          foundMatches.push({ text: match[0], index: match.index });
        }
      }

      setMatches(foundMatches);
    } catch (e) {
      setError('Invalid regex: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const highlightMatches = () => {
    if (!pattern.trim() || matches.length === 0) return testString;

    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      return testString.replace(regex, (match) => `[MATCH]${match}[/MATCH]`);
    } catch {
      return testString;
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Regex Tester"
        subtitle="Live Matching & Validation"
        description="Test regular expressions with live match highlighting and flag toggling. Validate patterns instantly."
        icon={Wand2}
        
      >
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label="Regex Pattern"
            
            action={<CopyButton text={pattern}  />}
          >
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g., \\d{3}-\\d{4}"
              className="bg-midnight-100 border-primary-40/30 text-midnight-950 focus:border-primary-50/60 placeholder-midnight-500 w-full rounded-sm border px-4 py-2 font-mono text-sm transition-colors focus:outline-none"
            />
          </ToolPanel>

          <div>
            <label className="text-midnight-500 mb-2 block font-sans text-xs font-bold tracking-widest uppercase lg:text-sm">
              Flags
            </label>
            <div className="flex gap-2">
              {['g', 'i', 'm', 's'].map((flag) => (
                <button
                  key={flag}
                  aria-label={`Toggle regex flag ${flag}`}
                  onClick={() =>
                    setFlags((f) => (f.includes(flag) ? f.replace(flag, '') : f + flag))
                  }
                  className={`rounded-sm border px-3 py-2 text-xs font-bold transition-all lg:text-sm ${
                    flags.includes(flag)
                      ? 'bg-primary-50/20 border-primary-50/50 text-primary-50'
                      : 'bg-midnight-100 text-midnight-500 hover:border-primary-40/50 border-midnight-200'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ToolPanel
          label="Test String"
          
          action={<CopyButton text={testString}  />}
        >
          <ToolTextarea
            value={testString}
            onChange={setTestString}
            placeholder="Paste text to test…"
            rows={10}
            
          />
        </ToolPanel>

        <div className="mt-6 mb-6">
          <ToolActionButton
            onClick={testRegex}
            disabled={!pattern.trim()}
            
            icon={Zap}
            label="Test Pattern"
          />
        </div>

        {error && <ToolError message={error} />}

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-sm border border-green-900/40 bg-green-950/20 p-3">
              <p className="font-sans text-xs text-green-300 lg:text-sm">
                ✓ Found <strong>{matches.length}</strong> match{matches.length !== 1 ? 'es' : ''}
              </p>
            </div>

            <div>
              <h3 className="text-midnight-950 mb-3 font-sans text-sm font-bold">Matches</h3>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {matches.map((match, i) => (
                  <div
                    key={i}
                    className="bg-midnight-100 border-midnight-200 rounded-sm border p-3"
                  >
                    <div className="text-primary-50 font-mono text-xs break-all lg:text-sm">
                      {match.text}
                    </div>
                    <div className="text-midnight-500 mt-1 text-[10px]">
                      Position: {match.index}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ToolPanel label="Highlighted Text" >
              <div className="text-midnight-950 bg-midnight-100 border-midnight-200 max-h-48 overflow-y-auto rounded-sm border px-4 py-3 font-mono text-xs break-all whitespace-pre-wrap lg:text-sm">
                {highlightMatches()
                  .split('[MATCH]')
                  .map((part, i) => (
                    <span key={i}>
                      {part.split('[/MATCH]').map((subpart, j) =>
                        j === 0 ? (
                          subpart
                        ) : (
                          <span key={`h-${j}`} className="text-primary-50 font-bold">
                            {subpart}
                          </span>
                        )
                      )}
                    </span>
                  ))}
              </div>
            </ToolPanel>
          </div>
        )}
      </ToolShell>
    </>
  );
}
