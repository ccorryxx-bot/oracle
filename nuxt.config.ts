import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-05-01',

  // ── Vercel SSR deployment ───────────────────
  ssr: true,
  nitro: {
    preset: 'vercel',
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
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  app: {
    head: {
      title: 'Oracle Market',
      titleTemplate: '%s · Oracle Market',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Myanmar #1 Game Website Marketplace — Buy & Sell premium game websites.' },
        { name: 'theme-color', content: '#07070F' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
