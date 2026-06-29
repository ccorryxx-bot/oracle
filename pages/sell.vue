<template>
  <div class="min-h-screen">

    <!-- Auth gate -->
    <div v-if="!user" class="max-w-lg mx-auto px-4 py-32 text-center">
      <p class="text-4xl mb-5">🔐</p>
      <h2 class="font-display font-bold text-text-strong text-xl mb-3">Login လိုအပ်ပါသည်</h2>
      <p class="text-sm text-text-muted mb-6">Website တင်ရောင်းရန် အကောင့်ဝင်ပါ</p>
      <NuxtLink to="/auth/login"
        class="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors">
        Sign In
      </NuxtLink>
    </div>

    <div v-else class="max-w-2xl mx-auto px-4 py-16">

      <!-- Header -->
      <div class="mb-12">
        <NuxtLink to="/dashboard"
          class="inline-flex items-center gap-2 text-sm text-text-subtle hover:text-text transition-colors mb-6">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </NuxtLink>
        <h1 class="font-display font-bold text-text-strong mb-2"
          style="font-size:clamp(1.8rem,4vw,2.5rem)">
          Website တင်ရောင်းမည်
        </h1>
        <p class="text-text-muted text-sm">ပြည့်စုံသော အချက်အလက်တွေ ထည့်လေ၊ Buyer ဆွဲဆောင်မှု ပိုများလေ</p>
      </div>

      <form @submit.prevent="submitListing" class="space-y-14">

        <!-- ① Basic Info -->
        <section>
          <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">① Basic Info</p>
          <div class="space-y-6">
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Website Name *</label>
              <input v-model="form.title" type="text" required placeholder="eg. Dragon Ace Gaming"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Description *</label>
              <textarea v-model="form.description" required rows="4"
                placeholder="Website ရဲ့ highlight တွေ၊ ဘာကောင်းသလဲ..."
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none resize-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Category</label>
              <select v-model="form.category_id"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors cursor-pointer appearance-none">
                <option value="" class="bg-bg">-- Category ရွေးပါ --</option>
                <option v-for="c in categories" :key="c.id" :value="c.id" class="bg-bg">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Thumbnail URL</label>
              <input v-model="form.thumbnail_url" type="url" placeholder="https://..."
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">
                Screenshot URLs <span class="text-text-faint">(comma separated)</span>
              </label>
              <textarea v-model="screenshotInput" rows="2"
                placeholder="https://img1.com, https://img2.com, ..."
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none resize-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
          </div>
        </section>

        <div class="h-px" style="background:rgba(255,255,255,0.06)" />

        <!-- ② Tech Stack -->
        <section>
          <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">② Tech Stack</p>
          <div class="grid sm:grid-cols-2 gap-6">
            <div v-for="field in techFields" :key="field.key">
              <label class="block text-xs font-medium mb-2 text-text-muted">{{ field.label }}</label>
              <input v-model="techStack[field.key]" type="text" :placeholder="field.placeholder"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
          </div>
        </section>

        <div class="h-px" style="background:rgba(255,255,255,0.06)" />

        <!-- ③ Games -->
        <section>
          <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">③ Games & Providers</p>

          <div class="mb-6">
            <p class="text-xs font-medium text-text-muted mb-3">Game Types</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="t in gameTypeOptions" :key="t" type="button"
                @click="toggleArr(form.game_types, t)"
                class="px-3 py-1.5 rounded-lg text-xs transition-colors"
                :class="form.game_types.includes(t)
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'"
                style="border:1px solid rgba(255,255,255,0.06)">
                {{ t }}
              </button>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-xs font-medium text-text-muted mb-3">Game Providers</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="p in providerOptions" :key="p" type="button"
                @click="toggleArr(form.game_providers, p)"
                class="px-3 py-1.5 rounded-lg text-xs transition-colors"
                :class="form.game_providers.includes(p)
                  ? 'bg-primary/20 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'"
                style="border:1px solid rgba(255,255,255,0.06)">
                {{ p }}
              </button>
            </div>
          </div>

          <div>
            <p class="text-xs font-medium text-text-muted mb-3">Payment Methods (Myanmar)</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="m in paymentOptions" :key="m" type="button"
                @click="toggleArr(form.payment_methods, m)"
                class="px-3 py-1.5 rounded-lg text-xs transition-colors"
                :class="form.payment_methods.includes(m)
                  ? 'bg-primary/20 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'"
                style="border:1px solid rgba(255,255,255,0.06)">
                {{ m }}
              </button>
            </div>
          </div>
        </section>

        <div class="h-px" style="background:rgba(255,255,255,0.06)" />

        <!-- ④ Pricing Model -->
        <section>
          <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">④ Pricing Model</p>

          <div class="space-y-2 mb-6">
            <button v-for="opt in pricingOptions" :key="opt.value" type="button"
              @click="form.pricing_model = opt.value"
              class="w-full text-left px-5 py-4 rounded-xl transition-colors relative"
              :style="form.pricing_model === opt.value
                ? 'background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.3)'
                : 'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)'">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium text-text-strong text-sm mb-0.5">{{ opt.label }}</p>
                  <p class="text-xs text-text-subtle">{{ opt.desc }}</p>
                </div>
                <div class="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                  :style="form.pricing_model === opt.value
                    ? 'background:#7C3AED'
                    : 'border:1px solid rgba(255,255,255,0.2)'">
                  <div v-if="form.pricing_model === opt.value" class="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </button>
          </div>

          <!-- Revenue Share fields -->
          <div v-if="form.pricing_model !== 'full_ownership'" class="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Monthly Fee (MMK)</label>
              <input v-model.number="form.monthly_fee" type="number" placeholder="eg. 150000"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Revenue Share %</label>
              <input v-model.number="form.revenue_share_pct" type="number" min="0" max="100" placeholder="eg. 15"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
          </div>

          <!-- Ownership price -->
          <div v-if="form.pricing_model !== 'revenue_share'">
            <label class="block text-xs font-medium mb-2 text-text-muted">Selling Price (MMK) *</label>
            <input v-model.number="form.price" type="number" :required="form.pricing_model !== 'revenue_share'"
              placeholder="eg. 5000000"
              class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                     border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
          </div>
        </section>

        <div class="h-px" style="background:rgba(255,255,255,0.06)" />

        <!-- ⑤ Contact & Demo -->
        <section>
          <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">⑤ Contact & Demo</p>
          <div class="space-y-6">
            <div class="flex items-center justify-between py-3 border-b"
              style="border-color:rgba(255,255,255,0.06)">
              <div>
                <p class="text-sm font-medium text-text-strong">Demo Available</p>
                <p class="text-xs text-text-subtle mt-0.5">Buyer တွေ demo ကြည့်ခွင့် ပေးမည်လား</p>
              </div>
              <button type="button" @click="form.demo_available = !form.demo_available"
                class="relative w-11 h-6 rounded-full transition-colors"
                :style="form.demo_available ? 'background:#7C3AED' : 'background:rgba(255,255,255,0.1)'">
                <span class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                  :class="form.demo_available ? 'translate-x-5' : 'translate-x-1'" />
              </button>
            </div>

            <div v-if="form.demo_available">
              <label class="block text-xs font-medium mb-2 text-text-muted">Demo URL (optional)</label>
              <input v-model="form.demo_url" type="url" placeholder="https://demo.yoursite.com"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>

            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">
                Telegram URL <span class="text-text-faint">(Free Consultation)</span>
              </label>
              <input v-model="form.telegram_url" type="url" placeholder="https://t.me/yourusername"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
          </div>
        </section>

        <!-- Error -->
        <div v-if="error"
          class="px-4 py-3 rounded-xl text-xs text-danger"
          style="background:rgba(248,113,113,0.08)">
          {{ error }}
        </div>

        <!-- Submit -->
        <div class="flex gap-3 pt-2">
          <button type="submit" :disabled="submitting"
            class="flex-1 py-4 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style="background:linear-gradient(135deg,#7C3AED,#6D28D9)">
            <span v-if="submitting"
              class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else>🚀 Listing တင်မည်</span>
          </button>
          <button type="button" @click="saveAsDraft" :disabled="submitting"
            class="px-5 py-4 rounded-xl text-sm text-text-muted hover:text-text hover:bg-surface-hover transition-colors">
            Draft သိမ်းမည်
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Sell Your Website — Oracle Market' })

const supabase = useSupabaseClient()
const user     = useSupabaseUser()
const router   = useRouter()

const { data: categories } = await useAsyncData('cats', async () => {
  const { data } = await supabase.from('categories').select('id,name').order('name')
  return data ?? []
})

const techStack = reactive({
  frontend: '',
  backend:  '',
  database: '',
  hosting:  '',
})

const techFields = [
  { key: 'frontend', label: 'Frontend',  placeholder: 'eg. Vue 3, React, Nuxt' },
  { key: 'backend',  label: 'Backend',   placeholder: 'eg. Node.js, Laravel' },
  { key: 'database', label: 'Database',  placeholder: 'eg. MySQL, PostgreSQL' },
  { key: 'hosting',  label: 'Hosting',   placeholder: 'eg. VPS, Vercel, AWS' },
]

const gameTypeOptions = ['Slot', 'Live Casino', 'Sports Betting', 'Lottery', 'Poker', 'Fishing', 'Arcade']
const providerOptions = ['CQ9', 'Jili', 'PG Soft', 'Evolution Gaming', 'Pragmatic Play', 'Habanero', 'Spribe', 'SA Gaming']
const paymentOptions  = ['KBZPay', 'Wave Money', 'AYA Pay', 'CB Pay', 'OK Dollar', 'True Money']

const pricingOptions = [
  { value: 'revenue_share',  label: 'Revenue Share Partner',  desc: 'Setup free / Monthly fee + Revenue % — အနည်းဆုံး ငွေ မပေးဘဲ စတင်နိုင်သည်' },
  { value: 'full_ownership', label: 'Full Ownership',         desc: 'One-time payment — Website ownership အပြည့်ရသည်' },
  { value: 'both',           label: 'Both Options',           desc: 'Buyer ကို ရွေးချယ်ခွင့် ပေး — conversion rate မြင့်တက်သည်' },
]

const form = reactive({
  title:            '',
  description:      '',
  category_id:      '',
  thumbnail_url:    '',
  pricing_model:    'full_ownership',
  price:            0,
  monthly_fee:      null as number | null,
  revenue_share_pct: null as number | null,
  setup_fee:        0,
  demo_available:   false,
  demo_url:         '',
  telegram_url:     '',
  reserve_available: true,
  game_types:       [] as string[],
  game_providers:   [] as string[],
  payment_methods:  [] as string[],
})

const screenshotInput = ref('')
const submitting = ref(false)
const error      = ref('')

function toggleArr(arr: string[], val: string) {
  const i = arr.indexOf(val)
  if (i === -1) arr.push(val)
  else arr.splice(i, 1)
}

async function submitListing(status = 'published') {
  if (!user.value) return
  submitting.value = true
  error.value = ''
  try {
    const techObj = Object.fromEntries(
      Object.entries(techStack).filter(([, v]) => v.trim())
    )
    const screenshots = screenshotInput.value
      .split(',').map(s => s.trim()).filter(Boolean)

    const { error: err } = await supabase.from('portfolio_items').insert({
      ...form,
      seller_id:      user.value.id,
      status,
      tech_stack:     Object.keys(techObj).length ? techObj : null,
      screenshot_urls: screenshots.length ? screenshots : null,
      game_types:      form.game_types.length ? form.game_types : null,
      game_providers:  form.game_providers.length ? form.game_providers : null,
      payment_methods: form.payment_methods.length ? form.payment_methods : null,
    })
    if (err) throw err
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.message ?? 'Something went wrong'
  } finally {
    submitting.value = false
  }
}

async function saveAsDraft() {
  await submitListing('draft')
}
</script>
