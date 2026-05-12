import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/login' || pathname === '/landing' || pathname === '/') {
    return NextResponse.next()
  }
  
  const token = request.cookies.get('sb-gbxedknmmpfwvgkekmng-auth-token')
  const token2 = request.cookies.get('sb-gbxedknmmpfwvgkekmng-auth-token.0')
  
  if (!token && !token2) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
