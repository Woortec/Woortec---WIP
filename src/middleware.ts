import { NextResponse } from 'next/server';
import { createClient } from '../utils/supabase/server';

export default async function middleware(req: any) {
  try {
    const supabase = createClient();
    const { pathname } = req.nextUrl;
    const host = req.headers.get('host') || '';
    const subdomain = host.split('.')[0];

    const user = req.cookies.get('accessToken')?.value;
    const providerLogin = req.cookies.get('sb-uvhvgcrczfdfvoujarga-auth-token-code-verifier')?.value;

    const protectedPaths = ['/dashboard', '/private', '/settings', '/'];
    const publicPaths = ['/auth/log-in', '/auth/sign-up', '/auth/callback', '/auth/reset-password', '/error'];

    const isRootPath = pathname === '/';
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
    const isPublic = publicPaths.some((p) => pathname.startsWith(p));

    // 1. Bypass internal and API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // 2. Admin domain — just rewrite to /admin/*
    if (subdomain === 'admin') {
      const url = req.nextUrl.clone();
      if (!pathname.startsWith('/admin')) {
        url.pathname = `/admin${pathname}`;
      }
      const res = NextResponse.rewrite(url);
      res.headers.set('Permissions-Policy', 'geolocation=(self)');
      return res;
    }

    // 3. App domain — handle auth + rewrite to /app/*
    if (subdomain === 'app') {
      if ((isRootPath || isProtected) && !user && !isPublic) {
        return NextResponse.redirect(new URL('/auth/log-in', req.url));
      }

      if (!pathname.startsWith('/app')) {
        const url = req.nextUrl.clone();
        url.pathname = `/app${pathname}`;
        const res = NextResponse.rewrite(url);
        res.headers.set('Permissions-Policy', 'geolocation=(self)');
        return res;
      }
    }

    // 4. Fallback
    const res = NextResponse.next();
    res.headers.set('Permissions-Policy', 'geolocation=(self)');
    return res;
  } catch (error) {
    console.log('error in middleware', error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

// Matcher config to avoid blocking static files
export const config = {
  matcher: ['/((?!_next|favicon.ico|assets|images).*)'],
};
