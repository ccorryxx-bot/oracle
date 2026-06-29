<template>
  <div>
    <!-- ── Hero (frameless, glow-only background) ── -->
    <section class="relative py-24 sm:py-28 px-4 text-center overflow-hidden">
      <div class="absolute inset-0 pointer-events-none hero-glow" />

      <div class="relative max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 mb-7 text-xs font-medium text-accent">
          <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
          {{ t('hero_badge') }}
        </div>

        <h1 class="font-display font-bold text-text-strong leading-tight mb-5 tracking-tight"
          style="font-size:clamp(2.25rem,5.5vw,3.5rem)">
          {{ t('hero_title_1') }}<br />
          <span class="text-accent">{{ t('hero_title_2') }}</span>
        </h1>

        <p class="text-base mb-10 max-w-lg mx-auto text-text-muted">
          Verified listings · Safe escrow · KBZPay &amp; Wave Money supported
        </p>

        <div class="flex items-center gap-2 max-w-md mx-auto">
          <div class="flex-1 relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-subtle"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="search" type="text" :placeholder="t('hero_placeholder')"
              class="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-text outline-none bg-surface-hover
                     focus:bg-white/8 transition-colors placeholder:text-text-faint" />
          </div>
          <button class="shrink-0 px-5 py-3 rounded-xl text-sm font-medium text-text-strong
                         bg-primary hover:bg-primary-hover transition-colors">
            {{ t('hero_search') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── Stats (frameless, whitespace only) ───── -->
    <section class="py-2">
      <div class="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
        <div v-for="stat in stats" :key="stat.label">
          <p class="font-display font-bold text-text-strong text-2xl">{{ stat.value }}</p>
          <p class="text-xs mt-1 text-text-subtle uppercase tracking-wider">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- ── Category tabs (text-only, underline active) ── -->
    <section class="max-w-7xl mx-auto px-4 pt-16 pb-4">
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

    <!-- ── Listings ──────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 pb-20">
      <div class="flex items-center justify-between mb-8">
        <p class="text-sm text-text-subtle">
          <span class="text-text-strong font-medium">{{ filteredListings.length }}</span>
          &nbsp;{{ t('listing_count') }}
        </p>
        <select v-model="sortBy"
          class="text-sm rounded-lg px-3 py-1.5 outline-none bg-transparent text-text-muted
                 hover:text-text cursor-pointer">
          <option value="newest" class="bg-bg">{{ t('sort_newest') }}</option>
          <option value="price_asc" class="bg-bg">{{ t('sort_asc') }}</option>
          <option value="price_desc" class="bg-bg">{{ t('sort_desc') }}</option>
        </select>
      </div>

      <!-- Skeleton (frameless shimmer) -->
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
        <div class="text-5xl mb-4">🏪</div>
        <p class="font-display font-semibold text-text-strong mb-2">{{ t('empty_title') }}</p>
        <p class="text-sm mb-6 text-text-subtle">{{ t('empty_desc') }}</p>
        <NuxtLink to="/sell"
          class="inline-flex text-sm font-medium text-text-strong px-5 py-2.5 rounded-xl
                 bg-primary hover:bg-primary-hover transition-colors">
          {{ t('sell_btn') }}
        </NuxtLink>
      </div>

      <!-- Cards (frameless, image + text only) -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        <NuxtLink v-for="item in filteredListings" :key="item.id"
          :to="`/listings/${item.id}`"
          class="group block">

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
          </div>

          <div class="pt-4 px-1">
            <div class="flex items-center justify-between gap-3 mb-1">
              <h3 class="font-display font-semibold text-text-strong text-base leading-snug line-clamp-1
                         group-hover:text-accent transition-colors">
                {{ item.title }}
              </h3>
              <span class="shrink-0 text-xs text-text-subtle">
                {{ (item as any).categories?.name ?? 'General' }}
              </span>
            </div>
            <p v-if="item.description" class="text-sm line-clamp-1 text-text-subtle mb-2">
              {{ item.description }}
            </p>
            <span class="font-display font-bold text-lg text-accent">
              {{ formatMMK(item.price) }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Oracle Market — Myanmar #1 Game Website Marketplace',
  description: 'Buy & Sell premium game websites safely. KBZPay & Wave Money supported.',
})

const { t }    = useLocale()
const supabase = useSupabaseClient()

const search        = ref('')
const selectedCatId = ref<string | null>(null)
const sortBy        = ref<'newest' | 'price_asc' | 'price_desc'>('newest')

const stats = computed(() => [
  { label: t('stat_listings'), value: '0+' },
  { label: t('stat_sellers'),  value: '0+' },
  { label: t('stat_deals'),    value: '0+' },
])

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
    .select('id,title,description,price,thumbnail_url,created_at,category_id,categories(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  return data ?? []
})

const filteredListings = computed(() => {
  let list = rawListings.value ?? []
  if (selectedCatId.value)
    list = list.filter((i: any) => i.category_id === selectedCatId.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((i: any) => i.title.toLowerCase().includes(q))
  if (sortBy.value === 'price_asc')  return [...list].sort((a: any, b: any) => a.price - b.price)
  if (sortBy.value === 'price_desc') return [...list].sort((a: any, b: any) => b.price - a.price)
  return list
})

function formatMMK(price: number) {
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M ks'
  if (price >= 1_000)     return (price / 1_000).toFixed(0) + 'K ks'
  return price + ' ks'
}
</script>
