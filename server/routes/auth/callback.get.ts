// Server-side PKCE callback handler
// ─────────────────────────────────────────────────────────────────────────────
// WHY server-side?
//   PKCE flow မှာ code_verifier ကို cookie မှာ သိမ်းထားတယ်။
//   Client-side (Nuxt SSR hydration gap) မှာ cookie ကို ဖတ်လို့ မရတာ
//   ကြောင့် "PKCE code verifier not found" error ထွက်တယ်။
//
//   Server route ကတော့ browser ဆီက request cookies ကို DIRECTLY ဖတ်တယ်
//   (request headers မှာ browser က code_verifier cookie ပါလာတယ်)
//   → exchangeCodeForSession server-side မှာ အမြဲ success ဖြစ်မယ်။
//
// FLOW:
//   1. Browser → Google OAuth
//   2. Google → /auth/callback?code=xxx  (browser request)
//   3. THIS server route intercepts (before page renders)
//   4. serverSupabaseClient reads cookies from request headers
//   5. exchangeCodeForSession(code) → Supabase sets session cookies
//   6. sendRedirect → /
// ─────────────────────────────────────────────────────────────────────────────

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query            = getQuery(event)
  const code             = query.code              as string | undefined
  const error            = query.error             as string | undefined
  const errorDescription = query.error_description as string | undefined

  // ── OAuth provider returned error (e.g. user denied) ──────────────────────
  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error)
    return sendRedirect(event, `/auth/login?auth_error=${msg}`, 302)
  }

  // ── No code in URL ─────────────────────────────────────────────────────────
  if (!code) {
    return sendRedirect(event, '/auth/login', 302)
  }

  // ── PKCE code exchange (server-side) ──────────────────────────────────────
  try {
    const supabase = await serverSupabaseClient(event)
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      const msg = encodeURIComponent(exchangeError.message)
      return sendRedirect(event, `/auth/login?auth_error=${msg}`, 302)
    }

    // ── Session set ✅ → redirect to app ──────────────────────────────────────
    return sendRedirect(event, '/', 302)

  } catch (e: any) {
    const msg = encodeURIComponent(e?.message ?? 'Unexpected auth error')
    return sendRedirect(event, `/auth/login?auth_error=${msg}`, 302)
  }
})
