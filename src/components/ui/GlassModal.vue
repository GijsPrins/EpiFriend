<script setup>
defineProps({
  show: Boolean,
  title: String
})

defineEmits(['close'])
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl glass-panel p-6 transform transition-all">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">{{ title }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .glass-panel,
.modal-leave-active .glass-panel {
  transition: all 0.3s ease;
}

.modal-enter-from .glass-panel,
.modal-leave-to .glass-panel {
  opacity: 0;
  transform: scale(0.95);
}
</style>
