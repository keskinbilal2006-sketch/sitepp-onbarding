import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = ['/dashboard', '/tasks', '/staff', '/reports'];
const authPrefixes = ['/login', '/register'];

/**
 * Basit route guard:
 * - Protected route icin token cookie zorunlu
 * - Staff/Reports sadece ADMIN
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('sitepp_access_token')?.value;
  const role = request.cookies.get('sitepp_user_role')?.value;

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if ((pathname.startsWith('/staff') || pathname.startsWith('/reports')) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/staff/:path*', '/reports/:path*', '/login', '/register'],
};
