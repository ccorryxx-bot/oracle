<!-- Auth confirm — actual landing page for the OAuth/email-confirm bridge.
     server/routes/auth/callback.get.ts intercepts GET /auth/callback (Nitro
     server routes always win over pages/ for the same path) and does a
     client-side redirect here so that the URL hash (#access_token=...) from
     implicit-flow OAuth survives the hop. This page is what actually parses
     the hash / query params and finishes the sign-in. -->
<template>
  <div class="min-h-screen flex items-center justify-center px-4" style="background:#07070F">
    <div class="w-full max-w-lg">

      <!-- Loading -->
      <div v-if="status === 'loading'" class="text-center space-y-4">
        <div class="w-10 h-10 border-2 rounded-full animate-spin mx-auto"
          style="border-color:#7C3AED;border-top-color:transparent" />
        <p class="text-sm" style="color:#94A3B8">Verifying...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'success'" class="text-center space-y-3">
        <div class="text-4xl">✅</div>
        <p class="text-white font-semibold">Success! Redirecting...</p>
      </div>

      <!-- ERROR panel -->
      <div v-else-if="status === 'error'" class="space-y-4">

        <!-- Friendly message -->
        <div class="rounded-xl p-4 border"
          style="background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.3)">
          <p class="text-sm font-bold mb-1" style="color:#F87171">
            {{ errorInfo.icon }} {{ errorInfo.title }}
          </p>
          <p class="text-sm mb-2" style="color:#FCA5A5">{{ errorInfo.friendly }}</p>
          <p class="text-xs" style="color:#7f8ea3">{{ errorInfo.action }}</p>
        </div>

        <!-- Raw error (technical) -->
        <div class="rounded-xl p-3 border text-xs"
          style="background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.06)">
          <p class="font-bold mb-1" style="color:#475569">🔧 Raw Error:</p>
          <p class="break-all font-mono" style="color:#64748B">{{ rawError }}</p>
        </div>

        <!-- Error code & description -->
        <div v-if="Object.keys(allParams).length > 0"
          class="rounded-xl p-3 border text-xs"
          style="background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.06)">
          <p class="font-bold mb-2" style="color:#475569">📋 URL Params:</p>
          <div v-for="(val, key) in allParams" :key="key" class="flex gap-2 mb-1 flex-wrap">
            <span class="font-mono" style="color:#F59E0B">{{ key }}:</span>
            <span class="break-all font-mono" style="color:#94A3B8">{{ val }}</span>
          </div>
        </div>

        <!-- Full URL -->
        <div class="rounded-xl p-3 border text-xs"
          style="background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.06)">
          <p class="font-bold mb-1" style="color:#475569">🔗 Full URL:</p>
          <p class="break-all font-mono" style="color:#7C3AED">{{ fullUrl }}</p>
        </div>

        <!-- Hash fragment -->
        <div v-if="hashFragment && hashFragment !== '#'"
          class="rounded-xl p-3 border text-xs"
          style="background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.06)">
          <p class="font-bold mb-1" style="color:#475569">🔑 Hash:</p>
          <p class="break-all font-mono" style="color:#34D399">{{ hashFragment }}</p>
        </div>

        <button @click="navigateTo('/auth/login')"
          class="w-full py-3 rounded-xl text-sm font-medium text-white"
          style="background:#7C3AED">
          ← Back to Login
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, ssr: false })

const supabase = useSupabaseClient()
const route    = useRoute()

// ── State ────────────────────────────────────────────────────────────────────
const status       = ref<'loading' | 'success' | 'error'>('loading')
const rawError     = ref('')
const fullUrl      = ref('')
const hashFragment = ref('')
const allParams    = ref<Record<string, string>>({})

// ── Error classifier ──────────────────────────────────────────────────────────
interface ErrorInfo {
  icon:     string
  title:    string
  friendly: string
  action:   string
}

function classifyError(raw: string): ErrorInfo {
  const r = raw.toLowerCase()

  // PKCE code_verifier missing — cookie/localStorage cleared during OAuth redirect
  if (r.includes('pkce') || r.includes('code verifier') || r.includes('code_verifier')) {
    return {
      icon:     '🔐',
      title:    'PKCE Verifier မတွေ့ဘူး',
      friendly: 'OAuth redirect ဖြစ်စဉ်မှာ browser cookie/storage clear ဖြစ်သွားတယ်။ ဒါမှမဟုတ် Private/Incognito mode သုံးနေတာ ဖြစ်နိုင်တယ်။',
      action:   'ပြင်ဆင်ချက်: Normal browser window မှာ ထပ်ကြိုးစားပါ။ Private mode မသုံးနဲ့။',
    }
  }

  // Google credentials / server-side exchange fail
  if (r.includes('unable to exchange external code') || r.includes('exchange external code')) {
    return {
      icon:     '⚙️',
      title:    'Server Configuration Error',
      friendly: 'Google OAuth credentials (Client ID / Secret) မှားနေတယ် သို့မဟုတ် Redirect URI mismatch ဖြစ်နေတယ်။',
      action:   'Fix: Supabase → Authentication → Providers → Google → Client ID & Secret ကို update လုပ်ပါ။',
    }
  }

  if (r.includes('email not confirmed')) {
    return {
      icon:     '📧',
      title:    'Email အတည်မပြုရသေးဘူး',
      friendly: 'Account ဖွင့်ပြီးပြီ — Email inbox ထဲ confirmation link ကို နှိပ်ပြီးမှ ဝင်ပါ။',
      action:   'Spam folder ကိုပါ စစ်ကြည့်ပါ။',
    }
  }

  if (r.includes('invalid login credentials') || r.includes('invalid credentials')) {
    return {
      icon:     '🔑',
      title:    'Email / Password မှားနေတယ်',
      friendly: 'Email သို့မဟုတ် Password တစ်ခုခု မှားနေတယ်။',
      action:   'ထပ်ကြိုးစားပါ သို့မဟုတ် Password reset လုပ်ပါ။',
    }
  }

  if (r.includes('user not found') || r.includes('no user')) {
    return {
      icon:     '👤',
      title:    'အကောင့် မတွေ့ဘူး',
      friendly: 'ဒီ email နဲ့ account မရှိဘူး — အရင် Register လုပ်ပါ။',
      action:   'Sign Up tab ကို ရွေးပြီး account ဖန်တီးပါ။',
    }
  }

  if (r.includes('token') && r.includes('expired')) {
    return {
      icon:     '⏰',
      title:    'Link သက်တမ်းကုန်သွားပြီ',
      friendly: 'Email confirmation link သို့မဟုတ် OTP သက်တမ်းကုန်သွားပြီ (10 min)။',
      action:   'Login page မှ ထပ် request လုပ်ပါ။',
    }
  }

  if (r.includes('oauth') || r.includes('provider')) {
    return {
      icon:     '🔗',
      title:    'OAuth Provider Error',
      friendly: 'Google authentication provider မှ error ပြန်လာတယ်။',
      action:   'ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ သို့မဟုတ် Admin ကို ဆက်သွယ်ပါ။',
    }
  }

  if (r.includes('no auth params') || r.includes('no valid')) {
    return {
      icon:     '🔍',
      title:    'Auth Params မတွေ့ဘူး',
      friendly: 'URL မှာ authentication data မပါဘူး — OAuth flow မပြီးမီ redirect ဖြစ်သွားနိုင်တယ်။',
      action:   'Login page ကနေ ထပ်ကြိုးစားပါ။',
    }
  }

  // Fallback
  return {
    icon:     '❌',
    title:    'Authentication Error',
    friendly: raw,
    action:   'ထပ်ကြိုးစားပါ။ ပြဿနာဆက်ရှိရင် Admin ကို ဆက်သွယ်ပါ။',
  }
}

const errorInfo = computed<ErrorInfo>(() => classifyError(rawError.value))

// ── Main flow ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    fullUrl.value      = window.location.href
    hashFragment.value = window.location.hash

    const params: Record<string, string> = {}
    for (const [k, v] of Object.entries(route.query)) {
      params[k] = String(v)
    }
    allParams.value = params

    const errorParam = route.query.error             as string | undefined
    const errorDesc  = route.query.error_description as string | undefined
    const tokenHash  = route.query.token_hash        as string | undefined
    const type       = route.query.type              as string | undefined

    // ── OAuth implicit: hash contains access_token ──────────────────────────
    if (window.location.hash.includes('access_token')) {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      if (data.session) {
        status.value = 'success'
        await navigateTo('/')
        return
      }
    }

    // ── Error returned from provider ──────────────────────────────────────────
    if (errorParam) {
      rawError.value = errorDesc ?? errorParam
      status.value   = 'error'
      return
    }

    // ── PKCE / email confirmation OTP ─────────────────────────────────────────
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type:       type as 'signup' | 'recovery' | 'invite' | 'email',
      })
      if (error) throw error
      status.value = 'success'
      await navigateTo('/')
      return
    }

    // ── OAuth PKCE code exchange ───────────────────────────────────────────────
    const code = route.query.code as string | undefined
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
      status.value = 'success'
      await navigateTo('/')
      return
    }

    // ── Check existing session ─────────────────────────────────────────────────
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      status.value = 'success'
      await navigateTo('/')
      return
    }

    // ── No valid auth params ───────────────────────────────────────────────────
    rawError.value = 'No auth params found in URL. Google OAuth may not have completed.'
    status.value   = 'error'

  } catch (e: any) {
    // Top-level catch — ဘာ error ဖြစ်ဖြစ် ဒီမှာ ရပ်မယ်
    rawError.value = e?.message ?? 'Unexpected error in auth callback'
    status.value   = 'error'
  }
})
</script>
