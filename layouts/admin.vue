<template>
  <div class="min-h-screen flex" style="background:#07070F">

    <!-- ── Desktop Sidebar ────────────────────────────────────── -->
    <aside class="hidden lg:flex flex-col w-56 shrink-0 h-screen sticky top-0"
      style="background:#09091A;border-right:1px solid rgba(255,255,255,0.05)">

      <!-- Logo -->
      <div class="h-16 flex items-center px-5"
        style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-xl flex items-center justify-center"
            style="background:rgba(124,58,237,0.25);border:1px solid rgba(124,58,237,0.3)">
            <span class="text-sm font-bold text-accent">O</span>
          </div>
          <div>
            <p class="text-sm font-bold text-text-strong leading-none">Oracle</p>
            <p class="text-xs text-text-faint leading-none mt-0.5 tracking-widest uppercase">Admin</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
        <p class="text-xs uppercase tracking-widest text-text-faint px-3 pb-2 pt-1">Main</p>
        <NuxtLink v-for="link in mainLinks" :key="link.to" :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group"
          :class="isActive(link.to)
            ? 'text-white'
            : 'text-text-subtle hover:text-text hover:bg-white/4'"
          :style="isActive(link.to) ? 'background:rgba(124,58,237,0.15)' : ''">
          <svg class="w-4 h-4 shrink-0 transition-colors"
            :class="isActive(link.to) ? 'text-accent' : 'text-text-faint group-hover:text-text-subtle'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"
            v-html="link.icon" />
          <span>{{ link.label }}</span>
        </NuxtLink>

        <p class="text-xs uppercase tracking-widest text-text-faint px-3 pb-2 pt-4">Manage</p>
        <NuxtLink v-for="link in manageLinks" :key="link.to" :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group"
          :class="isActive(link.to)
            ? 'text-white'
            : 'text-text-subtle hover:text-text hover:bg-white/4'"
          :style="isActive(link.to) ? 'background:rgba(124,58,237,0.15)' : ''">
          <svg class="w-4 h-4 shrink-0 transition-colors"
            :class="isActive(link.to) ? 'text-accent' : 'text-text-faint group-hover:text-text-subtle'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"
            v-html="link.icon" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Sign out -->
      <div class="px-3 pb-5 pt-2"
        style="border-top:1px solid rgba(255,255,255,0.05)">
        <div class="px-3 py-2 mb-3">
          <p class="text-xs font-medium text-text-strong truncate">{{ userEmail }}</p>
          <p class="text-xs text-text-faint mt-0.5">Administrator</p>
        </div>
        <button @click="signOut"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                 text-text-subtle hover:text-danger hover:bg-red-900/10 transition-all">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- ── Mobile topbar ──────────────────────────────────────── -->
    <div class="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4"
      style="background:#09091A;border-bottom:1px solid rgba(255,255,255,0.05)">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg flex items-center justify-center"
          style="background:rgba(124,58,237,0.25)">
          <span class="text-xs font-bold text-accent">O</span>
        </div>
        <p class="text-sm font-bold text-text-strong">Admin</p>
      </div>
      <button @click="mobileOpen = !mobileOpen"
        class="p-2 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

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
        class="lg:hidden fixed top-14 left-0 bottom-0 z-40 w-56 flex flex-col overflow-y-auto"
        style="background:#09091A;border-right:1px solid rgba(255,255,255,0.05)">
        <nav class="flex-1 py-4 px-3 space-y-0.5">
          <NuxtLink v-for="link in [...mainLinks, ...manageLinks]" :key="link.to" :to="link.to"
            @click="mobileOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            :class="isActive(link.to) ? 'text-white' : 'text-text-subtle hover:text-text'"
            :style="isActive(link.to) ? 'background:rgba(124,58,237,0.15)' : ''">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"
              v-html="link.icon" />
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>

    <!-- ── Page content ────────────────────────────────────────── -->
    <main class="flex-1 min-w-0 overflow-y-auto lg:pt-0 pt-14">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route    = useRoute()
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const mobileOpen = ref(false)
const userEmail  = computed(() => user.value?.email ?? '')

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const mainLinks = [
  { to: '/admin', label: 'Overview', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' },
]

const manageLinks = [
  { to: '/admin/listings',      label: 'Listings',      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>' },
  { to: '/admin/demo-requests', label: 'Demo Requests', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  { to: '/admin/qa',            label: 'Q&A',           icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>' },
  { to: '/admin/settings',      label: 'Settings',      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>' },
]

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/admin/login')
}
</script>
