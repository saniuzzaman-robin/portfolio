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
    <div className="min-h-screen bg-neutral-5 text-neutral-90">
      {/* Page header */}
      <div className="relative px-6 pt-10 pb-8 md:px-12 lg:px-20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />
        <div
          className="absolute top-0 right-0 w-96 h-40 opacity-[0.06] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top right, ${accentColor}, transparent 70%)`,
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-[10px] font-space-grotesk uppercase tracking-widest text-neutral-60 hover:text-neutral-90 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            All Tools
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-sm border flex items-center justify-center shrink-0 mt-0.5"
              style={{ borderColor: accentA(0.35), background: accentA(0.09), color: accentColor }}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <h1 className="font-space-grotesk font-bold text-2xl md:text-3xl text-neutral-90">
                  {title}
                </h1>
                <span
                  className="text-xs font-space-grotesk uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  {subtitle}
                </span>
              </div>
              <p className="text-neutral-60 text-sm leading-relaxed max-w-xl">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool content */}
      <div className="px-6 py-8 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">{children}</div>
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
      className={`glass rounded-sm border overflow-hidden ${className}`}
      style={{ borderColor: accentA(0.18) } as CSSProperties}
    >
      {label && (
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor: accentA(0.12), background: accentA(0.04) }}
        >
          <span
            className="text-[10px] font-space-grotesk font-bold uppercase tracking-widest"
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
      className={`w-full resize-none bg-transparent px-4 py-3 text-sm text-neutral-80 placeholder:text-neutral-50 outline-none focus:bg-white/2 transition-colors duration-200 ${mono ? 'font-mono' : 'font-sans'}`}
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

export function CopyButton({
  text,
  accent = 'primary',
  label = 'Copy',
}: CopyButtonProps) {
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
      className="text-[10px] font-space-grotesk font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all duration-200 hover:scale-105"
      style={{
        color: accentColor,
        border: `1px solid ${accentA(0.25)}`,
        background: copied ? accentA(0.15) : accentA(0.06),
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
    <div className="flex gap-1 p-1 glass rounded-sm border border-white/8 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="px-4 py-1.5 text-xs font-space-grotesk font-bold uppercase tracking-widest rounded-sm transition-all duration-200"
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
