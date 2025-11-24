<script setup>
defineProps({
  modelValue: [String, Number],
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  label: String
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium text-gray-300 ml-1">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="glass-input w-full"
    />
  </div>
</template>
