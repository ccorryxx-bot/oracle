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
// IMPORTANT #2 — do NOT use any Nitro h3 sugar helper that touches headers
// in this file (getQuery, setResponseHeaders, sendRedirect, getRequestHeader).
//   Root cause (confirmed against nuxt/nuxt#33800, a currently-open upstream
//   issue): Nitro's PRODUCTION build occasionally miscompiles these helpers.
//   In a correct build, getRequestHeader(event, name) safely branches on the
//   request-object shape. In an affected production build, that call gets
//   inlined/optimized into a direct `event.req.headers.get(name)`, which
//   assumes a Web-standard Headers instance. On this deployment, event.req
//   is the classic Node plain-object-headers shape, so `.get` doesn't exist
//   and every one of these helpers throws — this is NOT a Vercel-specific or
//   Supabase-specific bug, it reproduces on plain Node/Netlify/Railway builds
//   too, since it lives in Nitro's own bundler output, not the host platform.
//   We've now hit it twice in this exact file (getQuery → ERR_INVALID_URL,
//   setResponseHeaders → "Cannot read properties of undefined (reading
//   'set')"). Fix: talk to the underlying Node req/res objects directly via
//   event.node.req / event.node.res, which use the plain classic Node HTTP
//   API (.setHeader(), .statusCode, .end()) and are unaffected by this bug.
// ─────────────────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const res = event.node.res

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
  // Safe to redirect here: error cases never carry hash tokens, only query
  // params. Using raw res.setHeader/res.end instead of h3's sendRedirect()
  // — same miscompilation risk applies to every h3 sugar helper in this file.
  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error)
    res.statusCode = 302
    res.setHeader('location', `/auth/login?auth_error=${msg}`)
    res.end()
    return
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

  res.setHeader('content-type', 'text/html;charset=UTF-8')
  res.setHeader('cache-control', 'no-store, no-cache, must-revalidate')
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('referrer-policy', 'no-referrer')

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
