import { NextResponse } from 'next/server';
import { createClient } from '../utils/supabase/server';

export default async function middleware(req: any) {
  try {
    const supabase = createClient();
    const { pathname } = req.nextUrl;

    const user = req.cookies.get('accessToken');
    const providerLogin = req.cookies.get('sb-uvhvgcrczfdfvoujarga-auth-token-code-verifier');

    const protectedPaths = ['/dashboard', '/private', '/settings', '/'];

    const isRootPath = pathname === '/';
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }


    const response = NextResponse.next();

    // Set the Permissions-Policy header without the unrecognized 'ch-ua-form-factor'
    response.headers.set('Permissions-Policy', 'geolocation=(self)'); // Example of a valid policy

    return response;
  } catch (error) {
    console.log('error in middleware', error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
}
