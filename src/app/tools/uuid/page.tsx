'use client';

import { useState, useCallback } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTabs } from '@/components/tools/tool-shell';
import { Fingerprint, RefreshCw } from 'lucide-react';

// ── ID generators (pure browser, no deps) ───────────────────────
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
        accent="secondary"
      >
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <ToolTabs
            tabs={FORMATS}
            active={format}
            onChange={(t) => setFormat(t as Format)}
            accent="secondary"
          />

          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-60 font-space-grotesk uppercase tracking-widest">
              Count
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-neutral-10 border border-white/10 text-neutral-80 text-xs font-space-grotesk px-2 py-1.5 rounded-sm focus:outline-none focus:border-secondary-50/40"
            >
              {[1, 5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generate}
            className="flex items-center gap-2 text-xs font-space-grotesk font-bold uppercase tracking-widest px-4 py-2 rounded-sm btn-neon-cyan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate
          </button>
        </div>

        <ToolPanel
          label={`${format} — ${ids.length} IDs`}
          accent="secondary"
          action={
            <button
              onClick={copyAll}
              className="text-[10px] font-space-grotesk font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all duration-200 text-secondary-50 border border-secondary-50/25 hover:bg-secondary-50/10"
            >
              {copied === -1 ? '✓ Copied all' : 'Copy all'}
            </button>
          }
        >
          <div className="divide-y divide-white/5">
            {ids.map((id, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/2 group/row transition-colors"
              >
                <span className="font-mono text-sm text-neutral-80 select-all tracking-wide">
                  {id}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 ml-3">
                  <button
                    onClick={() => copyOne(id, i)}
                    className="text-[9px] font-space-grotesk font-bold uppercase tracking-widest px-2 py-1 rounded-sm border border-secondary-50/25 text-secondary-50 hover:bg-secondary-50/10 transition-colors"
                  >
                    {copied === i ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ToolPanel>

        {/* Info */}
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              ['UUID v4', 'Random 128-bit, RFC 4122 compliant'],
              ['UUID v7', 'Time-ordered UUID, sortable by creation time'],
              ['ULID', '26-char, time-sortable, case-insensitive'],
              ['NanoID', '21-char URL-safe, ~twice smaller than UUID'],
            ] as const
          ).map(([name, desc]) => (
            <div key={name} className="glass rounded-sm border border-white/8 p-3">
              <p className="text-secondary-50 text-[10px] font-space-grotesk font-bold uppercase tracking-widest mb-1">
                {name}
              </p>
              <p className="text-neutral-60 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </ToolShell>
    </>
  );
}
