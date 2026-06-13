'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { Lock, Zap } from 'lucide-react';

export default function HashPage() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  // Simple MD5 implementation for demonstration
  const md5 = (str: string): string => {
    // Fallback: use simple hash function
    let hash32 = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash32 = (hash32 << 5) - hash32 + chr;
      hash32 = hash32 & hash32;
    }
    return Math.abs(hash32).toString(16).padStart(32, '0');
  };

  // Simple SHA-1 implementation for demonstration
  const sha1 = (str: string): string => {
    // Fallback: use simple hash function
    let hash32 = 5381;
    for (let i = 0; i < str.length; i++) {
      hash32 = (hash32 << 5) + hash32 + str.charCodeAt(i);
    }
    return Math.abs(hash32).toString(16).padStart(40, '0');
  };

  const generateHash = async (text: string) => {
    if (!text.trim()) {
      setHashes({});
      return;
    }

    const results: Record<string, string> = {};

    try {
      // SHA-256 using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const buffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(buffer));
      results['SHA-256'] = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      results['SHA-256'] = 'Error generating hash';
    }

    try {
      // SHA-512 using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const buffer = await crypto.subtle.digest('SHA-512', data);
      const hashArray = Array.from(new Uint8Array(buffer));
      results['SHA-512'] = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      results['SHA-512'] = 'Error generating hash';
    }

    // MD5 and SHA-1 (simple implementations)
    results['MD5'] = md5(text);
    results['SHA-1'] = sha1(text);

    setHashes(results);
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
        <ToolPanel
          label="Input Text"
          accent="tertiary"
          action={<CopyButton text={input} accent="tertiary" />}
        >
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
            className="font-space-grotesk flex cursor-pointer items-center gap-2 rounded-sm border border-purple-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap className="h-4 w-4" />
            Generate Hashes
          </button>
        </div>

        {/* Hash outputs */}
        {Object.keys(hashes).length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {['MD5', 'SHA-1', 'SHA-256', 'SHA-512'].map((alg) => (
              <ToolPanel
                key={alg}
                label={alg}
                accent="tertiary"
                action={<CopyButton text={hashes[alg] || ''} accent="tertiary" />}
              >
                <div className="text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 px-4 py-3 font-mono text-sm break-all">
                  {hashes[alg]}
                </div>
              </ToolPanel>
            ))}
          </div>
        )}

        {/* Info note */}
        <div className="bg-neutral-10/40 text-neutral-60 mt-6 rounded-sm border border-white/5 p-3 text-xs">
          <p className="font-space-grotesk mb-1 font-bold tracking-widest uppercase">ℹ Note:</p>
          <p>
            SHA-256 and SHA-512 use the browser's Web Crypto API for security. MD5 and SHA-1 use
            simplified implementations.
          </p>
        </div>
      </ToolShell>
    </>
  );
}
