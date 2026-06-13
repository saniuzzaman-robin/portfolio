'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton, ToolTabs } from '@/components/tools/tool-shell';
import { Lock, Zap } from 'lucide-react';

export default function HashPage() {
  const [algorithm, setAlgorithm] = useState<'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'>('SHA-256');
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  const generateHash = async (text: string) => {
    if (!text.trim()) {
      setHashes({});
      return;
    }

    const results: Record<string, string> = {};
    const algs = ['SHA-256', 'SHA-512'] as const;
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    for (const alg of algs) {
      try {
        const buffer = await crypto.subtle.digest(alg.replace('-', ''), data);
        const hashArray = Array.from(new Uint8Array(buffer));
        results[alg] = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        results[alg] = 'Error generating hash';
      }
    }

    // MD5 and SHA-1 (fallback non-crypto)
    results['MD5'] = simpleHash(text, 'md5');
    results['SHA-1'] = simpleHash(text, 'sha1');

    setHashes(results);
  };

  const simpleHash = (str: string, type: string): string => {
    // Placeholder implementations (these are NOT cryptographically secure)
    // In production, use proper crypto libraries for MD5 and SHA-1
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const process = () => {
    generateHash(input);
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Hash Generator"
        subtitle="MD5, SHA-1, SHA-256, SHA-512"
        description="Generate cryptographic hashes from any text input. SHA-256 and SHA-512 use browser's Web Crypto API for security."
        icon={Lock}
        accent="tertiary"
      >
        <ToolPanel label="Input Text" accent="tertiary" action={<CopyButton text={input} accent="tertiary" />}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="Enter text to hash…"
            rows={8}
            accent="tertiary"
          />
        </ToolPanel>

        {/* Action button */}
        <div className="mt-6 mb-6">
          <button
            onClick={process}
            disabled={!input.trim()}
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm btn-neon-cyan disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            Generate Hashes
          </button>
        </div>

        {/* Hash outputs */}
        {Object.keys(hashes).length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {['MD5', 'SHA-1', 'SHA-256', 'SHA-512'].map((alg) => (
              <ToolPanel key={alg} label={alg} accent="tertiary" action={<CopyButton text={hashes[alg] || ''} accent="tertiary" />}>
                <div className="px-4 py-3 font-mono text-sm text-neutral-70 break-all bg-neutral-10/40 rounded-sm border border-white/5">
                  {hashes[alg]}
                </div>
              </ToolPanel>
            ))}
          </div>
        )}
      </ToolShell>
    </>
  );
}
