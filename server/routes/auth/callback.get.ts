// OAuth Callback Gateway  —  Nuxt/Nitro server route
// ─────────────────────────────────────────────────────────────────────────────
// WHY this file exists
//   In Nuxt 3, server/routes/ takes priority over pages/ for the same path.
//   Every GET /auth/callback is intercepted here before pages/auth/callback.vue
//   (or any other page) ever gets a chance to render.
//
// WHY we serve HTML + JS instead of a 302 redirect
//   HTTP 302 redirects do NOT preserve URL hash fragments (#access_token=…).
//   The browser strips the hash before following the redirect, so implicit-flow
//   OAuth tokens would be silently lost.
//   A JS redirect (window.location.replace) runs client-side: it can read the
//   hash from the current page and forward it to the next URL intact.
//
// Flow
//   Google/Supabase → GET /auth/callback[?code=…|#access_token=…]
//     ↓  (this file)
//   HTML bridge page is served immediately
//     ↓  (browser executes inline <script>)
//   window.location.replace('/auth/confirm' + search + hash)
//     ↓
//   pages/auth/confirm.vue  (SPA, ssr:false)  handles every auth scenario
//
// IMPORTANT — do NOT import @supabase/ssr or any package that is not listed
// in package.json as a direct dependency.  Transitive deps are not reliably
// bundled by Nitro for Vercel serverless functions → instant 500.
//
// IMPORTANT #2 — do NOT use Nitro's getQuery(event) here.
//   On this project's current Vercel deployment, getQuery() internally builds
//   `new URL(event.path)` with NO base argument. event.path is a relative
//   string ("/auth/callback?code=..."), and `new URL()` throws
//   `TypeError: Invalid URL` on relative input — confirmed in production
//   runtime logs (statusCode 500, code: 'ERR_INVALID_URL') every time Google
//   redirected back with ?code=. This single line was taking down 100% of
//   OAuth logins. We parse the query string ourselves below with an explicit
//   base, and never let a parse failure crash the handler.
// ─────────────────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  let error: string | undefined
  let errorDescription: string | undefined

  try {
    const rawUrl = event.node?.req?.url ?? event.path ?? ''
    const url    = new URL(rawUrl, 'http://localhost') // base avoids ERR_INVALID_URL on relative paths
    error            = url.searchParams.get('error') ?? undefined
    errorDescription = url.searchParams.get('error_description') ?? undefined
  } catch {
    // Parsing failed for some unexpected reason — fall through and serve the
    // JS bridge page anyway. pages/auth/confirm.vue will classify whatever
    // ends up in the URL client-side. We never want a query-parsing edge case
    // to be why a user can't log in.
  }

  // ── Explicit OAuth provider error ─────────────────────────────────────────
  // Safe to 302 here: error cases never carry hash tokens, only query params.
  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error)
    return sendRedirect(event, `/auth/login?auth_error=${msg}`, 302)
  }

  // ── All other cases: serve the JS bridge page ─────────────────────────────
  // Covers:
  //   • Implicit OAuth  →  #access_token=… in hash  (server never sees hash)
  //   • PKCE code       →  ?code=…          in query
  //   • Email confirm   →  ?token_hash=…&type=… in query
  //   • Bare callback   →  no params at all
  //
  // The inline <script> reads both window.location.search AND .hash from the
  // BROWSER (not from this server handler) and forwards them to /auth/confirm.
  // This is the only way to keep hash-based tokens alive across a "redirect".

  setResponseHeaders(event, {
    'content-type':           'text/html;charset=UTF-8',
    'cache-control':          'no-store, no-cache, must-revalidate',
    'x-content-type-options': 'nosniff',
    'referrer-policy':        'no-referrer',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Oracle Market — Authenticating</title>
  <style>
    *  { box-sizing:border-box; margin:0; padding:0 }
    body {
      background: #07070F;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; font-family: sans-serif;
    }
    .wrap { text-align:center; display:flex; flex-direction:column;
            align-items:center; gap:14px }
    .spin {
      width:36px; height:36px;
      border:2.5px solid #7C3AED; border-top-color:transparent;
      border-radius:50%; animation:spin .75s linear infinite;
    }
    p { color:#64748B; font-size:13px; letter-spacing:.01em }
    @keyframes spin { to { transform:rotate(360deg) } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="spin"></div>
    <p>Authenticating&hellip;</p>
  </div>

  <script>
    // ── JS-redirect bridge ────────────────────────────────────────────────
    // window.location.search  →  query params (?code=… / ?token_hash=…)
    // window.location.hash    →  hash fragment (#access_token=…)
    // Both are read CLIENT-SIDE so the hash is never stripped.
    try {
      var target = '/auth/confirm'
                 + window.location.search   // preserve ?code=… / ?token_hash=…
                 + window.location.hash;    // preserve #access_token=…
      window.location.replace(target);
    } catch (_) {
      // Safety fallback — should never be reached
      window.location.replace('/auth/login');
    }
  </script>
</body>
</html>`
})
