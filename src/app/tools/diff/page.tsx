'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { FileCode2 } from 'lucide-react';

// Simple diff algorithm (LCS-based)
interface DiffLine {
  type: 'equal' | 'added' | 'removed';
  content: string;
  lineNum1?: number;
  lineNum2?: number;
}

function computeDiff(text1: string, text2: string, ignoreWhitespace: boolean): DiffLine[] {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');

  const processLine = (line: string) => (ignoreWhitespace ? line.trim() : line);

  const lcs = computeLCS(lines1.map(processLine), lines2.map(processLine));

  const result: DiffLine[] = [];
  let i = 0,
    j = 0,
    lcsIdx = 0;

  while (i < lines1.length || j < lines2.length) {
    const l1 = i < lines1.length ? processLine(lines1[i]) : null;
    const l2 = j < lines2.length ? processLine(lines2[j]) : null;
    const lcsLine = lcsIdx < lcs.length ? lcs[lcsIdx] : null;

    if (l1 !== null && l1 === lcsLine) {
      result.push({ type: 'equal', content: lines1[i], lineNum1: i + 1, lineNum2: j + 1 });
      i++;
      j++;
      lcsIdx++;
    } else if (l1 !== null && (l2 === null || l1 !== l2)) {
      result.push({ type: 'removed', content: lines1[i], lineNum1: i + 1 });
      i++;
    } else if (l2 !== null) {
      result.push({ type: 'added', content: lines2[j], lineNum2: j + 1 });
      j++;
    }
  }

  return result;
}

function computeLCS(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs: string[] = [];
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

export default function DiffPage() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const diff = useMemo(() => {
    if (text1 || text2) {
      return computeDiff(text1, text2, ignoreWhitespace);
    }
    return [];
  }, [text1, text2, ignoreWhitespace]);

  const stats = {
    added: diff.filter((d) => d.type === 'added').length,
    removed: diff.filter((d) => d.type === 'removed').length,
    equal: diff.filter((d) => d.type === 'equal').length,
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Diff Viewer"
        subtitle="Text Comparison"
        description="Compare two texts side-by-side with line-by-line highlighting. Perfect for comparing code, configs, or any text documents."
        icon={FileCode2}
        accent="primary"
      >
        {/* Options */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="accent-primary-50 h-4 w-4"
            />
            <span className="text-neutral-70 text-sm">Ignore whitespace</span>
          </label>

          {diff.length > 0 && (
            <div className="font-poppins text-neutral-60 flex gap-4 text-xs">
              <span className="text-green-400">+{stats.added}</span>
              <span className="text-red-400">-{stats.removed}</span>
              <span className="text-neutral-50">={stats.equal}</span>
            </div>
          )}
        </div>

        {/* Input panels */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <ToolPanel
            label="Original Text"
            accent="primary"
            action={<CopyButton text={text1} accent="primary" />}
          >
            <ToolTextarea
              value={text1}
              onChange={setText1}
              placeholder="Paste original text here..."
              rows={12}
              accent="primary"
            />
          </ToolPanel>

          <ToolPanel
            label="Modified Text"
            accent="secondary"
            action={<CopyButton text={text2} accent="secondary" />}
          >
            <ToolTextarea
              value={text2}
              onChange={setText2}
              placeholder="Paste modified text here..."
              rows={12}
              accent="secondary"
            />
          </ToolPanel>
        </div>

        {/* Diff output */}
        {diff.length > 0 && (
          <ToolPanel label="Differences" accent="tertiary">
            <div className="max-h-96 overflow-y-auto font-mono text-[13px] leading-relaxed">
              {diff.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 px-4 py-1 ${
                    line.type === 'added'
                      ? 'bg-green-500/10 text-green-300'
                      : line.type === 'removed'
                        ? 'bg-red-500/10 text-red-300'
                        : 'text-neutral-70'
                  }`}
                >
                  <span className="text-neutral-60 w-10 shrink-0 text-right select-none">
                    {line.lineNum1 || ''}
                  </span>
                  <span className="text-neutral-60 w-10 shrink-0 text-right select-none">
                    {line.lineNum2 || ''}
                  </span>
                  <span className="w-4 shrink-0 font-bold">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="flex-1 break-all whitespace-pre-wrap">{line.content}</span>
                </div>
              ))}
            </div>
          </ToolPanel>
        )}
      </ToolShell>
    </>
  );
}
