'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  ToolTabs,
  ToolActionButton,
  ToolInfo,
  CopyButton,
} from '@/components/tools/tool-shell';
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

  const md5 = (str: string): string => {
    let hash32 = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash32 = (hash32 << 5) - hash32 + chr;
      hash32 = hash32 & hash32;
    }
    return Math.abs(hash32).toString(16).padStart(32, '0');
  };

  const hexToBase64 = (hex: string): string => {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
  };

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

    try {
      const hex = await computeHash('SHA-1', data, keyData);
      results.push({ algorithm: 'SHA-1', hex, base64: hexToBase64(hex) });
    } catch (e) {
      console.error(e);
    }

    try {
      const hex = await computeHash('SHA-256', data, keyData);
      results.push({ algorithm: 'SHA-256', hex, base64: hexToBase64(hex) });
    } catch (e) {
      console.error(e);
    }

    try {
      const hex = await computeHash('SHA-384', data, keyData);
      results.push({ algorithm: 'SHA-384', hex, base64: hexToBase64(hex) });
    } catch (e) {
      console.error(e);
    }

    try {
      const hex = await computeHash('SHA-512', data, keyData);
      results.push({ algorithm: 'SHA-512', hex, base64: hexToBase64(hex) });
    } catch (e) {
      console.error(e);
    }

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
      >
        {/* Mode Tabs */}
        <div className="mb-6">
          <ToolTabs
            tabs={['simple', 'hmac']}
            active={mode}
            onChange={(t) => {
              setMode(t as HashMode);
              setHashes([]);
            }}
            labels={{ simple: 'Simple Hash', hmac: 'HMAC' }}
          />
        </div>

        {/* Input Textarea */}
        <ToolPanel
          label="Input Text"
          action={<CopyButton text={input} />}
        >
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="Enter text to hash…"
            rows={6}
          />
        </ToolPanel>

        {/* Secret Key (HMAC only) */}
        {mode === 'hmac' && (
          <ToolPanel
            label="Secret Key"
            action={<CopyButton text={secret} />}
          >
            <ToolTextarea
              value={secret}
              onChange={setSecret}
              placeholder="Enter secret key for HMAC…"
              rows={4}
            />
          </ToolPanel>
        )}

        {/* Output Format Selector */}
        <div className="my-4 flex items-center gap-4">
          <label className="text-midnight-500 font-sans text-xs font-bold tracking-widest uppercase lg:text-sm">
            Output Format:
          </label>
          <div className="flex gap-2">
            {(['hex', 'base64'] as const).map((fmt) => (
              <button
                key={fmt}
                aria-label={`Set output format to ${fmt.toUpperCase()}`}
                onClick={() => setFormat(fmt)}
                className={`rounded-sm border px-4 py-1.5 text-xs font-bold uppercase transition-colors lg:text-sm ${
                  format === fmt
                    ? 'border-secondary-50 bg-secondary-50/20 text-secondary-50'
                    : 'text-midnight-500 border-midnight-200 hover:border-midnight-300'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="mb-6">
          <ToolActionButton
            onClick={process}
            disabled={!input.trim() || (mode === 'hmac' && !secret.trim())}
            icon={Zap}
            label="Generate Hashes"
          />
        </div>

        {/* Hash outputs */}
        {hashes.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {hashes.map((result) => (
                <ToolPanel
                  key={result.algorithm}
                  label={result.algorithm}
                  action={
                    <CopyButton
                      text={format === 'hex' ? result.hex : result.base64}
                    />
                  }
                >
                  <div className="bg-midnight-100 text-midnight-950 border-midnight-200 rounded-sm border px-4 py-3 font-mono text-xs break-all lg:text-sm">
                    {format === 'hex' ? result.hex : result.base64}
                  </div>
                </ToolPanel>
              ))}
            </div>
          </div>
        )}

        {/* Info note */}
        <ToolInfo title="Info">
          <ul className="text-midnight-950 list-inside list-disc space-y-1">
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
        </ToolInfo>
      </ToolShell>
    </>
  );
}
