<template>
  <div class="min-h-screen">

    <!-- Back nav -->
    <div class="max-w-5xl mx-auto px-4 pt-8 pb-2">
      <NuxtLink to="/"
        class="inline-flex items-center gap-2 text-sm text-text-subtle hover:text-text transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to listings
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="max-w-5xl mx-auto px-4 py-20 space-y-6">
      <div class="h-8 skeleton w-2/3" />
      <div class="h-4 skeleton w-1/3" />
      <div class="aspect-video skeleton rounded-2xl mt-8" />
    </div>

    <!-- Not found -->
    <div v-else-if="!item" class="max-w-5xl mx-auto px-4 py-32 text-center">
      <p class="text-4xl mb-4">🔍</p>
      <p class="font-display font-semibold text-text-strong text-lg mb-2">Listing not found</p>
      <NuxtLink to="/" class="text-sm text-accent underline">Back to marketplace</NuxtLink>
    </div>

    <div v-else>
      <!-- Screenshot Gallery -->
      <div v-if="allImages.length > 0" class="max-w-5xl mx-auto px-4 pt-4 pb-8">
        <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <div v-for="(img, i) in allImages" :key="i"
            class="shrink-0 w-24 aspect-video rounded-lg overflow-hidden cursor-pointer bg-surface-hover transition-opacity"
            :class="activeImg === i ? 'opacity-100 ring-1 ring-accent' : 'opacity-50 hover:opacity-75'"
            @click="activeImg = i">
            <img :src="img" :alt="item.title + ' ' + (i+1)" class="w-full h-full object-cover" />
          </div>
        </div>
        <div class="mt-3 rounded-2xl overflow-hidden aspect-video bg-surface-hover relative">
          <img :src="allImages[activeImg]" :alt="item.title" class="w-full h-full object-cover" />
          <div class="absolute top-3 left-3 flex gap-2">
            <span v-if="item.is_verified"
              class="text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm"
              style="background:rgba(52,211,153,0.15);color:#34D399">
              ✓ Verified
            </span>
            <span v-if="item.is_hot"
              class="text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm"
              style="background:rgba(239,68,68,0.15);color:#F87171">
              HOT
            </span>
          </div>
          <div class="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm text-text-muted"
            style="background:rgba(0,0,0,0.5)">
            {{ activeImg + 1 }} / {{ allImages.length }}
          </div>
        </div>
      </div>

      <!-- Main layout -->
      <div class="max-w-5xl mx-auto px-4 pb-24 grid lg:grid-cols-3 gap-12">

        <!-- Left: Main content (2/3) -->
        <div class="lg:col-span-2 space-y-12">

          <!-- Title + meta -->
          <div>
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <span class="text-xs font-medium px-2.5 py-1 rounded-full"
                style="background:rgba(124,58,237,0.12);color:#A78BFA">
                {{ item.categories?.name ?? 'Game Website' }}
              </span>
              <span class="text-xs text-text-subtle">
                👁 {{ item.view_count ?? 0 }} views
              </span>
              <span v-if="item.demo_available"
                class="text-xs font-medium px-2.5 py-1 rounded-full"
                style="background:rgba(124,58,237,0.1);color:#C4B5FD">
                Demo Available
              </span>
            </div>
            <h1 class="font-display font-bold text-text-strong leading-tight mb-4"
              style="font-size:clamp(1.6rem,4vw,2.5rem)">
              {{ item.title }}
            </h1>
            <p v-if="item.description" class="text-text-muted leading-relaxed">
              {{ item.description }}
            </p>

            <!-- Average rating -->
            <div v-if="avgRating > 0" class="flex items-center gap-2 mt-3">
              <div class="flex gap-0.5">
                <span v-for="s in 5" :key="s"
                  class="text-sm"
                  :class="s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-text-faint'">★</span>
              </div>
              <span class="text-xs text-text-subtle">{{ avgRating.toFixed(1) }} ({{ reviews.length }} reviews)</span>
            </div>
          </div>

          <!-- Benefits strip -->
          <div class="py-5 border-y" style="border-color:rgba(255,255,255,0.06)">
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-4">What's included</p>
            <div class="grid grid-cols-3 gap-6">
              <div v-for="b in costBenefits" :key="b.label" class="space-y-1">
                <p class="font-semibold text-text-strong text-sm">{{ b.icon }} {{ b.label }}</p>
                <p class="text-xs text-text-subtle">{{ b.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Tech Stack -->
          <div v-if="hasTechStack">
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-4">Tech Stack</p>
            <div class="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              <div v-for="(val, key) in item.tech_stack" :key="String(key)"
                class="flex items-center gap-3">
                <span class="text-xs text-text-subtle capitalize w-20 shrink-0">{{ key }}</span>
                <span class="h-px flex-1 bg-divider" />
                <span class="text-sm text-text-strong font-medium">{{ val }}</span>
              </div>
            </div>
          </div>

          <!-- Games & Providers -->
          <div v-if="item.game_providers?.length || item.game_types?.length">
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-4">Games & Providers</p>
            <div v-if="item.game_types?.length" class="mb-4">
              <p class="text-xs text-text-subtle mb-2">Game Types</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="t in item.game_types" :key="t"
                  class="text-xs px-3 py-1 rounded-full text-text-muted"
                  style="background:rgba(255,255,255,0.05)">{{ t }}</span>
              </div>
            </div>
            <div v-if="item.game_providers?.length">
              <p class="text-xs text-text-subtle mb-2">Providers</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="p in item.game_providers" :key="p"
                  class="text-xs px-3 py-1 rounded-full"
                  style="background:rgba(124,58,237,0.1);color:#A78BFA">{{ p }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Methods -->
          <div v-if="item.payment_methods?.length">
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-4">Payment Methods</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="m in item.payment_methods" :key="m"
                class="text-xs px-3 py-1.5 rounded-lg text-text-strong"
                style="background:rgba(255,255,255,0.05)">{{ m }}</span>
            </div>
          </div>

          <!-- How it works -->
          <div>
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">How it works</p>
            <div class="space-y-0">
              <div v-for="(step, i) in howItWorks" :key="i" class="flex gap-4 pb-8 relative">
                <div class="flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style="background:rgba(124,58,237,0.2);color:#A78BFA">
                    {{ i + 1 }}
                  </div>
                  <div v-if="i < howItWorks.length - 1"
                    class="flex-1 w-px mt-2" style="background:rgba(255,255,255,0.06)" />
                </div>
                <div class="pb-2">
                  <p class="font-medium text-text-strong text-sm mb-1">{{ step.title }}</p>
                  <p class="text-sm text-text-subtle">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Q&A Section -->
          <div>
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">
              Q&A <span class="text-text-faint normal-case tracking-normal">({{ qaItems.length }})</span>
            </p>

            <!-- Ask a question -->
            <div class="mb-6">
              <div class="flex gap-3">
                <input v-model="newQuestion" type="text"
                  placeholder="Ask a question about this listing..."
                  class="flex-1 px-1 py-2.5 text-sm bg-transparent text-text outline-none
                         border-b border-divider focus:border-accent transition-colors
                         placeholder:text-text-faint" />
                <button @click="submitQuestion" :disabled="!newQuestion.trim()"
                  class="text-xs font-medium text-accent hover:text-white transition-colors
                         px-4 py-2 rounded-lg hover:bg-primary disabled:opacity-40">
                  Ask
                </button>
              </div>
            </div>

            <!-- Q&A list -->
            <div v-if="qaItems.length === 0" class="text-sm text-text-subtle py-4">
              No questions yet. Be the first to ask.
            </div>
            <div v-else class="space-y-6">
              <div v-for="qa in qaItems" :key="qa.id">
                <div class="flex gap-3">
                  <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs mt-0.5"
                    style="background:rgba(255,255,255,0.06);color:#64748B">Q</div>
                  <p class="text-sm text-text-strong">{{ qa.question }}</p>
                </div>
                <div v-if="qa.answer" class="flex gap-3 mt-3 ml-4 pl-5"
                  style="border-left:1px solid rgba(124,58,237,0.2)">
                  <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs mt-0.5"
                    style="background:rgba(124,58,237,0.12);color:#A78BFA">A</div>
                  <p class="text-sm text-text-muted">{{ qa.answer }}</p>
                </div>
                <p v-else class="text-xs text-text-faint mt-2 ml-4 pl-5">
                  Awaiting seller's answer...
                </p>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div>
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">
              Reviews <span class="text-text-faint normal-case tracking-normal">({{ reviews.length }})</span>
            </p>

            <!-- Leave review (if user is logged in) -->
            <div v-if="user && !userReview" class="mb-8 pb-8 border-b"
              style="border-color:rgba(255,255,255,0.06)">
              <p class="text-sm text-text-muted mb-4">Leave a review after your purchase</p>
              <div class="flex gap-1 mb-4">
                <button v-for="s in 5" :key="s" @click="newRating = s"
                  class="text-xl transition-transform hover:scale-110"
                  :class="s <= newRating ? 'text-yellow-400' : 'text-text-faint'">★</button>
              </div>
              <textarea v-model="newComment" rows="3"
                placeholder="Share your experience..."
                class="w-full px-1 py-2.5 text-sm bg-transparent text-text outline-none resize-none
                       border-b border-divider focus:border-accent transition-colors
                       placeholder:text-text-faint mb-4" />
              <button @click="submitReview" :disabled="newRating === 0"
                class="text-sm font-medium px-4 py-2 rounded-xl text-white transition-colors
                       bg-primary hover:bg-primary-hover disabled:opacity-40">
                Submit Review
              </button>
            </div>

            <!-- Reviews list -->
            <div v-if="reviews.length === 0" class="text-sm text-text-subtle py-4">
              No reviews yet.
            </div>
            <div v-else class="space-y-6">
              <div v-for="review in reviews" :key="review.id"
                class="pb-6 border-b" style="border-color:rgba(255,255,255,0.04)">
                <div class="flex items-center gap-2 mb-2">
                  <div class="flex gap-0.5">
                    <span v-for="s in 5" :key="s"
                      class="text-sm"
                      :class="s <= review.rating ? 'text-yellow-400' : 'text-text-faint'">★</span>
                  </div>
                  <span class="text-xs text-text-subtle">{{ formatDate(review.created_at) }}</span>
                </div>
                <p v-if="review.comment" class="text-sm text-text-muted">{{ review.comment }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Sticky pricing + CTAs (1/3) -->
        <div class="lg:col-span-1">
          <div class="lg:sticky lg:top-24 space-y-6">

            <!-- Pricing tabs -->
            <div>
              <div v-if="item.pricing_model === 'both'"
                class="flex gap-1 mb-5 p-1 rounded-xl"
                style="background:rgba(255,255,255,0.04)">
                <button v-for="tab in pricingTabs" :key="tab.key"
                  @click="activeTab = tab.key"
                  class="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                  :class="activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text'">
                  {{ tab.label }}
                </button>
              </div>

              <!-- Revenue Share -->
              <div v-if="showRevenue" class="space-y-3">
                <div class="flex items-baseline gap-2">
                  <span class="font-display font-bold text-text-strong" style="font-size:2rem">
                    {{ item.setup_fee === 0 || !item.setup_fee ? 'Free' : formatMMK(item.setup_fee) }}
                  </span>
                  <span class="text-text-subtle text-sm">setup</span>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-text-subtle">Monthly Fee</span>
                    <span class="text-text-strong font-medium">
                      {{ item.monthly_fee ? formatMMK(item.monthly_fee) : 'Negotiable' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-subtle">Revenue Share</span>
                    <span class="text-accent font-semibold">
                      {{ item.revenue_share_pct ? item.revenue_share_pct + '%' : 'Negotiable' }}
                    </span>
                  </div>
                </div>
                <p class="text-xs text-text-subtle pt-1">
                  Start with zero upfront cost. Pay from your revenue only.
                </p>
              </div>

              <!-- Full Ownership -->
              <div v-if="showOwnership" class="space-y-3">
                <div class="flex items-baseline gap-2">
                  <span class="font-display font-bold gradient-text" style="font-size:2rem">
                    {{ formatMMK(item.price) }}
                  </span>
                </div>
                <p class="text-sm text-text-subtle">One-time · Full ownership</p>
                <div class="space-y-1.5 text-xs text-text-subtle pt-1">
                  <div class="flex items-center gap-2"><span class="text-success">✓</span> Source code included</div>
                  <div class="flex items-center gap-2"><span class="text-success">✓</span> Admin panel included</div>
                  <div class="flex items-center gap-2"><span class="text-success">✓</span> Lifetime ownership</div>
                </div>
              </div>
            </div>

            <div class="h-px" style="background:rgba(255,255,255,0.06)" />

            <!-- CTAs -->
            <div class="space-y-3">
              <button v-if="item.demo_available" @click="requestDemo"
                class="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all
                       hover:-translate-y-0.5 glow-accent"
                style="background:linear-gradient(135deg,#7C3AED,#6D28D9)">
                🎮 View Demo
              </button>

              <button v-if="item.reserve_available" @click="reserveNow"
                class="w-full py-3.5 rounded-xl text-sm font-medium text-text-strong transition-colors
                       hover:bg-white/8"
                style="background:rgba(255,255,255,0.05)">
                📋 Reserve Now
              </button>

              <a v-if="item.telegram_url" :href="item.telegram_url" target="_blank"
                class="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm
                       text-text-muted hover:text-text transition-colors">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
                </svg>
                Talk to an Expert
              </a>

              <!-- Wishlist -->
              <button @click="toggleWishlist"
                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs
                       text-text-subtle hover:text-text transition-colors">
                <svg class="w-4 h-4" fill="isWishlisted ? 'currentColor' : 'none'"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {{ isWishlisted ? 'Saved' : 'Save to Wishlist' }}
              </button>
            </div>

            <!-- Trust signals -->
            <div class="pt-2 space-y-2 text-xs text-text-subtle">
              <div class="flex items-center gap-2"><span class="text-success">✓</span> Escrow via KBZPay</div>
              <div class="flex items-center gap-2"><span class="text-success">✓</span> Verified seller</div>
              <div class="flex items-center gap-2"><span class="text-success">✓</span> After-sale support</div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Demo Modal -->
    <Transition enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="showDemoModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
        @click.self="showDemoModal = false">
        <div class="w-full max-w-sm py-10 px-6 rounded-2xl animate-fade-up"
          style="background:#0E0E1C;border:1px solid rgba(255,255,255,0.06)">
          <h2 class="font-display font-bold text-text-strong text-xl mb-2">Request a Demo</h2>
          <p class="text-sm text-text-muted mb-6">We'll get back to you within 24 hours.</p>
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-medium mb-2 text-text-subtle">Your Name</label>
              <input v-model="demoForm.name" type="text" placeholder="e.g. Ko Mg Mg"
                class="w-full px-1 py-2.5 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
            <div>
              <label class="block text-xs font-medium mb-2 text-text-subtle">Telegram / Phone</label>
              <input v-model="demoForm.contact" type="text" placeholder="@username or 09..."
                class="w-full px-1 py-2.5 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
            </div>
          </div>
          <button @click="submitDemoRequest" :disabled="!demoForm.name || !demoForm.contact"
            class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity
                   disabled:opacity-50 bg-primary hover:bg-primary-hover">
            Send Request
          </button>
          <button @click="showDemoModal = false"
            class="w-full mt-3 py-2 text-sm text-text-subtle hover:text-text transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
const route    = useRoute()
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const id = computed(() => route.params.id as string)

const { data: item, pending } = await useAsyncData(`listing-${id.value}`, async () => {
  const { data } = await supabase
    .from('portfolio_items')
    .select('*,categories(name)')
    .eq('id', id.value)
    .single()
  return data
})

// Track view
onMounted(async () => {
  if (id.value) {
    await supabase.rpc('increment_view_count', { listing_id: id.value })
  }
})

useSeoMeta({ title: computed(() => (item.value?.title ?? 'Listing') + ' — Oracle Market') })

// ── Gallery ───────────────────────────────────────────────────────────────
const activeImg = ref(0)

const allImages = computed(() => {
  const imgs: string[] = []
  if (item.value?.thumbnail_url) imgs.push(item.value.thumbnail_url)
  if (item.value?.screenshot_urls?.length) imgs.push(...item.value.screenshot_urls)
  return imgs
})

// ── Pricing tabs ──────────────────────────────────────────────────────────
const activeTab = ref<'revenue_share' | 'full_ownership'>('revenue_share')

const pricingTabs = [
  { key: 'revenue_share'  as const, label: 'Revenue Share' },
  { key: 'full_ownership' as const, label: 'Full Ownership' },
]

const showRevenue   = computed(() =>
  item.value?.pricing_model === 'revenue_share' ||
  (item.value?.pricing_model === 'both' && activeTab.value === 'revenue_share')
)
const showOwnership = computed(() =>
  item.value?.pricing_model === 'full_ownership' ||
  (item.value?.pricing_model === 'both' && activeTab.value === 'full_ownership')
)

const hasTechStack = computed(() =>
  item.value?.tech_stack && Object.keys(item.value.tech_stack).length > 0
)

// ── Q&A ───────────────────────────────────────────────────────────────────
const newQuestion = ref('')

const { data: qaItems, refresh: refreshQA } = await useAsyncData(`qa-${id.value}`, async () => {
  const { data } = await supabase
    .from('qa_items')
    .select('*')
    .eq('listing_id', id.value)
    .order('created_at', { ascending: true })
  return data ?? []
})

async function submitQuestion() {
  if (!newQuestion.value.trim()) return
  await supabase.from('qa_items').insert({
    listing_id: id.value,
    question:   newQuestion.value.trim(),
    asked_by:   user.value?.id ?? null,
  })
  newQuestion.value = ''
  await refreshQA()
}

// ── Reviews ───────────────────────────────────────────────────────────────
const newRating  = ref(0)
const newComment = ref('')

const { data: reviews, refresh: refreshReviews } = await useAsyncData(`reviews-${id.value}`, async () => {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', id.value)
    .order('created_at', { ascending: false })
  return data ?? []
})

const avgRating = computed(() => {
  const r = reviews.value ?? []
  if (!r.length) return 0
  return r.reduce((sum: number, r: any) => sum + r.rating, 0) / r.length
})

const userReview = computed(() =>
  (reviews.value ?? []).find((r: any) => r.user_id === user.value?.id)
)

async function submitReview() {
  if (!user.value || newRating.value === 0) return
  await supabase.from('reviews').insert({
    listing_id: id.value,
    user_id:    user.value.id,
    rating:     newRating.value,
    comment:    newComment.value.trim() || null,
  })
  newRating.value  = 0
  newComment.value = ''
  await refreshReviews()
}

// ── Wishlist ──────────────────────────────────────────────────────────────
const isWishlisted = ref(false)

onMounted(async () => {
  if (!user.value) {
    const saved = JSON.parse(localStorage.getItem('oracle_wishlist') || '[]')
    isWishlisted.value = saved.includes(id.value)
    return
  }
  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.value.id)
    .eq('listing_id', id.value)
    .maybeSingle()
  isWishlisted.value = !!data
})

async function toggleWishlist() {
  if (!user.value) {
    const saved: string[] = JSON.parse(localStorage.getItem('oracle_wishlist') || '[]')
    const idx = saved.indexOf(id.value)
    if (idx === -1) saved.push(id.value)
    else saved.splice(idx, 1)
    localStorage.setItem('oracle_wishlist', JSON.stringify(saved))
    isWishlisted.value = !isWishlisted.value
    return
  }
  if (isWishlisted.value) {
    await supabase.from('wishlists').delete()
      .eq('user_id', user.value.id).eq('listing_id', id.value)
  } else {
    await supabase.from('wishlists').insert({ user_id: user.value.id, listing_id: id.value })
  }
  isWishlisted.value = !isWishlisted.value
}

// ── Demo Modal ────────────────────────────────────────────────────────────
const showDemoModal = ref(false)
const demoForm      = reactive({ name: '', contact: '' })

function requestDemo() {
  if (item.value?.demo_url) window.open(item.value.demo_url, '_blank')
  else showDemoModal.value = true
}

function reserveNow() {
  if (item.value?.telegram_url) window.open(item.value.telegram_url, '_blank')
  else showDemoModal.value = true
}

async function submitDemoRequest() {
  if (!demoForm.name || !demoForm.contact) return
  await supabase.from('demo_requests').insert({
    listing_id: id.value,
    name:       demoForm.name,
    contact:    demoForm.contact,
  })
  showDemoModal.value = false
  demoForm.name = ''; demoForm.contact = ''
  alert('✅ Request sent. We\'ll reach out within 24 hours.')
}

// ── Helpers ───────────────────────────────────────────────────────────────
const costBenefits = [
  { icon: '🗄️', label: 'No DB cost',      desc: 'Zero database expenses' },
  { icon: '☁️', label: 'No Hosting cost', desc: 'Zero hosting expenses' },
  { icon: '⚙️', label: 'No Setup fee',    desc: 'Zero setup expenses'   },
]

const howItWorks = [
  { title: 'Choose a website',              desc: 'Browse listings and pick one you like' },
  { title: 'Demo or consult',               desc: 'Try a live demo or speak with an expert' },
  { title: 'Select a package',              desc: 'Revenue Share or Full Ownership' },
  { title: 'Pay & receive handover',        desc: 'Secure payment via KBZPay escrow' },
]

function formatMMK(price: number) {
  if (!price) return '—'
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M ks'
  if (price >= 1_000)     return (price / 1_000).toFixed(0) + 'K ks'
  return price + ' ks'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
