'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { Shield, Zap } from 'lucide-react';

interface JWTDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export default function JWTPage() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<JWTDecoded | null>(null);
  const [error, setError] = useState('');

  const decodeJWT = () => {
    setError('');
    setDecoded(null);

    if (!input.trim()) return;

    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) {
        setError('Invalid JWT format. Expected 3 parts separated by dots.');
        return;
      }

      const decode = (str: string) => {
        try {
          return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
        } catch {
          return str;
        }
      };

      setDecoded({
        header: decode(parts[0]),
        payload: decode(parts[1]),
        signature: parts[2],
      });
    } catch (e) {
      setError('Failed to decode JWT: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const isExpired = (decoded: JWTDecoded): boolean => {
    if (typeof decoded.payload === 'object' && decoded.payload !== null && 'exp' in decoded.payload) {
      const exp = decoded.payload.exp as number;
      return exp * 1000 < (() => Date.now())();
    }
    return false;
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="JWT Decoder"
        subtitle="Header, Payload & Claims"
        description="Decode JWT tokens and inspect header, payload, claims, and expiry times instantly."
        icon={Shield}
        accent="secondary"
      >
        <ToolPanel label="JWT Token" accent="secondary" action={<CopyButton text={input} accent="secondary" />}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="Paste JWT token…"
            rows={8}
            accent="secondary"
          />
        </ToolPanel>

        {/* Action button */}
        <div className="mt-6 mb-6">
          <button
            onClick={decodeJWT}
            disabled={!input.trim()}
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm btn-neon-purple disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            Decode Token
          </button>
        </div>

        {error && <div className="text-red-400 text-sm font-mono mb-4">{error}</div>}

        {decoded && (
          <div className="space-y-4">
            {/* Header */}
            <ToolPanel label="Header" accent="secondary">
              <div className="px-4 py-3 font-mono text-xs text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 break-all">
                {JSON.stringify(decoded.header, null, 2)}
              </div>
            </ToolPanel>

            {/* Payload */}
            <ToolPanel label="Payload" accent="secondary">
              <div className="px-4 py-3 font-mono text-xs text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5 break-all max-h-64 overflow-y-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </div>
            </ToolPanel>

            {/* Signature preview */}
            <ToolPanel label="Signature (first 32 chars)" accent="secondary">
              <div className="px-4 py-3 font-mono text-xs text-neutral-70 bg-neutral-10/40 rounded-sm border border-white/5">
                {decoded.signature.slice(0, 32)}...
              </div>
            </ToolPanel>

            {/* Expiry status */}
            {typeof decoded.payload === 'object' && decoded.payload !== null && 'exp' in decoded.payload && (
              <div
                className={`p-3 text-xs font-space-grotesk rounded-sm border ${
                  isExpired(decoded)
                    ? 'bg-red-950/30 border-red-900/50 text-red-300'
                    : 'bg-green-950/30 border-green-900/50 text-green-300'
                }`}
              >
                {isExpired(decoded)
                  ? '⚠ Token expired'
                  : `✓ Valid until ${new Date((decoded.payload.exp as number) * 1000).toLocaleString()}`}
              </div>
            )}
          </div>
        )}
      </ToolShell>
    </>
  );
}
