<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEpisodeStore } from '../composables/useEpisodeStore'
import { useMedicationStore } from '../composables/useMedicationStore'
import GlassCard from './ui/GlassCard.vue'
import GlassButton from './ui/GlassButton.vue'
import ExportPdfModal from './ExportPdfModal.vue'

const { t, locale } = useI18n()
const { episodes } = useEpisodeStore()
const { hasAnyMissedDose, medications, medicationLogs, activeMedications } = useMedicationStore()

// Selected day state
const selectedDay = ref(null)
const selectedDate = ref(null)
const showExportModal = ref(false)

// Calendar Logic
const currentDate = ref(new Date())

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleString(locale.value, { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const day = new Date(year, month, 1).getDay() // 0 = Sunday
  // Convert to Monday start (0 = Monday, ..., 6 = Sunday)
  return (day + 6) % 7
})

const calendarDays = computed(() => {
  const days = []
  // Padding for empty start days
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null)
  }
  // Days of month
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i)
  }
  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// Data Helpers
const getEventsForDay = (day) => {
  if (!day) return { hasEpisode: false, hasMissedMed: false }
  
  const year = currentDate.value.getFullYear()
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  const dateStr = `${year}-${month}-${dayStr}`

  // Check Episodes
  // Episode timestamp is ISO string (e.g. 2023-11-24T...)
  const hasEpisode = episodes.value.some(ep => ep.timestamp.startsWith(dateStr))

  // Check Missed Meds
  const hasMissedMed = medications.value.some(med => hasAnyMissedDose(med.id, dateStr))

  return { hasEpisode, hasMissedMed }
}

const getDateString = (day) => {
  const year = currentDate.value.getFullYear()
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${year}-${month}-${dayStr}`
}

const handleDayClick = (day) => {
  if (!day) return
  selectedDay.value = day
  selectedDate.value = getDateString(day)
}

const closeDetail = () => {
  selectedDay.value = null
  selectedDate.value = null
}

const selectedDayEpisodes = computed(() => {
  if (!selectedDate.value) return []
  return episodes.value.filter(ep => ep.timestamp.startsWith(selectedDate.value))
})

const selectedDayMissedMeds = computed(() => {
  if (!selectedDate.value) return []
  
  // Get all missed medication logs for this date
  const missedLogsForDate = medicationLogs.value.filter(
    log => log.date === selectedDate.value && log.status === 'missed'
  )
  
  // Map logs to medication details
  const missedMeds = []
  missedLogsForDate.forEach(log => {
    const med = medications.value.find(m => m.id === log.medId)
    if (med) {
      missedMeds.push({
        ...med,
        doseIndex: log.doseIndex,
        doseLabel: med.frequency > 1 ? `${log.doseIndex + 1}/${med.frequency}` : null
      })
    }
  })
  
  return missedMeds
})

const weekDays = computed(() => [
  t('calendar.weekdays.mo'),
  t('calendar.weekdays.tu'),
  t('calendar.weekdays.we'),
  t('calendar.weekdays.th'),
  t('calendar.weekdays.fr'),
  t('calendar.weekdays.sa'),
  t('calendar.weekdays.su')
])
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold text-white">{{ t('common.calendar') }}</h2>

    <GlassCard class="p-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <button @click="prevMonth" class="p-2 text-gray-400 hover:text-white">
          &lt;
        </button>
        <h3 class="text-lg font-semibold text-white capitalize">{{ currentMonthYear }}</h3>
        <button @click="nextMonth" class="p-2 text-gray-400 hover:text-white">
          &gt;
        </button>
        <GlassButton @click="showExportModal = true" variant="secondary" class="flex items-center gap-2 ml-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {{ t('common.export_pdf') }}
        </GlassButton>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-7 gap-2 text-center mb-2">
        <div v-for="day in weekDays" :key="day" class="text-xs text-gray-500 font-medium">
          {{ day }}
        </div>
      </div>
      
      <div class="grid grid-cols-7 gap-2">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          @click="handleDayClick(day)"
          class="aspect-square flex flex-col items-center justify-center rounded-lg relative cursor-pointer"
          :class="day ? 'bg-white/5 hover:bg-white/10 transition-colors' : ''"
        >
          <span v-if="day" class="text-sm text-white">{{ day }}</span>
          
          <!-- Indicators -->
          <div v-if="day" class="flex gap-1 mt-1">
            <div v-if="getEventsForDay(day).hasEpisode" class="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            <div v-if="getEventsForDay(day).hasMissedMed" class="w-1.5 h-1.5 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 justify-center mt-6 text-xs text-gray-400">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-error"></div>
          <span>{{ t('calendar.legend_episode') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-warning"></div>
          <span>{{ t('calendar.legend_missed_med') }}</span>
        </div>
      </div>
    </GlassCard>

    <!-- Day Detail Panel -->
    <GlassCard v-if="selectedDay" class="p-4 animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white">
          {{ t('calendar.day_details') }}: {{ selectedDay }} {{ currentMonthYear }}
        </h3>
        <button @click="closeDetail" class="text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Episodes -->
      <div v-if="selectedDayEpisodes.length > 0" class="mb-4">
        <h4 class="text-sm font-medium text-gray-300 mb-2">{{ t('calendar.episodes') }}</h4>
        <div class="space-y-2">
          <div 
            v-for="ep in selectedDayEpisodes" 
            :key="ep.id"
            class="p-3 bg-white/5 rounded-lg border-l-2 border-error"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white font-medium">{{ t(`common.episode_types.${ep.type || 'general'}`) }}</p>
                <p class="text-xs text-gray-400">{{ new Date(ep.timestamp).toLocaleTimeString() }}</p>
              </div>
              <div v-if="ep.duration" class="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                {{ ep.duration }}
              </div>
            </div>
            <p v-if="ep.notes" class="text-sm text-gray-300 mt-2">{{ ep.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Missed Medications -->
      <div v-if="selectedDayMissedMeds.length > 0" class="mb-4">
        <h4 class="text-sm font-medium text-gray-300 mb-2">{{ t('calendar.missed_medications') }}</h4>
        <div class="space-y-2">
          <div 
            v-for="med in selectedDayMissedMeds" 
            :key="`${med.id}-${med.doseIndex}`"
            class="p-3 bg-white/5 rounded-lg border-l-2 border-warning"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white font-medium">
                  {{ med.name }}
                  <span v-if="med.doseLabel" class="text-xs text-gray-400 ml-1">({{ med.doseLabel }})</span>
                </p>
                <p class="text-xs text-gray-400">{{ med.dosage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="selectedDayEpisodes.length === 0 && selectedDayMissedMeds.length === 0" class="text-center py-8 text-gray-400">
        {{ t('calendar.no_events') }}
      </div>
    </GlassCard>

    <ExportPdfModal 
      :show="showExportModal" 
      @close="showExportModal = false"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
