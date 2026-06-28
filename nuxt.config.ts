import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-05-01',

  // ── Vercel SSR deployment ──────────────────────────────────────────────────
  ssr: true,
  nitro: { preset: 'vercel' },

  // ── Auth pages: client-side only ──────────────────────────────────────────
  // Fixes: event.req.headers.get is not a function
  // @supabase/ssr uses Web API Headers which crashes on Vercel Node.js runtime
  routeRules: {
    '/auth/**': { ssr: false },
  },

  modules: ['@nuxtjs/supabase', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  imports: {
    dirs: ['stores'],
  },

  supabase: {
    url:      process.env.SUPABASE_URL      ?? '',
    key:      process.env.SUPABASE_ANON_KEY ?? '',
    redirect: false,

    // ── Cookie storage for auth session ───────────────────────────────────────
    cookieOptions: {
      maxAge:   60 * 60 * 8,
      sameSite: 'lax',
      secure:   true,
      path:     '/',
    },

    // ── Implicit flow: tokens returned in URL hash (#access_token=...) ────────
    // WHY implicit instead of pkce:
    //   PKCE requires code_verifier storage across OAuth redirect.
    //   Nuxt SSR + Vercel environment makes this unreliable (cookie/storage gap).
    //   Implicit: tokens come directly in URL hash → client reads immediately.
    //   No server-side exchange needed → no @supabase/ssr server import → no crash.
    //   Can upgrade back to PKCE later with proper @supabase/ssr server setup.
    clientOptions: {
      auth: {
        flowType:          'implicit', // ← changed from 'pkce'
        detectSessionInUrl: true,      // auto-processes #access_token in URL
        persistSession:     true,
      },
    },
  },

  typescript: {
    strict:    true,
    typeCheck: false,
  },

  app: {
    head: {
      title:         'Oracle Market',
      titleTemplate: '%s · Oracle Market',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport',    content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Myanmar #1 Game Website Marketplace — Buy & Sell premium game websites.' },
        { name: 'theme-color', content: '#07070F' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel:  'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
