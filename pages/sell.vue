<template>
  <div class="min-h-screen">

    <!-- ── Auth Gate ───────────────────────────────────────────── -->
    <div v-if="!user" class="max-w-lg mx-auto px-4 py-32 text-center">
      <p class="text-4xl mb-5">🔐</p>
      <h2 class="font-display font-bold text-text-strong text-xl mb-3">Login လိုအပ်ပါသည်</h2>
      <p class="text-sm text-text-muted mb-6">Website တင်ရောင်းရန် အကောင့်ဝင်ပါ</p>
      <NuxtLink to="/auth/login"
        class="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white
               bg-primary hover:bg-primary-hover transition-colors">
        Sign In
      </NuxtLink>
    </div>

    <!-- ── Success State ────────────────────────────────────────── -->
    <div v-else-if="submitted" class="max-w-lg mx-auto px-4 py-32 text-center">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl"
        style="background:rgba(52,211,153,0.1)">
        🚀
      </div>
      <h2 class="font-display font-bold text-text-strong text-2xl mb-2">Listing တင်ပြီးပြီ!</h2>
      <p class="text-sm text-text-muted mb-8">
        Admin review ပြီးရင် marketplace မှာ တက်ပါမယ်
      </p>
      <div class="flex gap-3 justify-center">
        <NuxtLink to="/dashboard"
          class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                 bg-primary hover:bg-primary-hover transition-colors">
          Dashboard သွား
        </NuxtLink>
        <button @click="resetForm"
          class="px-5 py-2.5 rounded-xl text-sm text-text-muted
                 hover:text-text hover:bg-surface-hover transition-colors">
          + နောက်ထပ် တင်မည်
        </button>
      </div>
    </div>

    <!-- ── Main Form ────────────────────────────────────────────── -->
    <div v-else class="max-w-2xl mx-auto px-4 py-12">

      <!-- Header -->
      <div class="mb-10">
        <NuxtLink to="/dashboard"
          class="inline-flex items-center gap-2 text-sm text-text-subtle
                 hover:text-text transition-colors mb-6">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </NuxtLink>
        <h1 class="font-display font-bold text-text-strong mb-1"
          style="font-size:clamp(1.6rem,4vw,2.2rem)">
          Website တင်ရောင်းမည်
        </h1>
        <p class="text-text-subtle text-sm">
          Step {{ currentStep }} of {{ TOTAL_STEPS }}
          <span class="text-text-faint mx-1.5">·</span>
          {{ stepMeta[currentStep - 1].label }}
        </p>
      </div>

      <!-- ── Step Progress ────────────────────────────────────── -->
      <div class="mb-10">
        <!-- Dot row -->
        <div class="flex items-center">
          <template v-for="(step, i) in stepMeta" :key="i">
            <button
              @click="jumpToStep(i + 1)"
              :disabled="i + 1 > maxReachedStep"
              class="relative flex flex-col items-center focus:outline-none"
              :class="i + 1 <= maxReachedStep ? 'cursor-pointer' : 'cursor-default'">
              <!-- Circle -->
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                       transition-all duration-300 z-10 select-none"
                :class="dotClass(i + 1)">
                <!-- Checkmark for completed -->
                <svg v-if="i + 1 < currentStep" class="w-4 h-4"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <!-- Label -->
              <span class="absolute -bottom-5 text-xs whitespace-nowrap transition-colors select-none"
                :class="i + 1 === currentStep
                  ? 'text-accent font-medium'
                  : i + 1 < currentStep
                    ? 'text-text-subtle'
                    : 'text-text-faint'">
                {{ step.short }}
              </span>
            </button>
            <!-- Connector line -->
            <div v-if="i < stepMeta.length - 1"
              class="flex-1 h-px mx-1 transition-all duration-500"
              :style="i + 1 < currentStep
                ? 'background:linear-gradient(90deg,#7C3AED,#A78BFA)'
                : 'background:rgba(255,255,255,0.08)'" />
          </template>
        </div>

        <!-- Progress fill bar -->
        <div class="mt-8 h-0.5 rounded-full overflow-hidden"
          style="background:rgba(255,255,255,0.05)">
          <div class="h-full rounded-full transition-all duration-500"
            style="background:linear-gradient(90deg,#7C3AED,#A78BFA)"
            :style="{ width: progressPct + '%' }" />
        </div>
      </div>

      <!-- ── Step Content ──────────────────────────────────────── -->
      <Transition :name="slideDir" mode="out-in">
        <div :key="currentStep" class="min-h-64">

          <!-- ════════════════════════════════════════════════════ -->
          <!-- Step 1 · Basic Info                                  -->
          <!-- ════════════════════════════════════════════════════ -->
          <section v-if="currentStep === 1" class="space-y-7">

            <!-- Title -->
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">
                Website Name <span style="color:#F87171">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                maxlength="80"
                placeholder="eg. Dragon Ace Gaming"
                @blur="touchField('title')"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b transition-colors placeholder:text-text-faint"
                :class="fieldError('title')
                  ? 'border-danger'
                  : 'border-divider focus:border-accent'" />
              <div class="flex justify-between mt-1.5">
                <p v-if="fieldError('title')" class="text-xs" style="color:#F87171">
                  {{ fieldError('title') }}
                </p>
                <span v-else class="text-xs text-text-faint">
                  ရောင်းကောင်းသော ခေါင်းစဉ် ရွေးပါ
                </span>
                <span class="text-xs shrink-0 ml-2"
                  :class="form.title.length > 65 ? 'text-warning' : 'text-text-faint'">
                  {{ form.title.length }}/80
                </span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">
                Description <span style="color:#F87171">*</span>
              </label>
              <textarea
                v-model="form.description"
                rows="6"
                maxlength="500"
                placeholder="Website ရဲ့ feature တွေ၊ ဘာကောင်းသလဲ၊ Monthly revenue ရှိပြီးသားဆိုရင် ထည့်ပါ..."
                @blur="touchField('description')"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       resize-none border-b transition-colors placeholder:text-text-faint"
                :class="fieldError('description')
                  ? 'border-danger'
                  : 'border-divider focus:border-accent'" />
              <div class="flex justify-between mt-1.5">
                <p v-if="fieldError('description')" class="text-xs" style="color:#F87171">
                  {{ fieldError('description') }}
                </p>
                <span v-else class="text-xs text-text-faint">
                  Detail ပိုများလေ၊ Buyer ဆွဲဆောင်မှု ပိုများလေ
                </span>
                <span class="text-xs shrink-0 ml-2"
                  :class="form.description.length > 450 ? 'text-warning' : 'text-text-faint'">
                  {{ form.description.length }}/500
                </span>
              </div>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Category</label>
              <div class="relative">
                <select
                  v-model="form.category_id"
                  class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                         border-b border-divider focus:border-accent transition-colors
                         cursor-pointer appearance-none">
                  <option value="" class="bg-bg">-- Category ရွေးပါ --</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id" class="bg-bg">
                    {{ c.name }}
                  </option>
                </select>
                <svg class="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint
                            pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </section>

          <!-- ════════════════════════════════════════════════════ -->
          <!-- Step 2 · Media                                       -->
          <!-- ════════════════════════════════════════════════════ -->
          <section v-else-if="currentStep === 2" class="space-y-8">

            <!-- Thumbnail -->
            <div>
              <label class="block text-xs font-medium mb-2 text-text-muted">Thumbnail URL</label>
              <input
                v-model="form.thumbnail_url"
                type="url"
                placeholder="https://i.imgur.com/yourimage.jpg"
                class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                       border-b border-divider focus:border-accent transition-colors
                       placeholder:text-text-faint" />
              <p class="text-xs text-text-faint mt-1.5">
                Imgur, ImgBB, Cloudinary — ဘယ် image host မဆို OK
              </p>

              <!-- Live thumbnail preview -->
              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="opacity-0 scale-95 -translate-y-1">
                <div
                  v-if="form.thumbnail_url && isValidUrl(form.thumbnail_url)"
                  class="mt-4 aspect-video rounded-xl overflow-hidden bg-surface-hover
                         relative max-w-sm">
                  <img
                    :src="form.thumbnail_url"
                    alt="Preview"
                    class="w-full h-full object-cover"
                    @error="thumbnailError = true"
                    @load="thumbnailError = false" />
                  <div
                    v-if="thumbnailError"
                    class="absolute inset-0 flex items-center justify-center text-xs text-text-faint">
                    Image ကို load မတင်နိုင်ဘူး
                  </div>
                  <div
                    v-else
                    class="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-md
                           bg-success/20 text-success border border-success/25">
                    Preview ✓
                  </div>
                </div>
              </Transition>
            </div>

            <div class="h-px" style="background:rgba(255,255,255,0.06)" />

            <!-- Screenshots -->
            <div>
              <label class="block text-xs font-medium mb-1 text-text-muted">
                Screenshot URLs
              </label>
              <p class="text-xs text-text-faint mb-4">
                တစ်လိုင်းမှာ URL တစ်ခု (max 6 ပုံ)
              </p>

              <div class="space-y-2.5">
                <div
                  v-for="(_, i) in screenshotLines"
                  :key="i"
                  class="flex items-center gap-2">
                  <input
                    v-model="screenshotLines[i]"
                    type="url"
                    :placeholder="`Screenshot ${i + 1} URL`"
                    class="flex-1 px-1 py-2.5 text-sm bg-transparent text-text outline-none
                           border-b border-divider focus:border-accent transition-colors
                           placeholder:text-text-faint" />
                  <button
                    v-if="screenshotLines.length > 1"
                    @click="screenshotLines.splice(i, 1)"
                    class="text-text-faint hover:text-danger transition-colors shrink-0 p-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                v-if="screenshotLines.length < 6"
                @click="screenshotLines.push('')"
                class="mt-3 flex items-center gap-1.5 text-xs text-text-subtle
                       hover:text-accent transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Screenshot ထပ်ထည့်မည်
              </button>

              <!-- Screenshot previews -->
              <div v-if="validScreenshots.length" class="mt-4 flex gap-2 overflow-x-auto pb-1">
                <div
                  v-for="(url, i) in validScreenshots"
                  :key="i"
                  class="shrink-0 w-20 aspect-video rounded-lg overflow-hidden bg-surface-hover">
                  <img :src="url" :alt="`Screenshot ${i + 1}`"
                    class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <!-- Skip tip -->
            <div class="px-4 py-3 rounded-xl text-xs flex items-start gap-2.5
                        bg-white/3 border border-divider">
              <span class="text-accent shrink-0">💡</span>
              <span class="text-text-subtle">
                Image မရှိသေးဘူးဆိုရင် skip လုပ်နိုင်တယ်
                — Dashboard မှာ နောက်မှ edit ပြီး ထည့်နိုင်ပါတယ်
              </span>
            </div>
          </section>

          <!-- ════════════════════════════════════════════════════ -->
          <!-- Step 3 · Tech & Games                               -->
          <!-- ════════════════════════════════════════════════════ -->
          <section v-else-if="currentStep === 3" class="space-y-10">

            <!-- Tech Stack -->
            <div>
              <p class="text-xs font-medium text-text-muted mb-4 uppercase tracking-widest">
                Tech Stack
              </p>
              <div class="grid sm:grid-cols-2 gap-5">
                <div v-for="field in techFields" :key="field.key">
                  <label class="block text-xs font-medium mb-2 text-text-muted">
                    {{ field.label }}
                  </label>
                  <input
                    v-model="techStack[field.key]"
                    type="text"
                    :placeholder="field.placeholder"
                    class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                           border-b border-divider focus:border-accent transition-colors
                           placeholder:text-text-faint" />
                </div>
              </div>
            </div>

            <div class="h-px" style="background:rgba(255,255,255,0.06)" />

            <!-- Game Types -->
            <div>
              <p class="text-xs font-medium text-text-muted mb-3 uppercase tracking-widest">
                Game Types
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="t in gameTypeOptions"
                  :key="t"
                  type="button"
                  @click="toggleArr(form.game_types, t)"
                  class="px-3 py-1.5 rounded-lg text-xs border transition-all duration-200"
                  :class="form.game_types.includes(t)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-hover text-text-muted border-white/8'">
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Game Providers -->
            <div>
              <p class="text-xs font-medium text-text-muted mb-3 uppercase tracking-widest">
                Game Providers
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in providerOptions"
                  :key="p"
                  type="button"
                  @click="toggleArr(form.game_providers, p)"
                  class="px-3 py-1.5 rounded-lg text-xs border transition-all duration-200"
                  :class="form.game_providers.includes(p)
                    ? 'bg-primary/20 text-accent border-primary/40'
                    : 'bg-surface-hover text-text-muted border-white/8'">
                  {{ p }}
                </button>
              </div>
            </div>

            <!-- Payment Methods -->
            <div>
              <p class="text-xs font-medium text-text-muted mb-3 uppercase tracking-widest">
                Payment Methods
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="m in paymentOptions"
                  :key="m"
                  type="button"
                  @click="toggleArr(form.payment_methods, m)"
                  class="px-3 py-1.5 rounded-lg text-xs border transition-all duration-200"
                  :class="form.payment_methods.includes(m)
                    ? 'bg-success/12 text-success border-success/30'
                    : 'bg-surface-hover text-text-muted border-white/8'">
                  {{ m }}
                </button>
              </div>
            </div>
          </section>

          <!-- ════════════════════════════════════════════════════ -->
          <!-- Step 4 · Pricing                                     -->
          <!-- ════════════════════════════════════════════════════ -->
          <section v-else-if="currentStep === 4" class="space-y-8">

            <!-- Pricing model selector -->
            <div>
              <p class="text-xs font-medium text-text-muted mb-4 uppercase tracking-widest">
                Pricing Model
              </p>
              <div class="space-y-2">
                <button
                  v-for="opt in pricingOptions"
                  :key="opt.value"
                  type="button"
                  @click="form.pricing_model = opt.value"
                  class="w-full text-left px-5 py-4 rounded-xl border transition-all duration-200"
                  :class="form.pricing_model === opt.value
                    ? 'bg-primary/12 border-primary/35'
                    : 'bg-white/3 border-divider'">
                  <div class="flex items-start gap-4">
                    <!-- Radio circle -->
                    <div
                      class="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center
                             justify-center transition-all duration-200"
                      :class="form.pricing_model === opt.value
                        ? 'bg-primary border-2 border-primary'
                        : 'border-[1.5px] border-white/20'">
                      <div
                        v-if="form.pricing_model === opt.value"
                        class="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p class="font-medium text-text-strong text-sm">{{ opt.label }}</p>
                        <span
                          v-if="opt.badge"
                          class="text-xs px-1.5 py-0.5 rounded font-medium
                                 bg-success/10 text-success">
                          {{ opt.badge }}
                        </span>
                      </div>
                      <p class="text-xs text-text-subtle">{{ opt.desc }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div class="h-px" style="background:rgba(255,255,255,0.06)" />

            <!-- Revenue Share fields -->
            <Transition
              enter-active-class="transition-all duration-300"
              enter-from-class="opacity-0 -translate-y-2">
              <div v-if="form.pricing_model !== 'full_ownership'" class="space-y-6">
                <p class="text-xs text-text-subtle uppercase tracking-widest">
                  Revenue Share Details
                </p>
                <div class="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-medium mb-2 text-text-muted">
                      Monthly Fee (MMK)
                    </label>
                    <input
                      v-model.number="form.monthly_fee"
                      type="number"
                      min="0"
                      placeholder="eg. 150000"
                      class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                             border-b border-divider focus:border-accent transition-colors
                             placeholder:text-text-faint" />
                    <p
                      v-if="form.monthly_fee && form.monthly_fee > 0"
                      class="text-xs text-accent mt-1.5">
                      ≈ {{ formatMMK(form.monthly_fee) }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-xs font-medium mb-2 text-text-muted">
                      Revenue Share %
                    </label>
                    <div class="relative">
                      <input
                        v-model.number="form.revenue_share_pct"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="eg. 15"
                        class="w-full px-1 py-3 pr-6 text-sm bg-transparent text-text
                               outline-none border-b border-divider focus:border-accent
                               transition-colors placeholder:text-text-faint" />
                      <span class="absolute right-1 top-3 text-text-subtle text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Ownership price -->
            <Transition
              enter-active-class="transition-all duration-300"
              enter-from-class="opacity-0 -translate-y-2">
              <div v-if="form.pricing_model !== 'revenue_share'">
                <label class="block text-xs font-medium mb-2 text-text-muted">
                  Selling Price (MMK) <span style="color:#F87171">*</span>
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  placeholder="eg. 5000000"
                  @blur="touchField('price')"
                  class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                         border-b transition-colors placeholder:text-text-faint"
                  :class="fieldError('price')
                    ? 'border-danger'
                    : 'border-divider focus:border-accent'" />
                <div class="flex justify-between mt-1.5">
                  <p v-if="fieldError('price')" class="text-xs" style="color:#F87171">
                    {{ fieldError('price') }}
                  </p>
                  <p
                    v-else-if="form.price > 0"
                    class="font-display font-bold text-sm text-accent">
                    {{ formatMMK(form.price) }}
                  </p>
                </div>
              </div>
            </Transition>

            <!-- Pricing tip -->
            <div class="px-4 py-3 rounded-xl text-xs flex items-start gap-2.5
                        bg-primary/8 border border-primary/20">
              <span class="shrink-0 mt-0.5">💡</span>
              <span class="text-text-subtle leading-relaxed">
                <span class="text-text-strong font-medium">"Both Options"</span>
                ကို ရွေးရင် Buyer ကို ရွေးချယ်ခွင့် ပေးတာမို့
                conversion rate 40% ပိုမြင့်တတ်တယ်
              </span>
            </div>
          </section>

          <!-- ════════════════════════════════════════════════════ -->
          <!-- Step 5 · Contact & Review                           -->
          <!-- ════════════════════════════════════════════════════ -->
          <section v-else-if="currentStep === 5" class="space-y-8">

            <!-- Contact & Demo -->
            <div class="space-y-6">
              <p class="text-xs font-medium text-text-muted uppercase tracking-widest">
                Contact & Demo
              </p>

              <!-- Demo toggle -->
              <div class="flex items-center justify-between py-3 border-b"
                style="border-color:rgba(255,255,255,0.06)">
                <div>
                  <p class="text-sm font-medium text-text-strong">Demo Available</p>
                  <p class="text-xs text-text-subtle mt-0.5">
                    Buyer တွေ demo ကြည့်ခွင့် ပေးမည်လား
                  </p>
                </div>
                <button
                  type="button"
                  @click="form.demo_available = !form.demo_available"
                  class="relative w-11 h-6 rounded-full transition-colors shrink-0"
                  :class="form.demo_available ? 'bg-primary' : 'bg-white/10'">
                  <span
                    class="absolute top-1 w-4 h-4 bg-white rounded-full
                           transition-transform duration-200"
                    :class="form.demo_available ? 'translate-x-5' : 'translate-x-1'" />
                </button>
              </div>

              <!-- Demo URL -->
              <div v-if="form.demo_available">
                <label class="block text-xs font-medium mb-2 text-text-muted">
                  Demo URL <span class="text-text-faint">(optional)</span>
                </label>
                <input
                  v-model="form.demo_url"
                  type="url"
                  placeholder="https://demo.yoursite.com"
                  class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                         border-b border-divider focus:border-accent transition-colors
                         placeholder:text-text-faint" />
              </div>

              <!-- Telegram -->
              <div>
                <label class="block text-xs font-medium mb-2 text-text-muted">
                  Telegram URL
                  <span class="text-text-faint ml-1">(highly recommended)</span>
                </label>
                <input
                  v-model="form.telegram_url"
                  type="url"
                  placeholder="https://t.me/yourusername"
                  class="w-full px-1 py-3 text-sm bg-transparent text-text outline-none
                         border-b border-divider focus:border-accent transition-colors
                         placeholder:text-text-faint" />
                <p class="text-xs text-text-faint mt-1.5">
                  Buyer တွေ ဒီ link မှ တဆင့် ဆက်သွယ်မယ်
                </p>
              </div>
            </div>

            <div class="h-px" style="background:rgba(255,255,255,0.06)" />

            <!-- ── Listing Review Summary ─────────────────────── -->
            <div>
              <p class="text-xs font-medium text-text-muted mb-4 uppercase tracking-widest">
                Review Summary
              </p>

              <div class="rounded-2xl overflow-hidden"
                style="border:1px solid rgba(255,255,255,0.06)">

                <!-- Thumbnail strip -->
                <div
                  v-if="form.thumbnail_url && isValidUrl(form.thumbnail_url) && !thumbnailError"
                  class="aspect-video bg-surface-hover relative">
                  <img :src="form.thumbnail_url" class="w-full h-full object-cover" />
                  <div class="absolute inset-0"
                    style="background:linear-gradient(to top,rgba(7,7,15,0.85) 35%,transparent)" />
                  <div class="absolute bottom-4 left-4 right-4">
                    <p class="font-display font-bold text-text-strong text-lg leading-snug">
                      {{ form.title || '—' }}
                    </p>
                    <p class="text-xs text-text-subtle mt-1">{{ categoryName }}</p>
                  </div>
                </div>
                <div v-else class="px-5 pt-5">
                  <p class="font-display font-semibold text-text-strong">
                    {{ form.title || '—' }}
                  </p>
                  <p class="text-xs text-text-subtle mt-0.5">{{ categoryName }}</p>
                </div>

                <!-- Summary grid -->
                <div class="px-5 py-4">
                  <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-xs mb-4">
                    <div>
                      <p class="text-text-faint mb-0.5">Pricing Model</p>
                      <p class="text-text-strong font-medium">{{ pricingModelLabel }}</p>
                    </div>
                    <div v-if="form.price > 0">
                      <p class="text-text-faint mb-0.5">Price</p>
                      <p class="font-display font-bold text-accent">{{ formatMMK(form.price) }}</p>
                    </div>
                    <div v-if="form.monthly_fee">
                      <p class="text-text-faint mb-0.5">Monthly Fee</p>
                      <p class="text-text-strong font-medium">{{ formatMMK(form.monthly_fee) }}</p>
                    </div>
                    <div v-if="form.game_types.length">
                      <p class="text-text-faint mb-0.5">Games</p>
                      <p class="text-text-strong">{{ form.game_types.join(', ') }}</p>
                    </div>
                    <div v-if="form.demo_available">
                      <p class="text-text-faint mb-0.5">Demo</p>
                      <p class="text-success">Available ✓</p>
                    </div>
                    <div v-if="form.telegram_url">
                      <p class="text-text-faint mb-0.5">Contact</p>
                      <p class="text-success">Telegram ✓</p>
                    </div>
                  </div>

                  <!-- Quality score bar -->
                  <div class="pt-3 border-t" style="border-color:rgba(255,255,255,0.06)">
                    <div class="flex items-center justify-between mb-1.5">
                      <p class="text-xs text-text-subtle">Listing Quality Score</p>
                      <p class="text-xs font-bold" :class="qualityColorClass">
                        {{ qualityScore }}%
                      </p>
                    </div>
                    <div class="h-1.5 rounded-full overflow-hidden bg-divider">
                      <div class="h-full rounded-full transition-all duration-700"
                        :class="qualityBarClass"
                        :style="{ width: qualityScore + '%' }" />
                    </div>
                    <!-- Tips -->
                    <div v-if="qualityTips.length" class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      <p v-for="tip in qualityTips" :key="tip"
                        class="text-xs flex items-center gap-1 text-warning">
                        <span>⚠</span> {{ tip }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error message -->
            <div v-if="error"
              class="px-4 py-3 rounded-xl text-xs bg-danger-bg text-danger">
              {{ error }}
            </div>
          </section>

        </div>
      </Transition>

      <!-- ── Navigation ────────────────────────────────────────── -->
      <div class="mt-10 flex items-center gap-3">
        <!-- Back -->
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          class="flex items-center gap-2 px-5 py-3 rounded-xl text-sm text-text-muted
                 hover:text-text hover:bg-surface-hover transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div class="flex-1" />

        <!-- Draft save (only on last step) -->
        <button
          v-if="currentStep === TOTAL_STEPS"
          @click="submitListing('draft')"
          :disabled="submitting"
          class="px-4 py-3 rounded-xl text-sm text-text-muted
                 hover:text-text hover:bg-surface-hover transition-colors
                 disabled:opacity-40">
          Draft သိမ်းမည်
        </button>

        <!-- Next button -->
        <button
          v-if="currentStep < TOTAL_STEPS"
          @click="nextStep"
          class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                 text-white bg-primary hover:bg-primary-hover transition-all
                 hover:-translate-y-0.5">
          Next
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Submit button -->
        <button
          v-else
          @click="submitListing('published')"
          :disabled="submitting"
          class="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold
                 text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style="background:linear-gradient(135deg,#7C3AED,#6D28D9)">
          <span
            v-if="submitting"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent
                   rounded-full animate-spin" />
          <span v-else>🚀 Listing တင်မည်</span>
        </button>
      </div>

      <!-- Auto-save indicator -->
      <p class="text-center text-xs text-text-faint mt-5 flex items-center justify-center gap-1.5">
        <span class="inline-block w-1.5 h-1.5 rounded-full" style="background:#34D399" />
        Draft auto-saved — browser ပိတ်သွားသော်လည်း data ဆုံးမည်မဟုတ်
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Sell Your Website — Oracle Market' })

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

// ── Constants ──────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5
const DRAFT_KEY   = 'oracle_sell_draft_v1'

// ── Step state ─────────────────────────────────────────────────────────────
const currentStep    = ref(1)
const maxReachedStep = ref(1)
const slideDir       = ref<'slide-left' | 'slide-right'>('slide-left')
const submitted      = ref(false)
const submitting     = ref(false)
const error          = ref('')
const thumbnailError = ref(false)

// ── Touched fields (show errors only after blur) ───────────────────────────
const touched = reactive<Record<string, boolean>>({})
function touchField(key: string) { touched[key] = true }

// ── Categories ─────────────────────────────────────────────────────────────
const { data: categories } = await useAsyncData('cats', async () => {
  const { data } = await supabase.from('categories').select('id,name').order('name')
  return data ?? []
})

// ── Options ────────────────────────────────────────────────────────────────
const gameTypeOptions = [
  'Slot', 'Live Casino', 'Sports Betting',
  'Lottery', 'Poker', 'Fishing', 'Arcade',
]
const providerOptions = [
  'CQ9', 'Jili', 'PG Soft', 'Evolution Gaming',
  'Pragmatic Play', 'Habanero', 'Spribe', 'SA Gaming',
]
const paymentOptions = [
  'KBZPay', 'Wave Money', 'AYA Pay', 'CB Pay', 'OK Dollar', 'True Money',
]

const pricingOptions = [
  {
    value: 'full_ownership',
    label: 'Full Ownership',
    badge: undefined,
    desc:  'One-time payment — Website ownership အပြည့်ရသည်',
  },
  {
    value: 'revenue_share',
    label: 'Revenue Share Partner',
    badge: undefined,
    desc:  'Monthly fee + Revenue % — Setup cost မကုန်ဘဲ စနိုင်သည်',
  },
  {
    value: 'both',
    label: 'Both Options',
    badge: 'Best',
    desc:  'Buyer ကို ရွေးချယ်ခွင့် ပေး — conversion rate ပိုမြင့်သည်',
  },
]

const techFields = [
  { key: 'frontend', label: 'Frontend',  placeholder: 'eg. Vue 3, React, Nuxt'   },
  { key: 'backend',  label: 'Backend',   placeholder: 'eg. Node.js, Laravel'     },
  { key: 'database', label: 'Database',  placeholder: 'eg. MySQL, PostgreSQL'    },
  { key: 'hosting',  label: 'Hosting',   placeholder: 'eg. VPS, Vercel, AWS'     },
]

// ── Step metadata ──────────────────────────────────────────────────────────
const stepMeta = [
  { label: 'Basic Info',   short: 'Info'   },
  { label: 'Media',        short: 'Media'  },
  { label: 'Tech & Games', short: 'Tech'   },
  { label: 'Pricing',      short: 'Price'  },
  { label: 'Contact & Review', short: 'Review' },
]

const progressPct = computed(() =>
  ((currentStep.value - 1) / (TOTAL_STEPS - 1)) * 100
)

// ── Form state ─────────────────────────────────────────────────────────────
const form = reactive({
  title:             '',
  description:       '',
  category_id:       '',
  thumbnail_url:     '',
  pricing_model:     'full_ownership' as string,
  price:             0,
  monthly_fee:       null as number | null,
  revenue_share_pct: null as number | null,
  demo_available:    false,
  demo_url:          '',
  telegram_url:      '',
  game_types:        [] as string[],
  game_providers:    [] as string[],
  payment_methods:   [] as string[],
})

const techStack = reactive({
  frontend: '',
  backend:  '',
  database: '',
  hosting:  '',
})

const screenshotLines = ref<string[]>([''])

const validScreenshots = computed(() =>
  screenshotLines.value.filter(u => u.trim() && isValidUrl(u.trim()))
)

// ── Per-step validation rules ──────────────────────────────────────────────
const validationRules: Record<string, () => string | null> = {
  title: () => {
    if (!form.title.trim()) return 'Website name လိုအပ်သည်'
    if (form.title.trim().length < 3) return 'အနည်းဆုံး 3 လုံး ထည့်ပါ'
    return null
  },
  description: () => {
    if (!form.description.trim()) return 'Description လိုအပ်သည်'
    if (form.description.trim().length < 20) return 'အနည်းဆုံး 20 လုံး ထည့်ပါ'
    return null
  },
  price: () => {
    if (form.pricing_model !== 'revenue_share' && (!form.price || form.price <= 0)) {
      return 'Selling price လိုအပ်သည်'
    }
    return null
  },
}

function fieldError(key: string): string | null {
  if (!touched[key]) return null
  return validationRules[key]?.() ?? null
}

// Validate each step before proceeding
const stepValidation: Record<number, () => boolean> = {
  1: () => {
    touchField('title')
    touchField('description')
    return !validationRules.title() && !validationRules.description()
  },
  2: () => true,   // media is optional
  3: () => true,   // tech/games are optional
  4: () => {
    if (form.pricing_model !== 'revenue_share') touchField('price')
    return form.pricing_model === 'revenue_share' || (!!form.price && form.price > 0)
  },
  5: () => true,
}

// ── Navigation ─────────────────────────────────────────────────────────────
function nextStep() {
  if (!stepValidation[currentStep.value]()) return
  slideDir.value = 'slide-left'
  currentStep.value++
  if (currentStep.value > maxReachedStep.value) {
    maxReachedStep.value = currentStep.value
  }
  saveDraft()
  // scroll to top of form
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevStep() {
  slideDir.value = 'slide-right'
  currentStep.value--
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function jumpToStep(step: number) {
  if (step > maxReachedStep.value) return
  slideDir.value = step > currentStep.value ? 'slide-left' : 'slide-right'
  currentStep.value = step
}

// ── Dot styles ─────────────────────────────────────────────────────────────
function dotClass(step: number): string {
  if (step < currentStep.value)
    return 'bg-primary text-white'
  if (step === currentStep.value)
    return 'bg-primary/20 text-accent border-[1.5px] border-primary'
  return 'bg-white/5 text-text-subtle border border-white/8'
}

// ── Quality score (Step 5 listing preview) ─────────────────────────────────
const qualityScore = computed(() => {
  let score = 0
  if (form.title.trim().length >= 3)        score += 20
  if (form.description.trim().length >= 50)  score += 20
  if (form.thumbnail_url)                    score += 15
  if (validScreenshots.value.length >= 2)    score += 10
  if (form.game_types.length)                score += 10
  if (form.price > 0 || form.monthly_fee)    score += 10
  if (form.telegram_url)                     score += 10
  if (form.demo_available)                   score += 5
  return Math.min(score, 100)
})

const qualityTips = computed(() => {
  const tips: string[] = []
  if (form.description.trim().length < 50) tips.push('Description ပိုရှည်ပါ')
  if (!form.thumbnail_url)                 tips.push('Thumbnail ထည့်ပါ')
  if (validScreenshots.value.length < 2)  tips.push('Screenshot ≥ 2 ထည့်ပါ')
  if (!form.telegram_url)                 tips.push('Telegram URL ထည့်ပါ')
  return tips
})

// 3-way traffic-light classes for the quality score — derived from the same
// semantic tokens as the rest of the app (success/warning/danger), so this
// never drifts from the design system even as thresholds change.
const qualityColorClass = computed(() => {
  if (qualityScore.value >= 80) return 'text-success'
  if (qualityScore.value >= 50) return 'text-warning'
  return 'text-danger'
})
const qualityBarClass = computed(() => {
  if (qualityScore.value >= 80) return 'bg-success'
  if (qualityScore.value >= 50) return 'bg-warning'
  return 'bg-danger'
})

// ── Computed helpers ───────────────────────────────────────────────────────
const categoryName = computed(() => {
  const cat = (categories.value ?? []).find((c: any) => c.id === form.category_id)
  return (cat as any)?.name ?? 'General'
})

const pricingModelLabel = computed(() => ({
  full_ownership: 'Full Ownership',
  revenue_share:  'Revenue Share',
  both:           'Both Options',
}[form.pricing_model] ?? '—'))

// ── LocalStorage draft auto-save ───────────────────────────────────────────
function saveDraft() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      form:            { ...form },
      techStack:       { ...techStack },
      screenshotLines: [...screenshotLines.value],
      currentStep:     currentStep.value,
      maxReachedStep:  maxReachedStep.value,
    }))
  } catch { /* quota exceeded or private mode — silently ignore */ }
}

function loadDraft() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const draft = JSON.parse(raw)
    Object.assign(form,      draft.form      ?? {})
    Object.assign(techStack, draft.techStack ?? {})
    screenshotLines.value = draft.screenshotLines ?? ['']
    currentStep.value     = draft.currentStep    ?? 1
    maxReachedStep.value  = draft.maxReachedStep ?? currentStep.value
  } catch { /* corrupted draft — silently ignore */ }
}

function clearDraft() {
  if (import.meta.client) {
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
  }
}

// Auto-save on every field change
watch([() => ({ ...form }), () => ({ ...techStack }), screenshotLines], saveDraft, { deep: true })

onMounted(loadDraft)

// ── Utility helpers ────────────────────────────────────────────────────────
function isValidUrl(s: string): boolean {
  try { new URL(s); return true } catch { return false }
}

function toggleArr(arr: string[], val: string) {
  const i = arr.indexOf(val)
  if (i === -1) arr.push(val)
  else arr.splice(i, 1)
}

function formatMMK(price: number): string {
  if (!price) return '—'
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M ks'
  if (price >= 1_000)     return (price / 1_000).toFixed(0) + 'K ks'
  return price + ' ks'
}

// ── Submit ─────────────────────────────────────────────────────────────────
async function submitListing(status: 'published' | 'draft') {
  if (!user.value) return
  submitting.value = true
  error.value = ''

  try {
    const techObj = Object.fromEntries(
      Object.entries(techStack).filter(([, v]) => (v as string).trim())
    )
    const screenshots = screenshotLines.value
      .map(s => s.trim())
      .filter(Boolean)

    const { error: dbError } = await supabase.from('portfolio_items').insert({
      title:             form.title,
      description:       form.description,
      category_id:       form.category_id   || null,
      thumbnail_url:     form.thumbnail_url || null,
      pricing_model:     form.pricing_model,
      price:             form.price         || null,
      monthly_fee:       form.monthly_fee,
      revenue_share_pct: form.revenue_share_pct,
      demo_available:    form.demo_available,
      demo_url:          form.demo_url      || null,
      telegram_url:      form.telegram_url  || null,
      seller_id:         user.value.id,
      status,
      tech_stack:        Object.keys(techObj).length ? techObj : null,
      screenshot_urls:   screenshots.length ? screenshots : null,
      game_types:        form.game_types.length    ? form.game_types    : null,
      game_providers:    form.game_providers.length ? form.game_providers : null,
      payment_methods:   form.payment_methods.length ? form.payment_methods : null,
    })

    if (dbError) throw dbError

    clearDraft()

    if (status === 'published') {
      submitted.value = true
    } else {
      await navigateTo('/dashboard')
    }
  } catch (e: any) {
    error.value = e?.message ?? 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

// ── Reset (after success) ──────────────────────────────────────────────────
function resetForm() {
  Object.assign(form, {
    title: '', description: '', category_id: '', thumbnail_url: '',
    pricing_model: 'full_ownership', price: 0, monthly_fee: null,
    revenue_share_pct: null, demo_available: false, demo_url: '',
    telegram_url: '', game_types: [], game_providers: [], payment_methods: [],
  })
  Object.assign(techStack, { frontend: '', backend: '', database: '', hosting: '' })
  screenshotLines.value = ['']
  currentStep.value    = 1
  maxReachedStep.value = 1
  submitted.value      = false
  Object.keys(touched).forEach(k => delete touched[k])
}
</script>

<style scoped>
/* ── Step slide transitions ─────────────────────────────────────── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.26s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from  { transform: translateX(24px); opacity: 0; }
.slide-left-leave-to    { transform: translateX(-24px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-24px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(24px); opacity: 0; }
</style>
