<template>
  <div>

    <!-- ── Activity Toast (bottom-right, fixed) ───────────────── -->
    <Transition enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-4 translate-x-2"
      leave-to-class="opacity-0 translate-x-full">
      <div v-if="toast.visible"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
               backdrop-blur-md max-w-xs"
        style="background:rgba(14,14,28,0.92);border:1px solid rgba(255,255,255,0.08)">
        <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: toast.color }" />
        <div class="min-w-0">
          <p class="text-xs font-medium text-text-strong truncate">{{ toast.message }}</p>
          <p class="text-xs text-text-subtle">{{ toast.time }}</p>
        </div>
      </div>
    </Transition>

    <!-- ── Hero ───────────────────────────────────────────────── -->
    <section class="relative py-24 sm:py-32 px-4 text-center overflow-hidden">
      <!-- Dot grid background -->
      <div class="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <!-- Glow -->
      <div class="absolute inset-0 pointer-events-none hero-glow" />

      <div class="relative max-w-3xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 mb-7 text-xs font-medium text-accent">
          <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
          {{ t('hero_badge') }}
        </div>

        <!-- Title -->
        <h1 class="font-display font-bold text-text-strong leading-tight mb-5 tracking-tight"
          style="font-size:clamp(2.25rem,5.5vw,3.5rem)">
          {{ t('hero_title_1') }}<br />
          <span class="gradient-text">{{ t('hero_title_2') }}</span>
        </h1>

        <p class="text-sm mb-10 max-w-md mx-auto text-text-muted">
          No DB cost · No Hosting cost · No Setup fee — <span class="text-text">Website price only</span>
        </p>

        <!-- Search -->
        <div class="flex items-center gap-2 max-w-md mx-auto">
          <div class="flex-1 relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-subtle"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="search" type="text" :placeholder="t('hero_placeholder')"
              class="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-text outline-none
                     bg-white/5 focus:bg-white/8 transition-colors placeholder:text-text-faint" />
          </div>
          <button class="shrink-0 px-5 py-3 rounded-xl text-sm font-semibold text-white
                         bg-primary hover:bg-primary-hover transition-colors">
            {{ t('hero_search') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── Stats (count-up) ───────────────────────────────────── -->
    <section ref="statsRef" class="py-4 border-y" style="border-color:rgba(255,255,255,0.04)">
      <div class="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
        <div v-for="(stat, i) in animatedStats" :key="i">
          <p class="font-display font-bold text-text-strong text-2xl tracking-tight">
            {{ stat.display }}<span class="text-accent text-xl">{{ stat.suffix }}</span>
          </p>
          <p class="text-xs mt-1 text-text-subtle uppercase tracking-wider">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- ── Trust strip ────────────────────────────────────────── -->
    <section class="py-5 border-b" style="border-color:rgba(255,255,255,0.04)">
      <div class="max-w-3xl mx-auto px-4 flex items-center justify-center gap-8 flex-wrap">
        <div v-for="t2 in trustPoints" :key="t2.label"
          class="flex items-center gap-2 text-xs text-text-subtle">
          <span class="text-success">{{ t2.icon }}</span>
          {{ t2.label }}
        </div>
      </div>
    </section>

    <!-- ── Filter bar ─────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 pt-10 pb-3">
      <div class="flex flex-wrap items-center gap-3">

        <!-- Price range -->
        <div class="relative">
          <select v-model="priceFilter"
            class="appearance-none text-xs pl-3 pr-7 py-2 rounded-lg outline-none cursor-pointer
                   text-text-muted hover:text-text transition-colors"
            style="background:rgba(255,255,255,0.05)">
            <option value="all">All Prices</option>
            <option value="under5">Under 5M ks</option>
            <option value="5to20">5M – 20M ks</option>
            <option value="above20">Above 20M ks</option>
          </select>
          <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-faint pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Pricing model -->
        <div class="relative">
          <select v-model="modelFilter"
            class="appearance-none text-xs pl-3 pr-7 py-2 rounded-lg outline-none cursor-pointer
                   text-text-muted hover:text-text transition-colors"
            style="background:rgba(255,255,255,0.05)">
            <option value="all">All Models</option>
            <option value="revenue_share">Revenue Share</option>
            <option value="full_ownership">Full Ownership</option>
            <option value="both">Both Available</option>
          </select>
          <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-faint pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Game type -->
        <div class="relative">
          <select v-model="gameFilter"
            class="appearance-none text-xs pl-3 pr-7 py-2 rounded-lg outline-none cursor-pointer
                   text-text-muted hover:text-text transition-colors"
            style="background:rgba(255,255,255,0.05)">
            <option value="all">All Games</option>
            <option v-for="g in gameTypeOptions" :key="g" :value="g">{{ g }}</option>
          </select>
          <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-faint pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Demo toggle -->
        <button @click="demoOnly = !demoOnly"
          class="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors"
          :style="demoOnly
            ? 'background:rgba(124,58,237,0.15);color:#A78BFA'
            : 'background:rgba(255,255,255,0.05);color:#64748B'">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Demo Only
        </button>

        <!-- Clear filters -->
        <button v-if="hasActiveFilters" @click="clearFilters"
          class="text-xs text-text-subtle hover:text-danger transition-colors ml-auto">
          Clear filters
        </button>
      </div>
    </section>

    <!-- ── Category tabs ──────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 pt-6 pb-3">
      <div class="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-hide">
        <button v-for="cat in allCategories" :key="cat.id ?? 'all'"
          @click="selectedCatId = cat.id"
          class="shrink-0 py-2 text-sm font-medium transition-colors relative"
          :class="selectedCatId === cat.id
            ? 'text-text-strong'
            : 'text-text-muted hover:text-text'">
          {{ cat.name }}
          <span v-if="selectedCatId === cat.id"
            class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />
        </button>
      </div>
    </section>

    <!-- ── Listings ────────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 pb-24">

      <div class="flex items-center justify-between mb-8">
        <p class="text-sm text-text-subtle">
          <span class="text-text-strong font-medium">{{ filteredListings.length }}</span>
          &nbsp;{{ t('listing_count') }}
        </p>
        <select v-model="sortBy"
          class="text-sm rounded-lg px-3 py-1.5 outline-none bg-transparent text-text-muted
                 hover:text-text cursor-pointer">
          <option value="newest" class="bg-bg">Newest</option>
          <option value="price_asc" class="bg-bg">Price: Low → High</option>
          <option value="price_desc" class="bg-bg">Price: High → Low</option>
          <option value="popular" class="bg-bg">Most Viewed</option>
        </select>
      </div>

      <!-- Skeleton -->
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        <div v-for="i in 6" :key="i" class="space-y-4">
          <div class="aspect-video rounded-2xl skeleton" />
          <div class="space-y-2 px-1">
            <div class="h-4 skeleton" style="width:75%" />
            <div class="h-3 skeleton" style="width:55%" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredListings.length === 0" class="text-center py-24">
        <div class="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-2xl"
          style="background:rgba(124,58,237,0.08)">
          <svg class="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p class="font-display font-semibold text-text-strong mb-2">{{ t('empty_title') }}</p>
        <p class="text-sm mb-6 text-text-subtle">{{ t('empty_desc') }}</p>
        <NuxtLink to="/sell"
          class="inline-flex text-sm font-semibold text-white px-5 py-2.5 rounded-xl
                 bg-primary hover:bg-primary-hover transition-colors">
          {{ t('sell_btn') }}
        </NuxtLink>
      </div>

      <!-- Cards grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        <NuxtLink v-for="item in filteredListings" :key="item.id"
          :to="item.status === 'sold' ? undefined : `/listings/${item.id}`"
          class="group block"
          :class="item.status === 'sold' ? 'cursor-default' : ''">

          <!-- Image wrapper -->
          <div class="aspect-video rounded-2xl overflow-hidden relative bg-surface-hover
                      transition-transform duration-300 group-hover:-translate-y-1">

            <img v-if="item.thumbnail_url"
              :src="item.thumbnail_url" :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div v-else class="w-full h-full flex items-center justify-center text-text-faint">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- SOLD overlay -->
            <div v-if="item.status === 'sold'"
              class="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
              style="background:rgba(7,7,15,0.7)">
              <div class="text-center">
                <span class="font-display font-bold text-white text-lg tracking-widest">SOLD</span>
              </div>
            </div>

            <!-- Badges (top-left) -->
            <div v-if="item.status !== 'sold'" class="absolute top-3 left-3 flex gap-1.5">
              <span v-if="isHot(item)"
                class="text-xs font-semibold px-2 py-0.5 rounded-md"
                style="background:rgba(239,68,68,0.15);color:#F87171">
                HOT
              </span>
              <span v-else-if="isNew(item)"
                class="text-xs font-semibold px-2 py-0.5 rounded-md"
                style="background:rgba(52,211,153,0.12);color:#34D399">
                NEW
              </span>
            </div>

            <!-- Demo badge (top-right) -->
            <div v-if="item.demo_available && item.status !== 'sold'"
              class="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-md
                     backdrop-blur-sm"
              style="background:rgba(124,58,237,0.25);color:#C4B5FD">
              Demo ✓
            </div>

            <!-- Hover overlay — quick info strip -->
            <div class="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0
                        transition-transform duration-300 ease-out p-3"
              style="background:linear-gradient(to top,rgba(7,7,15,0.95) 60%,transparent)">
              <div class="flex flex-wrap gap-1.5">
                <template v-if="item.tech_stack">
                  <span v-for="(val, key) in item.tech_stack" :key="key"
                    class="text-xs px-2 py-0.5 rounded text-text-subtle"
                    style="background:rgba(255,255,255,0.08)">{{ val }}</span>
                </template>
                <span class="text-xs px-2 py-0.5 rounded text-accent"
                  style="background:rgba(124,58,237,0.12)">
                  {{ modelLabel(item.pricing_model) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card info -->
          <div class="pt-4 px-1">
            <div class="flex items-start justify-between gap-3 mb-1">
              <h3 class="font-display font-semibold text-text-strong text-base leading-snug
                         line-clamp-1 group-hover:text-accent transition-colors">
                {{ item.title }}
              </h3>
              <span class="shrink-0 text-xs text-text-subtle mt-0.5">
                {{ (item as any).categories?.name ?? 'General' }}
              </span>
            </div>
            <p v-if="item.description" class="text-sm line-clamp-1 text-text-subtle mb-2">
              {{ item.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="font-display font-bold text-lg"
                :class="item.status === 'sold' ? 'text-text-subtle line-through' : 'gradient-text'">
                {{ formatMMK(item.price) }}
              </span>
              <span v-if="item.view_count" class="text-xs text-text-faint">
                {{ item.view_count }} views
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Oracle Market — Myanmar #1 Game Website Marketplace',
  description: 'Buy & Sell premium white-label game websites. No DB cost. No Hosting cost. KBZPay & Wave Money supported.',
})

const { t }    = useLocale()
const supabase = useSupabaseClient()

// ── State ─────────────────────────────────────────────────────────────────
const search        = ref('')
const selectedCatId = ref<string | null>(null)
const sortBy        = ref<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest')
const priceFilter   = ref('all')
const modelFilter   = ref('all')
const gameFilter    = ref('all')
const demoOnly      = ref(false)

const gameTypeOptions = ['Slot', 'Live Casino', 'Sports Betting', 'Lottery', 'Poker', 'Fishing']

const hasActiveFilters = computed(() =>
  priceFilter.value !== 'all' || modelFilter.value !== 'all' ||
  gameFilter.value !== 'all' || demoOnly.value
)

function clearFilters() {
  priceFilter.value = 'all'; modelFilter.value = 'all'
  gameFilter.value = 'all';  demoOnly.value = false
}

// ── Trust points ────────────────────────────────────────────────────────────
const trustPoints = [
  { icon: '✓', label: 'No database cost' },
  { icon: '✓', label: 'No hosting cost' },
  { icon: '✓', label: 'No setup fee' },
  { icon: '✓', label: 'KBZPay & Wave escrow' },
]

// ── Activity Toast ─────────────────────────────────────────────────────────
const activities = [
  { message: 'A website was sold',         time: 'Just now',   color: '#34D399' },
  { message: 'New listing added — Slot',   time: '12m ago',    color: '#A78BFA' },
  { message: 'A listing was reserved',     time: '28m ago',    color: '#A78BFA' },
  { message: 'Price reduced on a listing', time: '1h ago',     color: '#F59E0B' },
  { message: 'Deal completed',             time: '2h ago',     color: '#34D399' },
  { message: 'Demo request submitted',     time: '3h ago',     color: '#A78BFA' },
  { message: 'New listing — Live Casino',  time: '4h ago',     color: '#A78BFA' },
  { message: 'A website was sold',         time: 'Yesterday',  color: '#34D399' },
]

const toast = reactive({ visible: false, message: '', time: '', color: '#A78BFA' })
let toastIdx = 0
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showNextToast() {
  const act = activities[toastIdx % activities.length]
  toast.message = act.message
  toast.time    = act.time
  toast.color   = act.color
  toast.visible = true
  toastIdx++
  toastTimer = setTimeout(() => {
    toast.visible = false
    setTimeout(showNextToast, Math.random() * 6000 + 8000)
  }, 5000)
}

onMounted(() => {
  setTimeout(showNextToast, 3000)
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

// ── Count-up stats ──────────────────────────────────────────────────────────
const statsRef  = ref<HTMLElement | null>(null)
const statsStarted = ref(false)

const rawStats = [
  { target: 127, suffix: '+', label: t('stat_listings') },
  { target: 58,  suffix: '+', label: t('stat_sellers')  },
  { target: 340, suffix: '+', label: t('stat_deals')    },
]

const counters = rawStats.map(s => ({ current: ref(0), ...s }))

const animatedStats = computed(() =>
  counters.map(c => ({ display: c.current.value, suffix: c.suffix, label: c.label }))
)

function startCountUp() {
  if (statsStarted.value) return
  statsStarted.value = true
  counters.forEach(({ target, current }) => {
    const duration = 1800
    const start = Date.now()
    function update() {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      current.value = Math.floor(target * eased)
      if (p < 1) requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  })
}

onMounted(() => {
  const el = statsRef.value
  if (!el) { startCountUp(); return }
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { startCountUp(); obs.disconnect() }
  }, { threshold: 0.3 })
  obs.observe(el)
})

// ── Data ────────────────────────────────────────────────────────────────────
const { data: catData } = await useAsyncData('categories', async () => {
  const { data } = await supabase.from('categories').select('id,name,slug').order('name')
  return data ?? []
})

const allCategories = computed(() => [
  { id: null, name: t('cat_all'), slug: null },
  ...(catData.value ?? []),
])

const { data: rawListings, pending } = await useAsyncData('listings', async () => {
  const { data } = await supabase
    .from('portfolio_items')
    .select('id,title,description,price,thumbnail_url,created_at,category_id,status,view_count,pricing_model,demo_available,tech_stack,game_types,categories(name)')
    .in('status', ['published', 'sold'])
    .order('created_at', { ascending: false })
  return data ?? []
})

// ── Filtering & sorting ─────────────────────────────────────────────────────
const filteredListings = computed(() => {
  let list = rawListings.value ?? []

  if (selectedCatId.value)
    list = list.filter((i: any) => i.category_id === selectedCatId.value)

  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((i: any) => i.title.toLowerCase().includes(q))

  if (priceFilter.value === 'under5')   list = list.filter((i: any) => i.price < 5_000_000)
  if (priceFilter.value === '5to20')    list = list.filter((i: any) => i.price >= 5_000_000 && i.price <= 20_000_000)
  if (priceFilter.value === 'above20')  list = list.filter((i: any) => i.price > 20_000_000)

  if (modelFilter.value !== 'all')      list = list.filter((i: any) => i.pricing_model === modelFilter.value)
  if (gameFilter.value !== 'all')       list = list.filter((i: any) => i.game_types?.includes(gameFilter.value))
  if (demoOnly.value)                   list = list.filter((i: any) => i.demo_available)

  if (sortBy.value === 'price_asc')     return [...list].sort((a: any, b: any) => a.price - b.price)
  if (sortBy.value === 'price_desc')    return [...list].sort((a: any, b: any) => b.price - a.price)
  if (sortBy.value === 'popular')       return [...list].sort((a: any, b: any) => (b.view_count ?? 0) - (a.view_count ?? 0))

  // Published first, then sold
  return [...list].sort((a: any, b: any) => {
    if (a.status === 'sold' && b.status !== 'sold') return 1
    if (a.status !== 'sold' && b.status === 'sold') return -1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

// ── Helpers ─────────────────────────────────────────────────────────────────
function isNew(item: any) {
  const days = (Date.now() - new Date(item.created_at).getTime()) / 86_400_000
  return days < 7
}

function isHot(item: any) {
  return (item.view_count ?? 0) > 80
}

function modelLabel(m: string) {
  if (m === 'revenue_share') return 'Rev. Share'
  if (m === 'both')          return 'Rev. Share + Ownership'
  return 'Full Ownership'
}

function formatMMK(price: number) {
  if (!price) return '—'
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M ks'
  if (price >= 1_000)     return (price / 1_000).toFixed(0) + 'K ks'
  return price + ' ks'
}
</script>
