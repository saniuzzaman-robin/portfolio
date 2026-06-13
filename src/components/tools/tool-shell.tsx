'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { av, ava, type AccentToken } from '@/lib/accent';

interface ToolShellProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accent: AccentToken;
  children: ReactNode;
}

export function ToolShell({
  title,
  subtitle,
  description,
  icon: Icon,
  accent,
  children,
}: ToolShellProps) {
  const accentColor = av(accent);
  const accentA = (a: number) => ava(accent, a);

  return (
    <div className="bg-neutral-5 text-neutral-90 min-h-screen">
      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/5 px-6 pt-10 pb-8 md:px-12 lg:px-20">
        <div className="cyber-grid-dense pointer-events-none absolute inset-0 opacity-20" />
        <div
          className="pointer-events-none absolute top-0 right-0 h-40 w-96 opacity-[0.06]"
          style={{
            background: `radial-gradient(ellipse at top right, ${accentColor}, transparent 70%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl">
          <Link
            href="/tools"
            className="font-space-grotesk text-neutral-60 hover:text-neutral-90 group mb-6 inline-flex items-center gap-2 text-[10px] tracking-widest uppercase transition-colors"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            All Tools
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border"
              style={{ borderColor: accentA(0.35), background: accentA(0.09), color: accentColor }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="mb-1 flex items-baseline gap-3">
                <h1 className="font-space-grotesk text-neutral-90 text-2xl font-bold md:text-3xl">
                  {title}
                </h1>
                <span
                  className="font-space-grotesk text-xs tracking-widest uppercase"
                  style={{ color: accentColor }}
                >
                  {subtitle}
                </span>
              </div>
              <p className="text-neutral-60 max-w-xl text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool content */}
      <div className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ───────────────────────────────────── */

interface ToolPanelProps {
  label?: string;
  accent?: AccentToken;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ToolPanel({
  label,
  accent = 'primary',
  children,
  className = '',
  action,
}: ToolPanelProps) {
  const accentColor = av(accent);
  const accentA = (a: number) => ava(accent, a);
  return (
    <div
      className={`glass overflow-hidden rounded-sm border ${className}`}
      style={{ borderColor: accentA(0.18) } as CSSProperties}
    >
      {label && (
        <div
          className="flex items-center justify-between border-b px-4 py-2.5"
          style={{ borderColor: accentA(0.12), background: accentA(0.04) }}
        >
          <span
            className="font-space-grotesk text-[10px] font-bold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {label}
          </span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

interface ToolTextareaProps {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  mono?: boolean;
  accent?: AccentToken;
}

export function ToolTextarea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 12,
  mono = true,
  accent = 'primary',
}: ToolTextareaProps) {
  const accentA = (a: number) => ava(accent, a);
  return (
    <textarea
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      spellCheck={false}
      className={`text-neutral-80 w-full resize-none bg-transparent px-4 py-3 text-sm transition-colors duration-200 outline-none placeholder:text-neutral-50 focus:bg-white/2 ${mono ? 'font-mono' : 'font-sans'}`}
      style={{ borderColor: readOnly ? 'transparent' : accentA(0.15) }}
    />
  );
}

interface CopyButtonProps {
  text: string;
  accent?: AccentToken;
  label?: string;
  className?: string;
}

export function CopyButton({ text, accent = 'primary', label = 'Copy' }: CopyButtonProps) {
  const accentColor = av(accent);
  const accentA = (a: number) => ava(accent, a);
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="font-space-grotesk rounded-sm px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 hover:scale-105"
      style={{
        color: copied ? accentColor : accentColor,
        border: `1px solid ${accentA(0.35)}`,
        background: copied ? accentA(0.2) : accentA(0.08),
        boxShadow: copied ? `0 0 12px ${accentA(0.3)}` : 'none',
      }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

// Need React for useState
import React from 'react';

interface ToolTabsProps {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
  accent?: AccentToken;
}

export function ToolTabs({ tabs, active, onChange, accent = 'primary' }: ToolTabsProps) {
  const accentColor = av(accent);
  const accentA = (a: number) => ava(accent, a);
  return (
    <div className="glass flex w-fit gap-1 rounded-sm border border-white/8 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="font-space-grotesk rounded-sm px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-all duration-200"
          style={
            active === tab
              ? {
                  color: accentColor,
                  background: accentA(0.12),
                  border: `1px solid ${accentA(0.3)}`,
                }
              : { color: '#8da3b3', background: 'transparent', border: '1px solid transparent' }
          }
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
