<template>
  <div class="p-8 max-w-3xl">

    <div class="mb-10">
      <p class="text-xs uppercase tracking-widest text-text-subtle mb-1">Admin</p>
      <h1 class="font-display font-bold text-text-strong text-2xl">Site Settings</h1>
    </div>

    <!-- Site Banner -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-sm font-semibold text-text-strong">Announcement Banner</p>
          <p class="text-xs text-text-subtle mt-0.5">Shows at the top of the main site for all visitors</p>
        </div>
        <!-- Toggle -->
        <div @click="banner.enabled = !banner.enabled"
          class="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
          :style="banner.enabled ? 'background:#7C3AED' : 'background:rgba(255,255,255,0.1)'">
          <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow"
            :style="banner.enabled ? 'left:calc(100% - 20px)' : 'left:4px'" />
        </div>
      </div>
      <div class="space-y-3 p-5 rounded-2xl"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.06)">
        <div>
          <label class="block text-xs text-text-subtle mb-1.5">Banner Message</label>
          <input v-model="banner.message" type="text"
            placeholder="e.g. New listings added — check out the latest game websites 🔥"
            class="w-full px-3 py-2.5 rounded-xl text-sm text-text outline-none transition-colors
                   bg-white/5 focus:bg-white/7 placeholder:text-text-faint"
            style="border:1px solid rgba(255,255,255,0.07)" />
        </div>
        <div>
          <label class="block text-xs text-text-subtle mb-1.5">Banner Type</label>
          <div class="flex gap-2">
            <button v-for="t in bannerTypes" :key="t.key"
              @click="banner.type = t.key"
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              :style="banner.type === t.key ? t.activeStyle : 'background:rgba(255,255,255,0.05);color:#64748B'">
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="banner.message"
          class="mt-2 px-4 py-2.5 rounded-lg text-sm font-medium text-center"
          :style="bannerPreviewStyle">
          {{ banner.message }}
        </div>
      </div>
    </section>

    <!-- Featured listing settings -->
    <section class="mb-10">
      <p class="text-sm font-semibold text-text-strong mb-1">Featured Listing</p>
      <p class="text-xs text-text-subtle mb-5">Pinned listings appear first on the homepage with a ★ badge</p>
      <div class="p-5 rounded-2xl"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.06)">
        <p class="text-xs text-text-subtle mb-3">
          Currently featured:
          <span class="text-accent font-medium">{{ featuredCount }} listing{{ featuredCount !== 1 ? 's' : '' }}</span>
        </p>
        <NuxtLink to="/admin/listings"
          class="text-xs font-medium text-accent hover:underline">
          Manage in Listings →
        </NuxtLink>
      </div>
    </section>

    <!-- Admin accounts -->
    <section class="mb-10">
      <p class="text-sm font-semibold text-text-strong mb-1">Admin Accounts</p>
      <p class="text-xs text-text-subtle mb-5">Emails with admin access</p>
      <div class="p-5 rounded-2xl space-y-3"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.06)">
        <div v-for="email in adminEmails" :key="email"
          class="flex items-center gap-3 py-2 border-b"
          style="border-color:rgba(255,255,255,0.04)">
          <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style="background:rgba(124,58,237,0.15);color:#A78BFA">
            {{ email[0].toUpperCase() }}
          </div>
          <p class="text-sm text-text flex-1">{{ email }}</p>
          <span class="text-xs px-2 py-0.5 rounded-md"
            style="background:rgba(52,211,153,0.1);color:#34D399">Admin</span>
        </div>
        <p class="text-xs text-text-faint pt-1">
          To add more admins, update <code class="text-accent">middleware/admin.ts</code>
        </p>
      </div>
    </section>

    <!-- Save -->
    <div class="flex items-center gap-4">
      <button @click="saveBannerSettings" :disabled="saving"
        class="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-colors
               bg-primary hover:bg-primary-hover disabled:opacity-40">
        {{ saving ? 'Saving…' : 'Save Settings' }}
      </button>
      <Transition enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0" leave-to-class="opacity-0">
        <span v-if="saved" class="text-sm text-success">✓ Saved</span>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Settings — Oracle Admin' })

const supabase = useSupabaseClient()

const adminEmails = ['admin@oraclemarket.mm']

const banner = reactive({
  enabled: false,
  message: '',
  type:    'info' as 'info' | 'success' | 'warning',
})

const bannerTypes = [
  { key: 'info',    label: 'Info',    activeStyle: 'background:rgba(99,102,241,0.15);color:#818CF8' },
  { key: 'success', label: 'Success', activeStyle: 'background:rgba(52,211,153,0.12);color:#34D399' },
  { key: 'warning', label: 'Warning', activeStyle: 'background:rgba(245,158,11,0.12);color:#F59E0B' },
]

const bannerPreviewStyle = computed(() => {
  const styles: Record<string, string> = {
    info:    'background:rgba(99,102,241,0.1);color:#818CF8;border:1px solid rgba(99,102,241,0.2)',
    success: 'background:rgba(52,211,153,0.08);color:#34D399;border:1px solid rgba(52,211,153,0.15)',
    warning: 'background:rgba(245,158,11,0.08);color:#F59E0B;border:1px solid rgba(245,158,11,0.15)',
  }
  return styles[banner.type]
})

// Featured count
const { data: featuredData } = await useAsyncData('featured-count', async () => {
  const { count } = await supabase
    .from('portfolio_items')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true)
  return count ?? 0
})
const featuredCount = computed(() => featuredData.value ?? 0)

// Load banner from site_settings
const { data: settingsData } = await useAsyncData('site-settings', async () => {
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'banner')
    .maybeSingle()
  return data
})

onMounted(() => {
  if (settingsData.value?.value) {
    const v = settingsData.value.value
    banner.enabled = v.enabled ?? false
    banner.message = v.message ?? ''
    banner.type    = v.type ?? 'info'
  }
})

const saving = ref(false)
const saved  = ref(false)

async function saveBannerSettings() {
  saving.value = true
  await supabase.from('site_settings').upsert({
    key:   'banner',
    value: { enabled: banner.enabled, message: banner.message, type: banner.type },
  }, { onConflict: 'key' })
  saving.value = false
  saved.value  = true
  setTimeout(() => { saved.value = false }, 3000)
}
</script>
