<template>
  <div class="min-h-screen flex" style="background:#07070F">

    <!-- ── Sidebar ─────────────────────────────────────────────── -->
    <aside class="hidden lg:flex flex-col w-56 shrink-0 h-screen sticky top-0"
      style="background:#09091A;border-right:1px solid rgba(255,255,255,0.05)">

      <!-- Logo -->
      <div class="h-16 flex items-center px-5"
        style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md flex items-center justify-center"
            style="background:rgba(124,58,237,0.3)">
            <span class="text-xs font-bold text-accent">O</span>
          </div>
          <div>
            <p class="text-xs font-bold text-text-strong leading-none">Oracle</p>
            <p class="text-xs text-text-faint leading-none mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group"
          :class="$route.path === link.to
            ? 'text-white'
            : 'text-text-subtle hover:text-text hover:bg-white/4'"
          :style="$route.path === link.to ? 'background:rgba(124,58,237,0.15)' : ''">
          <span class="w-4 h-4 shrink-0"
            :class="$route.path === link.to ? 'text-accent' : 'text-text-faint group-hover:text-text-subtle'"
            v-html="link.icon" />
          <span>{{ link.label }}</span>
          <span v-if="link.badge"
            class="ml-auto text-xs font-medium px-1.5 py-0.5 rounded-md"
            style="background:rgba(239,68,68,0.15);color:#F87171">
            {{ link.badge }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Bottom: back to site + signout -->
      <div class="px-3 pb-5 pt-2 space-y-1"
        style="border-top:1px solid rgba(255,255,255,0.05)">
        <button @click="signOut"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-subtle
                 hover:text-danger hover:bg-red-900/10 transition-colors">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- ── Mobile topbar ───────────────────────────────────────── -->
    <div class="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4"
      style="background:#09091A;border-bottom:1px solid rgba(255,255,255,0.05)">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded flex items-center justify-center"
          style="background:rgba(124,58,237,0.3)">
          <span class="text-xs font-bold text-accent">O</span>
        </div>
        <p class="text-sm font-bold text-text-strong">Admin</p>
      </div>
      <button @click="mobileOpen = !mobileOpen"
        class="p-2 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-colors">
        <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile sidebar overlay -->
    <Transition enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="mobileOpen" class="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        @click="mobileOpen = false" />
    </Transition>
    <Transition enter-active-class="transition-transform duration-300"
      leave-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full" leave-to-class="-translate-x-full">
      <div v-if="mobileOpen"
        class="lg:hidden fixed top-14 left-0 bottom-0 z-40 w-56 py-4 px-3 space-y-1 overflow-y-auto"
        style="background:#09091A;border-right:1px solid rgba(255,255,255,0.05)">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
          @click="mobileOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
          :class="$route.path === link.to
            ? 'text-white'
            : 'text-text-subtle hover:text-text hover:bg-white/4'"
          :style="$route.path === link.to ? 'background:rgba(124,58,237,0.15)' : ''">
          <span class="w-4 h-4 shrink-0" v-html="link.icon" />
          {{ link.label }}
        </NuxtLink>
      </div>
    </Transition>

    <!-- ── Page content ────────────────────────────────────────── -->
    <main class="flex-1 min-w-0 lg:pt-0 pt-14">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const supabase  = useSupabaseClient()
const mobileOpen = ref(false)

const navLinks = [
  {
    to: '/admin',
    label: 'Overview',
    icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>'
  },
  {
    to: '/admin/listings',
    label: 'Listings',
    icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>'
  },
  {
    to: '/admin/demo-requests',
    label: 'Demo Requests',
    icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    badge: null
  },
  {
    to: '/admin/qa',
    label: 'Q&A',
    icon: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>'
  },
]

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/auth/login')
}
</script>
