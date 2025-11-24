<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMedicationStore } from '../composables/useMedicationStore'
import { useMedicineDatabase } from '../composables/useMedicineDatabase'
import GlassCard from './ui/GlassCard.vue'
import GlassButton from './ui/GlassButton.vue'
import GlassInput from './ui/GlassInput.vue'

const { t } = useI18n()
const { activeMedications, addMedication, updateMedication, stopMedication } = useMedicationStore()
const { searchMedicines } = useMedicineDatabase()

const showAddForm = ref(false)
const searchQuery = ref('')
const selectedMed = ref(null)
const dosage = ref('')
const frequency = ref('1') // Times per day

const searchResults = computed(() => searchMedicines(searchQuery.value))

const isEditing = ref(false)
const editingId = ref(null)

const selectMed = (med) => {
  selectedMed.value = med
  searchQuery.value = med.name
}

const editMedication = (med) => {
  isEditing.value = true
  editingId.value = med.id
  searchQuery.value = med.name
  dosage.value = med.dosage
  frequency.value = med.frequency.toString()
  selectedMed.value = { name: med.name, id: 'existing' } // Mock object to satisfy validation
  showAddForm.value = true
}

const saveMedication = () => {
  if (!selectedMed.value || !dosage.value) return

  const freq = parseInt(frequency.value)
  if (freq < 1 || freq > 10 || isNaN(freq)) {
    alert(t('medication.invalid_frequency'))
    return
  }

  const medData = {
    name: searchQuery.value, // Use query in case they typed a custom name
    dosage: dosage.value,
    frequency: freq,
    times: []
  }

  if (isEditing.value && editingId.value) {
    updateMedication(editingId.value, medData)
  } else {
    addMedication(medData)
  }

  // Reset form
  showAddForm.value = false
  searchQuery.value = ''
  selectedMed.value = null
  dosage.value = ''
  frequency.value = '1'
  isEditing.value = false
  editingId.value = null
}

const activeMeds = computed(() => activeMedications())
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-white">{{ t('common.medication') }}</h2>
      <GlassButton @click="showAddForm = !showAddForm; isEditing = false; searchQuery = ''; dosage = ''; selectedMed = null;" variant="primary">
        {{ showAddForm ? t('common.cancel') : '+ ' + t('common.add') }}
      </GlassButton>
    </div>

    <!-- Add/Edit Medication Form -->
    <GlassCard v-if="showAddForm" class="space-y-4 animate-fade-in">
      <h3 class="text-xl font-semibold mb-4">{{ isEditing ? t('medication.edit_title') : t('medication.add_title') }}</h3>
      
      <div class="relative">
        <GlassInput 
          v-model="searchQuery" 
          :label="t('common.search')" 
          :placeholder="t('medication.search_placeholder')" 
        />
        <!-- Autocomplete Dropdown -->
        <div v-if="searchQuery && !selectedMed && searchResults.length > 0" 
             class="absolute z-10 w-full mt-1 bg-surface border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          <div 
            v-for="med in searchResults" 
            :key="med.id"
            @click="selectMed(med)"
            class="p-3 hover:bg-white/10 cursor-pointer transition-colors"
          >
            {{ med.name }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <GlassInput v-model="dosage" :label="t('medication.dosage_label')" :placeholder="t('medication.dosage_placeholder')" />
        <GlassInput v-model="frequency" type="number" :label="t('medication.frequency_label')" :placeholder="t('medication.frequency_placeholder')" />
      </div>

      <div class="flex justify-end pt-4">
        <GlassButton @click="saveMedication" variant="success">
          {{ t('common.save') }}
        </GlassButton>
      </div>
    </GlassCard>

    <!-- Medication List -->
    <div class="grid gap-4">
      <GlassCard v-for="med in activeMeds" :key="med.id" class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-white">{{ med.name }}</h3>
          <p class="text-gray-400">{{ med.dosage }} • {{ med.frequency }}x daily</p>
          <p class="text-xs text-gray-500 mt-1">{{ t('common.started') }}: {{ new Date(med.startDate).toLocaleDateString() }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="editMedication(med)" class="p-2 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button @click="stopMedication(med.id)" class="p-2 text-gray-400 hover:text-error transition-colors" title="Stop taking">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </GlassCard>
      
      <div v-if="activeMeds.length === 0 && !showAddForm" class="text-center py-10 text-gray-400">
        {{ t('medication.no_meds_added') }}
      </div>
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
