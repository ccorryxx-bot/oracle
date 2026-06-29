<template>
  <div class="min-h-screen">

    <!-- Auth gate -->
    <div v-if="!user" class="max-w-lg mx-auto px-4 py-32 text-center">
      <p class="text-4xl mb-5">🔐</p>
      <h2 class="font-display font-bold text-text-strong text-xl mb-3">Login လိုအပ်ပါသည်</h2>
      <NuxtLink to="/auth/login"
        class="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors">
        Sign In
      </NuxtLink>
    </div>

    <div v-else class="max-w-5xl mx-auto px-4 py-12">

      <!-- Header -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h1 class="font-display font-bold text-text-strong text-2xl mb-1">My Dashboard</h1>
          <p class="text-sm text-text-muted">{{ user.email }}</p>
        </div>
        <NuxtLink to="/sell"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                 bg-primary hover:bg-primary-hover transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Website တင်မည်
        </NuxtLink>
      </div>

      <!-- Stats strip -->
      <div class="grid grid-cols-3 gap-8 mb-12 pb-10 border-b"
        style="border-color:rgba(255,255,255,0.06)">
        <div v-for="stat in stats" :key="stat.label">
          <p class="font-display font-bold text-text-strong text-2xl mb-1">{{ stat.value }}</p>
          <p class="text-xs text-text-subtle uppercase tracking-wider">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-6 mb-8">
        <button v-for="tab in statusTabs" :key="tab.value"
          @click="activeStatus = tab.value"
          class="relative pb-2 text-sm font-medium transition-colors"
          :class="activeStatus === tab.value ? 'text-text-strong' : 'text-text-subtle hover:text-text-muted'">
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1.5 text-xs text-text-faint">({{ tab.count }})</span>
          <span v-if="activeStatus === tab.value"
            class="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-accent" />
        </button>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-20 skeleton rounded-xl" />
      </div>

      <!-- Empty -->
      <div v-else-if="filteredListings.length === 0" class="py-24 text-center">
        <p class="text-4xl mb-4">📭</p>
        <p class="font-display font-semibold text-text-strong mb-2">Listing မရှိသေးဘူး</p>
        <p class="text-sm text-text-subtle mb-6">
          {{ activeStatus === 'all' ? 'ပထမဆုံး listing တင်လိုက်ပါ' : activeStatus + ' listings မရှိဘူး' }}
        </p>
        <NuxtLink to="/sell"
          class="inline-flex text-sm font-medium text-white px-5 py-2.5 rounded-xl
                 bg-primary hover:bg-primary-hover transition-colors">
          + Website တင်မည်
        </NuxtLink>
      </div>

      <!-- Listings table-style -->
      <div v-else class="space-y-px">
        <div v-for="item in filteredListings" :key="item.id"
          class="flex items-center gap-4 py-5 border-b group"
          style="border-color:rgba(255,255,255,0.04)">

          <!-- Thumbnail -->
          <div class="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-hover">
            <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.title"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-text-faint">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <p class="font-medium text-text-strong text-sm truncate">{{ item.title }}</p>
              <span class="shrink-0 text-xs px-2 py-0.5 rounded-full"
                :class="statusStyle(item.status).class"
                :style="statusStyle(item.status).style">
                {{ item.status }}
              </span>
            </div>
            <p class="text-xs text-text-subtle">
              {{ item.categories?.name ?? 'General' }}
              · {{ formatMMK(item.price) }}
              · {{ item.pricing_model === 'revenue_share' ? 'Revenue Share' : item.pricing_model === 'both' ? 'Both' : 'Full Ownership' }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <NuxtLink :to="`/listings/${item.id}`"
              class="p-2 rounded-lg text-text-subtle hover:text-text hover:bg-surface-hover transition-colors"
              title="View">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </NuxtLink>

            <button @click="toggleStatus(item)"
              class="p-2 rounded-lg text-text-subtle hover:text-text hover:bg-surface-hover transition-colors"
              :title="item.status === 'published' ? 'Unpublish' : 'Publish'">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path v-if="item.status === 'published'" stroke-linecap="round" stroke-linejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                <template v-else>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </template>
              </svg>
            </button>

            <button @click="deleteListing(item.id)"
              class="p-2 rounded-lg text-text-subtle hover:text-danger hover:bg-danger-bg transition-colors"
              title="Delete">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Date -->
          <div class="text-xs text-text-faint shrink-0 hidden sm:block">
            {{ formatDate(item.created_at) }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Dashboard — Oracle Market' })

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const activeStatus = ref<string>('all')

const { data: listings, pending, refresh } = await useAsyncData('my-listings', async () => {
  if (!user.value) return []
  const { data } = await supabase
    .from('portfolio_items')
    .select('*,categories(name)')
    .eq('seller_id', user.value.id)
    .order('created_at', { ascending: false })
  return data ?? []
})

const stats = computed(() => {
  const all = listings.value ?? []
  return [
    { label: 'Total Listings',    value: all.length },
    { label: 'Published',         value: all.filter(i => i.status === 'published').length },
    { label: 'Sold',              value: all.filter(i => i.status === 'sold').length },
  ]
})

const statusTabs = computed(() => [
  { value: 'all',       label: 'All',       count: listings.value?.length },
  { value: 'published', label: 'Published', count: listings.value?.filter(i => i.status === 'published').length },
  { value: 'draft',     label: 'Draft',     count: listings.value?.filter(i => i.status === 'draft').length },
  { value: 'sold',      label: 'Sold',      count: listings.value?.filter(i => i.status === 'sold').length },
])

const filteredListings = computed(() => {
  if (activeStatus.value === 'all') return listings.value ?? []
  return (listings.value ?? []).filter(i => i.status === activeStatus.value)
})

function statusStyle(status: string) {
  const map: Record<string, { class: string; style: string }> = {
    published: { class: '', style: 'background:rgba(52,211,153,0.1);color:#34D399' },
    draft:     { class: '', style: 'background:rgba(255,255,255,0.06);color:#64748B' },
    sold:      { class: '', style: 'background:rgba(124,58,237,0.15);color:#A78BFA' },
  }
  return map[status] ?? map.draft
}

function formatMMK(price: number) {
  if (!price) return '—'
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M ks'
  if (price >= 1_000)     return (price / 1_000).toFixed(0) + 'K ks'
  return price + ' ks'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function toggleStatus(item: any) {
  const next = item.status === 'published' ? 'draft' : 'published'
  await supabase.from('portfolio_items').update({ status: next }).eq('id', item.id)
  await refresh()
}

async function deleteListing(id: string) {
  if (!confirm('ဤ listing ကို ဖျက်မည်လား?')) return
  await supabase.from('portfolio_items').delete().eq('id', id)
  await refresh()
}
</script>
