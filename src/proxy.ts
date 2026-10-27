import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, localePath, splitLocale } from '@/i18n/config';
import { TOOLS_PATH } from '@/lib/data/tools';
import { presetForQuery, presetPath } from '@/lib/data/tool-presets';

/**
 * Sections removed from the site for good. 410 Gone tells crawlers to drop these
 * URLs from the index faster than a 404 would.
 */
const GONE_SECTIONS = ['/games', '/blog'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (GONE_SECTIONS.some((section) => pathname === section || pathname.startsWith(`${section}/`))) {
    return new NextResponse('Gone', { status: 410, headers: { 'X-Robots-Tag': 'noindex' } });
  }

  const { locale, path } = splitLocale(pathname);

  // The tools section is English-only; its translated URLs are gone.
  if (locale !== DEFAULT_LOCALE && (path === TOOLS_PATH || path.startsWith(`${TOOLS_PATH}/`))) {
    return new NextResponse('Gone', { status: 410, headers: { 'X-Robots-Tag': 'noindex' } });
  }

  // `/tools/generate?mode=ids&kind=uuid-v4` → `/tools/generate/uuid-generator`: the preset page
  // is the indexable URL for that view, so a permanent redirect consolidates the two.
  const preset = presetForQuery(path, request.nextUrl.searchParams);
  if (preset) {
    const url = request.nextUrl.clone();
    url.pathname = localePath(locale, presetPath(preset));
    for (const name of Object.keys(preset.params)) url.searchParams.delete(name);
    return NextResponse.redirect(url, 308);
  }

  const isPrefixed = pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);

  if (isPrefixed) {
    if (locale !== DEFAULT_LOCALE) return NextResponse.next();
    // The default locale lives at unprefixed URLs only: `/en/projects` → `/projects`.
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  // Unprefixed → serve the default-locale route without changing the URL.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except Next internals, API routes and files (sitemap.xml, robots.txt, icons, PDF…).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
