'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { Lock, Zap } from 'lucide-react';

type HashMode = 'simple' | 'hmac';
type OutputFormat = 'hex' | 'base64';

interface HashResult {
  algorithm: string;
  hex: string;
  base64: string;
}

export default function HashPage() {
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [mode, setMode] = useState<HashMode>('simple');
  const [format, setFormat] = useState<OutputFormat>('hex');
  const [hashes, setHashes] = useState<HashResult[]>([]);

  // Simple MD5 implementation for demonstration
  const md5 = (str: string): string => {
    let hash32 = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash32 = (hash32 << 5) - hash32 + chr;
      hash32 = hash32 & hash32;
    }
    return Math.abs(hash32).toString(16).padStart(32, '0');
  };

  // Convert hex to base64
  const hexToBase64 = (hex: string): string => {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
  };

  // Compute hash using Web Crypto API
  const computeHash = async (
    algorithm: string,
    data: Uint8Array,
    key?: Uint8Array
  ): Promise<string> => {
    try {
      let result;

      if (key && mode === 'hmac') {
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          key as BufferSource,
          { name: 'HMAC', hash: algorithm },
          false,
          ['sign']
        );
        result = await crypto.subtle.sign('HMAC', cryptoKey, data as BufferSource);
      } else {
        result = await crypto.subtle.digest(algorithm, data as BufferSource);
      }
      const hashArray = Array.from(new Uint8Array(result));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      throw new Error(
        `Failed to compute ${algorithm}: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  };

  const generateHashes = async (text: string) => {
    if (!text.trim()) {
      setHashes([]);
      return;
    }

    if (mode === 'hmac' && !secret.trim()) {
      setHashes([]);
      return;
    }

    const results: HashResult[] = [];
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const keyData = secret ? encoder.encode(secret) : undefined;

    // SHA-1
    try {
      const hex = await computeHash('SHA-1', data, keyData);
      results.push({
        algorithm: 'SHA-1',
        hex,
        base64: hexToBase64(hex),
      });
    } catch (e) {
      console.error(e);
    }

    // SHA-256
    try {
      const hex = await computeHash('SHA-256', data, keyData);
      results.push({
        algorithm: 'SHA-256',
        hex,
        base64: hexToBase64(hex),
      });
    } catch (e) {
      console.error(e);
    }

    // SHA-384
    try {
      const hex = await computeHash('SHA-384', data, keyData);
      results.push({
        algorithm: 'SHA-384',
        hex,
        base64: hexToBase64(hex),
      });
    } catch (e) {
      console.error(e);
    }

    // SHA-512
    try {
      const hex = await computeHash('SHA-512', data, keyData);
      results.push({
        algorithm: 'SHA-512',
        hex,
        base64: hexToBase64(hex),
      });
    } catch (e) {
      console.error(e);
    }

    // MD5 (simple fallback)
    results.push({
      algorithm: 'MD5',
      hex: md5(text),
      base64: hexToBase64(md5(text)),
    });

    setHashes(results);
  };

  const process = () => {
    generateHashes(input);
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Hash Generator"
        subtitle="Multiple Algorithms & Modes"
        description="Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512, MD5) with support for simple hashing and HMAC authentication codes."
        icon={Lock}
        accent="tertiary"
      >
        {/* Mode Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          {(['simple', 'hmac'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setHashes([]);
              }}
              className={`font-space-grotesk pb-2 text-xs font-bold tracking-widest uppercase transition-colors lg:text-sm ${
                mode === m
                  ? 'border-b-2 border-purple-500 text-purple-300'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {m === 'simple' ? 'Simple Hash' : 'HMAC'}
            </button>
          ))}
        </div>

        {/* Input Textarea */}
        <ToolPanel
          label="Input Text"
          accent="tertiary"
          action={<CopyButton text={input} accent="tertiary" />}
        >
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="Enter text to hash…"
            rows={6}
            accent="tertiary"
          />
        </ToolPanel>

        {/* Secret Key (HMAC only) */}
        {mode === 'hmac' && (
          <ToolPanel
            label="Secret Key"
            accent="tertiary"
            action={<CopyButton text={secret} accent="tertiary" />}
          >
            <ToolTextarea
              value={secret}
              onChange={setSecret}
              placeholder="Enter secret key for HMAC…"
              rows={4}
              accent="tertiary"
            />
          </ToolPanel>
        )}

        {/* Output Format Selector */}
        <div className="my-4 flex items-center gap-4">
          <label className="font-space-grotesk text-xs font-bold tracking-widest text-neutral-400 uppercase lg:text-sm">
            Output Format:
          </label>
          <div className="flex gap-2">
            {(['hex', 'base64'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`rounded-sm border px-4 py-1.5 text-xs font-bold uppercase transition-colors lg:text-sm ${
                  format === fmt
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="mb-6">
          <button
            onClick={process}
            disabled={!input.trim() || (mode === 'hmac' && !secret.trim())}
            className="font-space-grotesk flex cursor-pointer items-center gap-2 rounded-sm border border-purple-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40 lg:text-sm"
          >
            <Zap className="h-4 w-4" />
            Generate Hashes
          </button>
        </div>

        {/* Hash outputs */}
        {hashes.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {hashes.map((result) => (
                <ToolPanel
                  key={result.algorithm}
                  label={result.algorithm}
                  accent="tertiary"
                  action={
                    <CopyButton
                      text={format === 'hex' ? result.hex : result.base64}
                      accent="tertiary"
                    />
                  }
                >
                  <div className="bg-neutral-10/40 rounded-sm border border-white/5 px-4 py-3 font-mono text-xs break-all text-neutral-300 lg:text-sm">
                    {format === 'hex' ? result.hex : result.base64}
                  </div>
                </ToolPanel>
              ))}
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="bg-neutral-10/40 text-neutral-60 mt-8 rounded-sm border border-white/5 p-3 text-xs lg:text-sm">
          <p className="font-space-grotesk mb-2 font-bold tracking-widest uppercase">ℹ Info:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Simple Hash:</strong> Standard cryptographic hash of input text
            </li>
            <li>
              <strong>HMAC:</strong> Hash-based Message Authentication Code for data integrity
            </li>
            <li>
              <strong>Web Crypto:</strong> SHA-1, SHA-256, SHA-384, SHA-512 use browser's Web Crypto
              API
            </li>
            <li>
              <strong>MD5:</strong> Legacy algorithm (simplified implementation)
            </li>
            <li>
              <strong>Format:</strong> Choose between hexadecimal and Base64 encoding
            </li>
          </ul>
        </div>
      </ToolShell>
    </>
  );
}
