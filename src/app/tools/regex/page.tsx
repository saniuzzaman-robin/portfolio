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
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <ToolPanel label="Regex Pattern" accent="primary" action={<CopyButton text={pattern} accent="primary" />}>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g., \\d{3}-\\d{4}"
              className="w-full px-4 py-2 text-sm font-mono bg-neutral-15/40 border border-primary-40/30 rounded-sm text-neutral-90 placeholder-neutral-50 focus:outline-none focus:border-primary-50/60 transition-colors"
            />
          </ToolPanel>

          <div>
            <label className="block text-xs font-space-grotesk font-bold uppercase tracking-widest text-neutral-60 mb-2">
              Flags
            </label>
            <div className="flex gap-2">
              {['g', 'i', 'm', 's'].map((flag) => (
                <button
                  key={flag}
                    onClick={() =>
                    setFlags((f) => (f.includes(flag) ? f.replace(flag, '') : f + flag))
                  }
                  className={`px-3 py-2 text-xs font-bold rounded-sm border transition-all ${
                    flags.includes(flag)
                      ? 'bg-primary-50/20 border-primary-50/50 text-primary-50'
                      : 'bg-neutral-20/20 border-white/10 text-neutral-60 hover:border-primary-40/50'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ToolPanel label="Test String" accent="primary" action={<CopyButton text={testString} accent="primary" />}>
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
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm btn-neon-green disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            Test Pattern
          </button>
        </div>

        {error && <div className="text-red-400 text-sm font-mono mb-4">{error}</div>}

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="p-3 bg-green-950/20 border border-green-900/40 rounded-sm">
              <p className="text-xs font-space-grotesk text-green-300">
                ✓ Found <strong>{matches.length}</strong> match{matches.length !== 1 ? 'es' : ''}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-space-grotesk font-bold text-neutral-90 mb-3">Matches</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {matches.map((match, i) => (
                  <div key={i} className="p-3 bg-neutral-10/40 rounded-sm border border-white/5">
                    <div className="font-mono text-xs text-primary-50 break-all">{match.text}</div>
                    <div className="text-[10px] text-neutral-60 mt-1">Position: {match.index}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlighted preview */}
            <ToolPanel label="Highlighted Text" accent="secondary">
              <div className="px-4 py-3 text-xs font-mono text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 break-all whitespace-pre-wrap max-h-48 overflow-y-auto">
                {highlightMatches().split('[MATCH]').map((part, i) => (
                  <span key={i}>
                    {part.split('[/MATCH]').map((subpart, j) =>
                      j === 0 ? subpart : <span key={`h-${j}`} className="text-primary-50 font-bold">{subpart}</span>,
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
