<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import GlassModal from './ui/GlassModal.vue'
import GlassButton from './ui/GlassButton.vue'
import GlassInput from './ui/GlassInput.vue'
import GlassCheckbox from './ui/GlassCheckbox.vue'
import AccordionSection from './ui/AccordionSection.vue'
import SeverityScale from './ui/SeverityScale.vue'

const props = defineProps({
  show: Boolean,
  episode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])
const { t } = useI18n()

// Basic info
const type = ref('general')
const duration = ref('')
const notes = ref('')
const timestamp = ref(new Date().toISOString().slice(0, 16))
const severity = ref(0)

// Emergency response
const witnessed = ref(false)
const emergencyCalled = ref(false)
const wentToHospital = ref(false)
const medicationGiven = ref('')

// Warning signs (aura)
const warningSigns = ref([])
const warningSignsOther = ref('')
const warningSignOptions = [
  'unusual_smell_taste',
  'deja_vu',
  'vision_changes',
  'nausea',
  'dizziness',
  'anxiety'
]

// During episode
const duringSymptoms = ref([])
const duringSymptomsOther = ref('')
const duringSymptomOptions = [
  'confusion',
  'loss_consciousness',
  'convulsions',
  'muscle_stiffness',
  'falling',
  'loss_bladder_control',
  'tongue_biting'
]

// After episode
const afterSymptoms = ref([])
const afterSymptomsOther = ref('')
const afterSymptomOptions = [
  'extreme_fatigue',
  'headache',
  'muscle_soreness',
  'memory_loss',
  'difficulty_speaking',
  'sleepiness'
]

// Injuries
const injuries = ref([])
const injuriesOther = ref('')
const injuryOptions = [
  'bruising',
  'cuts_scrapes',
  'broken_teeth',
  'head_injury',
  'muscle_strain',
  'burns'
]

// Triggers
const triggers = ref([])
const triggersOther = ref('')
const triggerOptions = [
  'missed_medication',
  'lack_sleep',
  'stress',
  'flashing_lights',
  'alcohol',
  'illness',
  'menstruation'
]

const save = () => {
  const episodeDate = new Date(timestamp.value)
  const now = new Date()
  
  if (episodeDate > now) {
    alert(t('common.future_date_error'))
    return
  }
  
  emit('save', {
    id: props.episode?.id,
    type: type.value,
    duration: duration.value,
    notes: notes.value,
    timestamp: episodeDate.toISOString(),
    severity: severity.value,
    witnessed: witnessed.value,
    emergencyCalled: emergencyCalled.value,
    wentToHospital: wentToHospital.value,
    medicationGiven: medicationGiven.value,
    warningSigns: warningSigns.value,
    warningSignsOther: warningSignsOther.value,
    duringSymptoms: duringSymptoms.value,
    duringSymptomsOther: duringSymptomsOther.value,
    afterSymptoms: afterSymptoms.value,
    afterSymptomsOther: afterSymptomsOther.value,
    injuries: injuries.value,
    injuriesOther: injuriesOther.value,
    triggers: triggers.value,
    triggersOther: triggersOther.value
  })
  reset()
}

const reset = () => {
  type.value = 'general'
  duration.value = ''
  notes.value = ''
  timestamp.value = new Date().toISOString().slice(0, 16)
  severity.value = 0
  witnessed.value = false
  emergencyCalled.value = false
  wentToHospital.value = false
  medicationGiven.value = ''
  warningSigns.value = []
  warningSignsOther.value = ''
  duringSymptoms.value = []
  duringSymptomsOther.value = ''
  afterSymptoms.value = []
  afterSymptomsOther.value = ''
  injuries.value = []
  injuriesOther.value = ''
  triggers.value = []
  triggersOther.value = ''
}

watch(() => props.episode, (newEp) => {
  if (newEp) {
    type.value = newEp.type || 'general'
    duration.value = newEp.duration || ''
    notes.value = newEp.notes || ''
    timestamp.value = new Date(newEp.timestamp).toISOString().slice(0, 16)
    severity.value = newEp.severity || 0
    witnessed.value = newEp.witnessed || false
    emergencyCalled.value = newEp.emergencyCalled || false
    wentToHospital.value = newEp.wentToHospital || false
    medicationGiven.value = newEp.medicationGiven || ''
    warningSigns.value = newEp.warningSigns || []
    warningSignsOther.value = newEp.warningSignsOther || ''
    duringSymptoms.value = newEp.duringSymptoms || []
    duringSymptomsOther.value = newEp.duringSymptomsOther || ''
    afterSymptoms.value = newEp.afterSymptoms || []
    afterSymptomsOther.value = newEp.afterSymptomsOther || ''
    injuries.value = newEp.injuries || []
    injuriesOther.value = newEp.injuriesOther || ''
    triggers.value = newEp.triggers || []
    triggersOther.value = newEp.triggersOther || ''
  } else {
    reset()
  }
})

const episodeTypes = ['general', 'tonic_clonic', 'absence', 'focal', 'myoclonic', 'atonic']

const toggleArrayItem = (array, item) => {
  const index = array.indexOf(item)
  if (index > -1) {
    array.splice(index, 1)
  } else {
    array.push(item)
  }
}
</script>

<template>
  <GlassModal :show="show" :title="t('common.log_episode')" @close="$emit('close')">
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <!-- Basic Information -->
      <div class="glass-panel p-6 space-y-4">
        <h3 class="text-sm font-semibold text-white uppercase tracking-wide">{{ t('common.basic_info') }}</h3>
        
        <!-- Date/Time -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('common.date_time') }}</label>
          <input 
            type="datetime-local" 
            v-model="timestamp"
            class="glass-input w-full text-white scheme-dark"
          />
        </div>

        <!-- Type -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('common.type') }}</label>
          <select v-model="type" class="glass-input w-full appearance-none">
            <option v-for="et in episodeTypes" :key="et" :value="et" class="bg-surface text-white">
              {{ t(`common.episode_types.${et}`) }}
            </option>
          </select>
        </div>

        <!-- Duration -->
        <GlassInput 
          v-model="duration" 
          :label="t('common.duration')" 
          :placeholder="t('common.placeholder_duration')" 
        />

        <!-- Severity -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300 ml-1">{{ t('common.severity') }}</label>
          <SeverityScale v-model="severity" />
        </div>
      </div>

      <!-- Emergency Response -->
      <AccordionSection :title="t('common.emergency_response')" icon="🚨">
        <div class="space-y-3">
          <GlassCheckbox 
            v-model="witnessed" 
            :label="t('common.someone_witnessed')"
          />
          <GlassCheckbox 
            v-model="emergencyCalled" 
            :label="t('common.emergency_called')"
          />
          <GlassCheckbox 
            v-model="wentToHospital" 
            :label="t('common.went_to_hospital')"
          />
          <div class="pt-2">
            <GlassInput 
              v-model="medicationGiven" 
              :label="t('common.medication_given')" 
              :placeholder="t('common.placeholder_medication')" 
            />
          </div>
        </div>
      </AccordionSection>

      <!-- Warning Signs (Aura) -->
      <AccordionSection :title="t('common.warning_signs')" icon="⚠️">
        <div class="space-y-3">
          <GlassCheckbox
            v-for="option in warningSignOptions"
            :key="option"
            :modelValue="warningSigns.includes(option)"
            @update:modelValue="toggleArrayItem(warningSigns, option)"
            :label="t(`common.${option}`)"
          />
          <div class="pt-2">
            <GlassInput 
              v-model="warningSignsOther" 
              :label="t('common.other')" 
              :placeholder="t('common.placeholder_other_warning')" 
            />
          </div>
        </div>
      </AccordionSection>

      <!-- During Episode -->
      <AccordionSection :title="t('common.during_episode')" icon="⚡">
        <div class="space-y-3">
          <GlassCheckbox
            v-for="option in duringSymptomOptions"
            :key="option"
            :modelValue="duringSymptoms.includes(option)"
            @update:modelValue="toggleArrayItem(duringSymptoms, option)"
            :label="t(`common.${option}`)"
          />
          <div class="pt-2">
            <GlassInput 
              v-model="duringSymptomsOther" 
              :label="t('common.other')" 
              :placeholder="t('common.placeholder_other_symptoms')" 
            />
          </div>
        </div>
      </AccordionSection>

      <!-- After Episode - Symptoms -->
      <AccordionSection :title="t('common.after_symptoms')" icon="😴">
        <div class="space-y-3">
          <GlassCheckbox
            v-for="option in afterSymptomOptions"
            :key="option"
            :modelValue="afterSymptoms.includes(option)"
            @update:modelValue="toggleArrayItem(afterSymptoms, option)"
            :label="t(`common.${option}`)"
          />
          <div class="pt-2">
            <GlassInput 
              v-model="afterSymptomsOther" 
              :label="t('common.other')" 
              :placeholder="t('common.placeholder_other_after')" 
            />
          </div>
        </div>
      </AccordionSection>

      <!-- Injuries/Physical Effects -->
      <AccordionSection :title="t('common.injuries')" icon="🩹">
        <div class="space-y-3">
          <GlassCheckbox
            v-for="option in injuryOptions"
            :key="option"
            :modelValue="injuries.includes(option)"
            @update:modelValue="toggleArrayItem(injuries, option)"
            :label="t(`common.${option}`)"
          />
          <div class="pt-2">
            <GlassInput 
              v-model="injuriesOther" 
              :label="t('common.other')" 
              :placeholder="t('common.placeholder_other_injuries')" 
            />
          </div>
        </div>
      </AccordionSection>

      <!-- Possible Triggers -->
      <AccordionSection :title="t('common.triggers')" icon="🔍">
        <div class="space-y-3">
          <GlassCheckbox
            v-for="option in triggerOptions"
            :key="option"
            :modelValue="triggers.includes(option)"
            @update:modelValue="toggleArrayItem(triggers, option)"
            :label="t(`common.${option}`)"
          />
          <div class="pt-2">
            <GlassInput 
              v-model="triggersOther" 
              :label="t('common.other')" 
              :placeholder="t('common.placeholder_other_triggers')" 
            />
          </div>
        </div>
      </AccordionSection>

      <!-- Additional Notes -->
      <AccordionSection :title="t('common.notes')" icon="📝">
        <div class="flex flex-col gap-2">
          <textarea 
            v-model="notes" 
            rows="4"
            class="glass-input w-full resize-none"
            :placeholder="t('common.placeholder_notes')"
          ></textarea>
        </div>
      </AccordionSection>

      <!-- Action Buttons -->
      <div class="flex justify-end pt-4 gap-2 sticky bottom-0 bg-surface/80 backdrop-blur-md py-4 -mx-2 px-2">
        <GlassButton @click="$emit('close')" variant="secondary" class="!bg-white/10 hover:!bg-white/20">
          {{ t('common.cancel') }}
        </GlassButton>
        <GlassButton @click="save" variant="primary">
          {{ t('common.save') }}
        </GlassButton>
      </div>
    </div>
  </GlassModal>
</template>
