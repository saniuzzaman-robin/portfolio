'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { Wand2, Zap } from 'lucide-react';

export default function RegexPage() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState('g');
  const [matches, setMatches] = useState<Array<{ text: string; index: number }>>([]);
  const [error, setError] = useState('');

  const test = () => {
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
        accent="primary"
      >
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label="Regex Pattern"
            accent="primary"
            action={<CopyButton text={pattern} accent="primary" />}
          >
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g., \\d{3}-\\d{4}"
              className="bg-neutral-15/40 border-primary-40/30 text-neutral-90 focus:border-primary-50/60 w-full rounded-sm border px-4 py-2 font-mono text-sm placeholder-neutral-50 transition-colors focus:outline-none"
            />
          </ToolPanel>

          <div>
            <label className="font-space-grotesk text-neutral-60 mb-2 block text-xs font-bold tracking-widest uppercase">
              Flags
            </label>
            <div className="flex gap-2">
              {['g', 'i', 'm', 's'].map((flag) => (
                <button
                  key={flag}
                  onClick={() =>
                    setFlags((f) => (f.includes(flag) ? f.replace(flag, '') : f + flag))
                  }
                  className={`rounded-sm border px-3 py-2 text-xs font-bold transition-all ${
                    flags.includes(flag)
                      ? 'bg-primary-50/20 border-primary-50/50 text-primary-50'
                      : 'bg-neutral-20/20 text-neutral-60 hover:border-primary-40/50 border-white/10'
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
          accent="primary"
          action={<CopyButton text={testString} accent="primary" />}
        >
          <ToolTextarea
            value={testString}
            onChange={setTestString}
            placeholder="Paste text to test…"
            rows={10}
            accent="primary"
          />
        </ToolPanel>

        {/* Action button */}
        <div className="mt-6 mb-6">
          <button
            onClick={test}
            disabled={!pattern.trim() || !testString.trim()}
            className="hover:bg-primary-20 font-space-grotesk border-primary-30 flex cursor-pointer items-center gap-2 rounded-sm border px-6 py-2.5 text-xs font-bold tracking-widest uppercase disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap className="h-4 w-4" />
            Test Pattern
          </button>
        </div>

        {error && <div className="mb-4 font-mono text-sm text-red-400">{error}</div>}

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-sm border border-green-900/40 bg-green-950/20 p-3">
              <p className="font-space-grotesk text-xs text-green-300">
                ✓ Found <strong>{matches.length}</strong> match{matches.length !== 1 ? 'es' : ''}
              </p>
            </div>

            <div>
              <h3 className="font-space-grotesk text-neutral-90 mb-3 text-sm font-bold">Matches</h3>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {matches.map((match, i) => (
                  <div key={i} className="bg-neutral-10/40 rounded-sm border border-white/5 p-3">
                    <div className="text-primary-50 font-mono text-xs break-all">{match.text}</div>
                    <div className="text-neutral-60 mt-1 text-[10px]">Position: {match.index}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlighted preview */}
            <ToolPanel label="Highlighted Text" accent="secondary">
              <div className="text-neutral-70 bg-neutral-10/40 max-h-48 overflow-y-auto rounded-sm border border-white/5 px-4 py-3 font-mono text-xs break-all whitespace-pre-wrap">
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
