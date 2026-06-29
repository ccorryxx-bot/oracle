<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-bg">
    <div class="w-full max-w-sm py-12">

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center justify-center gap-2 mb-10">
        <span class="font-display font-bold text-xl text-text-strong">Oracle</span>
        <span class="text-xs font-semibold text-text-strong px-2 py-0.5 rounded-full bg-primary">
          Market
        </span>
      </NuxtLink>

      <!-- ── Email-sent confirmation (frameless) ── -->
      <div v-if="confirmed" class="text-center py-8">
        <div class="text-5xl mb-5">📧</div>
        <p class="font-display font-semibold text-text-strong text-lg mb-2">Email စစ်ပါ</p>
        <p class="text-sm text-text-muted">{{ t('auth_sent') }}</p>
        <button @click="confirmed = false; mode = 'signin'"
          class="mt-7 text-sm underline text-accent hover:text-text-strong transition-colors">
          {{ t('auth_signin') }} page ပြန်သွားမည်
        </button>
      </div>

      <!-- ── Auth (frameless, text-on-bg) ─────────── -->
      <div v-else>

        <!-- Tabs (underline, no pill background) -->
        <div class="flex gap-6 mb-8 justify-center">
          <button v-for="tab in tabs" :key="tab.key"
            @click="switchMode(tab.key)"
            class="relative pb-2 text-sm font-medium transition-colors"
            :class="mode === tab.key ? 'text-text-strong' : 'text-text-muted hover:text-text'">
            {{ t(tab.labelKey) }}
            <span v-if="mode === tab.key"
              class="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />
          </button>
        </div>

        <!-- Google OAuth (subtle bg, no border) -->
        <button @click="handleGoogle" :disabled="loading"
          class="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium mb-5
                 bg-surface-hover hover:bg-white/8 text-text transition-colors disabled:opacity-60">
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ t('auth_google') }}
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex-1 h-px bg-divider" />
          <span class="text-xs text-text-faint">{{ t('auth_or') }}</span>
          <div class="flex-1 h-px bg-divider" />
        </div>

        <!-- Email (underline input) -->
        <div class="mb-5">
          <label class="block text-xs font-medium mb-2 text-text-muted">
            {{ t('auth_email') }}
          </label>
          <input v-model="email" type="email" autocomplete="email"
            class="w-full px-1 py-2.5 text-sm bg-transparent text-text outline-none
                   border-b border-divider focus:border-accent transition-colors
                   placeholder:text-text-faint" />
        </div>

        <!-- Password (underline input) -->
        <div class="mb-6">
          <label class="block text-xs font-medium mb-2 text-text-muted">
            {{ t('auth_password') }}
          </label>
          <div class="relative">
            <input v-model="password" :type="showPw ? 'text' : 'password'"
              autocomplete="current-password"
              class="w-full px-1 py-2.5 pr-10 text-sm bg-transparent text-text outline-none
                     border-b border-divider focus:border-accent transition-colors"
              @keyup.enter="handleSubmit" />
            <button type="button" @click="showPw = !showPw"
              class="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-text-subtle hover:text-text"
              aria-label="Toggle password visibility">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <template v-if="!showPw">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </template>
                <template v-else>
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </template>
              </svg>
            </button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error"
          class="mb-4 rounded-xl px-4 py-3 text-xs text-center text-danger bg-danger-bg">
          {{ error }}
        </div>

        <!-- Submit -->
        <button @click="handleSubmit" :disabled="loading"
          class="w-full py-3 rounded-xl text-sm font-semibold text-text-strong
                 bg-primary hover:bg-primary-hover transition-colors disabled:opacity-65">
          <span v-if="loading"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span v-else>{{ mode === 'signin' ? t('auth_signin') : t('auth_signup') }}</span>
        </button>

        <!-- Switch mode -->
        <p class="mt-6 text-center text-xs">
          <button @click="switchMode(mode === 'signin' ? 'signup' : 'signin')"
            class="text-accent hover:text-text-strong underline transition-colors">
            {{ mode === 'signin' ? t('auth_to_signup') : t('auth_to_signin') }}
          </button>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { t }  = useLocale()
const auth   = useAuthStore()
const route  = useRoute()

type Mode = 'signin' | 'signup'

const tabs = [
  { key: 'signin' as Mode, labelKey: 'auth_signin' as const },
  { key: 'signup' as Mode, labelKey: 'auth_signup' as const },
]

const mode      = ref<Mode>('signin')
const email     = ref('')
const password  = ref('')
const showPw    = ref(false)
const loading   = ref(false)
const error     = ref('')
const confirmed = ref(false)

onMounted(() => {
  const authError = route.query.auth_error as string | undefined
  if (authError) error.value = decodeURIComponent(authError)
})

function switchMode(m: Mode) {
  mode.value  = m
  error.value = ''
}

async function handleSubmit() {
  if (!email.value.trim() || !password.value) return
  loading.value = true
  error.value   = ''
  try {
    if (mode.value === 'signin') {
      await auth.signIn(email.value.trim(), password.value)
    } else {
      await auth.signUp(email.value.trim(), password.value)
      confirmed.value = true
    }
  } catch (e: any) {
    error.value = e?.message ?? 'Something went wrong'
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  loading.value = true
  error.value   = ''
  try {
    await auth.signInWithGoogle()
  } catch (e: any) {
    error.value   = e?.message ?? 'Something went wrong'
    loading.value = false
  }
}
</script>
