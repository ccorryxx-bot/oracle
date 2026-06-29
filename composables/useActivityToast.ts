// composables/useActivityToast.ts
// Re-exported in case other pages need standalone toast control

export function useActivityToast() {
  const activities = [
    { message: 'A website was sold',         time: 'Just now',   color: '#34D399' },
    { message: 'New listing added — Slot',   time: '12m ago',    color: '#A78BFA' },
    { message: 'A listing was reserved',     time: '28m ago',    color: '#A78BFA' },
    { message: 'Price reduced on a listing', time: '1h ago',     color: '#F59E0B' },
    { message: 'Deal completed',             time: '2h ago',     color: '#34D399' },
    { message: 'Demo request submitted',     time: '3h ago',     color: '#A78BFA' },
  ]

  const toast = reactive({ visible: false, message: '', time: '', color: '#A78BFA' })
  let idx = Math.floor(Math.random() * activities.length)
  let timer: ReturnType<typeof setTimeout> | null = null

  function next() {
    const act = activities[idx % activities.length]
    toast.message = act.message
    toast.time    = act.time
    toast.color   = act.color
    toast.visible = true
    idx++
    timer = setTimeout(() => {
      toast.visible = false
      setTimeout(next, Math.random() * 7000 + 9000)
    }, 5000)
  }

  function start(delay = 3000) {
    setTimeout(next, delay)
  }

  function stop() {
    if (timer) clearTimeout(timer)
    toast.visible = false
  }

  return { toast, start, stop }
}
