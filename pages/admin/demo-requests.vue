<template>
  <div class="p-8 max-w-5xl">

    <div class="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <p class="text-xs uppercase tracking-widest text-text-subtle mb-1">Admin</p>
        <h1 class="font-display font-bold text-text-strong text-2xl">Demo Requests</h1>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="statusFilter"
          class="text-sm px-3 py-2 rounded-xl outline-none text-text-muted bg-white/5 cursor-pointer">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>

    <!-- Summary strip -->
    <div class="grid grid-cols-3 gap-5 mb-8">
      <div v-for="s in summary" :key="s.label"
        class="rounded-xl px-5 py-4"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">
        <p class="text-2xl font-display font-bold text-text-strong">{{ s.value }}</p>
        <p class="text-xs text-text-subtle mt-1">{{ s.label }}</p>
      </div>
    </div>

    <!-- Requests list -->
    <div class="rounded-2xl overflow-hidden"
      style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">

      <div class="grid gap-4 px-5 py-3 text-xs uppercase tracking-widest text-text-faint"
        style="grid-template-columns:1fr 12rem 7rem 7rem;border-bottom:1px solid rgba(255,255,255,0.05)">
        <span>Contact</span>
        <span>Listing</span>
        <span>Received</span>
        <span class="text-right">Status</span>
      </div>

      <div v-if="pending" class="divide-y divide-white/[0.03]">
        <div v-for="i in 6" :key="i" class="px-5 py-4"><div class="h-5 skeleton rounded w-3/4" /></div>
      </div>

      <div v-else-if="filtered.length === 0"
        class="py-16 text-center text-sm text-text-subtle">
        No requests found
      </div>

      <div v-else class="divide-y divide-white/[0.03]">
        <div v-for="req in filtered" :key="req.id"
          class="grid gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors group"
          style="grid-template-columns:1fr 12rem 7rem 7rem">

          <!-- Contact -->
          <div class="min-w-0">
            <p class="text-sm text-text-strong truncate">{{ req.name }}</p>
            <p class="text-xs text-text-subtle truncate">{{ req.contact }}</p>
          </div>

          <!-- Listing -->
          <p class="text-xs text-text-subtle truncate">{{ req.listing_id?.slice(0, 8) ?? '—' }}…</p>

          <!-- Date -->
          <p class="text-xs text-text-faint">{{ fmtDate(req.created_at) }}</p>

          <!-- Status + quick-change -->
          <div class="flex justify-end">
            <select :value="req.status"
              @change="updateStatus(req, ($event.target as HTMLSelectElement).value)"
              class="text-xs px-2 py-1.5 rounded-lg outline-none cursor-pointer"
              :style="statusStyle(req.status)">
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Demo Requests — Oracle Admin' })

const supabase     = useSupabaseClient()
const statusFilter = ref('all')

const { data: requests, pending, refresh } = await useAsyncData('admin-demo-reqs', async () => {
  const { data } = await supabase
    .from('demo_requests')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
})

const filtered = computed(() => {
  if (statusFilter.value === 'all') return requests.value ?? []
  return (requests.value ?? []).filter((r: any) => r.status === statusFilter.value)
})

const summary = computed(() => {
  const all = requests.value ?? []
  return [
    { label: 'Total Requests', value: all.length },
    { label: 'Pending',        value: all.filter((r: any) => r.status === 'pending').length },
    { label: 'Contacted',      value: all.filter((r: any) => r.status === 'contacted').length },
  ]
})

async function updateStatus(req: any, status: string) {
  await supabase.from('demo_requests').update({ status }).eq('id', req.id)
  req.status = status
}

function statusStyle(s: string) {
  const m: Record<string, string> = {
    pending:   'background:rgba(245,158,11,0.12);color:#F59E0B',
    contacted: 'background:rgba(99,102,241,0.15);color:#818CF8',
    closed:    'background:rgba(52,211,153,0.1);color:#34D399',
  }
  return (m[s] ?? m.pending) + ';border:none;'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
