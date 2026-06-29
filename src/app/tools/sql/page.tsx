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
} from '@/components/tools/tool-shell';
import { Database, Play } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

// Simple SQL formatter
function formatSQL(sql: string): string {
  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'LEFT',
    'RIGHT',
    'INNER',
    'OUTER',
    'ON',
    'AND',
    'OR',
    'ORDER',
    'BY',
    'GROUP',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'INSERT',
    'INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE',
    'CREATE',
    'TABLE',
    'DROP',
    'ALTER',
    'ADD',
    'COLUMN',
    'PRIMARY',
    'KEY',
    'FOREIGN',
    'REFERENCES',
    'INDEX',
    'UNIQUE',
    'NOT',
    'NULL',
    'DEFAULT',
    'AS',
    'DISTINCT',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'UNION',
    'ALL',
    'BETWEEN',
    'IN',
    'LIKE',
    'IS',
    'EXISTS',
    'COUNT',
    'SUM',
    'AVG',
    'MAX',
    'MIN',
  ];

  let formatted = sql.trim();

  // Add newlines before major keywords
  const majorKeywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'ORDER BY',
    'GROUP BY',
    'HAVING',
    'LIMIT',
    'UNION',
  ];

  majorKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${keyword.toUpperCase()}`);
  });

  // Uppercase all SQL keywords
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, keyword.toUpperCase());
  });

  // Add indentation
  const lines = formatted.split('\n').filter((line) => line.trim());
  let indentLevel = 0;
  const indented = lines.map((line) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('WHERE') ||
      trimmed.startsWith('ORDER') ||
      trimmed.startsWith('GROUP') ||
      trimmed.startsWith('HAVING') ||
      trimmed.startsWith('LIMIT')
    ) {
      indentLevel = 1;
    } else if (trimmed.includes('JOIN')) {
      indentLevel = 1;
    } else if (
      trimmed.startsWith('SELECT') ||
      trimmed.startsWith('FROM') ||
      trimmed.startsWith('UNION')
    ) {
      indentLevel = 0;
    }
    return '  '.repeat(indentLevel) + trimmed;
  });

  return indented.join('\n');
}

function minifySQL(sql: string): string {
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*=\s*/g, '=')
    .trim();
}

export default function SQLPage() {
  const [mode, setMode] = useState<'format' | 'minify'>('format');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const process = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const result = mode === 'format' ? formatSQL(input) : minifySQL(input);
      setOutput(result);
    } catch (e) {
      setOutput('Error processing SQL' + (e instanceof Error ? ': ' + e.message : ''));
    }
  };

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlOrCmd: true,
      callback: process,
      description: 'Process SQL',
    },
  ]);

  return (
    <>
      <Navigation />
      <ToolShell
        title="SQL Formatter"
        subtitle="Format & Minify"
        description="Format SQL queries for readability or minify them for production. Supports common SQL dialects."
        icon={Database}
      >
        {/* Mode selector */}
        <div className="mb-6 flex items-center gap-4">
          <ToolTabs
            tabs={['format', 'minify']}
            active={mode}
            onChange={(t) => setMode(t as typeof mode)}
          />
          <ToolActionButton
            onClick={process}
            icon={Play}
            label="Process (⌘/Ctrl+Enter)"
          />
        </div>

        {/* Input/Output */}
        <div className="grid gap-4 md:grid-cols-2">
          <ToolPanel
            label="SQL Input"
            action={<CopyButton text={input} />}
          >
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder="Paste your SQL query here..."
              rows={16}
            />
          </ToolPanel>

          <ToolPanel
            label={mode === 'format' ? 'Formatted SQL' : 'Minified SQL'}
            action={<CopyButton text={output} />}
          >
            <ToolTextarea value={output} readOnly rows={16} />
          </ToolPanel>
        </div>
      </ToolShell>
    </>
  );
}
