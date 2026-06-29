'use client';

import { useMemo, useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { Type } from 'lucide-react';

type CaseType =
  | 'camelCase'
  | 'PascalCase'
  | 'snake_case'
  | 'kebab-case'
  | 'UPPER_SNAKE'
  | 'dot.case'
  | 'path/case'
  | 'Title Case'
  | 'Sentence case'
  | 'UPPERCASE'
  | 'lowercase';

const CASE_TYPES: CaseType[] = [
  'camelCase',
  'PascalCase',
  'snake_case',
  'kebab-case',
  'UPPER_SNAKE',
  'dot.case',
  'path/case',
  'Title Case',
  'Sentence case',
  'UPPERCASE',
  'lowercase',
];

const toCamelCase = (str: string): string =>
  str
    .replace(/[-_./\s]+/g, ' ')
    .split(' ')
    .map((word, index) => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '');
      if (index === 0) return clean.toLowerCase();
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    })
    .join('');

const toPascalCase = (str: string): string =>
  str
    .replace(/[-_./\s]+/g, ' ')
    .split(' ')
    .map((word) => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '');
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    })
    .join('');

const toSnakeCase = (str: string): string =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s./]+/g, '_')
    .toLowerCase();

const toKebabCase = (str: string): string =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s./]+/g, '-')
    .toLowerCase();

const toUpperSnake = (str: string): string => toSnakeCase(str).toUpperCase();

const toDotCase = (str: string): string =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1.$2')
    .replace(/[_\-\s/]+/g, '.')
    .toLowerCase();

const toPathCase = (str: string): string =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1/$2')
    .replace(/[_\-\s.]+/g, '/')
    .toLowerCase();

const toTitleCase = (str: string): string =>
  str
    .replace(/[-_./]+/g, ' ')
    .split(' ')
    .map((word) => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '');
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    })
    .join(' ');

const toSentenceCase = (str: string): string => {
  const cleaned = str.replace(/[-_./]+/g, ' ').toLowerCase().trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const convertCase = (text: string, caseType: CaseType): string => {
  if (!text.trim()) return '';
  switch (caseType) {
    case 'camelCase':
      return toCamelCase(text);
    case 'PascalCase':
      return toPascalCase(text);
    case 'snake_case':
      return toSnakeCase(text);
    case 'kebab-case':
      return toKebabCase(text);
    case 'UPPER_SNAKE':
      return toUpperSnake(text);
    case 'dot.case':
      return toDotCase(text);
    case 'path/case':
      return toPathCase(text);
    case 'Title Case':
      return toTitleCase(text);
    case 'Sentence case':
      return toSentenceCase(text);
    case 'UPPERCASE':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    default:
      return text;
  }
};

export default function CaseConverterPage() {
  const [input, setInput] = useState('');

  const outputs = useMemo(
    () =>
      Object.fromEntries(CASE_TYPES.map((ct) => [ct, convertCase(input, ct)])) as Record<
        CaseType,
        string
      >,
    [input],
  );

  return (
    <>
      <Navigation />
      <ToolShell
        title="Case Converter"
        subtitle="11 Case Formats"
        description="Convert strings between camelCase, snake_case, kebab-case, PascalCase, and more. Perfect for variable naming across languages."
        icon={Type}
      >
        <div className="mb-6">
          <ToolPanel label="Input String">
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder="Enter text or a variable name…"
              rows={4}
            />
          </ToolPanel>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CASE_TYPES.map((caseType) => (
            <ToolPanel
              key={caseType}
              label={caseType}
              action={
                outputs[caseType] ? (
                  <CopyButton text={outputs[caseType]} />
                ) : undefined
              }
            >
              <div className="bg-midnight-100 text-midnight-950 min-h-10 rounded p-3 font-mono text-sm break-all">
                {outputs[caseType] || '—'}
              </div>
            </ToolPanel>
          ))}
        </div>
      </ToolShell>
    </>
  );
}
