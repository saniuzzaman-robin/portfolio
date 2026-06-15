'use client';

import { useState } from 'react';
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

const toCamelCase = (str: string): string => {
  return str
    .replace(/[-_./\s]+/g, ' ')
    .split(' ')
    .map((word, index) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      if (index === 0) return cleanWord.toLowerCase();
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    })
    .join('');
};

const toPascalCase = (str: string): string => {
  return str
    .replace(/[-_./\s]+/g, ' ')
    .split(' ')
    .map((word) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    })
    .join('');
};

const toSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s./]+/g, '_')
    .toLowerCase();
};

const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s./]+/g, '-')
    .toLowerCase();
};

const toUpperSnake = (str: string): string => {
  return toSnakeCase(str).toUpperCase();
};

const toDotCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1.$2')
    .replace(/[_\-\s/]+/g, '.')
    .toLowerCase();
};

const toPathCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1/$2')
    .replace(/[_\-\s.]+/g, '/')
    .toLowerCase();
};

const toTitleCase = (str: string): string => {
  return str
    .replace(/[-_./]+/g, ' ')
    .split(' ')
    .map((word) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    })
    .join(' ');
};

const toSentenceCase = (str: string): string => {
  const cleaned = str
    .replace(/[-_./]+/g, ' ')
    .toLowerCase()
    .trim();
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
  const [outputs, setOutputs] = useState<Record<CaseType, string>>({
    camelCase: '',
    PascalCase: '',
    snake_case: '',
    'kebab-case': '',
    UPPER_SNAKE: '',
    'dot.case': '',
    'path/case': '',
    'Title Case': '',
    'Sentence case': '',
    UPPERCASE: '',
    lowercase: '',
  });

  const handleInputChange = (value: string) => {
    setInput(value);
    const newOutputs: Record<CaseType, string> = {
      camelCase: convertCase(value, 'camelCase'),
      PascalCase: convertCase(value, 'PascalCase'),
      snake_case: convertCase(value, 'snake_case'),
      'kebab-case': convertCase(value, 'kebab-case'),
      UPPER_SNAKE: convertCase(value, 'UPPER_SNAKE'),
      'dot.case': convertCase(value, 'dot.case'),
      'path/case': convertCase(value, 'path/case'),
      'Title Case': convertCase(value, 'Title Case'),
      'Sentence case': convertCase(value, 'Sentence case'),
      UPPERCASE: convertCase(value, 'UPPERCASE'),
      lowercase: convertCase(value, 'lowercase'),
    };
    setOutputs(newOutputs);
  };

  const caseTypes: CaseType[] = [
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

  return (
    <>
      <Navigation />
      <ToolShell
        title="Case Converter"
        subtitle="11+ Case Formats"
        description="Convert strings between camelCase, snake_case, kebab-case, PascalCase, and more. Perfect for variable naming across languages."
        icon={Type}
        accent="secondary"
      >
        <div className="mb-6">
          <ToolPanel label="Input String" accent="secondary">
            <ToolTextarea
              value={input}
              onChange={handleInputChange}
              placeholder="Enter text or a variable name…"
              rows={4}
              accent="secondary"
            />
          </ToolPanel>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caseTypes.map((caseType) => (
            <ToolPanel
              key={caseType}
              label={caseType}
              accent="secondary"
              action={
                outputs[caseType] ? (
                  <CopyButton text={outputs[caseType]} accent="secondary" />
                ) : undefined
              }
            >
              <div className="bg-neutral-10 text-neutral-80 min-h-10 rounded p-3 font-mono text-sm break-all">
                {outputs[caseType] || '—'}
              </div>
            </ToolPanel>
          ))}
        </div>
      </ToolShell>
    </>
  );
}
