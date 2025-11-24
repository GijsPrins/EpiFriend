<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import GlassModal from './ui/GlassModal.vue'
import GlassButton from './ui/GlassButton.vue'
import GlassInput from './ui/GlassInput.vue'

const props = defineProps({
  show: Boolean,
  episode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])
const { t } = useI18n()

const type = ref('general')
const duration = ref('')
const notes = ref('')
const timestamp = ref(new Date().toISOString().slice(0, 16)) // YYYY-MM-DDTHH:mm

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
    timestamp: episodeDate.toISOString()
  })
  reset()
}

const reset = () => {
  type.value = 'general'
  duration.value = ''
  notes.value = ''
  timestamp.value = new Date().toISOString().slice(0, 16)
}

watch(() => props.episode, (newEp) => {
  if (newEp) {
    type.value = newEp.type || 'general'
    duration.value = newEp.duration || ''
    notes.value = newEp.notes || ''
    timestamp.value = new Date(newEp.timestamp).toISOString().slice(0, 16)
  } else {
    reset()
  }
})

const episodeTypes = ['general', 'tonic_clonic', 'absence', 'focal', 'myoclonic', 'atonic']
</script>

<template>
  <GlassModal :show="show" :title="t('common.log_episode')" @close="$emit('close')">
    <div class="space-y-4">
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
        placeholder="e.g. 2 min" 
      />

      <!-- Notes -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-300 ml-1">{{ t('common.notes') }}</label>
        <textarea 
          v-model="notes" 
          rows="3"
          class="glass-input w-full resize-none"
          placeholder="..."
        ></textarea>
      </div>

      <div class="flex justify-end pt-4 gap-2">
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
