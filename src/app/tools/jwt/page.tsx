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
import { Shield, Key } from 'lucide-react';
import { highlightJSON } from '../../../components/tools/json-highlighter';

interface JWTDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export default function JWTPage() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<JWTDecoded | null>(null);
  const [error, setError] = useState('');

  const decode = () => {
    setError('');
    setDecoded(null);

    if (!input.trim()) return;

    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) {
        setError('Invalid JWT format. Expected 3 parts separated by dots.');
        return;
      }

      const decodePart = (str: string) => {
        try {
          return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
        } catch {
          return str;
        }
      };

      setDecoded({
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
        signature: parts[2],
      });
    } catch (e) {
      setError('Failed to decode JWT: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const isExpired = (decoded: JWTDecoded): boolean => {
    if (
      typeof decoded.payload === 'object' &&
      decoded.payload !== null &&
      'exp' in decoded.payload
    ) {
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
        <ToolPanel
          label="JWT Token"
          accent="secondary"
          action={<CopyButton text={input} accent="secondary" />}
        >
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
          <ToolActionButton
            onClick={decode}
            disabled={!input.trim()}
            accent="secondary"
            icon={Key}
            label="Decode JWT"
          />
        </div>

        {error && <ToolError message={error} />}

        {decoded && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Header */}
              <ToolPanel label="Header" accent="secondary">
                <div className="bg-midnight-100 border-midnight-200 rounded-sm border px-4 py-3 font-mono text-xs lg:text-sm">
                  {highlightJSON(decoded.header)}
                </div>
              </ToolPanel>

              {/* Payload */}
              <ToolPanel label="Payload" accent="secondary">
                <div className="bg-midnight-100 border-midnight-200 max-h-64 overflow-y-auto rounded-sm border px-4 py-3 font-mono text-xs lg:text-sm">
                  {highlightJSON(decoded.payload)}
                </div>
              </ToolPanel>
            </div>

            {/* Signature preview */}
            <ToolPanel label="Signature (first 32 chars)" accent="secondary">
              <div className="text-midnight-500 bg-midnight-100 border-midnight-200 rounded-sm border px-4 py-3 font-mono text-xs lg:text-sm">
                {decoded.signature.slice(0, 32)}...
              </div>
            </ToolPanel>

            {/* Expiry status */}
            {typeof decoded.payload === 'object' &&
              decoded.payload !== null &&
              'exp' in decoded.payload && (
                <div
                  className={`rounded-sm border p-3 font-sans text-xs lg:text-sm ${
                    isExpired(decoded)
                      ? 'border-red-900/50 bg-red-950/30 text-red-300'
                      : 'border-green-900/50 bg-green-950/30 text-green-300'
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
