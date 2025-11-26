<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MedicationManager from './components/MedicationManager.vue'
import Dashboard from './components/Dashboard.vue'
import CalendarView from './components/CalendarView.vue'
import SettingsView from './components/SettingsView.vue'
import ToastNotification from './components/ui/ToastNotification.vue'

const { t } = useI18n()
const currentView = ref('dashboard')
</script>

<template>
  <div class="min-h-screen bg-background text-white pb-24"> <!-- Padding bottom for nav -->
    <div class="max-w-2xl mx-auto p-4 md:p-8">
      <!-- Header removed as per user request -->
      <div class="mb-8"></div>
      
      <main>
        <Transition name="fade" mode="out-in">
          <Dashboard v-if="currentView === 'dashboard'" />
          <MedicationManager v-else-if="currentView === 'meds'" />
          <CalendarView v-else-if="currentView === 'calendar'" />
          <SettingsView v-else-if="currentView === 'settings'" />
        </Transition>
      </main>

      <!-- Toast Notifications -->
      <ToastNotification />

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-white/10 p-4 z-50">
        <div class="max-w-2xl mx-auto flex justify-around">
          <button 
            @click="currentView = 'dashboard'"
            class="flex flex-col items-center gap-1 transition-colors"
            :class="currentView === 'dashboard' ? 'text-primary' : 'text-gray-400 hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-xs">{{ t('common.home') }}</span>
          </button>
          
          <button 
            @click="currentView = 'meds'"
            class="flex flex-col items-center gap-1 transition-colors"
            :class="currentView === 'meds' ? 'text-primary' : 'text-gray-400 hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span class="text-xs">{{ t('common.meds') }}</span>
          </button>

          <button 
            @click="currentView = 'calendar'"
            class="flex flex-col items-center gap-1 transition-colors"
            :class="currentView === 'calendar' ? 'text-primary' : 'text-gray-400 hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-xs">{{ t('common.calendar') }}</span>
          </button>

          <button 
            @click="currentView = 'settings'"
            class="flex flex-col items-center gap-1 transition-colors"
            :class="currentView === 'settings' ? 'text-primary' : 'text-gray-400 hover:text-white'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-xs">{{ t('common.settings') }}</span>
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
