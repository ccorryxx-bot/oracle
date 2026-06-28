<template>
  <div class="min-h-[calc(100vh-9rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">

      <!-- Logo mark -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-4">
          <span class="font-display font-bold text-xl text-white">Oracle</span>
          <span class="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style="background:#7C3AED">Market</span>
        </div>
        <h1 class="font-display text-2xl font-bold text-white mb-1">
          {{ isLogin ? 'Welcome back' : 'Join Oracle Market' }}
        </h1>
        <p class="text-sm" style="color:#475569">
          {{ isLogin ? 'Account ကို Sign in ပါ' : 'Free account တစ်ခု ဖွင့်ပါ' }}
        </p>
      </div>

      <!-- Tab toggle -->
      <div class="flex p-1 rounded-xl mb-6" style="background:rgba(255,255,255,0.04)">
        <button v-for="tab in tabs" :key="tab.id"
          @click="isLogin = tab.id === 'login'"
          class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
          :style="(isLogin && tab.id === 'login') || (!isLogin && tab.id === 'register')
            ? 'background:rgba(255,255,255,0.1);color:#fff'
            : 'color:#64748B'">
          {{ tab.label }}
        </button>
      </div>

      <!-- Form fields -->
      <div class="space-y-4">

        <!-- Display name (register only) -->
        <Transition name="slide">
          <div v-if="!isLogin">
            <label class="block text-xs font-medium mb-1.5" style="color:#94A3B8">Display Name</label>
            <input v-model="form.displayName" type="text" placeholder="Your name"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none border transition"
              style="background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);color:#E2E8F0"
              @focus="e => (e.target as HTMLInputElement).style.borderColor='#7C3AED'"
              @blur="e => (e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.1)'" />
          </div>
        </Transition>

        <!-- Email -->
        <div>
          <label class="block text-xs font-medium mb-1.5" style="color:#94A3B8">Email</label>
          <input v-model="form.email" type="email" placeholder="you@example.com"
            class="w-full px-4 py-3 rounded-xl text-sm outline-none border transition"
            style="background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);color:#E2E8F0"
            @focus="e => (e.target as HTMLInputElement).style.borderColor='#7C3AED'"
            @blur="e => (e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.1)'" />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-medium mb-1.5" style="color:#94A3B8">Password</label>
          <div class="relative">
            <input v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none border transition"
              style="background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.1);color:#E2E8F0"
              @focus="e => (e.target as HTMLInputElement).style.borderColor='#7C3AED'"
              @blur="e => (e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.1)'" />
            <button type="button" @click="showPass = !showPass"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style="color:#475569">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!showPass" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error msg -->
        <div v-if="errorMsg"
          class="text-sm px-4 py-3 rounded-xl border"
          style="background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.2);color:#FCA5A5">
          {{ errorMsg }}
        </div>

        <!-- Success msg -->
        <div v-if="successMsg"
          class="text-sm px-4 py-3 rounded-xl border"
          style="background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.2);color:#6EE7B7">
          {{ successMsg }}
        </div>

        <!-- Submit button -->
        <button @click="handleSubmit" :disabled="loading"
          class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style="background:#7C3AED"
          onmouseover="if(!this.disabled) this.style.background='#6D28D9'"
          onmouseout="this.style.background='#7C3AED'">
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
        </button>

      </div>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t" style="border-color:rgba(255,255,255,0.08)" />
        </div>
        <div class="relative text-center">
          <span class="px-3 text-xs" style="background:#07070F;color:#334155">or</span>
        </div>
      </div>

      <!-- Toggle link -->
      <p class="text-center text-sm" style="color:#475569">
        {{ isLogin ? 'Account မရှိသေးဘူးလား?' : 'Account ရှိပြီးသားလား?' }}
        <button @click="toggleMode" class="font-medium ml-1" style="color:#A78BFA">
          {{ isLogin ? 'Register' : 'Sign In' }}
        </button>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Sign In · Oracle Market' })

const authStore = useAuthStore()

const tabs = [
  { id: 'login',    label: 'Sign In'  },
  { id: 'register', label: 'Register' },
]

const isLogin    = ref(true)
const showPass   = ref(false)
const loading    = ref(false)
const errorMsg   = ref('')
const successMsg = ref('')

const form = reactive({ email: '', password: '', displayName: '' })

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMsg.value   = ''
  successMsg.value = ''
}

async function handleSubmit() {
  errorMsg.value   = ''
  successMsg.value = ''

  if (!form.email || !form.password) {
    errorMsg.value = 'Email နှင့် Password ထည့်ပါ'
    return
  }

  loading.value = true
  try {
    if (isLogin.value) {
      await authStore.signIn(form.email, form.password)
    } else {
      if (!form.displayName.trim()) {
        errorMsg.value = 'Display name ထည့်ပါ'
        return
      }
      await authStore.signUp(form.email, form.password, form.displayName)
      successMsg.value = 'Account ဖွင့်ပြီ! Email confirm လုပ်ပါ။'
    }
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Something went wrong. ထပ်ကြိုးစားပါ။'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
