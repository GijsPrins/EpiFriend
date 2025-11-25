<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  defaultOpen: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="glass-panel overflow-hidden">
    <!-- Header -->
    <button
      @click="toggle"
      class="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
      :aria-expanded="isOpen"
    >
      <div class="flex items-center gap-3">
        <span v-if="icon" class="text-xl">{{ icon }}</span>
        <h3 class="text-base font-semibold text-white">{{ title }}</h3>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-400 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Content -->
    <div
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="px-6 pb-6 pt-2">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
