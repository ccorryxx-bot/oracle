<template>
  <div class="p-8 max-w-7xl">

    <!-- Header -->
    <div class="mb-8 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p class="text-xs uppercase tracking-widest text-text-subtle mb-1">Admin</p>
        <h1 class="font-display font-bold text-text-strong text-2xl">Listings</h1>
      </div>
      <div class="flex items-center gap-3">
        <input v-model="search" type="text" placeholder="Search…"
          class="text-sm px-3 py-2 rounded-xl outline-none text-text w-44
                 bg-white/5 focus:bg-white/8 transition-colors placeholder:text-text-faint" />
        <select v-model="statusFilter"
          class="text-sm px-3 py-2 rounded-xl outline-none text-text-muted bg-white/5 cursor-pointer">
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="sold">Sold</option>
        </select>
        <button @click="openDrawer(null)"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                 transition-colors bg-primary hover:bg-primary-hover">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Listing
        </button>
      </div>
    </div>

    <!-- Status tabs -->
    <div class="flex items-center gap-6 mb-6 border-b" style="border-color:rgba(255,255,255,0.06)">
      <button v-for="tab in statusTabs" :key="tab.key"
        @click="statusFilter = tab.key"
        class="text-sm pb-3 transition-colors relative"
        :class="statusFilter === tab.key ? 'text-text-strong' : 'text-text-subtle hover:text-text'">
        {{ tab.label }}
        <span class="ml-1.5 text-xs opacity-60">{{ tab.count }}</span>
        <span v-if="statusFilter === tab.key"
          class="absolute -bottom-px left-0 right-0 h-0.5 bg-accent rounded-full" />
      </button>
    </div>

    <!-- Bulk action bar -->
    <Transition enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2">
      <div v-if="selected.length > 0"
        class="mb-4 flex items-center gap-4 px-4 py-3 rounded-xl"
        style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2)">
        <span class="text-sm text-accent font-medium">{{ selected.length }} selected</span>
        <div class="flex items-center gap-2 ml-auto">
          <button @click="bulkPublish"
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style="background:rgba(52,211,153,0.1);color:#34D399">
            Publish All
          </button>
          <button @click="bulkDelete"
            class="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style="background:rgba(239,68,68,0.1);color:#F87171">
            Delete Selected
          </button>
          <button @click="selected = []"
            class="text-xs text-text-subtle hover:text-text transition-colors">
            Clear
          </button>
        </div>
      </div>
    </Transition>

    <!-- Table -->
    <div class="rounded-2xl overflow-hidden"
      style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">

      <!-- Header row -->
      <div class="grid items-center gap-3 px-5 py-3 text-xs uppercase tracking-widest text-text-faint"
        style="grid-template-columns:2rem 3.5rem 1fr 6rem 5rem 5rem 9rem;border-bottom:1px solid rgba(255,255,255,0.05)">
        <input type="checkbox" class="rounded accent-accent cursor-pointer"
          :checked="allSelected" @change="toggleAll" />
        <span>#</span>
        <span>Listing</span>
        <span class="text-right">Price</span>
        <span class="text-right">Views</span>
        <span class="text-center">Status</span>
        <span class="text-right">Actions</span>
      </div>

      <!-- Skeleton -->
      <div v-if="pending" class="divide-y divide-white/[0.03]">
        <div v-for="i in 6" :key="i" class="px-5 py-4">
          <div class="h-5 skeleton rounded" style="width:60%" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredListings.length === 0"
        class="py-16 text-center">
        <p class="text-sm text-text-subtle mb-4">No listings found</p>
        <button @click="openDrawer(null)"
          class="text-sm font-medium text-accent hover:underline">
          + Add your first listing
        </button>
      </div>

      <!-- Rows -->
      <div v-else class="divide-y divide-white/[0.03]">
        <div v-for="(item, i) in filteredListings" :key="item.id"
          class="grid items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
          style="grid-template-columns:2rem 3.5rem 1fr 6rem 5rem 5rem 9rem">

          <!-- Checkbox -->
          <input type="checkbox" class="rounded accent-accent cursor-pointer"
            :checked="selected.includes(item.id)"
            @change="toggleSelect(item.id)" />

          <!-- Index + thumbnail -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-7 rounded overflow-hidden shrink-0 bg-surface-hover">
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url"
                class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Title + badges -->
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <p class="text-sm text-text-strong truncate">{{ item.title }}</p>
              <span v-if="item.is_featured" class="text-xs px-1 rounded"
                style="background:rgba(245,158,11,0.15);color:#F59E0B">★</span>
              <span v-if="item.is_verified" class="text-xs" style="color:#34D399">✓</span>
              <span v-if="item.is_hot" class="text-xs">🔥</span>
            </div>
            <p class="text-xs text-text-faint truncate">
              {{ (item as any).categories?.name ?? '—' }}
            </p>
          </div>

          <!-- Price -->
          <p class="text-sm text-right font-medium"
            :class="item.status === 'sold' ? 'text-text-subtle line-through' : 'text-text-strong'">
            {{ fmtPrice(item.price) }}
          </p>

          <!-- Views -->
          <p class="text-sm text-right text-text-muted">{{ item.view_count ?? 0 }}</p>

          <!-- Status -->
          <div class="flex justify-center">
            <span class="text-xs px-2.5 py-1 rounded-lg" :style="statusBadge(item.status)">
              {{ item.status }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-1.5">
            <!-- Pin/feature -->
            <button @click="toggleFeatured(item)" :title="item.is_featured ? 'Unpin' : 'Pin to top'"
              class="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              :style="item.is_featured
                ? 'background:rgba(245,158,11,0.15);color:#F59E0B'
                : 'background:rgba(255,255,255,0.05);color:#64748B'">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
            <!-- Edit -->
            <button @click="openDrawer(item)" title="Edit"
              class="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              style="background:rgba(255,255,255,0.05);color:#A78BFA hover:color:#fff">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <!-- Preview -->
            <NuxtLink :to="`/listings/${item.id}`" target="_blank" title="Preview on site"
              class="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              style="background:rgba(255,255,255,0.05);color:#64748B">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </NuxtLink>
            <!-- Delete -->
            <button @click="confirmDelete(item)" title="Delete"
              class="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              style="background:rgba(239,68,68,0.08);color:#F87171">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Delete Confirm Modal ────────────────────────────────── -->
  <Transition enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="deleteTarget"
      class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
      @click.self="deleteTarget = null">
      <div class="w-full max-w-sm p-7 rounded-2xl animate-fade-up"
        style="background:#0E0E1C;border:1px solid rgba(239,68,68,0.2)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
          style="background:rgba(239,68,68,0.1)">
          <svg class="w-5 h-5" style="color:#F87171" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <h3 class="font-display font-bold text-text-strong mb-2">Delete Listing?</h3>
        <p class="text-sm text-text-subtle mb-1">
          <span class="text-text-strong">{{ deleteTarget?.title }}</span>
        </p>
        <p class="text-sm text-text-subtle mb-7">
          This action is permanent and cannot be undone.
        </p>
        <div class="flex gap-3">
          <button @click="deleteTarget = null"
            class="flex-1 py-2.5 rounded-xl text-sm text-text-muted hover:text-text transition-colors"
            style="background:rgba(255,255,255,0.05)">
            Cancel
          </button>
          <button @click="executeDelete" :disabled="deleting"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style="background:#DC2626">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ── Add / Edit Drawer ──────────────────────────────────── -->
  <Transition enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="drawerOpen" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      @click.self="closeDrawer" />
  </Transition>
  <Transition enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="translate-x-full" leave-to-class="translate-x-full">
    <div v-if="drawerOpen"
      class="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl overflow-y-auto"
      style="background:#0A0A1A;border-left:1px solid rgba(255,255,255,0.07)">

      <!-- Drawer header -->
      <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style="background:#0A0A1A;border-bottom:1px solid rgba(255,255,255,0.06)">
        <h2 class="font-display font-bold text-text-strong">
          {{ editTarget ? 'Edit Listing' : 'Add New Listing' }}
        </h2>
        <button @click="closeDrawer" class="p-2 rounded-lg text-text-subtle hover:text-text hover:bg-white/5">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <div class="px-6 py-6 space-y-6">

        <!-- Basic Info -->
        <fieldset>
          <legend class="text-xs uppercase tracking-widest text-text-subtle mb-4">Basic Info</legend>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-text-subtle mb-1.5">Title *</label>
              <input v-model="form.title" type="text" placeholder="e.g. Dragon Ace — Full Slot Platform"
                class="field-input" />
            </div>
            <div>
              <label class="block text-xs text-text-subtle mb-1.5">Description</label>
              <textarea v-model="form.description" rows="3" placeholder="Describe this website listing…"
                class="field-input resize-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">Category</label>
                <select v-model="form.category_id" class="field-input">
                  <option value="">— Select —</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">Status</label>
                <select v-model="form.status" class="field-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs text-text-subtle mb-1.5">Thumbnail URL</label>
              <input v-model="form.thumbnail_url" type="url" placeholder="https://…"
                class="field-input" />
            </div>
          </div>
        </fieldset>

        <div class="h-px" style="background:rgba(255,255,255,0.05)" />

        <!-- Pricing -->
        <fieldset>
          <legend class="text-xs uppercase tracking-widest text-text-subtle mb-4">Pricing</legend>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-text-subtle mb-1.5">Pricing Model</label>
              <select v-model="form.pricing_model" class="field-input">
                <option value="full_ownership">Full Ownership</option>
                <option value="revenue_share">Revenue Share</option>
                <option value="both">Both Available</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">
                  Price (ks)
                  <span class="text-text-faint">(full ownership)</span>
                </label>
                <input v-model.number="form.price" type="number" placeholder="5000000"
                  class="field-input" />
              </div>
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">Monthly Fee (ks)</label>
                <input v-model.number="form.monthly_fee" type="number" placeholder="500000"
                  class="field-input" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">Revenue Share %</label>
                <input v-model.number="form.revenue_share_pct" type="number" min="0" max="100" placeholder="30"
                  class="field-input" />
              </div>
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">Setup Fee (ks)</label>
                <input v-model.number="form.setup_fee" type="number" placeholder="0"
                  class="field-input" />
              </div>
            </div>
          </div>
        </fieldset>

        <div class="h-px" style="background:rgba(255,255,255,0.05)" />

        <!-- Tech Stack -->
        <fieldset>
          <legend class="text-xs uppercase tracking-widest text-text-subtle mb-4">Tech Stack</legend>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="key in techKeys" :key="key">
              <label class="block text-xs text-text-subtle mb-1.5 capitalize">{{ key }}</label>
              <input v-model="form.tech_stack[key]" type="text" :placeholder="techPlaceholders[key] ?? key"
                class="field-input" />
            </div>
          </div>
        </fieldset>

        <div class="h-px" style="background:rgba(255,255,255,0.05)" />

        <!-- Games -->
        <fieldset>
          <legend class="text-xs uppercase tracking-widest text-text-subtle mb-4">Games</legend>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-text-subtle mb-2">Game Types</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="g in gameTypeOptions" :key="g"
                  class="flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-lg transition-colors"
                  :style="form.game_types.includes(g)
                    ? 'background:rgba(124,58,237,0.15);color:#A78BFA'
                    : 'background:rgba(255,255,255,0.04);color:#64748B'">
                  <input type="checkbox" class="sr-only"
                    :checked="form.game_types.includes(g)"
                    @change="toggleArr(form.game_types, g)" />
                  {{ g }}
                </label>
              </div>
            </div>
            <div>
              <label class="block text-xs text-text-subtle mb-1.5">Game Providers (comma-separated)</label>
              <input :value="form.game_providers.join(', ')"
                @input="form.game_providers = ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean)"
                type="text" placeholder="PG Soft, Pragmatic Play, Jili…"
                class="field-input" />
            </div>
          </div>
        </fieldset>

        <div class="h-px" style="background:rgba(255,255,255,0.05)" />

        <!-- Payment & Links -->
        <fieldset>
          <legend class="text-xs uppercase tracking-widest text-text-subtle mb-4">Payment & Contact</legend>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-text-subtle mb-2">Payment Methods</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="pm in paymentOptions" :key="pm"
                  class="flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-lg transition-colors"
                  :style="form.payment_methods.includes(pm)
                    ? 'background:rgba(52,211,153,0.12);color:#34D399'
                    : 'background:rgba(255,255,255,0.04);color:#64748B'">
                  <input type="checkbox" class="sr-only"
                    :checked="form.payment_methods.includes(pm)"
                    @change="toggleArr(form.payment_methods, pm)" />
                  {{ pm }}
                </label>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">Demo URL</label>
                <input v-model="form.demo_url" type="url" placeholder="https://demo.example.com"
                  class="field-input" />
              </div>
              <div>
                <label class="block text-xs text-text-subtle mb-1.5">Telegram URL</label>
                <input v-model="form.telegram_url" type="url" placeholder="https://t.me/…"
                  class="field-input" />
              </div>
            </div>
          </div>
        </fieldset>

        <div class="h-px" style="background:rgba(255,255,255,0.05)" />

        <!-- Flags -->
        <fieldset>
          <legend class="text-xs uppercase tracking-widest text-text-subtle mb-4">Flags</legend>
          <div class="flex flex-wrap gap-4">
            <label v-for="flag in flags" :key="flag.key"
              class="flex items-center gap-2 cursor-pointer text-sm">
              <div @click="(form as any)[flag.key] = !(form as any)[flag.key]"
                class="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                :style="(form as any)[flag.key]
                  ? 'background:#7C3AED'
                  : 'background:rgba(255,255,255,0.1)'">
                <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow"
                  :style="(form as any)[flag.key] ? 'left:calc(100% - 18px)' : 'left:2px'" />
              </div>
              <span class="text-text-muted">{{ flag.label }}</span>
            </label>
          </div>
        </fieldset>

      </div>

      <!-- Drawer footer -->
      <div class="sticky bottom-0 flex items-center gap-3 px-6 py-4"
        style="background:#0A0A1A;border-top:1px solid rgba(255,255,255,0.06)">
        <p v-if="formError" class="text-xs text-danger flex-1">{{ formError }}</p>
        <div v-else class="flex-1" />
        <button @click="closeDrawer"
          class="px-4 py-2.5 rounded-xl text-sm text-text-muted hover:text-text transition-colors"
          style="background:rgba(255,255,255,0.05)">
          Cancel
        </button>
        <button @click="saveListing" :disabled="saving || !form.title"
          class="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
                 bg-primary hover:bg-primary-hover disabled:opacity-40">
          {{ saving ? 'Saving…' : (editTarget ? 'Save Changes' : 'Publish Listing') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Listings — Oracle Admin' })

const supabase     = useSupabaseClient()
const search       = ref('')
const statusFilter = ref('all')
const selected     = ref<string[]>([])
const drawerOpen   = ref(false)
const editTarget   = ref<any>(null)
const deleteTarget = ref<any>(null)
const deleting     = ref(false)
const saving       = ref(false)
const formError    = ref('')

const blankForm = () => ({
  title: '', description: '', category_id: '', status: 'published',
  thumbnail_url: '', price: null as number | null,
  pricing_model: 'full_ownership', monthly_fee: null as number | null,
  revenue_share_pct: null as number | null, setup_fee: null as number | null,
  tech_stack: { frontend: '', backend: '', database: '', admin: '' } as Record<string, string>,
  game_types: [] as string[], game_providers: [] as string[],
  payment_methods: [] as string[], demo_url: '', telegram_url: '',
  demo_available: false, is_verified: false, is_hot: false, is_featured: false,
})

const form = reactive(blankForm())

const gameTypeOptions  = ['Slot', 'Live Casino', 'Sports Betting', 'Lottery', 'Poker', 'Fishing']
const paymentOptions   = ['KBZPay', 'Wave Money', 'AYA Pay', 'USDT', 'Bank Transfer']
const techKeys         = ['frontend', 'backend', 'database', 'admin']
const techPlaceholders: Record<string, string> = {
  frontend: 'Vue 3 / React', backend: 'Node.js', database: 'MySQL', admin: 'Custom Panel'
}
const flags = [
  { key: 'demo_available', label: 'Demo Available' },
  { key: 'is_verified',    label: 'Verified'        },
  { key: 'is_hot',         label: 'Hot'             },
  { key: 'is_featured',    label: 'Featured (pin)'  },
]

// ── Data ────────────────────────────────────────────────────────────────────
const { data: allListings, pending, refresh } = await useAsyncData('admin-listings-full', async () => {
  const { data } = await supabase
    .from('portfolio_items')
    .select('id,title,price,status,view_count,is_verified,is_hot,is_featured,thumbnail_url,category_id,categories(name),demo_available,pricing_model,description,monthly_fee,revenue_share_pct,setup_fee,tech_stack,game_types,game_providers,payment_methods,demo_url,telegram_url,created_at')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
})

const { data: categories } = await useAsyncData('admin-cats', async () => {
  const { data } = await supabase.from('categories').select('id,name').order('name')
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

const allSelected = computed(() =>
  filteredListings.value.length > 0 &&
  filteredListings.value.every(i => selected.value.includes(i.id))
)

function toggleAll() {
  if (allSelected.value) selected.value = []
  else selected.value = filteredListings.value.map(i => i.id)
}
function toggleSelect(id: string) {
  const idx = selected.value.indexOf(id)
  if (idx === -1) selected.value.push(id)
  else selected.value.splice(idx, 1)
}

// ── Drawer ───────────────────────────────────────────────────────────────────
function openDrawer(item: any) {
  editTarget.value = item
  Object.assign(form, blankForm())
  if (item) {
    form.title              = item.title ?? ''
    form.description        = item.description ?? ''
    form.category_id        = item.category_id ?? ''
    form.status             = item.status ?? 'published'
    form.thumbnail_url      = item.thumbnail_url ?? ''
    form.price              = item.price ?? null
    form.pricing_model      = item.pricing_model ?? 'full_ownership'
    form.monthly_fee        = item.monthly_fee ?? null
    form.revenue_share_pct  = item.revenue_share_pct ?? null
    form.setup_fee          = item.setup_fee ?? null
    form.tech_stack         = item.tech_stack ?? { frontend: '', backend: '', database: '', admin: '' }
    form.game_types         = item.game_types ?? []
    form.game_providers     = item.game_providers ?? []
    form.payment_methods    = item.payment_methods ?? []
    form.demo_url           = item.demo_url ?? ''
    form.telegram_url       = item.telegram_url ?? ''
    form.demo_available     = item.demo_available ?? false
    form.is_verified        = item.is_verified ?? false
    form.is_hot             = item.is_hot ?? false
    form.is_featured        = item.is_featured ?? false
  }
  drawerOpen.value = true
  formError.value  = ''
}

function closeDrawer() {
  drawerOpen.value = false
  editTarget.value = null
  formError.value  = ''
}

async function saveListing() {
  if (!form.title.trim()) { formError.value = 'Title is required'; return }
  saving.value    = true
  formError.value = ''

  const payload = {
    title:             form.title.trim(),
    description:       form.description || null,
    category_id:       form.category_id || null,
    status:            form.status,
    thumbnail_url:     form.thumbnail_url || null,
    price:             form.price,
    pricing_model:     form.pricing_model,
    monthly_fee:       form.monthly_fee,
    revenue_share_pct: form.revenue_share_pct,
    setup_fee:         form.setup_fee,
    tech_stack:        form.tech_stack,
    game_types:        form.game_types,
    game_providers:    form.game_providers,
    payment_methods:   form.payment_methods,
    demo_url:          form.demo_url || null,
    telegram_url:      form.telegram_url || null,
    demo_available:    form.demo_available,
    is_verified:       form.is_verified,
    is_hot:            form.is_hot,
    is_featured:       form.is_featured,
  }

  let err
  if (editTarget.value) {
    const r = await supabase.from('portfolio_items').update(payload).eq('id', editTarget.value.id)
    err = r.error
  } else {
    const r = await supabase.from('portfolio_items').insert(payload)
    err = r.error
  }

  saving.value = false
  if (err) { formError.value = err.message; return }

  closeDrawer()
  await refresh()
}

// ── Delete ────────────────────────────────────────────────────────────────────
function confirmDelete(item: any) { deleteTarget.value = item }

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  await supabase.from('portfolio_items').delete().eq('id', deleteTarget.value.id)
  deleting.value  = false
  deleteTarget.value = null
  await refresh()
}

// ── Bulk actions ──────────────────────────────────────────────────────────────
async function bulkPublish() {
  await supabase.from('portfolio_items').update({ status: 'published' }).in('id', selected.value)
  selected.value = []
  await refresh()
}
async function bulkDelete() {
  if (!confirm(`Delete ${selected.value.length} listings? This cannot be undone.`)) return
  await supabase.from('portfolio_items').delete().in('id', selected.value)
  selected.value = []
  await refresh()
}

// ── Toggles ───────────────────────────────────────────────────────────────────
async function toggleFeatured(item: any) {
  await supabase.from('portfolio_items').update({ is_featured: !item.is_featured }).eq('id', item.id)
  item.is_featured = !item.is_featured
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function toggleArr(arr: string[], val: string) {
  const i = arr.indexOf(val)
  if (i === -1) arr.push(val); else arr.splice(i, 1)
}
function statusBadge(s: string) {
  const m: Record<string, string> = {
    published: 'background:rgba(52,211,153,0.1);color:#34D399',
    draft:     'background:rgba(255,255,255,0.06);color:#64748B',
    sold:      'background:rgba(124,58,237,0.15);color:#A78BFA',
  }
  return m[s] ?? m.draft
}
function fmtPrice(p: number) {
  if (!p) return '—'
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1) + 'M'
  return p.toLocaleString()
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-2.5 rounded-xl text-sm text-text outline-none transition-colors
         placeholder:text-text-faint;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.07);
}
.field-input:focus {
  background: rgba(255,255,255,0.07);
  border-color: rgba(124,58,237,0.4);
}
</style>
