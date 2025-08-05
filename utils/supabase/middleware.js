import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

const protectedPaths = [ '/dashboard', '/']; // Example protected paths

export async function middleware(request) {
  const response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are available
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Middleware will not work properly.');
    return response;
  }

  const supabase = createMiddlewareSupabaseClient({
    supabaseUrl: supabaseUrl,
    supabaseKey: supabaseKey,
    getRequestCookies: () => {
      const cookieHeader = request.headers.get('cookie');
      const cookies = new Map();

      if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
          const [name, ...rest] = cookie.split('=');
          cookies.set(name.trim(), rest.join('='));
        });
      }

      return cookies;
    },
    setRequestCookies: (cookies) => {
      cookies.forEach((value, name) => {
        response.cookies.set(name, value);
      });
    },
    removeRequestCookies: (name) => {
      response.cookies.set(name, '', { maxAge: -1 });
    }
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const url = new URL(request.url);

  if (sessionData.session) {
    // User is authenticated
    if (url.pathname === '/login') {
      // Redirect authenticated user away from login page
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  } else {
    // User is not authenticated
    if (protectedPaths.includes(url.pathname)) {
      // Redirect unauthenticated user to login page
      return NextResponse.redirect(new URL('/login?next=' + url.pathname, request.url));
    }
    return response;
  }
}

export const config = {
  matcher: ['/protected', '/dashboard', '/'], // Paths where this middleware should run
};
