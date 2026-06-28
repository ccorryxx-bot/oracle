// Server-side PKCE callback — Vercel Node.js compatible
// ─────────────────────────────────────────────────────────────────────────────
// WHY this approach:
//   serverSupabaseClient() → @supabase/ssr → event.req.headers.get('cookie')
//   Node.js IncomingMessage မှာ .get() မရှိဘူး → Vercel မှာ 500 crash
//
//   Fix: createServerClient မှ H3's parseCookies / setCookie ကို directly pass
//   H3 က event.node.req.headers['cookie'] (bracket notation) သုံးတယ် ✅
//   Vercel Node.js runtime မှာ အကြောင်းမရှိဘူး
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie }  from 'h3'

export default defineEventHandler(async (event) => {
  const query            = getQuery(event)
  const code             = query.code              as string | undefined
  const error            = query.error             as string | undefined
  const errorDescription = query.error_description as string | undefined

  // ── OAuth provider returned error ─────────────────────────────────────────
  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error)
    return sendRedirect(event, `/auth/login?auth_error=${msg}`, 302)
  }

  // ── No code ───────────────────────────────────────────────────────────────
  if (!code) {
    return sendRedirect(event, '/auth/login', 302)
  }

  // ── PKCE code exchange (server-side, Vercel-safe) ─────────────────────────
  try {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          // H3 parseCookies uses event.node.req.headers['cookie'] ← works on Vercel ✅
          getAll() {
            return Object.entries(parseCookies(event)).map(([name, value]) => ({
              name,
              value,
            }))
          },
          // H3 setCookie writes Set-Cookie headers in the response ✅
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              setCookie(event, name, value, {
                ...options,
                sameSite: 'lax',
                secure:   true,
                path:     '/',
              })
            })
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      const msg = encodeURIComponent(exchangeError.message)
      return sendRedirect(event, `/auth/login?auth_error=${msg}`, 302)
    }

    // ── Session set ✅ ─────────────────────────────────────────────────────
    return sendRedirect(event, '/', 302)

  } catch (e: any) {
    const msg = encodeURIComponent(e?.message ?? 'Unexpected server error')
    return sendRedirect(event, `/auth/login?auth_error=${msg}`, 302)
  }
})
