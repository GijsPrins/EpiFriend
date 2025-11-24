<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success'].includes(value)
  }
})
</script>

<template>
  <button 
    class="glass-button"
    :class="{
      'bg-primary/80 hover:bg-primary/90': variant === 'primary',
      'bg-secondary/80 hover:bg-secondary/90': variant === 'secondary',
      'bg-error/80 hover:bg-error/90': variant === 'danger',
      'bg-success/80 hover:bg-success/90': variant === 'success'
    }"
  >
    <slot></slot>
  </button>
</template>
