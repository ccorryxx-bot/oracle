<template>
  <!-- Floating Telegram CTA -->
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="opacity-0 translate-y-4 scale-90"
    leave-to-class="opacity-0 translate-y-4 scale-90">
    <div v-if="visible"
      class="fixed bottom-6 left-6 z-40 flex items-center gap-3 group cursor-pointer
             select-none"
      @click="openTelegram">

      <!-- Pulse rings -->
      <div class="relative">
        <div class="absolute inset-0 rounded-full animate-ping opacity-20"
          style="background:#229ED9;animation-duration:2s" />
        <div class="absolute inset-0 rounded-full animate-ping opacity-10"
          style="background:#229ED9;animation-duration:2s;animation-delay:0.5s" />

        <!-- Main button -->
        <div class="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl
                    transition-transform duration-200 group-hover:scale-105"
          style="background:linear-gradient(135deg,#229ED9,#1a7fa8)">
          <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
          </svg>
        </div>
      </div>

      <!-- Label — expands on hover -->
      <div class="overflow-hidden transition-all duration-300 ease-out max-w-0 group-hover:max-w-xs opacity-0 group-hover:opacity-100">
        <div class="px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold text-white shadow-lg"
          style="background:#229ED9">
          Chat on Telegram →
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{ telegramUrl?: string }>()

const visible = ref(false)

onMounted(() => {
  // Show after 2s delay
  setTimeout(() => { visible.value = true }, 2000)
})

function openTelegram() {
  const url = props.telegramUrl || 'https://t.me/oraclemarket'
  window.open(url, '_blank')
}
</script>
