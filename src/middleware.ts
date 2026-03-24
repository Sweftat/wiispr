import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/2fa')) {
    const userId = req.cookies.get('wiispr_user_id')?.value
    if (!userId) return NextResponse.redirect(new URL('/', req.url))

    // If 2FA verified this session, allow through
    const twoFaVerified = req.cookies.get('wiispr_2fa_verified')?.value
    if (twoFaVerified !== '1') {
      // Check if this admin has 2FA enabled
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=totp_enabled,is_admin`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
          }
        )
        const data = await res.json()
        const user = data?.[0]
        if (user?.is_admin && user?.totp_enabled) {
          return NextResponse.redirect(new URL('/admin/2fa', req.url))
        }
      } catch {
        // If check fails, allow through
      }
    }
  }

  // Maintenance mode check — skip for admin, api, maintenance page itself, auth, and static files
  const skip = pathname.startsWith('/admin') || pathname.startsWith('/api') ||
    pathname.startsWith('/maintenance') || pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') || pathname.includes('.')

  if (!skip) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_settings?key=eq.maintenance&select=value`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
          cache: 'no-store',
        }
      )
      const data = await res.json()
      if (data?.[0]?.value?.enabled === true) {
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    } catch {
      // If DB is unreachable, allow through
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
