<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../composables/useSettings'
import { useToast } from '../composables/useToast'
import GlassCard from './ui/GlassCard.vue'
import GlassButton from './ui/GlassButton.vue'
import GlassInput from './ui/GlassInput.vue'
import GlassModal from './ui/GlassModal.vue'
import AccordionSection from './ui/AccordionSection.vue'

const { t, locale } = useI18n()
const { settings, addAllergy, removeAllergy } = useSettings()
const { showToast } = useToast()

const newAllergy = ref('')

const handleAddAllergy = () => {
  if (newAllergy.value.trim()) {
    addAllergy(newAllergy.value.trim())
    newAllergy.value = ''
  }
}

const handleSave = () => {
  showToast('success', t('settings.save_success'))
}

const changeLanguage = (lang) => {
  locale.value = lang
  settings.value.preferences.language = lang
}

// Data Management
const MAX_FILE_SIZE = 1024 * 1024 // 1MB
const fileInput = ref(null)
const showImportModal = ref(false)

const handleExport = () => {
  const data = {
    episodes: JSON.parse(localStorage.getItem('epifriend_episodes') || '[]'),
    medications: JSON.parse(localStorage.getItem('epifriend_medications') || '[]'),
    settings: JSON.parse(localStorage.getItem('epifriend_settings') || '{}'),
    version: 1,
    timestamp: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `epifriend_backup_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleImport = () => {
  if (!fileInput.value) {
    showToast('error', 'File input not found')
    return
  }
  showImportModal.value = true
}

const confirmImport = () => {
  showImportModal.value = false
  // Use setTimeout to ensure the modal close animation doesn't interfere with file picker
  // although usually not strictly necessary, it can help with focus management
  setTimeout(() => {
    fileInput.value.click()
  }, 100)
}

const validateBackup = (data) => {
  // Check required root properties
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.episodes)) return false
  if (!Array.isArray(data.medications)) return false
  if (!data.settings || typeof data.settings !== 'object') return false
  
  // Optional: Check version if strict versioning is needed
  // if (typeof data.version !== 'number') return false

  return true
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Security: Check file size
  if (file.size > MAX_FILE_SIZE) {
    showToast('error', t('settings.import_error_size'))
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      // Security: Validate schema
      if (!validateBackup(data)) {
        throw new Error('Invalid backup schema')
      }

      localStorage.setItem('epifriend_episodes', JSON.stringify(data.episodes))
      localStorage.setItem('epifriend_medications', JSON.stringify(data.medications))
      localStorage.setItem('epifriend_settings', JSON.stringify(data.settings))

      showToast('success', t('settings.import_success'))
      
      // Reload to apply changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Import failed:', error)
      showToast('error', t('settings.import_error'))
    }
  }
  reader.readAsText(file)
  // Reset input
  event.target.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold text-white">{{ t('settings.title') }}</h2>

    <!-- Personal Information -->
    <AccordionSection :title="t('settings.personal_info')" icon="👤" :defaultOpen="true">
      <div class="space-y-4">
        <GlassInput 
          v-model="settings.profile.name" 
          :label="t('settings.name')" 
          :placeholder="t('settings.name')"
        />
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('settings.date_of_birth') }}</label>
          <input 
            type="date" 
            v-model="settings.profile.dateOfBirth"
            class="glass-input w-full text-white scheme-dark"
          />
        </div>
      </div>
    </AccordionSection>

    <!-- Emergency Contacts -->
    <AccordionSection :title="t('settings.emergency_contacts')" icon="🚨">
      <div class="space-y-4">
        <GlassInput 
          v-model="settings.emergency.contactName" 
          :label="t('settings.emergency_contact_name')" 
          :placeholder="t('settings.emergency_contact_name')"
        />
        <GlassInput 
          v-model="settings.emergency.contactPhone" 
          :label="t('settings.emergency_contact_phone')" 
          type="tel"
          placeholder="+31 6 12345678"
        />
        <GlassInput 
          v-model="settings.emergency.contactRelation" 
          :label="t('settings.emergency_contact_relation')" 
          :placeholder="t('settings.emergency_contact_relation')"
        />
        
        <div class="border-t border-white/10 pt-4 mt-4">
          <GlassInput 
            v-model="settings.emergency.doctorName" 
            :label="t('settings.doctor_name')" 
            :placeholder="t('settings.doctor_name')"
          />
          <GlassInput 
            v-model="settings.emergency.doctorPhone" 
            :label="t('settings.doctor_phone')" 
            type="tel"
            placeholder="+31 20 1234567"
            class="mt-4"
          />
        </div>

        <div class="border-t border-white/10 pt-4 mt-4">
          <GlassInput 
            v-model="settings.emergency.neurologistName" 
            :label="t('settings.neurologist_name')" 
            :placeholder="t('settings.neurologist_name')"
          />
          <GlassInput 
            v-model="settings.emergency.neurologistPhone" 
            :label="t('settings.neurologist_phone')" 
            type="tel"
            placeholder="+31 20 1234567"
            class="mt-4"
          />
        </div>
      </div>
    </AccordionSection>

    <!-- Medical Information -->
    <AccordionSection :title="t('settings.medical_info')" icon="⚕️">
      <div class="space-y-4">
        <!-- Allergies -->
        <div>
          <label class="text-sm font-medium text-gray-300 ml-1 block mb-2">{{ t('settings.allergies') }}</label>
          
          <!-- Allergy List -->
          <div v-if="settings.medical.allergies.length > 0" class="space-y-2 mb-3">
            <div 
              v-for="(allergy, index) in settings.medical.allergies" 
              :key="index"
              class="flex items-center justify-between p-2 bg-white/5 rounded-lg"
            >
              <span class="text-white">{{ allergy }}</span>
              <button 
                @click="removeAllergy(index)"
                class="text-error hover:text-error/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Add Allergy -->
          <div class="flex flex-col sm:flex-row gap-2">
            <input 
              v-model="newAllergy"
              @keyup.enter="handleAddAllergy"
              type="text"
              :placeholder="t('settings.add_allergy')"
              class="glass-input flex-1 text-white"
            />
            <GlassButton @click="handleAddAllergy" variant="primary" class="w-full sm:w-auto">
              {{ t('common.add') }}
            </GlassButton>
          </div>
        </div>

        <!-- Medical Notes -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('settings.medical_notes') }}</label>
          <textarea 
            v-model="settings.medical.notes"
            rows="4"
            class="glass-input w-full resize-none text-white"
            :placeholder="t('settings.medical_notes')"
          ></textarea>
        </div>
      </div>
    </AccordionSection>

    <!-- Preferences -->
    <AccordionSection :title="t('settings.preferences')" icon="⚙️">
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('settings.language') }}</label>
          <div class="flex gap-4">
            <button
              @click="changeLanguage('nl')"
              class="flex-1 px-4 py-2 rounded-lg border transition-all"
              :class="locale === 'nl' 
                ? 'bg-primary/20 border-primary text-white' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'"
            >
              Nederlands
            </button>
            <button
              @click="changeLanguage('en')"
              class="flex-1 px-4 py-2 rounded-lg border transition-all"
              :class="locale === 'en' 
                ? 'bg-primary/20 border-primary text-white' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'"
            >
              English
            </button>
          </div>
        </div>
      </div>
    </AccordionSection>

    <!-- Data Management -->
    <AccordionSection :title="t('settings.data_management')" icon="💾">
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Export -->
          <div class="flex-1 flex flex-col">
            <p class="text-sm text-gray-400 mb-2">{{ t('settings.export_desc') }}</p>
            <GlassButton @click="handleExport" variant="secondary" class="w-full flex items-center justify-center gap-2 mt-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {{ t('settings.export_data') }}
            </GlassButton>
          </div>

          <!-- Import -->
          <div class="flex-1 flex flex-col">
            <p class="text-sm text-gray-400 mb-2">{{ t('settings.import_desc') }}</p>
            <GlassButton @click="handleImport" variant="secondary" class="w-full flex items-center justify-center gap-2 mt-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {{ t('settings.import_data') }}
            </GlassButton>
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept=".json" 
              @change="onFileSelected"
            />
          </div>
        </div>
      </div>
    </AccordionSection>

    <!-- Save Button -->
    <div class="flex justify-end sticky bottom-20 z-10">
      <GlassButton @click="handleSave" variant="success" class="w-full sm:w-auto shadow-lg shadow-black/50">
        {{ t('common.save') }}
      </GlassButton>
    </div>

    <!-- Import Confirmation Modal -->
    <GlassModal 
      :show="showImportModal" 
      :title="t('settings.import_data')" 
      @close="showImportModal = false"
    >
      <div class="space-y-6">
        <div class="flex items-start gap-4 p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div class="p-2 bg-warning/20 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-1">{{ t('common.warning') }}</h4>
            <p class="text-sm text-gray-300">{{ t('settings.confirm_import') }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <GlassButton @click="showImportModal = false" variant="secondary">
            {{ t('common.cancel') }}
          </GlassButton>
          <GlassButton @click="confirmImport" variant="primary">
            {{ t('settings.import_data') }}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
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
