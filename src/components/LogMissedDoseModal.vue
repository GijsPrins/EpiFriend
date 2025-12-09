<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMedicationStore } from '../composables/useMedicationStore'
import GlassModal from './ui/GlassModal.vue'
import GlassButton from './ui/GlassButton.vue'
import GlassInput from './ui/GlassInput.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { activeMedications, logMissedDose, removeMissedDose, isMissed } = useMedicationStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])

// Calculate medications relevant for the selected date
// Note: Ideally, we would need to check start/end dates of medications against the selected date
// but for now, we'll use activeMedications and filter potentially?
// activeMedications() in store filters by endDate.
// A more robust solution would be to get ALL medications and filter by startDate <= selectedDate and (endDate >= selectedDate or endDate is null)
// But useMedicationStore doesn't expose a method for that directly yet, so we'll stick to activeMedications for now
// assuming "Forgot Past Medication" usually implies recent past where meds were active.
const medsForDate = computed(() => {
  const meds = activeMedications()
  const doses = []
  meds.forEach(med => {
    // Check if med was started before or on selected date
    const start = new Date(med.startDate).toISOString().split('T')[0]
    if (start > selectedDate.value) return 

    // Check if med was ended before selected date
    if (med.endDate) {
      const end = new Date(med.endDate).toISOString().split('T')[0]
      if (end < selectedDate.value) return
    }

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


const toggleMedStatus = (med) => {
  if (isMissed(med.id, med.doseIndex, selectedDate.value)) {
    removeMissedDose(med.id, med.doseIndex, selectedDate.value)
  } else {
    logMissedDose(med.id, med.doseIndex, selectedDate.value)
  }
}

const handleClose = () => {
  // Reset date to today on close, or keep it?
  // Let's keep it but perhaps reset when opening?
  // For now just emit close
  emit('close')
}

// Watcher to reset date when modal opens?
watch(() => props.show, (newVal) => {
    if (newVal) {
        // defaulting to yesterday as "forgot" implies past, but users can change it
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        selectedDate.value = yesterday.toISOString().split('T')[0]
    }
})

</script>

<template>
  <GlassModal :show="show" :title="t('medication.log_past_dose')" @close="handleClose">
    <div class="space-y-6">
      <!-- Date Picker -->
      <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('medication.select_date') }}</label>
          <input 
            type="date" 
            v-model="selectedDate"
            :max="new Date().toISOString().split('T')[0]"
            class="glass-input w-full text-white scheme-dark"
          />
      </div>

      <!-- Medication List -->
      <div class="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        <h3 class="text-sm font-semibold text-white mb-2">{{ t('medication.doses_for_date', { date: new Date(selectedDate).toLocaleDateString() }) }}</h3>
        
        <div v-if="medsForDate.length === 0" class="text-gray-400 text-center py-4">
            {{ t('medication.no_meds_added') }}
        </div>
        
        <div v-else class="space-y-3">
            <div v-for="med in medsForDate" :key="med.uniqueId" class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
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
            
             <button 
              @click="toggleMedStatus(med)"
              class="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors"
              :class="isMissed(med.id, med.doseIndex, selectedDate) ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-success/10 text-success hover:bg-success/20'"
            >
               <span class="text-xs font-medium">{{ isMissed(med.id, med.doseIndex, selectedDate) ? t('common.missed') : t('common.taken') }}</span>
            </button> 
          </div>
        </div>

      </div>

      <div class="flex justify-end pt-4">
        <GlassButton @click="handleClose" variant="primary">
          {{ t('common.save') }}
        </GlassButton>
      </div>
    </div>
  </GlassModal>
</template>
