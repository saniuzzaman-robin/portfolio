'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { Type } from 'lucide-react';

type TransformMode =
  | 'slug'
  | 'kebab'
  | 'snake'
  | 'camel'
  | 'pascal'
  | 'constant'
  | 'title'
  | 'sentence';

const transforms: Record<TransformMode, (text: string) => string> = {
  slug: (text) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
  kebab: (text) =>
    text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase(),
  snake: (text) =>
    text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase(),
  camel: (text) =>
    text
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^(.)/, (chr) => chr.toLowerCase()),
  pascal: (text) =>
    text
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^(.)/, (chr) => chr.toUpperCase()),
  constant: (text) =>
    text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toUpperCase(),
  title: (text) => text.toLowerCase().replace(/\b\w/g, (chr) => chr.toUpperCase()),
  sentence: (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
};

const examples: Record<TransformMode, string> = {
  slug: 'hello-world-2024',
  kebab: 'hello-world',
  snake: 'hello_world',
  camel: 'helloWorld',
  pascal: 'HelloWorld',
  constant: 'HELLO_WORLD',
  title: 'Hello World',
  sentence: 'Hello world',
};

export default function SlugPage() {
  const [input, setInput] = useState('Hello World 2024!');
  const [mode, setMode] = useState<TransformMode>('slug');

  const output = useMemo(() => {
    if (input) {
      return transforms[mode](input);
    }
    return '';
  }, [input, mode]);

  const modes: { value: TransformMode; label: string }[] = [
    { value: 'slug', label: 'URL Slug' },
    { value: 'kebab', label: 'kebab-case' },
    { value: 'snake', label: 'snake_case' },
    { value: 'camel', label: 'camelCase' },
    { value: 'pascal', label: 'PascalCase' },
    { value: 'constant', label: 'CONSTANT_CASE' },
    { value: 'title', label: 'Title Case' },
    { value: 'sentence', label: 'Sentence case' },
  ];

  return (
    <>
      <Navigation />
      <ToolShell
        title="Text Transform"
        subtitle="Slug · Case Converter"
        description="Transform text between different formats: URL slugs, camelCase, snake_case, kebab-case, and more. Perfect for naming variables and files."
        icon={Type}
        accent="primary"
      >
        {/* Mode selector */}
        <div className="mb-6">
          <label className="text-midnight-700 mb-3 block text-sm font-medium">Transform Type</label>
          <div className="grid gap-2 sm:grid-cols-4 md:grid-cols-8">
            {modes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`font-poppins rounded-sm px-3 py-2 text-xs font-bold transition-all ${
                  mode === value
                    ? 'bg-primary-50 text-black'
                    : 'bg-midnight-100 text-midnight-500 hover:text-midnight-900 border border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input/Output */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label="Input Text"
            accent="primary"
            action={<CopyButton text={input} accent="primary" />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder="Enter text to transform..."
              rows={10}
              accent="primary"
            />
          </ToolPanel>

          <ToolPanel
            label={`Output (${modes.find((m) => m.value === mode)?.label})`}
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            <ToolTextarea value={output} readOnly rows={10} accent="secondary" />
          </ToolPanel>
        </div>

        {/* Examples & Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <ToolPanel label="Format Examples" accent="tertiary">
            <div className="space-y-2 p-4 text-sm">
              {modes.map(({ value, label }) => (
                <div key={value} className="flex items-center justify-between">
                  <span className="text-midnight-700">{label}:</span>
                  <code className="text-tertiary-50 font-mono text-xs">{examples[value]}</code>
                </div>
              ))}
            </div>
          </ToolPanel>

          <ToolPanel label="Common Use Cases" accent="tertiary">
            <div className="text-midnight-700 space-y-3 p-4 text-sm">
              <div>
                <p className="text-midnight-900 mb-2 font-medium">💡 When to use each format:</p>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>
                    <strong className="text-midnight-950">URL Slug:</strong> Blog posts, page URLs
                  </li>
                  <li>
                    <strong className="text-midnight-950">camelCase:</strong> JavaScript variables
                  </li>
                  <li>
                    <strong className="text-midnight-950">PascalCase:</strong> React components,
                    classes
                  </li>
                  <li>
                    <strong className="text-midnight-950">snake_case:</strong> Python, Ruby, SQL
                  </li>
                  <li>
                    <strong className="text-midnight-950">kebab-case:</strong> CSS classes, URLs
                  </li>
                  <li>
                    <strong className="text-midnight-950">CONSTANT_CASE:</strong> Environment
                    variables
                  </li>
                </ul>
              </div>
            </div>
          </ToolPanel>
        </div>
      </ToolShell>
    </>
  );
}
