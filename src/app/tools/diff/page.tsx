'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea, CopyButton } from '@/components/tools/tool-shell';
import { FileCode2 } from 'lucide-react';

// Character-level diff segment
interface CharSegment {
  text: string;
  type: 'equal' | 'added' | 'removed';
}

// Line diff with character-level details
interface DiffLine {
  type: 'equal' | 'added' | 'removed' | 'modified';
  content: string;
  lineNum1?: number;
  lineNum2?: number;
  charDiff?: {
    left: CharSegment[];
    right: CharSegment[];
  };
}

// Compute character-level diff using LCS
function computeCharDiff(
  str1: string,
  str2: string
): { left: CharSegment[]; right: CharSegment[] } {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Build LCS table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to get diff segments
  const left: CharSegment[] = [];
  const right: CharSegment[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
      left.unshift({ text: str1[i - 1], type: 'equal' });
      right.unshift({ text: str2[j - 1], type: 'equal' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      right.unshift({ text: str2[j - 1], type: 'added' });
      j--;
    } else if (i > 0) {
      left.unshift({ text: str1[i - 1], type: 'removed' });
      i--;
    }
  }

  // Merge consecutive segments of same type
  const mergeSegments = (segments: CharSegment[]): CharSegment[] => {
    if (segments.length === 0) return [];
    const merged: CharSegment[] = [segments[0]];
    for (let k = 1; k < segments.length; k++) {
      const last = merged[merged.length - 1];
      if (last.type === segments[k].type) {
        last.text += segments[k].text;
      } else {
        merged.push(segments[k]);
      }
    }
    return merged;
  };

  return {
    left: mergeSegments(left),
    right: mergeSegments(right),
  };
}

function computeDiff(text1: string, text2: string, ignoreWhitespace: boolean): DiffLine[] {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');

  const processLine = (line: string) => (ignoreWhitespace ? line.trim() : line);

  const result: DiffLine[] = [];
  const maxLines = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLines; i++) {
    const line1 = i < lines1.length ? lines1[i] : null;
    const line2 = i < lines2.length ? lines2[i] : null;
    const proc1 = line1 !== null ? processLine(line1) : null;
    const proc2 = line2 !== null ? processLine(line2) : null;

    if (line1 !== null && line2 !== null) {
      if (proc1 === proc2) {
        // Lines are identical
        result.push({ type: 'equal', content: line1, lineNum1: i + 1, lineNum2: i + 1 });
      } else {
        // Lines exist but differ - show character-level diff
        const charDiff = computeCharDiff(line1, line2);
        result.push({
          type: 'modified',
          content: line1,
          lineNum1: i + 1,
          lineNum2: i + 1,
          charDiff,
        });
      }
    } else if (line1 !== null) {
      // Line only in original (removed)
      result.push({ type: 'removed', content: line1, lineNum1: i + 1 });
    } else if (line2 !== null) {
      // Line only in modified (added)
      result.push({ type: 'added', content: line2, lineNum2: i + 1 });
    }
  }

  return result;
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
    modified: diff.filter((d) => d.type === 'modified').length,
    equal: diff.filter((d) => d.type === 'equal').length,
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Diff Viewer"
        subtitle="Text Comparison"
        description="Compare two texts with character-level precision. See exactly which characters changed within modified lines. Perfect for code review and config comparison."
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
            <span className="text-midnight-700 text-sm">Ignore whitespace</span>
          </label>

          {diff.length > 0 && (
            <div className="font-poppins text-midnight-500 flex gap-4 text-xs">
              <span className="text-green-400">+{stats.added}</span>
              <span className="text-red-400">-{stats.removed}</span>
              <span className="text-yellow-400">~{stats.modified}</span>
              <span className="text-midnight-50">={stats.equal}</span>
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
              {diff.map((line, idx) => {
                if (line.type === 'modified' && line.charDiff) {
                  // Show character-level diff for modified lines
                  return (
                    <div key={idx}>
                      {/* Original line (left) */}
                      <div className="flex gap-3 bg-red-500/10 px-4 py-1">
                        <span className="text-midnight-500 w-10 shrink-0 text-right select-none">
                          {line.lineNum1}
                        </span>
                        <span className="text-midnight-500 w-10 shrink-0 text-right select-none"></span>
                        <span className="w-4 shrink-0 font-bold text-red-300">-</span>
                        <span className="flex-1 break-all whitespace-pre-wrap">
                          {line.charDiff.left.map((seg, segIdx) => (
                            <span
                              key={segIdx}
                              className={
                                seg.type === 'removed'
                                  ? 'bg-red-500/30 text-red-200'
                                  : 'text-red-300'
                              }
                            >
                              {seg.text}
                            </span>
                          ))}
                        </span>
                      </div>
                      {/* Modified line (right) */}
                      <div className="flex gap-3 bg-green-500/10 px-4 py-1">
                        <span className="text-midnight-500 w-10 shrink-0 text-right select-none"></span>
                        <span className="text-midnight-500 w-10 shrink-0 text-right select-none">
                          {line.lineNum2}
                        </span>
                        <span className="w-4 shrink-0 font-bold text-green-300">+</span>
                        <span className="flex-1 break-all whitespace-pre-wrap">
                          {line.charDiff.right.map((seg, segIdx) => (
                            <span
                              key={segIdx}
                              className={
                                seg.type === 'added'
                                  ? 'bg-green-500/30 text-green-200'
                                  : 'text-green-300'
                              }
                            >
                              {seg.text}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Regular line-level diff
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 px-4 py-1 ${
                      line.type === 'added'
                        ? 'bg-green-500/10 text-green-300'
                        : line.type === 'removed'
                          ? 'bg-red-500/10 text-red-300'
                          : 'text-midnight-700'
                    }`}
                  >
                    <span className="text-midnight-500 w-10 shrink-0 text-right select-none">
                      {line.lineNum1 || ''}
                    </span>
                    <span className="text-midnight-500 w-10 shrink-0 text-right select-none">
                      {line.lineNum2 || ''}
                    </span>
                    <span className="w-4 shrink-0 font-bold">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className="flex-1 break-all whitespace-pre-wrap">{line.content}</span>
                  </div>
                );
              })}
            </div>
          </ToolPanel>
        )}
      </ToolShell>
    </>
  );
}
