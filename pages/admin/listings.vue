<template>
  <div class="p-8 max-w-6xl">

    <div class="mb-8 flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-widest text-text-subtle mb-1">Admin</p>
        <h1 class="font-display font-bold text-text-strong text-2xl">Listings</h1>
      </div>
      <!-- Search + filter -->
      <div class="flex items-center gap-3">
        <input v-model="search" type="text" placeholder="Search listings..."
          class="text-sm px-3 py-2 rounded-xl outline-none text-text w-48
                 bg-white/5 focus:bg-white/8 transition-colors placeholder:text-text-faint" />
        <select v-model="statusFilter"
          class="text-sm px-3 py-2 rounded-xl outline-none text-text-muted bg-white/5 cursor-pointer">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="sold">Sold</option>
        </select>
      </div>
    </div>

    <!-- Tab counts -->
    <div class="flex items-center gap-6 mb-6">
      <button v-for="tab in statusTabs" :key="tab.key"
        @click="statusFilter = tab.key"
        class="text-sm pb-2 transition-colors relative"
        :class="statusFilter === tab.key ? 'text-text-strong' : 'text-text-subtle hover:text-text'">
        {{ tab.label }}
        <span class="ml-1.5 text-xs">{{ tab.count }}</span>
        <span v-if="statusFilter === tab.key"
          class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />
      </button>
    </div>

    <!-- Table -->
    <div class="rounded-2xl overflow-hidden"
      style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">

      <!-- Table header -->
      <div class="grid items-center gap-4 px-5 py-3 text-xs uppercase tracking-widest text-text-faint"
        style="grid-template-columns:3rem 1fr 7rem 6rem 5rem 6rem 7rem;border-bottom:1px solid rgba(255,255,255,0.05)">
        <span>#</span>
        <span>Listing</span>
        <span>Category</span>
        <span class="text-right">Price</span>
        <span class="text-right">Views</span>
        <span class="text-center">Status</span>
        <span class="text-right">Actions</span>
      </div>

      <!-- Skeleton -->
      <div v-if="pending" class="divide-y divide-white/[0.03]">
        <div v-for="i in 8" :key="i" class="px-5 py-4">
          <div class="h-5 skeleton rounded" style="width:70%" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredListings.length === 0"
        class="py-16 text-center text-sm text-text-subtle">
        No listings found
      </div>

      <!-- Rows -->
      <div v-else class="divide-y divide-white/[0.03]">
        <div v-for="(item, i) in filteredListings" :key="item.id"
          class="grid items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
          style="grid-template-columns:3rem 1fr 7rem 6rem 5rem 6rem 7rem">

          <!-- Index -->
          <span class="text-xs font-mono text-text-faint">{{ i + 1 }}</span>

          <!-- Title + badges -->
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <p class="text-sm text-text-strong truncate">{{ item.title }}</p>
              <span v-if="item.is_verified"
                class="text-xs shrink-0" style="color:#34D399">✓</span>
              <span v-if="item.is_hot"
                class="text-xs shrink-0 px-1.5 py-0.5 rounded"
                style="background:rgba(239,68,68,0.12);color:#F87171">HOT</span>
            </div>
            <p class="text-xs text-text-faint">ID: {{ item.id.slice(0, 8) }}…</p>
          </div>

          <!-- Category -->
          <span class="text-xs text-text-subtle truncate">
            {{ (item as any).categories?.name ?? '—' }}
          </span>

          <!-- Price -->
          <span class="text-sm font-medium text-right" :class="item.status === 'sold' ? 'text-text-subtle' : 'text-text-strong'">
            {{ fmtPrice(item.price) }}
          </span>

          <!-- Views -->
          <span class="text-sm text-right text-text-muted">{{ item.view_count ?? 0 }}</span>

          <!-- Status badge -->
          <div class="flex justify-center">
            <span class="text-xs px-2.5 py-1 rounded-lg"
              :style="statusBadge(item.status)">{{ item.status }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="toggleVerified(item)"
              :title="item.is_verified ? 'Unverify' : 'Verify'"
              class="p-1.5 rounded-lg transition-colors"
              :style="item.is_verified
                ? 'background:rgba(52,211,153,0.1);color:#34D399'
                : 'background:rgba(255,255,255,0.05);color:#64748B'">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button @click="toggleHot(item)"
              :title="item.is_hot ? 'Remove Hot' : 'Mark Hot'"
              class="p-1.5 rounded-lg transition-colors text-xs"
              :style="item.is_hot
                ? 'background:rgba(239,68,68,0.12);color:#F87171'
                : 'background:rgba(255,255,255,0.05);color:#64748B'">
              🔥
            </button>
            <button v-if="item.status !== 'sold'" @click="markSold(item)"
              title="Mark as Sold"
              class="p-1.5 rounded-lg transition-colors"
              style="background:rgba(255,255,255,0.05);color:#64748B hover:color:#A78BFA">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination info -->
    <p v-if="filteredListings.length > 0"
      class="text-xs text-text-faint mt-4 text-center">
      Showing {{ filteredListings.length }} of {{ allListings.length }} listings
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Listings — Oracle Admin' })

const supabase = useSupabaseClient()
const search       = ref('')
const statusFilter = ref('all')

const { data: allListings, pending, refresh } = await useAsyncData('admin-listings-all', async () => {
  const { data } = await supabase
    .from('portfolio_items')
    .select('id,title,price,status,view_count,is_verified,is_hot,categories(name),created_at')
    .order('created_at', { ascending: false })
  return data ?? []
})

const statusTabs = computed(() => {
  const all = allListings.value ?? []
  return [
    { key: 'all',       label: 'All',       count: all.length },
    { key: 'published', label: 'Published', count: all.filter(i => i.status === 'published').length },
    { key: 'draft',     label: 'Draft',     count: all.filter(i => i.status === 'draft').length },
    { key: 'sold',      label: 'Sold',      count: all.filter(i => i.status === 'sold').length },
  ]
})

const filteredListings = computed(() => {
  let list = allListings.value ?? []
  if (statusFilter.value !== 'all') list = list.filter(i => i.status === statusFilter.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((i: any) => i.title.toLowerCase().includes(q))
  return list
})

function statusBadge(s: string) {
  const m: Record<string, string> = {
    published: 'background:rgba(52,211,153,0.1);color:#34D399',
    draft:     'background:rgba(255,255,255,0.06);color:#64748B',
    sold:      'background:rgba(124,58,237,0.15);color:#A78BFA',
  }
  return m[s] ?? m.draft
}

async function toggleVerified(item: any) {
  await supabase.from('portfolio_items').update({ is_verified: !item.is_verified }).eq('id', item.id)
  item.is_verified = !item.is_verified
}
async function toggleHot(item: any) {
  await supabase.from('portfolio_items').update({ is_hot: !item.is_hot }).eq('id', item.id)
  item.is_hot = !item.is_hot
}
async function markSold(item: any) {
  await supabase.from('portfolio_items').update({ status: 'sold' }).eq('id', item.id)
  item.status = 'sold'
}

function fmtPrice(p: number) {
  if (!p) return '—'
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1) + 'M'
  if (p >= 1_000)     return (p / 1_000).toFixed(0) + 'K'
  return String(p)
}
</script>
