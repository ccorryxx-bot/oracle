// middleware/admin.ts
// Guards all /admin/* routes — redirects to /admin/login (NOT main site login)

const ADMIN_EMAILS = ['admin@oraclemarket.mm']

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip guard on admin login page itself
  if (to.path === '/admin/login') return

  const user = useSupabaseUser()

  if (!user.value) return navigateTo('/admin/login')

  const isAdmin =
    ADMIN_EMAILS.includes(user.value.email ?? '') ||
    user.value.app_metadata?.role === 'admin'

  if (!isAdmin) return navigateTo('/admin/login')
})
