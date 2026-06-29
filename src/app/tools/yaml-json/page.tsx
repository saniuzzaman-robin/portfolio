'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  CopyButton,
  ToolTabs,
  ToolActionButton,
  ToolSecondaryButton,
  ToolError,
  ToolInfo,
} from '@/components/tools/tool-shell';
import { Code, ArrowRightLeft } from 'lucide-react';
import * as yaml from 'js-yaml';

export default function YAMLJSONPage() {
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const convert = () => {
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
        
      >
        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <ToolTabs
            tabs={['yaml-to-json', 'json-to-yaml']}
            active={mode}
            onChange={(t) => setMode(t as typeof mode)}
            
            labels={{ 'yaml-to-json': 'YAML → JSON', 'json-to-yaml': 'JSON → YAML' }}
          />
          <ToolSecondaryButton
            onClick={swapMode}
            icon={ArrowRightLeft}
            label="Swap"
          />
          <ToolActionButton
            onClick={convert}
            disabled={!input.trim()}
            
            icon={ArrowRightLeft}
            label="Convert"
          />
          <ToolSecondaryButton
            onClick={loadExample}
            label="Load Example"
          />
        </div>

        {/* Input/Output */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label={mode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
            
            action={<CopyButton text={input}  />}
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
              
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}
            
            action={<CopyButton text={output}  />}
          >
            {error ? (
              <ToolError message={error} />
            ) : (
              <ToolTextarea value={output} readOnly rows={16}  />
            )}
          </ToolPanel>
        </div>

        {/* Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <ToolInfo title="YAML Features" >
            <div className="text-midnight-950 space-y-2 p-4 text-sm">
              <p className="text-midnight-950 mb-2 font-medium">✨ Benefits:</p>
              <ul className="list-inside text-midnight-950 list-disc space-y-1 text-xs">
                <li>More readable and concise than JSON</li>
                <li>Supports comments (# comment)</li>
                <li>No need for quotes around strings</li>
                <li>Multi-line strings with | or {'>'}</li>
                <li>Widely used in DevOps and configuration</li>
              </ul>
            </div>
          </ToolInfo>

          <ToolInfo title="Common Use Cases" >
            <div className="text-midnight-950 space-y-2 p-4 text-sm">
              <p className="text-midnight-950 mb-2 font-medium">💡 When to use:</p>
              <ul className="list-inside text-midnight-950 list-disc space-y-1 text-xs">
                <li>Kubernetes manifests and Helm charts</li>
                <li>Docker Compose and CI/CD configs</li>
                <li>Application configuration files</li>
                <li>Ansible playbooks</li>
                <li>OpenAPI/Swagger specifications</li>
                <li>Converting for API consumption</li>
              </ul>
            </div>
          </ToolInfo>
        </div>
      </ToolShell>
    </>
  );
}
