'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  CopyButton,
  ToolTabs,
} from '@/components/tools/tool-shell';
import { Code } from 'lucide-react';
import * as yaml from 'js-yaml';

export default function YAMLJSONPage() {
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const process = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'yaml-to-json') {
        const parsed = yaml.load(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(input);
        setOutput(yaml.dump(parsed, { indent: 2, lineWidth: 80 }));
      }
    } catch (e) {
      setError(
        mode === 'yaml-to-json'
          ? 'Invalid YAML syntax'
          : 'Invalid JSON syntax' + (e instanceof Error ? ': ' + e.message : '')
      );
      setOutput('');
    }
  };

  const swapMode = () => {
    setMode((m) => (m === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json'));
    setInput(output);
    setOutput('');
    setError('');
  };

  const loadExample = () => {
    if (mode === 'yaml-to-json') {
      setInput(`name: John Doe
age: 30
email: john@example.com
skills:
  - JavaScript
  - TypeScript
  - React
address:
  street: 123 Main St
  city: New York
  country: USA`);
    } else {
      setInput(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "skills": [
    "JavaScript",
    "TypeScript",
    "React"
  ],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  }
}`);
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="YAML ↔ JSON"
        subtitle="Converter & Formatter"
        description="Convert between YAML and JSON formats. Perfect for config files, Kubernetes manifests, CI/CD pipelines, and API data."
        icon={Code}
        accent="secondary"
      >
        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <ToolTabs
            tabs={['yaml-to-json', 'json-to-yaml']}
            active={mode}
            onChange={(t) => setMode(t as typeof mode)}
            accent="secondary"
            labels={{ 'yaml-to-json': 'YAML → JSON', 'json-to-yaml': 'JSON → YAML' }}
          />
          <button
            onClick={swapMode}
            className="font-poppins text-midnight-500 hover:text-secondary-50 hover:border-secondary-50/30 rounded-sm border border-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all"
          >
            ⇄ Swap
          </button>
          <button
            onClick={process}
            className="font-poppins bg-secondary-50 hover:bg-secondary-60 rounded-sm px-4 py-2 text-sm font-bold text-black transition-colors"
          >
            Convert
          </button>
          <button
            onClick={loadExample}
            className="font-poppins text-midnight-500 hover:text-midnight-900 rounded-sm border border-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all"
          >
            Load Example
          </button>
        </div>

        {/* Input/Output */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label={mode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
            accent="primary"
            action={<CopyButton text={input} accent="primary" />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={
                mode === 'yaml-to-json'
                  ? 'Paste YAML here...\n\nExample:\nname: John\nage: 30'
                  : 'Paste JSON here...\n\nExample:\n{\n  "name": "John",\n  "age": 30\n}'
              }
              rows={16}
              accent="primary"
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            {error ? (
              <div className="animate-shake flex h-full items-center justify-center p-4">
                <div className="rounded-sm bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              </div>
            ) : (
              <ToolTextarea value={output} readOnly rows={16} accent="secondary" />
            )}
          </ToolPanel>
        </div>

        {/* Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <ToolPanel label="YAML Features" accent="tertiary">
            <div className="text-midnight-700 space-y-2 p-4 text-sm">
              <p className="text-midnight-900 mb-2 font-medium">✨ Benefits:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>More readable and concise than JSON</li>
                <li>Supports comments (# comment)</li>
                <li>No need for quotes around strings</li>
                <li>Multi-line strings with | or {'>'}</li>
                <li>Widely used in DevOps and configuration</li>
              </ul>
            </div>
          </ToolPanel>

          <ToolPanel label="Common Use Cases" accent="tertiary">
            <div className="text-midnight-700 space-y-2 p-4 text-sm">
              <p className="text-midnight-900 mb-2 font-medium">💡 When to use:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Kubernetes manifests and Helm charts</li>
                <li>Docker Compose and CI/CD configs</li>
                <li>Application configuration files</li>
                <li>Ansible playbooks</li>
                <li>OpenAPI/Swagger specifications</li>
                <li>Converting for API consumption</li>
              </ul>
            </div>
          </ToolPanel>
        </div>
      </ToolShell>
    </>
  );
}
