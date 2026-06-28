import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-05-01',

  // ── Vercel SSR deployment ───────────────────
  ssr: true,
  nitro: {
    preset: 'vercel',
  },

  // ── Route rules: auth pages client-side only ─
  // Fixes: event.req.headers.get is not a function
  // @supabase/ssr uses Web API Headers on server which
  // crashes in Vercel Node.js runtime
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
    url: process.env.SUPABASE_URL ?? '',
    key: process.env.SUPABASE_ANON_KEY ?? '',
    redirect: false,

    // ── PKCE fix: store code_verifier in cookies ──────────────────────────────
    // OAuth redirect (Google → app) ဖြစ်တဲ့အခါ localStorage က clear ဖြစ်နိုင်တယ်
    // Cookie ကတော့ OAuth redirect ကို survive လုပ်တယ် (sameSite: lax = top-level nav ✅)
    cookieOptions: {
      maxAge:   60 * 60 * 8, // 8 hours — PKCE verifier ကို ကြာကြာ မထားဘူး
      sameSite: 'lax',       // OAuth cross-site redirect မှာ cookie ပါလာဖို့
      secure:   true,        // HTTPS only (Vercel always HTTPS ✅)
      path:     '/',         // app တစ်ခုလုံး အတွက်
    },

    // ── Client auth options ───────────────────────────────────────────────────
    clientOptions: {
      auth: {
        flowType:          'pkce',  // PKCE = most secure OAuth flow
        detectSessionInUrl: true,   // callback URL ထဲက code ကို auto-detect
        persistSession:     true,   // session ကို cookie မှာ persist လုပ်
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
