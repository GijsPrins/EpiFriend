<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../composables/useSettings'
import GlassCard from './ui/GlassCard.vue'
import GlassButton from './ui/GlassButton.vue'
import GlassInput from './ui/GlassInput.vue'

const { t } = useI18n()
const { settings, updateProfile, updateEmergency, updateMedical, addAllergy, removeAllergy } = useSettings()

const newAllergy = ref('')
const showSuccess = ref(false)

const handleAddAllergy = () => {
  if (newAllergy.value.trim()) {
    addAllergy(newAllergy.value.trim())
    newAllergy.value = ''
  }
}

const handleSave = () => {
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-white">{{ t('settings.title') }}</h2>
      <div v-if="showSuccess" class="text-success text-sm animate-fade-in">
        ✓ {{ t('settings.save_success') }}
      </div>
    </div>

    <!-- Personal Information -->
    <GlassCard>
      <h3 class="text-lg font-semibold text-white mb-4">{{ t('settings.personal_info') }}</h3>
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
    </GlassCard>

    <!-- Emergency Contacts -->
    <GlassCard>
      <h3 class="text-lg font-semibold text-white mb-4">{{ t('settings.emergency_contacts') }}</h3>
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
    </GlassCard>

    <!-- Medical Information -->
    <GlassCard>
      <h3 class="text-lg font-semibold text-white mb-4">{{ t('settings.medical_info') }}</h3>
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
    </GlassCard>

    <!-- Save Button -->
    <div class="flex justify-end">
      <GlassButton @click="handleSave" variant="success" class="w-full sm:w-auto">
        {{ t('common.save') }}
      </GlassButton>
    </div>
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
