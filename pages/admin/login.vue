<template>
  <div class="min-h-screen flex items-center justify-center px-4"
    style="background:#07070F">
    <div class="w-full max-w-sm">

      <!-- Branding -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
          style="background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3)">
          <span class="font-display font-bold text-accent text-xl">O</span>
        </div>
        <h1 class="font-display font-bold text-text-strong text-xl">Oracle Admin</h1>
        <p class="text-sm text-text-subtle mt-1">Restricted access only</p>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-text-subtle mb-2">Admin Email</label>
          <input v-model="email" type="email" placeholder="admin@oraclemarket.mm"
            @keydown.enter="signIn"
            class="w-full px-4 py-3 rounded-xl text-sm text-text outline-none
                   placeholder:text-text-faint transition-all"
            style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)"
            :style="email && 'border-color:rgba(124,58,237,0.4)'" />
        </div>
        <div>
          <label class="block text-xs font-medium text-text-subtle mb-2">Password</label>
          <div class="relative">
            <input v-model="password" :type="showPw ? 'text' : 'password'"
              placeholder="••••••••••••"
              @keydown.enter="signIn"
              class="w-full px-4 py-3 pr-11 rounded-xl text-sm text-text outline-none
                     placeholder:text-text-faint transition-all"
              style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)"
              :style="password && 'border-color:rgba(124,58,237,0.4)'" />
            <button @click="showPw = !showPw"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-faint
                     hover:text-text-subtle transition-colors">
              <svg v-if="!showPw" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Error -->
      <Transition enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 -translate-y-1">
        <div v-if="error"
          class="mt-4 px-4 py-3 rounded-xl text-sm"
          style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#F87171">
          {{ error }}
        </div>
      </Transition>

      <!-- Submit -->
      <button @click="signIn" :disabled="loading || !email || !password"
        class="mt-6 w-full py-3.5 rounded-xl text-sm font-semibold text-white
               transition-all disabled:opacity-40 relative overflow-hidden"
        style="background:linear-gradient(135deg,#7C3AED,#6D28D9)">
        <span v-if="!loading">Sign In to Admin</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Signing in…
        </span>
      </button>

      <p class="text-center text-xs text-text-faint mt-6">
        Unauthorised access is prohibited
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Admin Login — Oracle' })

const supabase = useSupabaseClient()
const router   = useRouter()

const ADMIN_EMAILS = ['admin@oraclemarket.mm']

const email    = ref('')
const password = ref('')
const showPw   = ref(false)
const loading  = ref(false)
const error    = ref('')

// Redirect if already logged-in admin
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user && ADMIN_EMAILS.includes(user.email ?? '')) router.replace('/admin')
})

async function signIn() {
  if (!email.value || !password.value) return
  loading.value = true
  error.value   = ''

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email:    email.value.trim().toLowerCase(),
    password: password.value,
  })

  if (authError) {
    error.value   = 'Invalid credentials. Please try again.'
    loading.value = false
    return
  }

  if (!ADMIN_EMAILS.includes(data.user?.email ?? '')) {
    await supabase.auth.signOut()
    error.value   = 'Access denied. Not an admin account.'
    loading.value = false
    return
  }

  router.replace('/admin')
}
</script>
