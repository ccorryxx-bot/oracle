<template>
  <div class="min-h-screen">
    <div v-if="!isAdmin" class="max-w-lg mx-auto px-4 py-32 text-center">
      <p class="text-4xl mb-4">🔒</p>
      <p class="font-display font-semibold text-text-strong">Access Restricted</p>
    </div>

    <div v-else class="max-w-6xl mx-auto px-4 py-12">

      <!-- Header -->
      <div class="mb-10">
        <p class="text-xs uppercase tracking-widest text-text-subtle mb-2">Admin</p>
        <h1 class="font-display font-bold text-text-strong text-2xl">Business Overview</h1>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-10 border-b"
        style="border-color:rgba(255,255,255,0.06)">
        <div v-for="s in overviewStats" :key="s.label">
          <p class="font-display font-bold text-text-strong text-2xl mb-1">{{ s.value }}</p>
          <p class="text-xs text-text-subtle">{{ s.label }}</p>
          <p v-if="s.sub" class="text-xs mt-0.5" :class="s.up ? 'text-success' : 'text-text-faint'">
            {{ s.sub }}
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-12">

        <!-- Top listings by views -->
        <div>
          <p class="text-xs uppercase tracking-widest text-text-subtle mb-5">Top Listings · By Views</p>
          <div v-if="pendingListings" class="space-y-3">
            <div v-for="i in 5" :key="i" class="h-10 skeleton rounded-lg" />
          </div>
          <div v-else class="space-y-px">
            <div v-for="(item, i) in topListings" :key="item.id"
              class="flex items-center gap-4 py-3 border-b"
              style="border-color:rgba(255,255,255,0.04)">
              <span class="text-xs font-mono text-text-faint w-5">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-text-strong truncate">{{ item.title }}</p>
                <p class="text-xs text-text-subtle">{{ item.categories?.name ?? '—' }} · {{ formatMMK(item.price) }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-medium text-text-strong">{{ item.view_count ?? 0 }}</p>
                <p class="text-xs text-text-subtle">views</p>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-md shrink-0"
                :style="statusStyle(item.status)">{{ item.status }}</span>
            </div>
          </div>
        </div>

        <!-- Demo requests -->
        <div>
          <p class="text-xs uppercase tracking-widest text-text-subtle mb-5">Demo Requests</p>
          <div v-if="pendingDemos" class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-10 skeleton rounded-lg" />
          </div>
          <div v-else-if="demoRequests.length === 0"
            class="py-10 text-center text-sm text-text-subtle">
            No demo requests yet
          </div>
          <div v-else class="space-y-px">
            <div v-for="req in demoRequests" :key="req.id"
              class="flex items-center gap-4 py-3 border-b"
              style="border-color:rgba(255,255,255,0.04)">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-text-strong truncate">{{ req.name }}</p>
                <p class="text-xs text-text-subtle truncate">{{ req.contact }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs text-text-subtle">{{ formatDate(req.created_at) }}</p>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-md shrink-0"
                :style="req.status === 'pending'
                  ? 'background:rgba(245,158,11,0.12);color:#F59E0B'
                  : 'background:rgba(52,211,153,0.1);color:#34D399'">
                {{ req.status }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- All listings management -->
      <div class="mt-12">
        <p class="text-xs uppercase tracking-widest text-text-subtle mb-5">All Listings</p>
        <div v-if="pendingAll" class="space-y-3">
          <div v-for="i in 6" :key="i" class="h-12 skeleton rounded-lg" />
        </div>
        <div v-else class="space-y-px">
          <div v-for="item in allListings" :key="item.id"
            class="flex items-center gap-4 py-3.5 border-b group"
            style="border-color:rgba(255,255,255,0.04)">
            <div class="w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-surface-hover">
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url" :alt="item.title"
                class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-text-strong truncate">{{ item.title }}</p>
              <p class="text-xs text-text-subtle">
                {{ item.categories?.name ?? '—' }} ·
                {{ formatMMK(item.price) }} ·
                {{ item.view_count ?? 0 }} views
              </p>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="toggleVerified(item)"
                class="text-xs px-2.5 py-1 rounded-lg transition-colors"
                :style="item.is_verified
                  ? 'background:rgba(52,211,153,0.1);color:#34D399'
                  : 'background:rgba(255,255,255,0.05);color:#64748B'">
                {{ item.is_verified ? '✓ Verified' : 'Verify' }}
              </button>
              <button @click="toggleHot(item)"
                class="text-xs px-2.5 py-1 rounded-lg transition-colors"
                :style="item.is_hot
                  ? 'background:rgba(239,68,68,0.12);color:#F87171'
                  : 'background:rgba(255,255,255,0.05);color:#64748B'">
                {{ item.is_hot ? '🔥 Hot' : 'Mark Hot' }}
              </button>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-md shrink-0"
              :style="statusStyle(item.status)">{{ item.status }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Admin — Oracle Market' })

const user     = useSupabaseUser()
const supabase = useSupabaseClient()

const ADMIN_EMAIL = 'admin@oraclemarket.mm' // change to your email

const isAdmin = computed(() =>
  user.value?.email === ADMIN_EMAIL ||
  user.value?.app_metadata?.role === 'admin'
)

const { data: listingsData, pending: pendingListings } = await useAsyncData('admin-top', async () => {
  if (!isAdmin.value) return []
  const { data } = await supabase
    .from('portfolio_items')
    .select('id,title,price,status,view_count,is_verified,is_hot,thumbnail_url,categories(name)')
    .order('view_count', { ascending: false })
    .limit(50)
  return data ?? []
})

const topListings = computed(() => (listingsData.value ?? []).slice(0, 8))
const allListings  = computed(() => listingsData.value ?? [])

const pendingAll = pendingListings

const { data: demoRequests, pending: pendingDemos } = await useAsyncData('admin-demos', async () => {
  if (!isAdmin.value) return []
  const { data } = await supabase
    .from('demo_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
})

const overviewStats = computed(() => {
  const all = listingsData.value ?? []
  return [
    { label: 'Total Listings',    value: all.length,                               sub: null,     up: false },
    { label: 'Published',         value: all.filter(i => i.status === 'published').length, sub: null, up: false },
    { label: 'Sold',              value: all.filter(i => i.status === 'sold').length,      sub: null, up: true  },
    { label: 'Demo Requests',     value: demoRequests.value?.length ?? 0,           sub: null,     up: true  },
  ]
})

function statusStyle(status: string) {
  const m: Record<string, string> = {
    published: 'background:rgba(52,211,153,0.1);color:#34D399',
    draft:     'background:rgba(255,255,255,0.06);color:#64748B',
    sold:      'background:rgba(124,58,237,0.15);color:#A78BFA',
  }
  return m[status] ?? m.draft
}

function formatMMK(price: number) {
  if (!price) return '—'
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M ks'
  if (price >= 1_000)     return (price / 1_000).toFixed(0) + 'K ks'
  return price + ' ks'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

async function toggleVerified(item: any) {
  await supabase.from('portfolio_items').update({ is_verified: !item.is_verified }).eq('id', item.id)
  item.is_verified = !item.is_verified
}

async function toggleHot(item: any) {
  await supabase.from('portfolio_items').update({ is_hot: !item.is_hot }).eq('id', item.id)
  item.is_hot = !item.is_hot
}
</script>
