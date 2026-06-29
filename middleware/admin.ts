// middleware/admin.ts
// Protects all /admin/* routes — redirects non-admins to home

const ADMIN_EMAILS = [
  'admin@oraclemarket.mm',
  // add more emails here
]

export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  // Not logged in
  if (!user.value) return navigateTo('/auth/login')

  // Not admin
  const isAdmin =
    ADMIN_EMAILS.includes(user.value.email ?? '') ||
    user.value.app_metadata?.role === 'admin'

  if (!isAdmin) return navigateTo('/')
})
