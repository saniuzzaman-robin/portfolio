'use client';

import { useState, useCallback } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTabs, ToolActionButton } from '@/components/tools/tool-shell';
import { Fingerprint, RefreshCw } from 'lucide-react';

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function uuidv7(): string {
  const now = Date.now();
  const timeMsHex = now.toString(16).padStart(12, '0');
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const r = rand.slice(0, 4);
  const rest = rand.slice(4);
  return `${timeMsHex.slice(0, 8)}-${timeMsHex.slice(8)}-7${r}-${((parseInt(rest[0], 16) & 0x3) | 0x8).toString(16)}${rest.slice(1, 4)}-${rest.slice(4)}`;
}

function ulid(): string {
  const CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const now = Date.now();
  let timeStr = '';
  let t = now;
  for (let i = 9; i >= 0; i--) {
    timeStr = CHARS[t % 32] + timeStr;
    t = Math.floor(t / 32);
  }
  let randStr = '';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  for (const b of bytes) randStr += CHARS[b % 32];
  return timeStr + randStr;
}

function nanoid(size = 21): string {
  const CHARS = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join('');
}

type Format = 'UUID v4' | 'UUID v7' | 'ULID' | 'NanoID';

const generators: Record<Format, () => string> = {
  'UUID v4': uuidv4,
  'UUID v7': uuidv7,
  ULID: ulid,
  NanoID: nanoid,
};

const FORMATS: Format[] = ['UUID v4', 'UUID v7', 'ULID', 'NanoID'];

export default function UuidPage() {
  const [format, setFormat] = useState<Format>('UUID v4');
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 5 }, generators['UUID v4']));
  const [copied, setCopied] = useState<number | null>(null);

  const generate = useCallback(() => {
    setIds(Array.from({ length: count }, generators[format]));
  }, [count, format]);

  const copyOne = (id: string, i: number) => {
    navigator.clipboard.writeText(id);
    setCopied(i);
    setTimeout(() => setCopied(null), 1200);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(ids.join('\n'));
    setCopied(-1);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="ID Generator"
        subtitle="UUID · ULID · NanoID"
        description="Generate cryptographically random identifiers in multiple formats. All generation happens in your browser."
        icon={Fingerprint}
        
      >
        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <ToolTabs
            tabs={FORMATS}
            active={format}
            onChange={(t) => setFormat(t as Format)}
            
          />

          <div className="flex items-center gap-2">
            <label className="text-midnight-500 font-sans text-xs tracking-widest uppercase lg:text-sm">
              Count
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-midnight-100 text-midnight-950 font-sans focus:border-secondary-50/40 rounded-sm border border-midnight-200 px-2 py-1.5 text-xs focus:outline-none lg:text-sm"
            >
              {[1, 5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <ToolActionButton
            onClick={generate}
            
            icon={RefreshCw}
            label="Generate UUIDs"
          />
        </div>

        <ToolPanel
          label={`${format} — ${ids.length} IDs`}
          
          action={
            <button
              onClick={copyAll}
              aria-label="Copy all IDs"
              className="font-sans text-secondary-50 border-secondary-50/25 hover:bg-secondary-50/10 rounded-sm border px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
            >
              {copied === -1 ? '✓ Copied all' : 'Copy all'}
            </button>
          }
        >
          <div className="divide-y divide-white/5">
            {ids.map((id, i) => (
              <div
                key={i}
                className="group/row flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/2"
              >
                <span className="text-midnight-950 font-mono text-sm tracking-wide select-all">
                  {id}
                </span>
                <div className="ml-3 flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover/row:opacity-100">
                  <button
                    onClick={() => copyOne(id, i)}
                    aria-label={`Copy ID ${i + 1}`}
                    className="font-sans border-secondary-50/25 text-secondary-50 hover:bg-secondary-50/10 rounded-sm border px-2 py-1 text-[9px] font-bold tracking-widest uppercase transition-colors"
                  >
                    {copied === i ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ToolPanel>

        {/* Info */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['UUID v4', 'Random 128-bit, RFC 4122 compliant'],
              ['UUID v7', 'Time-ordered UUID, sortable by creation time'],
              ['ULID', '26-char, time-sortable, case-insensitive'],
              ['NanoID', '21-char URL-safe, ~twice smaller than UUID'],
            ] as const
          ).map(([name, desc]) => (
            <div key={name} className="bg-midnight-100 rounded-sm border border-midnight-200 p-3">
              <p className="text-secondary-50 font-sans mb-1 text-[10px] font-bold tracking-widest uppercase">
                {name}
              </p>
              <p className="text-midnight-500 text-xs leading-relaxed lg:text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </ToolShell>
    </>
  );
}
