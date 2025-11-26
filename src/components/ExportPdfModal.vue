<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePdfExport } from '../composables/usePdfExport'
import { useToast } from '../composables/useToast'
import GlassModal from './ui/GlassModal.vue'
import GlassButton from './ui/GlassButton.vue'
import GlassCheckbox from './ui/GlassCheckbox.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { generateMedicalPDF } = usePdfExport()
const { showToast } = useToast()

// Export options
const includeEpisodes = ref(true)
const episodeDetailLevel = ref('full') // 'basic' or 'full'
const includeMissedMeds = ref(true)
const includePatientInfo = ref(true)
const dateFrom = ref('')
const dateTo = ref('')

const handleClose = () => {
  emit('close')
}

const handleGenerate = () => {
  try {
    const options = {
      includeEpisodes: includeEpisodes.value,
      includeMissedMeds: includeMissedMeds.value,
      episodeDetailLevel: episodeDetailLevel.value,
      includePatientInfo: includePatientInfo.value,
      dateRange: (dateFrom.value || dateTo.value) ? {
        from: dateFrom.value || null,
        to: dateTo.value || null
      } : null
    }

    const result = generateMedicalPDF(options)
    
    if (result.success) {
      showToast('success', t('pdf.generated_success'))
      emit('close')
      
      // Reset form
      includeEpisodes.value = true
      episodeDetailLevel.value = 'full'
      includeMissedMeds.value = true
      includePatientInfo.value = true
      dateFrom.value = ''
      dateTo.value = ''
    }
  } catch (error) {
    console.error('PDF generation failed:', error)
    showToast('error', t('pdf.generated_error'))
  }
}
</script>

<template>
  <GlassModal :show="show" :title="t('pdf.export_title')" @close="handleClose">
    <div class="space-y-6">
      <!-- Section 1: Data Selection -->
      <div>
        <h4 class="text-sm font-semibold text-white mb-3">{{ t('pdf.data_selection') }}</h4>
        <div class="space-y-3">
          <!-- Include Episodes -->
          <GlassCheckbox v-model="includeEpisodes" :label="t('pdf.include_episodes')" />
          
          <!-- Episode Detail Level -->
          <div v-if="includeEpisodes" class="ml-6 space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                v-model="episodeDetailLevel" 
                value="basic"
                class="w-4 h-4 text-primary bg-white/10 border-white/20 focus:ring-primary"
              />
              <span class="text-sm text-gray-300">{{ t('pdf.episode_detail_basic') }}</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                v-model="episodeDetailLevel" 
                value="full"
                class="w-4 h-4 text-primary bg-white/10 border-white/20 focus:ring-primary"
              />
              <span class="text-sm text-gray-300">{{ t('pdf.episode_detail_full') }}</span>
            </label>
          </div>

          <!-- Include Missed Meds -->
          <GlassCheckbox v-model="includeMissedMeds" :label="t('pdf.include_missed_meds')" />
        </div>
      </div>

      <!-- Section 2: Patient Information -->
      <div class="border-t border-white/10 pt-4">
        <h4 class="text-sm font-semibold text-white mb-3">{{ t('pdf.patient_info') }}</h4>
        <div class="space-y-3">
          <p class="text-xs text-gray-400 italic">{{ t('pdf.patient_name_always') }}</p>
          <GlassCheckbox 
            v-model="includePatientInfo" 
            :label="t('pdf.include_additional_info')" 
          />
        </div>
      </div>

      <!-- Section 3: Date Range -->
      <div class="border-t border-white/10 pt-4">
        <h4 class="text-sm font-semibold text-white mb-3">{{ t('pdf.date_range') }}</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-xs font-medium text-gray-300 ml-1">{{ t('pdf.date_from') }}</label>
            <input 
              type="date" 
              v-model="dateFrom"
              class="glass-input w-full text-white scheme-dark text-sm"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-xs font-medium text-gray-300 ml-1">{{ t('pdf.date_to') }}</label>
            <input 
              type="date" 
              v-model="dateTo"
              class="glass-input w-full text-white scheme-dark text-sm"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
        <GlassButton @click="handleClose" variant="secondary">
          {{ t('common.cancel') }}
        </GlassButton>
        <GlassButton @click="handleGenerate" variant="primary">
          {{ t('common.export_pdf') }}
        </GlassButton>
      </div>
    </div>
  </GlassModal>
</template>
