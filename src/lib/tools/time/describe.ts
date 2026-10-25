/** Locales cronstrue has that the site uses; others (Bengali) get English. */
const LOCALES: Partial<Record<string, () => Promise<unknown>>> = {
  ar: () => import('cronstrue/locales/ar'),
};

/**
 * A sentence describing a valid expression ("At 09:00 AM, Monday through Friday"), via cronstrue
 * loaded on demand. Null if cronstrue can't describe it; a rejection means it failed to load.
 */
export async function describeCron(
  expression: string,
  options: { locale: string; quartz: boolean }
): Promise<string | null> {
  const { default: cronstrue } = await import('cronstrue');
  const loadLocale = LOCALES[options.locale];
  if (loadLocale) await loadLocale();
  try {
    return cronstrue.toString(expression, {
      locale: loadLocale ? options.locale : 'en',
      dayOfWeekStartIndexZero: !options.quartz,
      use24HourTimeFormat: options.locale !== 'en',
      throwExceptionOnParseError: true,
    });
  } catch {
    // cronstrue throws plain strings for syntax it doesn't know; our parser already validated.
    return null;
  }
}
