<template>
  <div class="p-8 max-w-5xl">

    <div class="mb-8">
      <p class="text-xs uppercase tracking-widest text-text-subtle mb-1">Admin</p>
      <h1 class="font-display font-bold text-text-strong text-2xl">Q&A Management</h1>
      <p class="text-sm text-text-subtle mt-1">Answer buyer questions — public on each listing page</p>
    </div>

    <!-- Unanswered count -->
    <div v-if="unanswered.length > 0"
      class="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl"
      style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15)">
      <div class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
      <p class="text-sm text-yellow-400 font-medium">
        {{ unanswered.length }} question{{ unanswered.length > 1 ? 's' : '' }} waiting for an answer
      </p>
    </div>

    <!-- Filter -->
    <div class="flex items-center gap-3 mb-6">
      <button v-for="tab in tabs" :key="tab.key"
        @click="filter = tab.key"
        class="text-sm px-3 py-1.5 rounded-xl transition-colors"
        :style="filter === tab.key
          ? 'background:rgba(124,58,237,0.15);color:#A78BFA'
          : 'background:rgba(255,255,255,0.04);color:#64748B'">
        {{ tab.label }}
        <span class="ml-1 text-xs opacity-70">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Q&A list -->
    <div v-if="pending" class="space-y-4">
      <div v-for="i in 4" :key="i" class="h-24 skeleton rounded-2xl" />
    </div>

    <div v-else-if="filtered.length === 0"
      class="py-16 text-center text-sm text-text-subtle">
      No questions found
    </div>

    <div v-else class="space-y-4">
      <div v-for="qa in filtered" :key="qa.id"
        class="rounded-2xl p-5"
        style="background:#0D0D1F;border:1px solid rgba(255,255,255,0.05)">

        <!-- Question -->
        <div class="flex items-start gap-3 mb-3">
          <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs mt-0.5"
            style="background:rgba(255,255,255,0.06);color:#64748B">Q</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-text-strong">{{ qa.question }}</p>
            <p class="text-xs text-text-faint mt-1">{{ fmtDate(qa.created_at) }}</p>
          </div>
          <NuxtLink :to="`/listings/${qa.listing_id}`" target="_blank"
            class="text-xs text-text-subtle hover:text-accent transition-colors shrink-0">
            View listing →
          </NuxtLink>
        </div>

        <!-- Existing answer -->
        <div v-if="qa.answer"
          class="flex items-start gap-3 pl-4 pt-3"
          style="border-left:1px solid rgba(124,58,237,0.2)">
          <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs"
            style="background:rgba(124,58,237,0.12);color:#A78BFA">A</div>
          <p class="text-sm text-text-muted flex-1">{{ qa.answer }}</p>
          <button @click="startEdit(qa)"
            class="text-xs text-text-subtle hover:text-accent transition-colors shrink-0">Edit</button>
        </div>

        <!-- Answer textarea (unanswered or editing) -->
        <div v-else-if="editingId === qa.id || !qa.answer"
          class="pl-4 pt-3"
          :style="editingId === qa.id ? 'border-left:1px solid rgba(124,58,237,0.2)' : ''">
          <textarea v-model="answerDraft" rows="3"
            placeholder="Type your answer..."
            class="w-full px-1 py-2 text-sm bg-transparent text-text outline-none resize-none
                   border-b border-divider focus:border-accent transition-colors
                   placeholder:text-text-faint mb-3" />
          <div class="flex items-center gap-3">
            <button @click="submitAnswer(qa)"
              :disabled="!answerDraft.trim()"
              class="text-xs font-medium px-4 py-2 rounded-xl text-white transition-colors
                     bg-primary hover:bg-primary-hover disabled:opacity-40">
              Publish Answer
            </button>
            <button v-if="editingId === qa.id" @click="cancelEdit"
              class="text-xs text-text-subtle hover:text-text transition-colors">
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Q&A — Oracle Admin' })

const supabase    = useSupabaseClient()
const filter      = ref<'all' | 'unanswered' | 'answered'>('unanswered')
const editingId   = ref<string | null>(null)
const answerDraft = ref('')

const { data: qaItems, pending, refresh } = await useAsyncData('admin-qa', async () => {
  const { data } = await supabase
    .from('qa_items')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
})

const unanswered = computed(() => (qaItems.value ?? []).filter((q: any) => !q.answer))
const answered   = computed(() => (qaItems.value ?? []).filter((q: any) =>  q.answer))

const tabs = computed(() => [
  { key: 'unanswered', label: 'Unanswered', count: unanswered.value.length },
  { key: 'answered',   label: 'Answered',   count: answered.value.length   },
  { key: 'all',        label: 'All',        count: (qaItems.value ?? []).length },
])

const filtered = computed(() => {
  if (filter.value === 'unanswered') return unanswered.value
  if (filter.value === 'answered')   return answered.value
  return qaItems.value ?? []
})

function startEdit(qa: any) {
  editingId.value   = qa.id
  answerDraft.value = qa.answer ?? ''
}
function cancelEdit() {
  editingId.value   = null
  answerDraft.value = ''
}

async function submitAnswer(qa: any) {
  if (!answerDraft.value.trim()) return
  await supabase.from('qa_items').update({ answer: answerDraft.value.trim() }).eq('id', qa.id)
  qa.answer         = answerDraft.value.trim()
  editingId.value   = null
  answerDraft.value = ''
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
