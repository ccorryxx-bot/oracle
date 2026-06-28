<!-- OAuth redirect + email confirmation handler -->
<template>
  <div class="min-h-screen flex items-center justify-center" style="background:#07070F">
    <div class="text-center space-y-4">
      <div class="w-10 h-10 border-2 rounded-full animate-spin mx-auto"
        style="border-color:#7C3AED;border-top-color:transparent" />
      <p class="text-sm" style="color:#94A3B8">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const route    = useRoute()
const message  = ref('Verifying...')

onMounted(async () => {
  const errorParam = route.query.error as string | undefined
  const tokenHash  = route.query.token_hash as string | undefined
  const type       = route.query.type as string | undefined

  if (errorParam) {
    message.value = 'Authentication failed. Redirecting...'
    setTimeout(() => navigateTo('/auth/login'), 2000)
    return
  }

  if (tokenHash && type) {
    // Email confirmation link clicked
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'recovery' | 'invite' | 'email',
    })
    if (error) {
      message.value = `Error: ${error.message}. Redirecting...`
      setTimeout(() => navigateTo('/auth/login'), 2500)
      return
    }
  }

  // OAuth or confirmed email — go to home
  message.value = 'Done! Redirecting...'
  await navigateTo('/')
})
</script>
