import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  const showToast = (type = 'success', message = '', duration = 3000) => {
    const id = nextId++
    const toast = {
      id,
      type, // 'success' | 'error' | 'info'
      message,
      visible: true
    }
    
    toasts.value.push(toast)
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  return {
    toasts,
    showToast,
    removeToast
  }
}
