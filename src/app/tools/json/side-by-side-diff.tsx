import type { DiffEntry } from './diff';
import { highlightDiff } from '../../../components/tools/diff-highlight';

function stripTrailingComma(text: string): string {
  return text.replace(/,\s*$/, '');
}

export function SideBySideDiff({ diff }: { diff: DiffEntry[] }) {
  return (
    <div className="overflow-auto rounded-sm font-mono text-xs lg:text-sm">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '3ch' }} />
          <col style={{ width: '50%' }} />
          <col style={{ width: '3ch' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <thead>
          <tr>
            <th
              colSpan={2}
              className="font-poppins py-1.5 pr-4 text-center text-[10px] font-bold tracking-widest uppercase"
              style={{
                color: '#ef4444',
                background: 'rgba(239,68,68,0.06)',
                borderBottom: '1px solid rgba(239,68,68,0.15)',
              }}
            >
              JSON 1
            </th>
            <th
              colSpan={2}
              className="font-poppins py-1.5 pr-4 text-center text-[10px] font-bold tracking-widest uppercase"
              style={{
                color: '#22c55e',
                background: 'rgba(34,197,94,0.06)',
                borderBottom: '1px solid rgba(34,197,94,0.15)',
              }}
            >
              JSON 2
            </th>
          </tr>
        </thead>
        <tbody>
          {diff.map((entry, idx) => {
            const isDelete = entry.type === 'delete';
            const isInsert = entry.type === 'insert';
            const isModify = entry.type === 'modify';

            const leftNum = entry.type !== 'insert' ? entry.leftNum : null;
            const rightNum = entry.type !== 'delete' ? entry.rightNum : null;
            let leftText = entry.type !== 'insert' ? entry.left : null;
            let rightText = entry.type !== 'delete' ? entry.right : null;

            // Only strip trailing commas for non-modify entries (modify entries are pre-normalized)
            if (!isModify) {
              if (leftText) leftText = stripTrailingComma(leftText);
              if (rightText) rightText = stripTrailingComma(rightText);
            }

            const leftBg = isDelete
              ? 'rgba(239,68,68,0.12)'
              : isModify
                ? 'rgba(249,115,22,0.12)'
                : 'transparent';
            const rightBg = isInsert
              ? 'rgba(34,197,94,0.12)'
              : isModify
                ? 'rgba(249,115,22,0.12)'
                : 'transparent';
            const leftNumColor = isDelete ? '#ef4444' : isModify ? '#f97316' : '#4b6070';
            const rightNumColor = isInsert ? '#22c55e' : isModify ? '#f97316' : '#4b6070';
            const leftTextColor = isDelete ? '#fca5a5' : isModify ? '#fed7aa' : '#cbd5e1';
            const rightTextColor = isInsert ? '#86efac' : isModify ? '#fed7aa' : '#cbd5e1';

            const highlight =
              isModify && leftText && rightText ? highlightDiff(leftText, rightText) : null;

            return (
              <tr key={idx}>
                <td
                  className="px-2 py-0.5 text-right select-none"
                  style={{
                    background: leftBg,
                    color: leftNumColor,
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    minWidth: '3ch',
                  }}
                >
                  {leftNum ?? ''}
                </td>
                <td
                  className="overflow-hidden py-0.5 pr-2 pl-3 whitespace-pre"
                  style={{
                    background: leftBg,
                    color: leftTextColor,
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {isDelete && <span style={{ color: '#ef4444', marginRight: '0.4ch' }}>−</span>}
                  {isModify && <span style={{ color: '#f97316', marginRight: '0.4ch' }}>⚡</span>}
                  {highlight ? (
                    <>
                      <span style={{ color: 'inherit' }}>{highlight.prefix}</span>
                      {highlight.old.map((seg, i) => (
                        <span
                          key={i}
                          style={{
                            background: seg.changed ? 'rgba(239,68,68,0.4)' : 'transparent',
                            color: seg.changed ? '#ff6b6b' : 'inherit',
                          }}
                        >
                          {seg.text}
                        </span>
                      ))}
                    </>
                  ) : (
                    leftText
                  )}
                </td>
                <td
                  className="px-2 py-0.5 text-right select-none"
                  style={{
                    background: rightBg,
                    color: rightNumColor,
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    minWidth: '3ch',
                  }}
                >
                  {rightNum ?? ''}
                </td>
                <td
                  className="overflow-hidden py-0.5 pr-2 pl-3 whitespace-pre"
                  style={{ background: rightBg, color: rightTextColor, textOverflow: 'ellipsis' }}
                >
                  {isInsert && <span style={{ color: '#22c55e', marginRight: '0.4ch' }}>+</span>}
                  {isModify && <span style={{ color: '#f97316', marginRight: '0.4ch' }}>⚡</span>}
                  {highlight ? (
                    <>
                      <span style={{ color: 'inherit' }}>{highlight.prefix}</span>
                      {highlight.new.map((seg, i) => (
                        <span
                          key={i}
                          style={{
                            background: seg.changed ? 'rgba(34,197,94,0.4)' : 'transparent',
                            color: seg.changed ? '#51cf66' : 'inherit',
                          }}
                        >
                          {seg.text}
                        </span>
                      ))}
                    </>
                  ) : (
                    rightText
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
