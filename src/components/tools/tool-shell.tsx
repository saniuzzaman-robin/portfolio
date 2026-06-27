'use client';

import type { ReactNode } from 'react';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, type LucideIcon } from 'lucide-react';
import { av, ava, type AccentToken } from '@/lib/accent';

/* ── ToolShell ─────────────────────────────────────────────────── */

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
      <div className="border-midnight-200 relative overflow-hidden border-b px-6 pt-10 pb-8 md:px-12 lg:px-20">
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
            className="group text-midnight-500 hover:text-midnight-950 mb-6 inline-flex items-center gap-2 text-[10px] tracking-widest uppercase transition-colors"
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
              <div className="mb-1 flex flex-wrap items-baseline gap-3">
                <h1 className="text-midnight-950 text-2xl font-bold md:text-3xl">{title}</h1>
                <span
                  className="text-xs tracking-widest uppercase lg:text-sm"
                  style={{ color: accentColor }}
                >
                  {subtitle}
                </span>
              </div>
              <p className="text-midnight-500 max-w-xl text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}

/* ── ToolPanel ─────────────────────────────────────────────────── */

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
      className={`bg-midnight-900 border-midnight-200 overflow-hidden rounded-2xl border ${className}`}
    >
      {label && (
        <div
          className="border-midnight-200 flex items-center justify-between border-b px-4 py-2.5"
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

/* ── ToolTextarea ──────────────────────────────────────────────── */

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
      aria-label={placeholder}
      className={`text-midnight-950 placeholder:text-midnight-500 focus:bg-midnight-100 w-full resize-none bg-transparent px-4 py-3 text-sm transition-colors duration-200 outline-none ${mono ? 'font-mono' : 'font-sans'}`}
    />
  );
}

/* ── CopyButton ────────────────────────────────────────────────── */

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
      aria-label={copied ? 'Copied' : label}
    >
      <span>{copied ? '✓ Copied!' : label}</span>
    </button>
  );
}

/* ── ToolTabs ──────────────────────────────────────────────────── */

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
    <div
      className="bg-midnight-100 border-midnight-200 flex w-fit flex-wrap gap-1 rounded-full border p-1"
      role="tablist"
      aria-label="Mode selection"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          role="tab"
          aria-selected={active === tab}
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

/* ── ToolActionButton ──────────────────────────────────────────── */

interface ToolActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  accent?: AccentToken;
  icon?: LucideIcon;
  label: string;
  fullWidth?: boolean;
}

export function ToolActionButton({
  onClick,
  disabled = false,
  accent = 'primary',
  icon: IconComp,
  label,
  fullWidth = false,
}: ToolActionButtonProps) {
  const accentColor = av(accent);
  const accentA = (a: number) => ava(accent, a);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-6 py-2.5 font-sans text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 lg:text-sm ${fullWidth ? 'w-full' : ''}`}
      style={{
        color: accentColor,
        borderColor: accentA(0.5),
        background: accentA(0.08),
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = accentA(0.18);
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = accentA(0.08);
        e.currentTarget.style.borderColor = accentA(0.5);
      }}
      aria-label={label}
    >
      {IconComp && <IconComp className="h-4 w-4" aria-hidden="true" />}
      {label}
    </button>
  );
}

/* ── ToolSecondaryButton ───────────────────────────────────────── */

interface ToolSecondaryButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  label: string;
}

export function ToolSecondaryButton({
  onClick,
  disabled = false,
  icon: IconComp,
  label,
}: ToolSecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border-midnight-200 text-midnight-500 hover:border-midnight-300 hover:text-midnight-950 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-5 py-2.5 font-sans text-xs font-bold tracking-widest uppercase transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 lg:text-sm"
      aria-label={label}
    >
      {IconComp && <IconComp className="h-4 w-4" aria-hidden="true" />}
      {label}
    </button>
  );
}

/* ── ToolError ─────────────────────────────────────────────────── */

interface ToolErrorProps {
  message: string;
}

export function ToolError({ message }: ToolErrorProps) {
  return (
    <div className="border-tertiary-40/30 bg-tertiary-40/5 flex items-start gap-3 rounded-xl border px-4 py-3">
      <AlertCircle className="text-midnight-500 mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="text-midnight-500 text-sm">{message}</p>
    </div>
  );
}

/* ── ToolInfo ──────────────────────────────────────────────────── */

interface ToolInfoProps {
  title?: string;
  children: ReactNode;
  accent?: AccentToken;
}

export function ToolInfo({ title, children, accent = 'primary' }: ToolInfoProps) {
  const accentColor = av(accent);
  const accentA = (a: number) => ava(accent, a);

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: accentA(0.03),
        borderColor: accentA(0.15),
      }}
    >
      {title && (
        <p
          className="mb-2 text-xs font-bold tracking-widest uppercase"
          style={{ color: accentColor }}
        >
          {title}
        </p>
      )}
      <div className="text-midnight-500 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
