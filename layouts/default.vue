<template>
  <div class="min-h-screen flex flex-col" style="background:#07070F">

    <!-- ── Navbar ───────────────────────────────── -->
    <header class="sticky top-0 z-50 border-b backdrop-blur-md"
      style="border-color:rgba(255,255,255,0.06);background:rgba(7,7,15,0.85)">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <span class="font-display font-bold text-lg text-white">Oracle</span>
          <span class="text-xs font-semibold text-white px-2 py-0.5 rounded-full"
            style="background:#7C3AED">Market</span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink to="/" class="text-sm transition-colors"
            style="color:#94A3B8" active-class="!text-white">
            {{ t('nav_listings') }}
          </NuxtLink>
          <NuxtLink to="/sell" class="text-sm transition-colors"
            style="color:#94A3B8" active-class="!text-white">
            {{ t('nav_sell') }}
          </NuxtLink>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-2">

          <!-- ── Language toggle ────────────────── -->
          <button @click="toggleLocale"
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
            style="background:rgba(255,255,255,0.05)">
            <span :style="locale === 'en' ? 'color:#A78BFA' : 'color:#475569'">EN</span>
            <span style="color:#334155;margin:0 2px">/</span>
            <span :style="locale === 'my' ? 'color:#A78BFA' : 'color:#475569'">မြ</span>
          </button>

          <template v-if="user">
            <NuxtLink to="/dashboard"
              class="text-sm transition-colors hidden sm:block"
              style="color:#94A3B8">
              {{ t('nav_dashboard') }}
            </NuxtLink>
            <button class="relative p-2 rounded-lg" style="color:#64748B">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
            <button @click="signOut"
              class="text-sm px-3 py-1.5 rounded-lg transition"
              style="color:#94A3B8;background:rgba(255,255,255,0.05)">
              {{ t('nav_signout') }}
            </button>
          </template>

          <template v-else>
            <NuxtLink to="/auth/login"
              class="text-sm font-medium text-white px-4 py-2 rounded-xl transition-colors"
              style="background:#7C3AED"
              onmouseover="this.style.background='#6D28D9'"
              onmouseout="this.style.background='#7C3AED'">
              {{ t('nav_signin') }}
            </NuxtLink>
          </template>

        </div>
      </div>
    </header>

    <!-- ── Page content ─────────────────────────── -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- ── Footer ───────────────────────────────── -->
    <footer class="border-t py-8" style="border-color:rgba(255,255,255,0.06)">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-display font-semibold text-white text-sm">Oracle Market</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium"
            style="background:rgba(124,58,237,0.2);color:#A78BFA">Beta</span>
        </div>
        <p class="text-xs" style="color:#475569">
          © 2026 Oracle Market · Myanmar #1 Game Website Marketplace
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-xs" style="color:#475569">Terms</a>
          <a href="#" class="text-xs" style="color:#475569">Privacy</a>
          <a href="#" class="text-xs" style="color:#475569">Contact</a>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const user   = useSupabaseUser()
const { locale, t, toggleLocale } = useLocale()

async function signOut() {
  await client.auth.signOut()
  await navigateTo('/auth/login')
}
</script>
