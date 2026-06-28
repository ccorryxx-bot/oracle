import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const client = useSupabaseClient()
  const user   = useSupabaseUser()

  // ── Sign in ──────────────────────────────────────
  async function signIn(email: string, password: string) {
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    await navigateTo('/')
  }

  // ── Register ─────────────────────────────────────
  async function signUp(email: string, password: string, displayName: string) {
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
      },
    })
    if (error) throw error
    await navigateTo('/')
  }

  // ── Sign out ─────────────────────────────────────
  async function signOut() {
    await client.auth.signOut()
    await navigateTo('/auth/login')
  }

  return { user, signIn, signUp, signOut }
})
