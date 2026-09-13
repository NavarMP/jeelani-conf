import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Pass through static assets, media files, and internal next paths immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|wav|ogg|ico|json|txt|woff|woff2|ttf|eot)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  const segments = pathname.split('/');
  const isLocaleInPath = locales.includes(segments[1] as any);
  const pathWithoutLocale = isLocaleInPath
    ? '/' + segments.slice(2).join('/')
    : pathname;

  let defaultLocale = 'en';

  if (
    pathWithoutLocale === '/schedule' || pathWithoutLocale.startsWith('/schedule/') ||
    pathWithoutLocale === '/register/burda-qawwali' || pathWithoutLocale.startsWith('/register/burda-qawwali/')
  ) {
    defaultLocale = 'ml';
  }

  const handleI18nRouting = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed'
  });

  const response = handleI18nRouting(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLocaleAdmin = locales.some(loc => pathname.startsWith(`/${loc}/admin`) || pathname === `/${loc}/admin`);
  const isAdminRoute = pathname.startsWith('/admin') || isLocaleAdmin;
  
  const isLocaleLogin = locales.some(loc => pathname === `/${loc}/admin/login`);
  const isLoginPage = pathname === '/admin/login' || isLocaleLogin;

  if (isAdminRoute && !user && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|wav|ogg|ico|json|txt|woff|woff2|ttf|eot)$).*)',
  ],
};
