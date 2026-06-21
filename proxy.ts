import { NextRequest, NextResponse } from 'next/server';
import { LOCALE_COOKIE_NAME, LOCALE_HEADER_NAME, normalizeLocale } from '@/lib/locale';

export function proxy(request: NextRequest) {
  const langParam = request.nextUrl.searchParams.get('lang');
  if (!langParam) return NextResponse.next();

  const locale = normalizeLocale(langParam);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER_NAME, locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
