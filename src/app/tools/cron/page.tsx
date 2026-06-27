'use client';

import { useState, useMemo } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, CopyButton } from '@/components/tools/tool-shell';
import { CalendarClock } from 'lucide-react';

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const PRESETS: Record<string, string> = {
  '* * * * *': 'Every minute',
  '*/5 * * * *': 'Every 5 minutes',
  '0 * * * *': 'Every hour',
  '0 0 * * *': 'Daily at midnight',
  '0 9 * * *': 'Daily at 9:00 AM',
  '0 0 * * 0': 'Weekly on Sunday',
  '0 0 1 * *': 'Monthly on the 1st',
  '0 0 1 1 *': 'Yearly on January 1st',
};

function parseCron(expression: string): CronParts | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}

function buildCron(parts: CronParts): string {
  return `${parts.minute} ${parts.hour} ${parts.dayOfMonth} ${parts.month} ${parts.dayOfWeek}`;
}

function explainCron(expression: string): string {
  const preset = PRESETS[expression];
  if (preset) return preset;

  const parts = parseCron(expression);
  if (!parts) return 'Invalid cron expression';

  const explain: string[] = [];

  // Minute
  if (parts.minute === '*') explain.push('every minute');
  else if (parts.minute.startsWith('*/')) explain.push(`every ${parts.minute.slice(2)} minutes`);
  else explain.push(`at minute ${parts.minute}`);

  // Hour
  if (parts.hour === '*') {
    if (!explain[0].includes('every')) explain.push('of every hour');
  } else if (parts.hour.startsWith('*/')) {
    explain.push(`every ${parts.hour.slice(2)} hours`);
  } else {
    explain.push(`at ${parts.hour}:00`);
  }

  // Day of month
  if (parts.dayOfMonth !== '*') {
    explain.push(`on day ${parts.dayOfMonth}`);
  }

  // Month
  if (parts.month !== '*') {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthNum = parseInt(parts.month);
    if (monthNum >= 1 && monthNum <= 12) {
      explain.push(`in ${months[monthNum - 1]}`);
    }
  }

  // Day of week
  if (parts.dayOfWeek !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNum = parseInt(parts.dayOfWeek);
    if (dayNum >= 0 && dayNum <= 6) {
      explain.push(`on ${days[dayNum]}`);
    }
  }

  return explain.join(' ');
}

export default function CronPage() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');

  const expression = useMemo(
    () => buildCron({ minute, hour, dayOfMonth, month, dayOfWeek }),
    [minute, hour, dayOfMonth, month, dayOfWeek]
  );

  const explanation = useMemo(() => explainCron(expression), [expression]);

  const loadPreset = (preset: string) => {
    const parts = parseCron(preset);
    if (parts) {
      setMinute(parts.minute);
      setHour(parts.hour);
      setDayOfMonth(parts.dayOfMonth);
      setMonth(parts.month);
      setDayOfWeek(parts.dayOfWeek);
    }
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Cron Expression"
        subtitle="Builder & Tester"
        description="Build and test cron expressions with a visual interface. Get human-readable explanations and preview execution times."
        icon={CalendarClock}
        accent="tertiary"
      >
        {/* Presets */}
        <div className="mb-6">
          <label className="text-midnight-700 mb-2 block text-sm font-medium">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([expr, label]) => (
              <button
                key={expr}
                onClick={() => loadPreset(expr)}
                className="font-poppins text-midnight-700 hover:text-tertiary-50 hover:border-tertiary-50/30 rounded-sm border border-white/10 px-3 py-1.5 text-xs transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Builder */}
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <div>
            <label className="text-midnight-700 mb-2 block text-sm font-medium">
              Minute
              <span className="text-midnight-500 ml-1 text-xs">(0-59)</span>
            </label>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="*"
              className="bg-midnight-100 border-midnight-200 text-midnight-900 focus:border-tertiary-50/50 w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-midnight-700 mb-2 block text-sm font-medium">
              Hour
              <span className="text-midnight-500 ml-1 text-xs">(0-23)</span>
            </label>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="*"
              className="bg-midnight-100 border-midnight-200 text-midnight-900 focus:border-tertiary-50/50 w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-midnight-700 mb-2 block text-sm font-medium">
              Day
              <span className="text-midnight-500 ml-1 text-xs">(1-31)</span>
            </label>
            <input
              type="text"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              placeholder="*"
              className="bg-midnight-100 border-midnight-200 text-midnight-900 focus:border-tertiary-50/50 w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-midnight-700 mb-2 block text-sm font-medium">
              Month
              <span className="text-midnight-500 ml-1 text-xs">(1-12)</span>
            </label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="*"
              className="bg-midnight-100 border-midnight-200 text-midnight-900 focus:border-tertiary-50/50 w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-midnight-700 mb-2 block text-sm font-medium">
              Weekday
              <span className="text-midnight-500 ml-1 text-xs">(0-6)</span>
            </label>
            <input
              type="text"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              placeholder="*"
              className="bg-midnight-100 border-midnight-200 text-midnight-900 focus:border-tertiary-50/50 w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <ToolPanel
            label="Cron Expression"
            accent="tertiary"
            action={<CopyButton text={expression} accent="tertiary" />}
          >
            <div className="text-tertiary-50 px-4 py-3 font-mono text-lg font-bold">
              {expression}
            </div>
          </ToolPanel>

          <ToolPanel label="Human Readable" accent="secondary">
            <div className="text-midnight-700 px-4 py-3 text-base">{explanation}</div>
          </ToolPanel>

          <div className="bg-midnight-100 border-midnight-200 rounded-sm border p-4">
            <h3 className="text-midnight-700 mb-2 text-sm font-medium">Note</h3>
            <p className="text-midnight-500 text-xs leading-relaxed">
              Use <code className="text-tertiary-50">*</code> for "any value",{' '}
              <code className="text-tertiary-50">*/5</code> for "every 5",{' '}
              <code className="text-tertiary-50">1,15</code> for specific values, or{' '}
              <code className="text-tertiary-50">1-5</code> for ranges.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  );
}
