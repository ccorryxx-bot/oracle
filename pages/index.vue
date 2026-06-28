<template>
  <div>
    <!-- ── Hero ──────────────────────────────────── -->
    <section class="relative py-20 px-4 text-center overflow-hidden">
      <div class="absolute inset-0 pointer-events-none"
        style="background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(124,58,237,0.15),transparent)" />

      <div class="relative max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-medium border"
          style="background:rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.3);color:#A78BFA">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse-dot" style="background:#A78BFA" />
          {{ t('hero_badge') }}
        </div>

        <h1 class="font-display font-bold text-white leading-tight mb-4"
          style="font-size:clamp(2rem,5vw,3.25rem)">
          {{ t('hero_title_1') }}<br />
          <span style="color:#A78BFA">{{ t('hero_title_2') }}</span>
        </h1>

        <p class="text-base mb-8 max-w-lg mx-auto" style="color:#64748B">
          Verified listings · Safe escrow · KBZPay &amp; Wave Money supported
        </p>

        <div class="flex items-center gap-2 max-w-md mx-auto">
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style="color:#475569" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="search" type="text" :placeholder="t('hero_placeholder')"
              class="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition"
              style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#E2E8F0"
              @focus="($event.target as HTMLInputElement).style.borderColor='#7C3AED'"
              @blur="($event.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.1)'" />
          </div>
          <button class="shrink-0 px-5 py-3 rounded-xl text-sm font-medium text-white"
            style="background:#7C3AED"
            onmouseover="this.style.background='#6D28D9'"
            onmouseout="this.style.background='#7C3AED'">
            {{ t('hero_search') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── Stats ─────────────────────────────────── -->
    <section class="border-y py-5" style="border-color:rgba(255,255,255,0.06)">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
        <div v-for="stat in stats" :key="stat.label">
          <p class="font-display font-bold text-white text-xl">{{ stat.value }}</p>
          <p class="text-xs mt-0.5" style="color:#475569">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- ── Category tabs ─────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 pt-8 pb-4">
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button v-for="cat in allCategories" :key="cat.id ?? 'all'"
          @click="selectedCatId = cat.id"
          class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          :style="selectedCatId === cat.id
            ? 'background:#7C3AED;color:#fff'
            : 'background:rgba(255,255,255,0.05);color:#64748B'">
          {{ cat.name }}
        </button>
      </div>
    </section>

    <!-- ── Listings grid ─────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 pb-20">
      <div class="flex items-center justify-between mb-6">
        <p class="text-sm" style="color:#475569">
          <span class="text-white font-medium">{{ filteredListings.length }}</span>
          &nbsp;{{ t('listing_count') }}
        </p>
        <select v-model="sortBy"
          class="text-sm rounded-lg px-3 py-1.5 outline-none border"
          style="background:#0D0D1A;color:#94A3B8;border-color:rgba(255,255,255,0.1)">
          <option value="newest">{{ t('sort_newest') }}</option>
          <option value="price_asc">{{ t('sort_asc') }}</option>
          <option value="price_desc">{{ t('sort_desc') }}</option>
        </select>
      </div>

      <!-- Skeleton -->
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i"
          class="rounded-2xl overflow-hidden animate-pulse"
          style="background:rgba(255,255,255,0.04)">
          <div class="aspect-video" style="background:rgba(255,255,255,0.06)" />
          <div class="p-5 space-y-3">
            <div class="h-4 rounded" style="background:rgba(255,255,255,0.06);width:75%" />
            <div class="h-3 rounded" style="background:rgba(255,255,255,0.04);width:55%" />
            <div class="h-5 rounded" style="background:rgba(124,58,237,0.2);width:40%" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredListings.length === 0" class="text-center py-24">
        <div class="text-5xl mb-4">🏪</div>
        <p class="font-display font-semibold text-white mb-2">{{ t('empty_title') }}</p>
        <p class="text-sm mb-6" style="color:#475569">{{ t('empty_desc') }}</p>
        <NuxtLink to="/sell"
          class="inline-flex text-sm font-medium text-white px-5 py-2.5 rounded-xl"
          style="background:#7C3AED">
          {{ t('sell_btn') }}
        </NuxtLink>
      </div>

      <!-- Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <NuxtLink v-for="item in filteredListings" :key="item.id"
          :to="`/listings/${item.id}`"
          class="group rounded-2xl overflow-hidden border transition-all"
          style="background:rgba(255,255,255,0.025);border-color:rgba(255,255,255,0.07)"
          onmouseover="this.style.borderColor='rgba(124,58,237,0.4)'"
          onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">

          <div class="aspect-video overflow-hidden relative" style="background:rgba(255,255,255,0.04)">
            <img v-if="item.thumbnail_url"
              :src="item.thumbnail_url" :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div v-else class="w-full h-full flex items-center justify-center" style="color:#334155">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full"
              style="background:rgba(16,185,129,0.15);color:#34D399;border:1px solid rgba(16,185,129,0.2)">
              Published
            </span>
          </div>

          <div class="p-5">
            <h3 class="font-display font-semibold text-white text-base leading-snug mb-1.5 line-clamp-1 group-hover:text-violet-400">
              {{ item.title }}
            </h3>
            <p v-if="item.description" class="text-sm line-clamp-2 mb-4" style="color:#475569">
              {{ item.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="font-display font-bold text-lg" style="color:#A78BFA">
                {{ formatMMK(item.price) }}
              </span>
              <span class="text-xs px-2.5 py-1 rounded-full"
                style="background:rgba(255,255,255,0.05);color:#64748B">
                {{ (item as any).categories?.name ?? 'General' }}
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
  description: 'Buy & Sell premium game websites safely. KBZPay & Wave Money supported.',
})

const { t }    = useLocale()
const supabase = useSupabaseClient()

const search        = ref('')
const selectedCatId = ref<string | null>(null)
const sortBy        = ref<'newest' | 'price_asc' | 'price_desc'>('newest')

// Reactive stats — re-renders when locale switches
const stats = computed(() => [
  { label: t('stat_listings'), value: '0+' },
  { label: t('stat_sellers'),  value: '0+' },
  { label: t('stat_deals'),    value: '0+' },
])

// Categories
const { data: catData } = await useAsyncData('categories', async () => {
  const { data } = await supabase.from('categories').select('id,name,slug').order('name')
  return data ?? []
})

const allCategories = computed(() => [
  { id: null, name: t('cat_all'), slug: null },
  ...(catData.value ?? []),
])

// Listings
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
  if (sortBy.value === 'price_asc') return [...list].sort((a: any, b: any) => a.price - b.price)
  if (sortBy.value === 'price_desc') return [...list].sort((a: any, b: any) => b.price - a.price)
  return list
})

function formatMMK(price: number) {
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M ks'
  if (price >= 1_000)     return (price / 1_000).toFixed(0) + 'K ks'
  return price + ' ks'
}
</script>
