<template>
  <div class="min-h-screen">

    <!-- Floating Telegram CTA -->
    <FloatingCTA :telegram-url="item?.telegram_url ?? undefined" />

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

      <!-- ── Screenshot Gallery ───────────────────────────────────────── -->
      <div v-if="allImages.length > 0" class="max-w-5xl mx-auto px-4 pt-4 pb-6">
        <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <div v-for="(img, i) in allImages" :key="i"
            class="shrink-0 w-24 aspect-video rounded-lg overflow-hidden cursor-pointer bg-surface-hover transition-all"
            :class="activeImg === i ? 'opacity-100 ring-1 ring-accent' : 'opacity-45 hover:opacity-70'"
            @click="activeImg = i">
            <img :src="img" :alt="item.title + ' ' + (i+1)" class="w-full h-full object-cover" />
          </div>
        </div>
        <div class="mt-3 rounded-2xl overflow-hidden aspect-video bg-surface-hover relative cursor-zoom-in"
          @click="lightboxOpen = true">
          <img :src="allImages[activeImg]" :alt="item.title" class="w-full h-full object-cover" />

          <!-- Top-left badges -->
          <div class="absolute top-3 left-3 flex gap-2">
            <span v-if="item.is_verified"
              class="text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1"
              style="background:rgba(52,211,153,0.2);color:#34D399;border:1px solid rgba(52,211,153,0.25)">
              ✓ Verified
            </span>
            <span v-if="item.is_hot"
              class="text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm"
              style="background:rgba(239,68,68,0.2);color:#F87171">
              🔥 HOT
            </span>
            <span v-if="item.is_featured"
              class="text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm"
              style="background:rgba(245,158,11,0.2);color:#F59E0B">
              ★ Featured
            </span>
          </div>

          <!-- Expand hint -->
          <div class="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm text-white/70 flex items-center gap-1.5"
            style="background:rgba(0,0,0,0.45)">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
            {{ activeImg + 1 }} / {{ allImages.length }}
          </div>
        </div>
      </div>

      <!-- ── Lightbox ──────────────────────────────────────────────── -->
      <Transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0" leave-to-class="opacity-0">
        <div v-if="lightboxOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          @click.self="lightboxOpen = false">
          <button @click="lightboxOpen = false"
            class="absolute top-5 right-5 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <img :src="allImages[activeImg]" class="max-w-5xl w-full max-h-[85vh] object-contain rounded-2xl" />
          <button v-if="activeImg > 0" @click="activeImg--"
            class="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button v-if="activeImg < allImages.length - 1" @click="activeImg++"
            class="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </Transition>

      <!-- ── Main layout ───────────────────────────────────────────── -->
      <div class="max-w-5xl mx-auto px-4 pb-32 grid lg:grid-cols-3 gap-12">

        <!-- ── Left: Main content ────────────────────────────────── -->
        <div class="lg:col-span-2 space-y-10">

          <!-- Title + meta -->
          <div>
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <span class="text-xs font-medium px-2.5 py-1 rounded-full"
                style="background:rgba(124,58,237,0.12);color:#A78BFA">
                {{ item.categories?.name ?? 'Game Website' }}
              </span>
              <span v-if="item.demo_available"
                class="text-xs font-medium px-2.5 py-1 rounded-full"
                style="background:rgba(52,211,153,0.1);color:#34D399">
                Demo ✓
              </span>
            </div>

            <h1 class="font-display font-bold text-text-strong leading-tight mb-4"
              style="font-size:clamp(1.6rem,4vw,2.5rem)">
              {{ item.title }}
            </h1>

            <!-- Star rating -->
            <div v-if="avgRating > 0" class="flex items-center gap-2 mb-4">
              <div class="flex gap-0.5">
                <span v-for="s in 5" :key="s" class="text-sm"
                  :class="s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-text-faint'">★</span>
              </div>
              <span class="text-xs text-text-subtle">{{ avgRating.toFixed(1) }} ({{ reviews.length }} reviews)</span>
            </div>

            <p v-if="item.description" class="text-text-muted leading-relaxed mb-6">
              {{ item.description }}
            </p>

            <!-- ── Scarcity / Social proof bar ───────────────────── -->
            <div class="flex flex-wrap items-center gap-4 py-4 px-5 rounded-2xl"
              style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
              <!-- Viewing now -->
              <div class="flex items-center gap-2 text-xs">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style="background:#34D399" />
                  <span class="relative inline-flex rounded-full h-2 w-2" style="background:#34D399" />
                </span>
                <span class="text-text-strong font-medium">{{ viewingNow }}</span>
                <span class="text-text-subtle">viewing right now</span>
              </div>

              <div class="h-3 w-px" style="background:rgba(255,255,255,0.08)" />

              <!-- Wishlist count -->
              <div class="flex items-center gap-1.5 text-xs text-text-subtle">
                <svg class="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                </svg>
                <span class="text-text-strong font-medium">{{ wishlistCount }}</span> saved
              </div>

              <div class="h-3 w-px" style="background:rgba(255,255,255,0.08)" />

              <!-- Views -->
              <div class="flex items-center gap-1.5 text-xs text-text-subtle">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span class="text-text-strong font-medium">{{ item.view_count ?? 0 }}</span> views
              </div>

              <!-- Days listed -->
              <div class="ml-auto text-xs text-text-faint">
                Listed {{ daysAgo }} ago
              </div>
            </div>
          </div>

          <!-- ── Revenue Calculator ─────────────────────────────── -->
          <div class="rounded-2xl overflow-hidden"
            style="background:linear-gradient(135deg,rgba(124,58,237,0.08),rgba(167,139,250,0.04));border:1px solid rgba(124,58,237,0.2)">
            <div class="px-6 pt-6 pb-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-text-strong">💰 Revenue Calculator</p>
                <p class="text-xs text-text-subtle mt-0.5">Estimate your monthly earnings</p>
              </div>
              <button @click="calcOpen = !calcOpen"
                class="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style="background:rgba(124,58,237,0.15);color:#A78BFA">
                {{ calcOpen ? 'Hide' : 'Calculate' }}
              </button>
            </div>

            <Transition enter-active-class="transition-all duration-300"
              leave-active-class="transition-all duration-200"
              enter-from-class="opacity-0 max-h-0"
              leave-to-class="opacity-0 max-h-0">
              <div v-if="calcOpen" class="px-6 pb-6 space-y-5 overflow-hidden" style="max-height:600px">
                <div class="h-px" style="background:rgba(124,58,237,0.15)" />

                <!-- Active Players -->
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-xs text-text-subtle">Active Players / Day</label>
                    <span class="text-xs font-bold text-accent">{{ calc.players.toLocaleString() }}</span>
                  </div>
                  <input type="range" v-model.number="calc.players"
                    min="50" max="5000" step="50"
                    class="w-full accent-accent cursor-pointer" />
                  <div class="flex justify-between text-xs text-text-faint mt-1">
                    <span>50</span><span>5,000</span>
                  </div>
                </div>

                <!-- Avg bet -->
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-xs text-text-subtle">Avg Bet per Session (ks)</label>
                    <span class="text-xs font-bold text-accent">{{ calc.avgBet.toLocaleString() }} ks</span>
                  </div>
                  <input type="range" v-model.number="calc.avgBet"
                    min="1000" max="100000" step="1000"
                    class="w-full accent-accent cursor-pointer" />
                  <div class="flex justify-between text-xs text-text-faint mt-1">
                    <span>1,000 ks</span><span>100,000 ks</span>
                  </div>
                </div>

                <!-- House edge -->
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-xs text-text-subtle">Platform Margin (house edge)</label>
                    <span class="text-xs font-bold text-accent">{{ calc.margin }}%</span>
                  </div>
                  <input type="range" v-model.number="calc.margin"
                    min="1" max="15" step="0.5"
                    class="w-full accent-accent cursor-pointer" />
                  <div class="flex justify-between text-xs text-text-faint mt-1">
                    <span>1%</span><span>15%</span>
                  </div>
                </div>

                <!-- Results -->
                <div class="grid grid-cols-3 gap-3 pt-2">
                  <div class="rounded-xl p-4 text-center"
                    style="background:rgba(255,255,255,0.04)">
                    <p class="text-xs text-text-subtle mb-1">Gross / Month</p>
                    <p class="font-display font-bold text-text-strong text-lg">
                      {{ fmtCalc(calcResult.gross) }}
                    </p>
                  </div>
                  <div class="rounded-xl p-4 text-center"
                    style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.15)">
                    <p class="text-xs mb-1" style="color:#34D399">Your Profit / Month</p>
                    <p class="font-display font-bold text-lg" style="color:#34D399">
                      {{ fmtCalc(calcResult.profit) }}
                    </p>
                  </div>
                  <div class="rounded-xl p-4 text-center"
                    style="background:rgba(124,58,237,0.08)">
                    <p class="text-xs text-text-subtle mb-1">Annual Profit</p>
                    <p class="font-display font-bold text-accent text-lg">
                      {{ fmtCalc(calcResult.annual) }}
                    </p>
                  </div>
                </div>

                <!-- ROI callout -->
                <div class="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2)">
                  <span class="text-xl">🚀</span>
                  <div>
                    <p class="text-xs font-semibold text-text-strong">
                      Break-even in {{ breakEvenMonths }} months
                    </p>
                    <p class="text-xs text-text-subtle mt-0.5">
                      vs building from scratch (costs ~50M ks + 6 months)
                    </p>
                  </div>
                </div>
              </div>
            </Transition>
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
                    style="background:rgba(124,58,237,0.2);color:#A78BFA">{{ i + 1 }}</div>
                  <div v-if="i < howItWorks.length - 1"
                    class="flex-1 w-px mt-2" style="background:rgba(255,255,255,0.06)" />
                </div>
                <div class="pb-2">
                  <p class="text-sm font-medium text-text-strong mb-1">{{ step.title }}</p>
                  <p class="text-xs text-text-subtle">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Q&A -->
          <div>
            <p class="text-xs uppercase tracking-widest text-text-subtle mb-6">Q&A</p>
            <div v-if="qaItems.length" class="space-y-4 mb-6">
              <div v-for="qa in qaItems" :key="qa.id"
                class="p-4 rounded-xl"
                style="background:rgba(255,255,255,0.03)">
                <p class="text-sm text-text-strong mb-2">❓ {{ qa.question }}</p>
                <p v-if="qa.answer" class="text-sm text-text-muted">
                  <span class="text-accent mr-1">→</span>{{ qa.answer }}
                </p>
                <p v-else class="text-xs text-text-faint italic">Awaiting answer…</p>
              </div>
            </div>
            <div v-if="user" class="flex gap-3">
              <input v-model="newQuestion" type="text" placeholder="Ask a question…"
                @keydown.enter="submitQuestion"
                class="flex-1 px-1 py-2.5 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors placeholder:text-text-faint" />
              <button @click="submitQuestion" :disabled="!newQuestion.trim()"
                class="text-sm font-medium px-4 py-2 rounded-xl text-white transition-colors
                       bg-primary hover:bg-primary-hover disabled:opacity-40">
                Ask
              </button>
            </div>
            <p v-else class="text-xs text-text-subtle">
              <NuxtLink to="/auth/login" class="text-accent underline">Sign in</NuxtLink> to ask a question
            </p>
          </div>

          <!-- Reviews -->
          <div>
            <div class="flex items-center justify-between mb-6">
              <p class="text-xs uppercase tracking-widest text-text-subtle">Reviews</p>
              <div v-if="avgRating > 0" class="flex items-center gap-2">
                <span class="font-bold text-text-strong">{{ avgRating.toFixed(1) }}</span>
                <div class="flex gap-0.5">
                  <span v-for="s in 5" :key="s" class="text-sm"
                    :class="s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-text-faint'">★</span>
                </div>
              </div>
            </div>

            <div v-if="user && !userReview" class="mb-8 pb-8 border-b"
              style="border-color:rgba(255,255,255,0.06)">
              <p class="text-sm text-text-muted mb-4">Leave a review after your purchase</p>
              <div class="flex gap-1 mb-4">
                <button v-for="s in 5" :key="s" @click="newRating = s"
                  class="text-xl transition-transform hover:scale-110"
                  :class="s <= newRating ? 'text-yellow-400' : 'text-text-faint'">★</button>
              </div>
              <textarea v-model="newComment" rows="3" placeholder="Share your experience..."
                class="w-full px-1 py-2.5 text-sm bg-transparent text-text outline-none resize-none
                       border-b border-divider focus:border-accent transition-colors
                       placeholder:text-text-faint mb-4" />
              <button @click="submitReview" :disabled="newRating === 0"
                class="text-sm font-medium px-4 py-2 rounded-xl text-white transition-colors
                       bg-primary hover:bg-primary-hover disabled:opacity-40">
                Submit Review
              </button>
            </div>

            <div v-if="reviews.length === 0" class="text-sm text-text-subtle py-4">No reviews yet.</div>
            <div v-else class="space-y-6">
              <div v-for="review in reviews" :key="review.id"
                class="pb-6 border-b" style="border-color:rgba(255,255,255,0.04)">
                <div class="flex items-center gap-2 mb-2">
                  <div class="flex gap-0.5">
                    <span v-for="s in 5" :key="s" class="text-sm"
                      :class="s <= review.rating ? 'text-yellow-400' : 'text-text-faint'">★</span>
                  </div>
                  <span class="text-xs text-text-subtle">{{ formatDate(review.created_at) }}</span>
                </div>
                <p v-if="review.comment" class="text-sm text-text-muted">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Right: Sticky pricing ──────────────────────────── -->
        <div class="lg:col-span-1">
          <div class="lg:sticky lg:top-24 space-y-5">

            <!-- Urgency badge -->
            <div class="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs"
              style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15)">
              <span class="flex items-center gap-2 text-yellow-400">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                High Demand
              </span>
              <span class="text-yellow-500/70">{{ viewingNow }} viewing now</span>
            </div>

            <!-- Pricing tabs -->
            <div>
              <div v-if="item.pricing_model === 'both'"
                class="flex gap-1 mb-5 p-1 rounded-xl"
                style="background:rgba(255,255,255,0.04)">
                <button v-for="tab in pricingTabs" :key="tab.key"
                  @click="activeTab = tab.key"
                  class="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                  :class="activeTab === tab.key ? 'bg-primary text-white' : 'text-text-muted hover:text-text'">
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
                <p class="text-xs text-text-subtle pt-1">Start with zero upfront cost.</p>
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
              <!-- Primary CTA -->
              <button @click="openContactModal"
                class="relative w-full py-4 rounded-xl text-sm font-bold text-white transition-all
                       hover:-translate-y-0.5 overflow-hidden group"
                style="background:linear-gradient(135deg,#7C3AED,#6D28D9)">
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style="background:linear-gradient(135deg,#8B5CF6,#7C3AED)" />
                <span class="relative flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
                  </svg>
                  Contact Expert Now
                </span>
              </button>

              <!-- Demo button -->
              <button v-if="item.demo_available" @click="requestDemo"
                class="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                style="background:rgba(255,255,255,0.06);color:#F1F1F3;border:1px solid rgba(255,255,255,0.08)">
                🎮 View Live Demo
              </button>

              <!-- Wishlist -->
              <button @click="toggleWishlist"
                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs
                       transition-colors"
                :style="isWishlisted
                  ? 'color:#F87171;background:rgba(239,68,68,0.08)'
                  : 'color:#64748B;background:rgba(255,255,255,0.04)'">
                <svg class="w-4 h-4" :fill="isWishlisted ? 'currentColor' : 'none'"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {{ isWishlisted ? '❤️ Saved to Wishlist' : 'Save to Wishlist' }}
              </button>
            </div>

            <!-- Trust signals -->
            <div class="pt-1 space-y-2 text-xs text-text-subtle border-t"
              style="border-color:rgba(255,255,255,0.06)">
              <div class="flex items-center gap-2 pt-3"><span class="text-success">✓</span> Escrow via KBZPay</div>
              <div class="flex items-center gap-2"><span class="text-success">✓</span> Verified & tested website</div>
              <div class="flex items-center gap-2"><span class="text-success">✓</span> After-sale 30-day support</div>
              <div class="flex items-center gap-2"><span class="text-success">✓</span> Source code handover</div>
            </div>

            <!-- Share -->
            <button @click="shareUrl"
              class="flex items-center justify-center gap-2 w-full py-2 text-xs text-text-faint
                     hover:text-text-subtle transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              Share this listing
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Contact Modal ─────────────────────────────────────── -->
    <Transition enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="showContactModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
        @click.self="showContactModal = false">
        <div class="w-full max-w-sm py-10 px-6 rounded-2xl animate-fade-up"
          style="background:#0E0E1C;border:1px solid rgba(255,255,255,0.07)">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              style="background:rgba(124,58,237,0.15)">
              <svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
              </svg>
            </div>
            <div>
              <h2 class="font-display font-bold text-text-strong">Contact Expert</h2>
              <p class="text-xs text-text-subtle">Reply within 24 hours</p>
            </div>
          </div>

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
            <div>
              <label class="block text-xs font-medium mb-2 text-text-subtle">What are you interested in?</label>
              <select v-model="demoForm.intent"
                class="w-full px-0 py-2.5 text-sm bg-transparent text-text-muted outline-none
                       border-b border-divider focus:border-accent transition-colors cursor-pointer">
                <option value="demo">Request a Demo</option>
                <option value="buy">Ready to Buy</option>
                <option value="negotiate">Negotiate Price</option>
                <option value="custom">Custom Request</option>
              </select>
            </div>
          </div>

          <button @click="submitDemoRequest" :disabled="!demoForm.name || !demoForm.contact"
            class="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all
                   disabled:opacity-50 hover:-translate-y-0.5"
            style="background:linear-gradient(135deg,#7C3AED,#6D28D9)">
            Send Message
          </button>
          <button @click="showContactModal = false"
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

// ── Dynamic SEO ───────────────────────────────────────────────────────────
useSeoMeta({
  title:          computed(() => (item.value?.title ?? 'Listing') + ' — Oracle Market'),
  description:    computed(() => item.value?.description ?? 'Premium game website for sale on Oracle Market Myanmar.'),
  ogTitle:        computed(() => (item.value?.title ?? 'Listing') + ' — Oracle Market'),
  ogDescription:  computed(() => item.value?.description ?? 'Buy premium game websites in Myanmar.'),
  ogImage:        computed(() => item.value?.thumbnail_url ?? ''),
  twitterCard:    'summary_large_image',
})

// Track view
onMounted(async () => {
  if (id.value) await supabase.rpc('increment_view_count', { listing_id: id.value })
})

// ── Gallery ───────────────────────────────────────────────────────────────
const activeImg   = ref(0)
const lightboxOpen = ref(false)

const allImages = computed(() => {
  const imgs: string[] = []
  if (item.value?.thumbnail_url) imgs.push(item.value.thumbnail_url)
  if (item.value?.screenshot_urls?.length) imgs.push(...item.value.screenshot_urls)
  return imgs
})

// ── Scarcity ──────────────────────────────────────────────────────────────
const viewingNow   = computed(() => Math.max(2, Math.min(18, Math.floor((item.value?.view_count ?? 5) / 7) + 2)))
const wishlistCount = computed(() => Math.max(1, Math.floor((item.value?.view_count ?? 10) / 15) + 1))

const daysAgo = computed(() => {
  if (!item.value?.created_at) return 'recently'
  const d = Math.floor((Date.now() - new Date(item.value.created_at).getTime()) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return '1 day'
  return d + ' days'
})

// ── Revenue Calculator ─────────────────────────────────────────────────────
const calcOpen = ref(false)
const calc = reactive({ players: 500, avgBet: 10000, margin: 5 })

const calcResult = computed(() => {
  const gross  = calc.players * calc.avgBet * (calc.margin / 100) * 30
  const profit = gross * 0.7  // assume operator keeps 70%
  const annual = profit * 12
  return { gross, profit, annual }
})

const breakEvenMonths = computed(() => {
  if (!calcResult.value.profit || !item.value?.price) return '—'
  return Math.ceil(item.value.price / calcResult.value.profit)
})

function fmtCalc(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B ks'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M ks'
  return Math.floor(n / 1000) + 'K ks'
}

// ── Pricing tabs ──────────────────────────────────────────────────────────
const activeTab = ref<'revenue_share' | 'full_ownership'>('full_ownership')
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
  const { data } = await supabase.from('qa_items').select('*').eq('listing_id', id.value).order('created_at', { ascending: true })
  return data ?? []
})
async function submitQuestion() {
  if (!newQuestion.value.trim()) return
  await supabase.from('qa_items').insert({ listing_id: id.value, question: newQuestion.value.trim(), asked_by: user.value?.id ?? null })
  newQuestion.value = ''
  await refreshQA()
}

// ── Reviews ───────────────────────────────────────────────────────────────
const newRating  = ref(0)
const newComment = ref('')
const { data: reviews, refresh: refreshReviews } = await useAsyncData(`reviews-${id.value}`, async () => {
  const { data } = await supabase.from('reviews').select('*').eq('listing_id', id.value).order('created_at', { ascending: false })
  return data ?? []
})
const avgRating  = computed(() => {
  const r = reviews.value ?? []
  return r.length ? r.reduce((s: number, x: any) => s + x.rating, 0) / r.length : 0
})
const userReview = computed(() => (reviews.value ?? []).find((r: any) => r.user_id === user.value?.id))
async function submitReview() {
  if (!user.value || newRating.value === 0) return
  await supabase.from('reviews').insert({ listing_id: id.value, user_id: user.value.id, rating: newRating.value, comment: newComment.value.trim() || null })
  newRating.value = 0; newComment.value = ''
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
  const { data } = await supabase.from('wishlists').select('id').eq('user_id', user.value.id).eq('listing_id', id.value).maybeSingle()
  isWishlisted.value = !!data
})
async function toggleWishlist() {
  if (!user.value) {
    const saved: string[] = JSON.parse(localStorage.getItem('oracle_wishlist') || '[]')
    const idx = saved.indexOf(id.value)
    if (idx === -1) saved.push(id.value); else saved.splice(idx, 1)
    localStorage.setItem('oracle_wishlist', JSON.stringify(saved))
    isWishlisted.value = !isWishlisted.value
    return
  }
  if (isWishlisted.value) {
    await supabase.from('wishlists').delete().eq('user_id', user.value.id).eq('listing_id', id.value)
  } else {
    await supabase.from('wishlists').insert({ user_id: user.value.id, listing_id: id.value })
  }
  isWishlisted.value = !isWishlisted.value
}

// ── Contact / Demo ────────────────────────────────────────────────────────
const showContactModal = ref(false)
const demoForm = reactive({ name: '', contact: '', intent: 'demo' })

function openContactModal() {
  if (item.value?.telegram_url) window.open(item.value.telegram_url, '_blank')
  else showContactModal.value = true
}
function requestDemo() {
  if (item.value?.demo_url) window.open(item.value.demo_url, '_blank')
  else { demoForm.intent = 'demo'; showContactModal.value = true }
}
async function submitDemoRequest() {
  if (!demoForm.name || !demoForm.contact) return
  await supabase.from('demo_requests').insert({ listing_id: id.value, name: demoForm.name, contact: demoForm.contact })
  showContactModal.value = false
  demoForm.name = ''; demoForm.contact = ''
}

// ── Share ─────────────────────────────────────────────────────────────────
function shareUrl() {
  if (navigator.share) {
    navigator.share({ title: item.value?.title ?? 'Oracle Market', url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
  }
}

// ── Static data ───────────────────────────────────────────────────────────
const costBenefits = [
  { icon: '🗄️', label: 'No DB cost',      desc: 'Zero database expenses' },
  { icon: '☁️', label: 'No Hosting cost', desc: 'Zero hosting expenses'  },
  { icon: '⚙️', label: 'No Setup fee',    desc: 'Zero setup expenses'    },
]
const howItWorks = [
  { title: 'Choose a website',       desc: 'Browse listings and pick one you like'   },
  { title: 'Demo or consult',        desc: 'Try a live demo or speak with an expert' },
  { title: 'Select a package',       desc: 'Revenue Share or Full Ownership'         },
  { title: 'Pay & receive handover', desc: 'Secure payment via KBZPay escrow'        },
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
