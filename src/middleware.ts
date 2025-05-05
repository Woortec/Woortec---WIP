// middleware.ts
import { NextResponse } from 'next/server';
import { createClient } from '../utils/supabase/server';

export default async function middleware(req: any) {
  try {
    const supabase = createClient();
    const { pathname } = req.nextUrl;
    const host = req.headers.get('host') || '';
    const subdomain = host.split('.')[0];

    const user = req.cookies.get('accessToken');
    const protectedPaths = ['/dashboard', '/private', '/settings', '/'];
    const publicPaths    = ['/auth/log-in', '/auth-sign-up', '/auth/callback', '/auth/reset-password', '/error'];

    const isRootPath     = pathname === '/';
    const isProtected    = protectedPaths.some((p) => pathname.startsWith(p));
    const isPublic       = publicPaths   .some((p) => pathname.startsWith(p));

    // 1) Internals & API
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // 2) ADMIN subdomain: only rewrite—no auth redirects
    if (subdomain === 'admin') {
      const url = req.nextUrl.clone();

      // **only** prefix when not already under /admin
      if (!pathname.startsWith('/admin')) {
        url.pathname = `/admin${pathname}`;
      }

      const res = NextResponse.rewrite(url);
      res.headers.set('Permissions-Policy', 'geolocation=(self)');
      return res;
    }

    // 3) APP subdomain: your existing redirects
    if (subdomain === 'app') {
      if ((isRootPath || isProtected) && !user && !isPublic) {
        return NextResponse.redirect(new URL('/auth/log-in', req.url));
      }
    }

    // 4) APP rewrite
    if (subdomain === 'app' && !pathname.startsWith('/app')) {
      const url = req.nextUrl.clone();
      url.pathname = `/app${pathname}`;
      const res = NextResponse.rewrite(url);
      res.headers.set('Permissions-Policy', 'geolocation=(self)');
      return res;
    }

    // 5) Fallback
    return NextResponse.next();
  } catch (error) {
    console.log('error in middleware', error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|assets|images).*)'],
};
