import { ref, watch } from 'vue'

const STORAGE_KEY = 'epifriend_settings'

const defaultSettings = {
  profile: {
    name: '',
    dateOfBirth: ''
  },
  emergency: {
    contactName: '',
    contactPhone: '',
    contactRelation: '',
    doctorName: '',
    doctorPhone: '',
    neurologistName: '',
    neurologistPhone: ''
  },
  medical: {
    allergies: [],
    notes: ''
  },
  preferences: {
    language: 'nl'
  }
}

export function useSettings() {
  const loadSettings = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch (e) {
      console.error('Failed to load settings:', e)
      return defaultSettings
    }
  }

  const settings = ref(loadSettings())

  watch(settings, (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }, { deep: true })

  const updateProfile = (profile) => {
    settings.value.profile = { ...settings.value.profile, ...profile }
  }

  const updateEmergency = (emergency) => {
    settings.value.emergency = { ...settings.value.emergency, ...emergency }
  }

  const updateMedical = (medical) => {
    settings.value.medical = { ...settings.value.medical, ...medical }
  }

  const addAllergy = (allergy) => {
    if (allergy && !settings.value.medical.allergies.includes(allergy)) {
      settings.value.medical.allergies.push(allergy)
    }
  }

  const removeAllergy = (index) => {
    settings.value.medical.allergies.splice(index, 1)
  }

  const updatePreferences = (preferences) => {
    settings.value.preferences = { ...settings.value.preferences, ...preferences }
  }

  return {
    settings,
    updateProfile,
    updateEmergency,
    updateMedical,
    addAllergy,
    removeAllergy,
    updatePreferences
  }
}
