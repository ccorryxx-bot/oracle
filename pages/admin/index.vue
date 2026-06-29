<template>
  <div class="p-8 max-w-6xl">

    <!-- Header -->
    <div class="mb-10 flex items-center justify-between flex-wrap gap-4">
      <div>
        <p class="text-xs uppercase tracking-widest text-text-subtle mb-1">Admin</p>
        <h1 class="font-display font-bold text-text-strong text-2xl">Overview</h1>
        <p class="text-sm text-text-subtle mt-1">{{ today }}</p>
      </div>
      <div class="flex items-center gap-2 text-xs px-4 py-2 rounded-xl"
        style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.15);color:#34D399">
        <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        Live
      </div>
    </div>

    <!-- ── KPI Cards ──────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <div v-for="kpi in kpis" :key="kpi.label"
        class="rounded-2xl p-5 relative overflow-hidden group"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          :style="kpi.glow" />
        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <p class="text-xs text-text-subtle">{{ kpi.label }}</p>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
              :style="kpi.iconBg">
              <span class="text-sm">{{ kpi.icon }}</span>
            </div>
          </div>
          <p class="font-display font-bold text-text-strong text-3xl mb-1">{{ kpi.value }}</p>
          <p v-if="kpi.sub" class="text-xs" :class="kpi.positive ? 'text-success' : 'text-text-faint'">
            {{ kpi.sub }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Conversion Funnel ──────────────────────────────────────────── -->
    <div class="mb-8 rounded-2xl p-6"
      style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-sm font-semibold text-text-strong">Conversion Funnel</p>
          <p class="text-xs text-text-subtle mt-0.5">Total views → Demo → Sale</p>
        </div>
        <span class="text-xs px-3 py-1.5 rounded-lg text-text-subtle"
          style="background:rgba(255,255,255,0.05)">All time</span>
      </div>

      <div class="space-y-3">
        <div v-for="(stage, i) in funnelStages" :key="stage.label" class="group">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">{{ stage.icon }}</span>
              <span class="text-sm text-text-muted">{{ stage.label }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-text-strong">{{ stage.value }}</span>
              <span v-if="i > 0" class="text-xs px-2 py-0.5 rounded-md"
                :style="stage.convRate > 10
                  ? 'background:rgba(52,211,153,0.1);color:#34D399'
                  : 'background:rgba(245,158,11,0.1);color:#F59E0B'">
                {{ stage.convRate }}%
              </span>
            </div>
          </div>
          <div class="h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.05)">
            <div class="h-full rounded-full transition-all duration-1000"
              :style="{ width: stage.pct + '%', background: stage.color }" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">

      <!-- ── Top Listings ───────────────────────────────────────────── -->
      <div class="rounded-2xl p-6"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm font-semibold text-text-strong">Top Listings</p>
          <NuxtLink to="/admin/listings"
            class="text-xs text-text-subtle hover:text-accent transition-colors">View all →</NuxtLink>
        </div>
        <div v-if="pending" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-9 skeleton rounded-lg" />
        </div>
        <div v-else class="space-y-0.5">
          <div v-for="(item, i) in topListings" :key="item.id"
            class="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
            <span class="text-xs font-mono text-text-faint w-4 shrink-0">{{ i + 1 }}</span>

            <!-- Mini bar chart -->
            <div class="w-1 h-6 rounded-full shrink-0"
              :style="{ background: `rgba(124,58,237,${0.9 - i * 0.15})`, minWidth: '3px' }" />

            <div class="flex-1 min-w-0">
              <p class="text-sm text-text truncate">{{ item.title }}</p>
            </div>
            <span class="text-xs text-text-subtle shrink-0">{{ item.view_count ?? 0 }} views</span>
            <span class="text-xs px-2 py-0.5 rounded-md shrink-0" :style="statusBadge(item.status)">
              {{ item.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Recent Demo Requests ───────────────────────────────────── -->
      <div class="rounded-2xl p-6"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-text-strong">Demo Requests</p>
            <span v-if="pendingCount > 0"
              class="text-xs px-2 py-0.5 rounded-full font-semibold"
              style="background:rgba(245,158,11,0.15);color:#F59E0B">
              {{ pendingCount }} new
            </span>
          </div>
          <NuxtLink to="/admin/demo-requests"
            class="text-xs text-text-subtle hover:text-accent transition-colors">View all →</NuxtLink>
        </div>
        <div v-if="pendingDemos" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-9 skeleton rounded-lg" />
        </div>
        <div v-else-if="!recentDemos.length"
          class="py-8 text-center text-sm text-text-subtle">No demo requests yet</div>
        <div v-else class="space-y-0.5">
          <div v-for="req in recentDemos" :key="req.id"
            class="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
            <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style="background:rgba(124,58,237,0.12);color:#A78BFA">
              {{ req.name?.[0]?.toUpperCase() ?? '?' }}
            </div>
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

      <!-- ── Revenue Pipeline ──────────────────────────────────────── -->
      <div class="rounded-2xl p-6 lg:col-span-2"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm font-semibold text-text-strong">Listing Pipeline</p>
          <NuxtLink to="/admin/listings"
            class="text-xs text-accent hover:underline">+ Add listing</NuxtLink>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="stage in pipeline" :key="stage.label"
            class="text-center p-4 rounded-xl"
            :style="stage.bg">
            <p class="text-2xl font-bold mb-1" :style="{ color: stage.color }">
              {{ stage.value }}
            </p>
            <p class="text-xs text-text-subtle">{{ stage.label }}</p>
            <p v-if="stage.amount" class="text-xs font-medium mt-1" :style="{ color: stage.color }">
              {{ stage.amount }}
            </p>
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
  const { data } = await supabase.from('demo_requests').select('*').order('created_at', { ascending: false }).limit(20)
  return data ?? []
})

const { data: demoTotal } = await useAsyncData('demo-total', async () => {
  const { count } = await supabase.from('demo_requests').select('*', { count: 'exact', head: true })
  return count ?? 0
})

const topListings  = computed(() => (listings.value ?? []).slice(0, 6))
const recentDemos  = computed(() => (demos.value ?? []).slice(0, 5))
const pendingCount = computed(() => (demos.value ?? []).filter((d: any) => d.status === 'pending').length)

const totalViews = computed(() => (listings.value ?? []).reduce((s, i) => s + (i.view_count ?? 0), 0))
const totalRevenue = computed(() => {
  const sold = (listings.value ?? []).filter(i => i.status === 'sold')
  return sold.reduce((s, i) => s + (i.price ?? 0), 0)
})

const kpis = computed(() => {
  const all  = listings.value ?? []
  const pub  = all.filter(i => i.status === 'published')
  const sold = all.filter(i => i.status === 'sold')
  return [
    { label: 'Total Views',    value: totalViews.value.toLocaleString(), sub: 'All time',        positive: true,  icon: '👁', iconBg: 'background:rgba(124,58,237,0.12)', glow: 'background:radial-gradient(circle at 50% 0,rgba(124,58,237,0.05),transparent 60%)' },
    { label: 'Published',      value: pub.length,  sub: all.length + ' total',     positive: true,  icon: '🟢', iconBg: 'background:rgba(52,211,153,0.1)',  glow: 'background:radial-gradient(circle at 50% 0,rgba(52,211,153,0.04),transparent 60%)'  },
    { label: 'Sold',           value: sold.length, sub: formatRevenue(totalRevenue.value), positive: true,  icon: '✅', iconBg: 'background:rgba(52,211,153,0.1)',  glow: 'background:radial-gradient(circle at 50% 0,rgba(52,211,153,0.04),transparent 60%)'  },
    { label: 'Demo Requests',  value: demoTotal.value ?? 0, sub: pendingCount.value + ' pending', positive: false, icon: '📋', iconBg: 'background:rgba(245,158,11,0.1)', glow: 'background:radial-gradient(circle at 50% 0,rgba(245,158,11,0.04),transparent 60%)'  },
  ]
})

const funnelStages = computed(() => {
  const all   = listings.value ?? []
  const views = totalViews.value || 1
  const demos = demoTotal.value ?? 0
  const sold  = all.filter(i => i.status === 'sold').length
  return [
    { label: 'Total Views',   icon: '👁', value: views,  pct: 100, color: '#7C3AED', convRate: 100 },
    { label: 'Demo Requests', icon: '🎮', value: demos,  pct: Math.min(100, (demos / views) * 100 * 8), color: '#A78BFA', convRate: +(demos / views * 100).toFixed(1) },
    { label: 'Sold',          icon: '🤝', value: sold,   pct: Math.min(100, (sold  / Math.max(demos, 1)) * 100 * 5), color: '#34D399', convRate: +(sold / Math.max(demos, 1) * 100).toFixed(1) },
  ]
})

const pipeline = computed(() => {
  const all  = listings.value ?? []
  const draft  = all.filter(i => i.status === 'draft').length
  const pub    = all.filter(i => i.status === 'published').length
  const sold   = all.filter(i => i.status === 'sold').length
  const soldAmt = all.filter(i => i.status === 'sold').reduce((s, i) => s + (i.price ?? 0), 0)
  const pipAmt  = all.filter(i => i.status === 'published').reduce((s, i) => s + (i.price ?? 0), 0)
  return [
    { label: 'Draft',     value: draft, amount: '',                    color: '#64748B', bg: 'background:rgba(255,255,255,0.03)' },
    { label: 'Published', value: pub,   amount: formatRevenue(pipAmt) + ' pipeline', color: '#A78BFA', bg: 'background:rgba(124,58,237,0.05)' },
    { label: 'Demos',     value: demoTotal.value ?? 0, amount: pendingCount.value + ' pending', color: '#F59E0B', bg: 'background:rgba(245,158,11,0.05)' },
    { label: 'Sold',      value: sold,  amount: formatRevenue(soldAmt) + ' earned',   color: '#34D399', bg: 'background:rgba(52,211,153,0.05)' },
  ]
})

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

function formatRevenue(n: number) {
  if (!n) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M ks'
  return (n / 1000).toFixed(0) + 'K ks'
}
</script>
