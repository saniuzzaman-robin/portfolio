/*
 * Cron expression parser. Unix (Vixie) syntax: 5 fields, or 6 with seconds first. Quartz syntax
 * (toggle): 6 or 7 fields (seconds first, optional year), `?`, `L`, `W` and `#`, with days of
 * the week numbered 1–7 from Sunday. Days of the week are normalized to 0–6 from Sunday.
 */

export type CronField =
  'second' | 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'year';

const FIELD_NAMES: Record<CronField, string> = {
  second: 'Second',
  minute: 'Minute',
  hour: 'Hour',
  dayOfMonth: 'Day of month',
  month: 'Month',
  dayOfWeek: 'Day of week',
  year: 'Year',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** Shorthands from Vixie cron. `@reboot` has no schedule, so it is rejected. */
export const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

/** Quartz day rules, with weekdays normalized to 0–6 from Sunday. */
export type DayRule =
  | { kind: 'last'; offset: number } // L, L-3 (day of month)
  | { kind: 'lastWeekday' } // LW
  | { kind: 'nearestWeekday'; day: number } // 15W
  | { kind: 'nth'; weekday: number; nth: number } // 5#3 (day of week)
  | { kind: 'lastOf'; weekday: number }; // 5L, and L alone (Saturday)

export type ParsedField = {
  field: CronField;
  text: string;
  /** Offsets of the field in the expression as typed (for a macro, the whole macro). */
  from: number;
  to: number;
  /** Matching values, sorted (days of the week 0–6). */
  values: number[];
  rules: DayRule[];
  /** Starts with `*`: Vixie treats such day fields as unrestricted and such jobs as "wildcard". */
  wildcard: boolean;
  /** `?` (Quartz): this day field doesn't apply. */
  unspecified: boolean;
};

export type CronExpression = {
  fields: Record<CronField, ParsedField | undefined>;
  /** The fields in the order they were written. */
  order: CronField[];
  quartz: boolean;
  /** The macro the expression came from, if any. */
  macro?: string;
  /** The expression with any macro expanded. */
  expanded: string;
};

export type CronError = { message: string; from: number; to: number; field?: CronField };
export type CronParse = { ok: true; cron: CronExpression } | { ok: false; error: CronError };

export const FIELD_ORDERS: Record<string, CronField[]> = {
  unix5: ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
  unix6: ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
  quartz6: ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
  quartz7: ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek', 'year'],
};

function bounds(field: CronField, quartz: boolean): [number, number] {
  switch (field) {
    case 'second':
    case 'minute':
      return [0, 59];
    case 'hour':
      return [0, 23];
    case 'dayOfMonth':
      return [1, 31];
    case 'month':
      return [1, 12];
    case 'dayOfWeek':
      return quartz ? [1, 7] : [0, 7];
    case 'year':
      return [1970, 2099];
  }
}

class FieldError extends Error {
  constructor(
    message: string,
    readonly offset = 0,
    readonly length = 0
  ) {
    super(message);
  }
}

/** Parses an expression; errors point at the offending field. */
export function parseCron(text: string, options: { quartz: boolean }): CronParse {
  const { quartz } = options;
  const trimmed = text.trim();
  const lead = text.length - text.trimStart().length;
  if (trimmed === '')
    return { ok: false, error: { message: 'Enter a cron expression.', from: 0, to: 0 } };

  let source = text;
  let macro: string | undefined;
  if (trimmed.startsWith('@')) {
    const expansion = MACROS[trimmed.toLowerCase()];
    if (!expansion) {
      const message =
        trimmed.toLowerCase() === '@reboot'
          ? '@reboot runs at startup and has no schedule.'
          : `Unknown macro ${trimmed}. Use @yearly, @monthly, @weekly, @daily or @hourly.`;
      return { ok: false, error: { message, from: lead, to: lead + trimmed.length } };
    }
    macro = trimmed.toLowerCase();
    // Quartz wants seconds and a `?` day.
    source = quartz
      ? `0 ${expansion.replace(/\*$/, '?').replace(/ \* \* 0$/, ' ? * 1')}`
      : expansion;
  }

  const tokens = [...source.matchAll(/\S+/g)].map((match) => ({
    text: match[0],
    from: macro ? lead : (match.index ?? 0),
    to: macro ? lead + trimmed.length : (match.index ?? 0) + match[0].length,
  }));
  const order = quartz
    ? FIELD_ORDERS[`quartz${tokens.length}`]
    : FIELD_ORDERS[`unix${tokens.length}`];
  if (!order) {
    const expected = quartz
      ? '6 or 7 fields (seconds first, optional year)'
      : '5 fields, or 6 with seconds first';
    return {
      ok: false,
      error: {
        message: `Expected ${expected}; found ${tokens.length}.`,
        from: lead,
        to: lead + trimmed.length,
      },
    };
  }

  const fields: CronExpression['fields'] = {
    second: undefined,
    minute: undefined,
    hour: undefined,
    dayOfMonth: undefined,
    month: undefined,
    dayOfWeek: undefined,
    year: undefined,
  };
  for (const [index, field] of order.entries()) {
    const token = tokens[index];
    try {
      fields[field] = parseField(field, token.text, quartz, token.from, token.to);
    } catch (error) {
      if (!(error instanceof FieldError)) throw error;
      const from = macro ? token.from : token.from + error.offset;
      const to = macro ? token.to : error.length ? from + error.length : token.to;
      return {
        ok: false,
        error: { message: `${FIELD_NAMES[field]}: ${error.message}`, from, to, field },
      };
    }
  }

  const dom = fields.dayOfMonth;
  const dow = fields.dayOfWeek;
  if (quartz && dom && dow && dom.unspecified === dow.unspecified) {
    const token = tokens[order.indexOf('dayOfMonth')];
    return {
      ok: false,
      error: {
        message: dom.unspecified
          ? 'Quartz: only one of day of month and day of week can be ?.'
          : 'Quartz: set either day of month or day of week to ?.',
        from: token.from,
        to: tokens[order.indexOf('dayOfWeek')].to,
        field: 'dayOfMonth',
      },
    };
  }

  return {
    ok: true,
    cron: { fields, order, quartz, macro, expanded: tokens.map((token) => token.text).join(' ') },
  };
}

const QUARTZ_ONLY = 'needs the Quartz option';

function parseField(
  field: CronField,
  text: string,
  quartz: boolean,
  from: number,
  to: number
): ParsedField {
  const [min, max] = bounds(field, quartz);
  const values = new Set<number>();
  const rules: DayRule[] = [];
  const isDay = field === 'dayOfMonth' || field === 'dayOfWeek';

  if (text === '?') {
    if (!isDay) throw new FieldError('? is only allowed in the day fields.');
    if (!quartz) throw new FieldError(`? ${QUARTZ_ONLY}.`);
    return { field, text, from, to, values: [], rules, wildcard: false, unspecified: true };
  }

  const names = field === 'month' ? MONTHS : field === 'dayOfWeek' ? DAYS : null;
  const value = (token: string, offset: number): number => {
    const index = names?.indexOf(token.toUpperCase()) ?? -1;
    let number: number;
    if (index >= 0) {
      number = field === 'month' ? index + 1 : quartz ? index + 1 : index;
    } else if (/^\d+$/.test(token)) {
      number = Number(token);
    } else {
      throw new FieldError(
        `“${token}” is not a number${names ? ' or a name' : ''}.`,
        offset,
        token.length
      );
    }
    if (number < min || number > max) {
      throw new FieldError(`${token} is out of range (${min}–${max}).`, offset, token.length);
    }
    return number;
  };
  /** Days of the week as 0–6 from Sunday, whichever numbering was used. */
  const weekday = (number: number) => (quartz ? number - 1 : number % 7);

  let offset = 0;
  for (const part of text.split(',')) {
    const at = offset;
    offset += part.length + 1;
    if (part === '') throw new FieldError('Empty list item.', at, 1);
    const special = quartz ? quartzRule(field, part, at, value, weekday) : null;
    if (special) {
      rules.push(special);
      continue;
    }
    if (!quartz && isDay && /^(?:L|LW|L-\d+|\d+W|\w+L|\w+#\d+)$/i.test(part))
      throw new FieldError(`L, W and # ${QUARTZ_ONLY}.`, at, part.length);

    const [range, stepText, extra] = part.split('/');
    if (extra !== undefined)
      throw new FieldError(`“${part}” has more than one /.`, at, part.length);
    let step = 1;
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText) || Number(stepText) === 0) {
        throw new FieldError(
          `Step “${stepText}” must be a whole number from 1.`,
          at + range.length + 1,
          stepText.length || 1
        );
      }
      step = Number(stepText);
    }
    let start: number;
    let end: number;
    if (range === '*') {
      [start, end] = [min, max];
    } else if (range.includes('-')) {
      const [low, high, more] = range.split('-');
      if (more !== undefined || low === '' || high === '') {
        throw new FieldError(`“${range}” is not a valid range.`, at, range.length);
      }
      start = value(low, at);
      end = value(high, at + low.length + 1);
      if (start > end) throw new FieldError(`Range ${range} runs backwards.`, at, range.length);
    } else {
      start = value(range, at);
      // `5/15` means from 5 to the end, in steps of 15.
      end = stepText !== undefined ? max : start;
    }
    for (let current = start; current <= end; current += step) {
      values.add(field === 'dayOfWeek' ? weekday(current) : current);
    }
  }

  return {
    field,
    text,
    from,
    to,
    values: [...values].sort((a, b) => a - b),
    rules,
    wildcard: text.startsWith('*'),
    unspecified: false,
  };
}

function quartzRule(
  field: CronField,
  part: string,
  at: number,
  value: (token: string, offset: number) => number,
  weekday: (number: number) => number
): DayRule | null {
  const upper = part.toUpperCase();
  if (field === 'dayOfMonth') {
    if (upper === 'L') return { kind: 'last', offset: 0 };
    if (upper === 'LW') return { kind: 'lastWeekday' };
    const lastOffset = /^L-(\d+)$/.exec(upper);
    if (lastOffset) {
      const days = Number(lastOffset[1]);
      if (days > 30) throw new FieldError(`L-${days} is more than 30 days back.`, at, part.length);
      return { kind: 'last', offset: days };
    }
    const nearest = /^(\d+)W$/.exec(upper);
    if (nearest) return { kind: 'nearestWeekday', day: value(nearest[1], at) };
  }
  if (field === 'dayOfWeek') {
    if (upper === 'L') return { kind: 'lastOf', weekday: 6 };
    const last = /^(\w+)L$/.exec(upper);
    if (last) return { kind: 'lastOf', weekday: weekday(value(last[1], at)) };
    const nth = /^(\w+)#(\d+)$/.exec(upper);
    if (nth) {
      const count = Number(nth[2]);
      if (count < 1 || count > 5) {
        throw new FieldError(`#${nth[2]} must be 1–5.`, at + nth[1].length, nth[2].length + 1);
      }
      return { kind: 'nth', weekday: weekday(value(nth[1], at)), nth: count };
    }
  }
  return null;
}

/** Day-of-week numbers moved by `by` (Unix 0–7 ↔ Quartz 1–7); steps and `#n` stay as they are. */
const shiftWeekdays = (text: string, by: 1 | -1) =>
  text.replace(/(^|[^#/\d])(\d+)/g, (_, before: string, number: string) => {
    const value = Number(number);
    return before + (by > 0 ? (value % 7) + 1 : value - 1);
  });

/**
 * Rewrites an expression in the other syntax (Unix ↔ Quartz), or null when it has no
 * equivalent: L/W/#, a year, or two restricted day fields (Vixie ORs them; Quartz can't).
 */
export function switchSyntax(cron: CronExpression, toQuartz: boolean): string | null {
  if (toQuartz === cron.quartz) return cron.expanded;
  const text = (field: CronField) => cron.fields[field]?.text ?? '*';
  let dom = text('dayOfMonth');
  let dow = text('dayOfWeek');
  if (toQuartz) {
    if (dow === '*') dow = '?';
    else if (dom === '*') dom = '?';
    else return null;
    if (dow !== '?') dow = shiftWeekdays(dow, 1);
    const second = cron.fields.second?.text ?? '0';
    return [second, text('minute'), text('hour'), dom, text('month'), dow].join(' ');
  }
  const { dayOfMonth, dayOfWeek, year } = cron.fields;
  if ((year && year.text !== '*') || dayOfMonth?.rules.length || dayOfWeek?.rules.length)
    return null;
  dom = dom === '?' ? '*' : dom;
  dow = dow === '?' ? '*' : shiftWeekdays(dow, -1);
  const second = text('second');
  return [
    ...(second === '0' ? [] : [second]),
    text('minute'),
    text('hour'),
    dom,
    text('month'),
    dow,
  ].join(' ');
}
