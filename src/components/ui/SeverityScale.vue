<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 5
  },
  maxLevel: {
    type: Number,
    default: 5
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const hoveredLevel = ref(0)

const getSegmentColor = (level) => {
  if (level <= 2) return 'from-cyan-500 to-blue-500'
  if (level === 3) return 'from-yellow-400 to-amber-500'
  return 'from-orange-500 to-red-500'
}

const selectLevel = (level) => {
  if (!props.readonly) {
    emit('update:modelValue', level)
  }
}

const previewLevel = computed(() => hoveredLevel.value || props.modelValue)
</script>

<template>
  <div class="space-y-3">
    <!-- Labels -->
    <div class="flex justify-between items-center">
      <span class="text-xs text-gray-400 uppercase tracking-wide">{{ t('common.mild') }}</span>
      <span class="text-xs text-gray-400 uppercase tracking-wide">{{ t('common.severe') }}</span>
    </div>

    <!-- Segmented Scale -->
    <div class="flex gap-1.5">
      <button
        v-for="level in maxLevel"
        :key="level"
        type="button"
        @click="selectLevel(level)"
        @mouseenter="!readonly && (hoveredLevel = level)"
        @mouseleave="hoveredLevel = 0"
        :disabled="readonly"
        :aria-label="`Severity level ${level}`"
        class="flex-1 h-12 rounded-lg border-2 transition-all duration-300 relative overflow-hidden group"
        :class="[
          level <= previewLevel
            ? 'border-transparent scale-105'
            : 'border-white/20 hover:border-white/30',
          !readonly && 'cursor-pointer',
          readonly && 'cursor-default'
        ]"
      >
        <!-- Fill gradient -->
        <div
          v-if="level <= previewLevel"
          class="absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity"
          :class="getSegmentColor(level)"
        ></div>

        <!-- Number label -->
        <div class="relative z-10 h-full flex items-center justify-center">
          <span
            class="font-semibold text-sm transition-colors"
            :class="level <= previewLevel ? 'text-white' : 'text-gray-500'"
          >
            {{ level }}
          </span>
        </div>

        <!-- Glass overlay -->
        <div
          v-if="level <= previewLevel"
          class="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none"
        ></div>
      </button>
    </div>

    <!-- Current selection indicator -->
    <div v-if="modelValue > 0" class="text-center">
      <span class="text-sm text-gray-400">
        Selected: <span class="font-semibold text-white">Level {{ modelValue }}</span>
      </span>
    </div>
  </div>
</template>
