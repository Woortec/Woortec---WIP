import { NextResponse } from 'next/server';
import { createClient } from '../utils/supabase/server';

export default async function middleware(req: any) {
  try {
    const supabase = createClient();
    const { pathname } = req.nextUrl;
    const host = (req.headers.get('host') || '').toLowerCase();
    const subdomain = host.split('.')[0];

    // Grab cookie *values*
    const user = req.cookies.get('accessToken')?.value;
    // (other cookies if you need them)
    // const providerLogin = req.cookies.get('…')?.value;

    // 1) Allow all _next/static and API calls
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // 2) ADMIN subdomain → rewrite into your /admin folder
    if (subdomain === 'admin') {
      const url = req.nextUrl.clone();
      if (!pathname.startsWith('/admin')) {
        url.pathname = `/admin${pathname}`;
      }
      const res = NextResponse.rewrite(url);
      res.headers.set('Permissions-Policy', 'geolocation=(self)');
      return res;
    }

    // 3) APP subdomain → just run your auth logic, no rewrites
    if (subdomain === 'app') {
      const protectedPaths = ['/dashboard', '/private', '/settings', '/'];
      const publicPaths    = ['/auth/log-in', '/auth-sign-up', '/auth/callback', '/auth/reset-password', '/error'];

      const isRoot      = pathname === '/';
      const isProtected = protectedPaths.some(p => pathname.startsWith(p));
      const isPublic    = publicPaths.some(p => pathname.startsWith(p));

      if ((isRoot || isProtected) && !user && !isPublic) {
        return NextResponse.redirect(new URL('/auth/log-in', req.url));
      }

      // allow everything else through
      const res = NextResponse.next();
      res.headers.set('Permissions-Policy', 'geolocation=(self)');
      return res;
    }

    // 4) any other host (e.g. your apex or www), just pass through
    return NextResponse.next();
  } catch (error) {
    console.error('middleware error', error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

// avoid blocking your static assets
export const config = {
  matcher: ['/((?!_next|favicon.ico|assets|images).*)'],
};
