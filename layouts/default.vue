<template>
  <div class="min-h-screen flex flex-col bg-bg">

    <!-- ── Navbar (frameless, blur-only) ───────── -->
    <header class="sticky top-0 z-40 backdrop-blur-md bg-[color:var(--color-overlay)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
          <span class="font-display font-bold text-lg text-text-strong">Oracle</span>
          <span class="text-xs font-semibold text-text-strong px-2 py-0.5 rounded-full bg-primary">
            Market
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink to="/"
            class="text-sm text-text-muted hover:text-text-strong transition-colors"
            active-class="!text-text-strong">
            {{ t('nav_listings') }}
          </NuxtLink>
          <NuxtLink to="/sell"
            class="text-sm text-text-muted hover:text-text-strong transition-colors"
            active-class="!text-text-strong">
            {{ t('nav_sell') }}
          </NuxtLink>
        </nav>

        <!-- Right side (desktop) -->
        <div class="flex items-center gap-3">

          <!-- Language toggle -->
          <button @click="toggleLocale"
            class="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-surface-hover transition-colors">
            <span :class="locale === 'en' ? 'text-accent' : 'text-text-faint'">EN</span>
            <span class="text-text-faint mx-0.5">/</span>
            <span :class="locale === 'my' ? 'text-accent' : 'text-text-faint'">မြ</span>
          </button>

          <template v-if="user">
            <NuxtLink to="/dashboard"
              class="hidden md:block text-sm text-text-muted hover:text-text-strong transition-colors">
              {{ t('nav_dashboard') }}
            </NuxtLink>
            <button @click="signOut"
              class="hidden md:inline-flex text-sm px-3 py-1.5 rounded-lg text-text-muted hover:text-text-strong hover:bg-surface-hover transition-colors">
              {{ t('nav_signout') }}
            </button>
          </template>

          <template v-else>
            <NuxtLink to="/auth/login"
              class="hidden md:inline-flex text-sm font-medium text-text-strong px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover transition-colors">
              {{ t('nav_signin') }}
            </NuxtLink>
          </template>

          <!-- Hamburger (mobile only) -->
          <button @click="mobileOpen = true"
            class="md:hidden p-2 -mr-2 text-text rounded-lg hover:bg-surface-hover transition-colors"
            aria-label="Open menu">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ── Mobile drawer ────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="mobileOpen"
        class="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm"
        @click="mobileOpen = false" />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="translate-x-full" leave-to-class="translate-x-full">
      <aside v-if="mobileOpen"
        class="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden bg-bg flex flex-col"
        @click.stop>
        <div class="flex items-center justify-between h-16 px-5">
          <span class="font-display font-bold text-text-strong">Menu</span>
          <button @click="mobileOpen = false"
            class="p-2 -mr-2 text-text-muted hover:text-text-strong"
            aria-label="Close menu">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
          <NuxtLink to="/" @click="mobileOpen = false"
            class="px-3 py-3 rounded-xl text-base text-text hover:bg-surface-hover transition-colors">
            {{ t('nav_listings') }}
          </NuxtLink>
          <NuxtLink to="/sell" @click="mobileOpen = false"
            class="px-3 py-3 rounded-xl text-base text-text hover:bg-surface-hover transition-colors">
            {{ t('nav_sell') }}
          </NuxtLink>
          <NuxtLink v-if="user" to="/dashboard" @click="mobileOpen = false"
            class="px-3 py-3 rounded-xl text-base text-text hover:bg-surface-hover transition-colors">
            {{ t('nav_dashboard') }}
          </NuxtLink>

          <div class="my-3 h-px bg-divider mx-3" />

          <button @click="toggleLocale"
            class="flex items-center justify-between px-3 py-3 rounded-xl text-base text-text-muted hover:bg-surface-hover transition-colors">
            <span>Language</span>
            <span class="flex items-center gap-1 text-xs font-semibold">
              <span :class="locale === 'en' ? 'text-accent' : 'text-text-faint'">EN</span>
              <span class="text-text-faint">/</span>
              <span :class="locale === 'my' ? 'text-accent' : 'text-text-faint'">မြ</span>
            </span>
          </button>
        </nav>

        <div class="p-4">
          <button v-if="user" @click="() => { mobileOpen = false; signOut() }"
            class="w-full py-3 rounded-xl text-sm text-text-muted hover:bg-surface-hover transition-colors">
            {{ t('nav_signout') }}
          </button>
          <NuxtLink v-else to="/auth/login" @click="mobileOpen = false"
            class="block text-center py-3 rounded-xl text-sm font-medium text-text-strong bg-primary hover:bg-primary-hover transition-colors">
            {{ t('nav_signin') }}
          </NuxtLink>
        </div>
      </aside>
    </Transition>

    <!-- ── Page content ─────────────────────────── -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- ── Footer (frameless) ───────────────────── -->
    <footer class="py-10 mt-12">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-display font-semibold text-text-strong text-sm">Oracle Market</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium text-accent bg-primary/10">
            Beta
          </span>
        </div>
        <p class="text-xs text-text-faint text-center">
          © 2026 Oracle Market · Myanmar #1 Game Website Marketplace
        </p>
        <div class="flex items-center gap-5">
          <a href="#" class="text-xs text-text-faint hover:text-text-muted transition-colors">Terms</a>
          <a href="#" class="text-xs text-text-faint hover:text-text-muted transition-colors">Privacy</a>
          <a href="#" class="text-xs text-text-faint hover:text-text-muted transition-colors">Contact</a>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const user   = useSupabaseUser()
const route  = useRoute()
const { locale, t, toggleLocale } = useLocale()

const mobileOpen = ref(false)

// Close drawer on route change
watch(() => route.fullPath, () => { mobileOpen.value = false })

async function signOut() {
  await client.auth.signOut()
  await navigateTo('/auth/login')
}
</script>
