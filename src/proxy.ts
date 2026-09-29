import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, splitLocale } from '@/i18n/config';

/**
 * Sections removed from the site for good. 410 Gone tells crawlers to drop these
 * URLs from the index faster than a 404 would.
 */
const GONE_SECTIONS = ['/tools', '/games', '/blog'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (GONE_SECTIONS.some((section) => pathname === section || pathname.startsWith(`${section}/`))) {
    return new NextResponse('Gone', { status: 410, headers: { 'X-Robots-Tag': 'noindex' } });
  }

  const { locale, path } = splitLocale(pathname);
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
