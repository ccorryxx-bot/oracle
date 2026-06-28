<!-- Auth callback — shows full debug info on error -->
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

      <!-- ERROR — full debug panel -->
      <div v-else-if="status === 'error'" class="space-y-4">
        <div class="rounded-xl p-4 border"
          style="background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.3)">
          <p class="text-sm font-bold mb-1" style="color:#F87171">❌ Authentication Error</p>
          <p class="text-xs" style="color:#FCA5A5">{{ errorMessage }}</p>
        </div>

        <!-- Full URL -->
        <div class="rounded-xl p-4 border text-xs space-y-2"
          style="background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.08);color:#64748B">
          <p class="font-bold" style="color:#94A3B8">🔗 Full URL:</p>
          <p class="break-all" style="color:#A78BFA">{{ fullUrl }}</p>
        </div>

        <!-- Query params -->
        <div class="rounded-xl p-4 border text-xs"
          style="background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.08)">
          <p class="font-bold mb-2" style="color:#94A3B8">📋 URL Params:</p>
          <div v-for="(val, key) in allParams" :key="key" class="flex gap-2 mb-1">
            <span style="color:#F59E0B">{{ key }}:</span>
            <span class="break-all" style="color:#E2E8F0">{{ val }}</span>
          </div>
          <p v-if="Object.keys(allParams).length === 0" style="color:#475569">No params found</p>
        </div>

        <!-- Hash fragment -->
        <div v-if="hashFragment" class="rounded-xl p-4 border text-xs"
          style="background:rgba(255,255,255,0.03);border-color:rgba(255,255,255,0.08)">
          <p class="font-bold mb-1" style="color:#94A3B8">🔑 Hash Fragment:</p>
          <p class="break-all" style="color:#34D399">{{ hashFragment }}</p>
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

const supabase  = useSupabaseClient()
const route     = useRoute()

const status       = ref<'loading'|'success'|'error'>('loading')
const errorMessage = ref('')
const fullUrl      = ref('')
const hashFragment = ref('')
const allParams    = ref<Record<string, string>>({})

onMounted(async () => {
  // Capture full debug info
  fullUrl.value   = window.location.href
  hashFragment.value = window.location.hash

  // All query params
  const params: Record<string, string> = {}
  for (const [k, v] of Object.entries(route.query)) {
    params[k] = String(v)
  }
  allParams.value = params

  const errorParam   = route.query.error as string | undefined
  const errorDesc    = route.query.error_description as string | undefined
  const tokenHash    = route.query.token_hash as string | undefined
  const type         = route.query.type as string | undefined

  // ── OAuth implicit: hash contains access_token ──
  if (window.location.hash.includes('access_token')) {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      if (data.session) {
        status.value = 'success'
        await navigateTo('/')
        return
      }
    } catch (e: any) {
      status.value   = 'error'
      errorMessage.value = e?.message ?? 'Session fetch failed'
      return
    }
  }

  // ── Error from provider ──────────────────────
  if (errorParam) {
    status.value       = 'error'
    errorMessage.value = errorDesc ?? errorParam
    return
  }

  // ── PKCE / email confirmation ────────────────
  if (tokenHash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'signup' | 'recovery' | 'invite' | 'email',
      })
      if (error) throw error
      status.value = 'success'
      await navigateTo('/')
      return
    } catch (e: any) {
      status.value       = 'error'
      errorMessage.value = e?.message ?? 'OTP verification failed'
      return
    }
  }

  // ── OAuth PKCE code exchange ─────────────────
  const code = route.query.code as string | undefined
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
      status.value = 'success'
      await navigateTo('/')
      return
    } catch (e: any) {
      status.value       = 'error'
      errorMessage.value = e?.message ?? 'Code exchange failed'
      return
    }
  }

  // ── Check existing session ───────────────────
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    status.value = 'success'
    await navigateTo('/')
    return
  }

  // ── No valid params found ────────────────────
  status.value       = 'error'
  errorMessage.value = 'No auth params found in URL. Google OAuth may not have completed.'
})
</script>
