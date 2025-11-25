<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div 
    class="flex items-center gap-3 cursor-pointer group"
    @click="toggle"
    role="checkbox"
    :aria-checked="modelValue"
    :aria-disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    @keydown.space.prevent="toggle"
  >
    <div class="relative">
      <div
        class="w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center"
        :class="[
          modelValue 
            ? 'bg-primary/80 border-primary scale-105' 
            : 'bg-white/5 border-white/20 group-hover:border-white/30',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <svg
          v-if="modelValue"
          xmlns="http://www.w3.org/2000/svg"
          class="h-3.5 w-3.5 text-white transition-transform duration-300"
          :class="modelValue ? 'scale-100' : 'scale-0'"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
    <span
      class="text-sm text-gray-300 transition-colors duration-200 select-none"
      :class="[
        !disabled && 'group-hover:text-white',
        disabled && 'opacity-50'
      ]"
    >
      {{ label }}
    </span>
  </div>
</template>
