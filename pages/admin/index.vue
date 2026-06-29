<template>
  <div class="p-8 max-w-6xl">

    <!-- Page header -->
    <div class="mb-10">
      <p class="text-xs uppercase tracking-widest text-text-subtle mb-1">Admin</p>
      <h1 class="font-display font-bold text-text-strong text-2xl">Overview</h1>
      <p class="text-sm text-text-subtle mt-1">{{ today }}</p>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      <div v-for="kpi in kpis" :key="kpi.label"
        class="rounded-2xl p-5"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <p class="text-xs text-text-subtle mb-3">{{ kpi.label }}</p>
        <p class="font-display font-bold text-text-strong text-3xl">{{ kpi.value }}</p>
        <p v-if="kpi.sub" class="text-xs mt-2"
          :class="kpi.positive ? 'text-success' : 'text-text-faint'">
          {{ kpi.sub }}
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">

      <!-- Top listings by views -->
      <div class="rounded-2xl p-6"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm font-semibold text-text-strong">Top Listings</p>
          <NuxtLink to="/admin/listings"
            class="text-xs text-text-subtle hover:text-accent transition-colors">
            View all →
          </NuxtLink>
        </div>
        <div v-if="pending" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-9 skeleton rounded-lg" />
        </div>
        <div v-else class="space-y-1">
          <div v-for="(item, i) in topListings" :key="item.id"
            class="flex items-center gap-4 py-2.5">
            <span class="text-xs font-mono text-text-faint w-4 shrink-0">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-text truncate">{{ item.title }}</p>
            </div>
            <span class="text-xs text-text-subtle shrink-0">{{ item.view_count ?? 0 }} views</span>
            <span class="text-xs px-2 py-0.5 rounded-md shrink-0"
              :style="statusBadge(item.status)">{{ item.status }}</span>
          </div>
        </div>
      </div>

      <!-- Recent demo requests -->
      <div class="rounded-2xl p-6"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm font-semibold text-text-strong">Recent Demo Requests</p>
          <NuxtLink to="/admin/demo-requests"
            class="text-xs text-text-subtle hover:text-accent transition-colors">
            View all →
          </NuxtLink>
        </div>
        <div v-if="pendingDemos" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-9 skeleton rounded-lg" />
        </div>
        <div v-else-if="!recentDemos.length"
          class="py-8 text-center text-sm text-text-subtle">No demo requests yet</div>
        <div v-else class="space-y-1">
          <div v-for="req in recentDemos" :key="req.id"
            class="flex items-center gap-3 py-2.5">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-text truncate">{{ req.name }}</p>
              <p class="text-xs text-text-subtle truncate">{{ req.contact }}</p>
            </div>
            <span class="text-xs text-text-faint shrink-0">{{ fmtDate(req.created_at) }}</span>
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

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Overview — Oracle Admin' })

const supabase = useSupabaseClient()

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const { data: listings, pending } = await useAsyncData('admin-overview', async () => {
  const { data } = await supabase
    .from('portfolio_items')
    .select('id,title,status,view_count,price,created_at')
    .order('view_count', { ascending: false })
    .limit(100)
  return data ?? []
})

const { data: demos, pending: pendingDemos } = await useAsyncData('admin-demos', async () => {
  const { data } = await supabase
    .from('demo_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
})

const topListings  = computed(() => (listings.value ?? []).slice(0, 6))
const recentDemos  = computed(() => (demos.value ?? []).slice(0, 5))

const kpis = computed(() => {
  const all  = listings.value ?? []
  const pub  = all.filter(i => i.status === 'published')
  const sold = all.filter(i => i.status === 'sold')
  return [
    { label: 'Total Listings',  value: all.length,          sub: null,                    positive: false },
    { label: 'Published',       value: pub.length,           sub: null,                    positive: true  },
    { label: 'Sold',            value: sold.length,          sub: null,                    positive: true  },
    { label: 'Demo Requests',   value: demos.value?.length ?? 0, sub: pendingCount.value + ' pending', positive: false },
  ]
})

const pendingCount = computed(() =>
  (demos.value ?? []).filter((d: any) => d.status === 'pending').length
)

function statusBadge(s: string) {
  const m: Record<string, string> = {
    published: 'background:rgba(52,211,153,0.1);color:#34D399',
    draft:     'background:rgba(255,255,255,0.06);color:#64748B',
    sold:      'background:rgba(124,58,237,0.15);color:#A78BFA',
  }
  return m[s] ?? m.draft
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
</script>
