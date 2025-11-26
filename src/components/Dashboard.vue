<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMedicationStore } from '../composables/useMedicationStore'
import { useEpisodeStore } from '../composables/useEpisodeStore'
import { useSettings } from '../composables/useSettings'
import GlassCard from './ui/GlassCard.vue'
import GlassButton from './ui/GlassButton.vue'
import LogEpisodeModal from './LogEpisodeModal.vue'
import ExportPdfModal from './ExportPdfModal.vue'

const { t } = useI18n()
const { activeMedications, logMissedDose, removeMissedDose, isMissed } = useMedicationStore()
const { addEpisode, updateEpisode, getRecentEpisodes } = useEpisodeStore()
const { settings } = useSettings()

const activeMeds = computed(() => {
  const meds = activeMedications()
  const doses = []
  meds.forEach(med => {
    for (let i = 0; i < med.frequency; i++) {
      doses.push({
        ...med,
        doseIndex: i,
        uniqueId: `${med.id}-${i}`
      })
    }
  })
  return doses
})
const recentEpisodes = computed(() => getRecentEpisodes())

const showLogModal = ref(false)
const selectedEpisode = ref(null)
const showExportModal = ref(false)

const handleSaveEpisode = (episodeData) => {
  if (episodeData.id) {
    updateEpisode(episodeData.id, episodeData)
  } else {
    addEpisode(episodeData)
  }
  showLogModal.value = false
  selectedEpisode.value = null
}

const openLogModal = (episode = null) => {
  selectedEpisode.value = episode
  showLogModal.value = true
}

const getEpisodeColor = (type) => {
  const colors = {
    'general': 'bg-gray-500',
    'tonic_clonic': 'bg-error',
    'absence': 'bg-purple-500',
    'focal': 'bg-blue-500',
    'myoclonic': 'bg-yellow-500',
    'atonic': 'bg-pink-500'
  }
  return colors[type] || 'bg-gray-500'
}

const toggleMedStatus = (med) => {
  if (isMissed(med.id, med.doseIndex)) {
    removeMissedDose(med.id, med.doseIndex)
  } else {
    logMissedDose(med.id, med.doseIndex)
  }
}

const today = new Date().toLocaleDateString()
</script>

<template>
  <div class="space-y-6">
    <!-- Greeting -->
    <header class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold text-white">{{ t('dashboard.greeting') }}, {{ settings.profile.name || 'Friend' }}</h2>
        <p class="text-gray-400">{{ today }}</p>
      </div>
      <div class="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-primary/30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-gray-300">
          <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
        </svg>
      </div>
    </header>

    <!-- Quick Actions -->
    <section>
      <button 
        @click="openLogModal()"
        class="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-secondary backdrop-blur-md shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
      >
        <div class="p-2 bg-white/20 rounded-full group-hover:animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span class="text-xl font-bold text-white">{{ t('common.log_episode') }}</span>
      </button>
    </section>

    <!-- Medication Status -->
    <section>
      <h3 class="text-lg font-semibold text-white mb-3">{{ t('dashboard.medication_status') }}</h3>
      <GlassCard>
        <div v-if="activeMeds.length === 0" class="text-gray-400 text-center py-4">
          {{ t('dashboard.no_meds_configured') }}
        </div>
        <div v-else class="space-y-4">
          <div v-for="med in activeMeds" :key="med.uniqueId" class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-white">
                  {{ med.name }} 
                  <span v-if="med.frequency > 1" class="text-xs text-gray-400 ml-1">({{ med.doseIndex + 1 }}/{{ med.frequency }})</span>
                </p>
                <p class="text-xs text-gray-400">{{ med.dosage }}</p>
              </div>
            </div>
            <!-- Optimistic UI: Default is taken, so we show a checkmark. 
                 User would click to mark as MISSED (exception logging). -->
            <button 
              @click="toggleMedStatus(med)"
              class="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors"
              :class="isMissed(med.id, med.doseIndex) ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-success/10 text-success hover:bg-success/20'"
            >
               <span class="text-xs font-medium">{{ isMissed(med.id, med.doseIndex) ? t('common.missed') : t('common.taken') }}</span>
            </button>
          </div>
        </div>
      </GlassCard>
    </section>

    <!-- Recent Activity -->
    <section>
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-white">{{ t('dashboard.recent_activity') }}</h3>
        <GlassButton @click="showExportModal = true" variant="secondary" class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {{ t('common.export_pdf') }}
        </GlassButton>
      </div>
      <div class="space-y-3">
        <div 
          v-for="ep in recentEpisodes" 
          :key="ep.id" 
          @click="openLogModal(ep)"
          class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div class="h-2 w-2 rounded-full" :class="getEpisodeColor(ep.type || 'general')"></div>
          <div class="flex-1">
            <p class="text-white font-medium">{{ t(`common.episode_types.${(ep.type || 'general').toLowerCase()}`) }}</p>
            <p class="text-xs text-gray-400">{{ new Date(ep.timestamp).toLocaleString() }}</p>
          </div>
          <div v-if="ep.duration" class="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
            {{ ep.duration }}
          </div>
        </div>
        <div v-if="recentEpisodes.length === 0" class="text-gray-500 text-center py-4">
          {{ t('dashboard.no_activity') }}
        </div>
      </div>
    </section>

    <LogEpisodeModal 
      :show="showLogModal" 
      :episode="selectedEpisode"
      @close="showLogModal = false"
      @save="handleSaveEpisode"
    />

    <ExportPdfModal 
      :show="showExportModal" 
      @close="showExportModal = false"
    />
  </div>
</template>
