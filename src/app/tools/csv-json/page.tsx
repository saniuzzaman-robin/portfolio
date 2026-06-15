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
import { Database } from 'lucide-react';

const csvToJson = (csv: string, hasHeader: boolean, delimiter: string = ','): string => {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return '';

  const data: Record<string, string>[] = [];
  let headers: string[] = [];

  // Parse header if present
  if (hasHeader && lines.length > 0) {
    headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
  }

  // Parse rows
  const startIndex = hasHeader ? 1 : 0;
  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));

    if (hasHeader && headers.length > 0) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    } else {
      data.push(
        values.reduce((obj: Record<string, string>, val, index) => {
          obj[`column_${index + 1}`] = val;
          return obj;
        }, {})
      );
    }
  }

  return JSON.stringify(data, null, 2);
};

const jsonToCsv = (json: string, delimiter: string = ','): string => {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows: string[] = [];

    // Add header row
    rows.push(headers.map((h) => `"${h}"`).join(delimiter));

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      rows.push(values.join(delimiter));
    }

    return rows.join('\n');
  } catch {
    return '';
  }
};

export default function CsvJsonPage() {
  const [mode, setMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const [input, setInput] = useState(`name,email,role
John Doe,john@example.com,Engineer
Jane Smith,jane@example.com,Designer
Bob Johnson,bob@example.com,Manager`);
  const [output, setOutput] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');
  const [error, setError] = useState('');

  const handleProcess = () => {
    setError('');
    try {
      if (mode === 'csv-to-json') {
        const result = csvToJson(input, hasHeader, delimiter);
        setOutput(result);
      } else {
        const result = jsonToCsv(input, delimiter);
        if (!result) {
          setError('Invalid JSON format');
          return;
        }
        setOutput(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed');
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="CSV ↔ JSON"
        subtitle="Convert & Transform"
        description="Convert between CSV and JSON formats. Supports custom delimiters and header detection."
        icon={Database}
        accent="primary"
      >
        <ToolTabs
          tabs={['csv-to-json', 'json-to-csv']}
          active={mode}
          onChange={(t) => setMode(t as 'csv-to-json' | 'json-to-csv')}
          accent="primary"
        />

        <div className="mt-6 mb-6 flex flex-wrap items-center gap-4">
          {mode === 'csv-to-json' && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="h-4 w-4 cursor-pointer"
              />
              <span className="text-neutral-80 text-sm">First row is header</span>
            </label>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="delimiter" className="text-neutral-80 text-sm">
              Delimiter:
            </label>
            <select
              id="delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="border-neutral-30 bg-neutral-10 text-neutral-90 rounded border px-2 py-1 text-sm"
            >
              <option value=",">,</option>
              <option value=";">;</option>
              <option value="\t">Tab</option>
              <option value="|">|</option>
            </select>
          </div>

          <button
            onClick={handleProcess}
            disabled={!input.trim()}
            className="font-poppins ml-auto flex cursor-pointer items-center gap-2 rounded-sm border border-cyan-700 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 lg:text-sm"
          >
            Convert
          </button>
        </div>

        {error && <div className="mb-4 font-mono text-sm text-red-400">{error}</div>}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <ToolPanel label={mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'} accent="primary">
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={mode === 'csv-to-json' ? 'Paste CSV here…' : 'Paste JSON here…'}
              rows={12}
              accent="primary"
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
            accent="primary"
            action={output ? <CopyButton text={output} accent="primary" /> : undefined}
          >
            <ToolTextarea value={output} readOnly placeholder="" rows={12} accent="primary" />
          </ToolPanel>
        </div>

        {output && (
          <div className="text-neutral-60 font-poppins text-xs">
            <span>✓ Conversion successful</span>
            {mode === 'csv-to-json' && (
              <span className="ml-4">• {output.split('\n').length} lines</span>
            )}
          </div>
        )}
      </ToolShell>
    </>
  );
}
