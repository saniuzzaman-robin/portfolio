'use client';

import type { ReactNode } from 'react';
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
    <div className="bg-midnight-900 text-midnight-950 min-h-screen">
      {/* Page header */}
      <div className="relative overflow-hidden border-b border-midnight-200 px-6 pt-10 pb-8 md:px-12 lg:px-20">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 right-0 h-40 w-96 opacity-[0.08]"
            style={{
              background: `radial-gradient(ellipse at top right, ${accentColor}, transparent 70%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl">
          <Link
            href="/tools"
            className="group mb-6 inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-midnight-500 hover:text-midnight-950 transition-colors"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            All Tools
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: accentA(0.1), color: accentColor }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="mb-1 flex items-baseline gap-3">
                <h1 className="text-2xl font-bold text-midnight-950 md:text-3xl">
                  {title}
                </h1>
                <span
                  className="text-xs tracking-widest uppercase lg:text-sm"
                  style={{ color: accentColor }}
                >
                  {subtitle}
                </span>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-midnight-500">
                {description}
              </p>
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
      className={`glass overflow-hidden rounded-2xl ${className}`}
    >
      {label && (
        <div
          className="flex items-center justify-between border-b border-midnight-200 px-4 py-2.5"
          style={{ background: accentA(0.04) }}
        >
          <span
            className="text-[10px] font-bold tracking-widest uppercase"
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
}: ToolTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      spellCheck={false}
      className={`w-full resize-none bg-transparent px-4 py-3 text-sm text-midnight-950 transition-colors duration-200 outline-none placeholder:text-midnight-500 focus:bg-midnight-100 ${mono ? 'font-mono' : 'font-sans'}`}
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
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      disabled={!text}
      className="relative rounded-full px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        color: accentColor,
        border: `1px solid ${accentA(copied ? 0.5 : 0.35)}`,
        background: copied ? accentA(0.2) : accentA(0.08),
      }}
    >
      <span>{copied ? '✓ Copied!' : label}</span>
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
  labels?: Record<string, string>;
}

export function ToolTabs({ tabs, active, onChange, accent = 'primary', labels }: ToolTabsProps) {
  const accentColor = av(accent);
  const accentA = (a: number) => ava(accent, a);
  return (
    <div className="glass flex w-fit flex-wrap gap-1 rounded-full p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-80 lg:text-sm"
          style={
            active === tab
              ? {
                  color: accentColor,
                  background: accentA(0.15),
                }
              : { color: '#8da3b3', background: 'transparent' }
          }
        >
          {labels?.[tab] || tab}
        </button>
      ))}
    </div>
  );
}
