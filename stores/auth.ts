import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const client = useSupabaseClient()
  const user   = useSupabaseUser()

  // ── Email / password sign-in ─────────────────────
  async function signIn(email: string, password: string) {
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    await navigateTo('/')
  }

  // ── Register — email + password only (no display name) ──
  async function signUp(email: string, password: string) {
    const origin = import.meta.client ? window.location.origin : ''
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    })
    if (error) throw error
    // Caller shows the "check your email" confirmation UI
  }

  // ── Google OAuth ─────────────────────────────────
  async function signInWithGoogle() {
    const origin = import.meta.client ? window.location.origin : ''
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    })
    if (error) throw error
    // Browser redirects to Google — no further action needed here
  }

  // ── Sign out ─────────────────────────────────────
  async function signOut() {
    await client.auth.signOut()
    await navigateTo('/auth/login')
  }

  return { user, signIn, signUp, signInWithGoogle, signOut }
})
