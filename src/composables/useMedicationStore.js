import { ref, watch } from 'vue'

const STORAGE_KEY = 'epifriend_medications'
const LOGS_KEY = 'epifriend_medication_logs'

export function useMedicationStore() {
  // Load from local storage or default to empty array
  const loadData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch (e) {
      console.error(`Failed to load ${key}:`, e)
      return []
    }
  }
  
  const medications = ref(loadData(STORAGE_KEY))
  const medicationLogs = ref(loadData(LOGS_KEY))

  // Watch for changes and save to local storage
  watch(medications, (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    } catch (e) {
      console.error('Failed to save medications:', e)
    }
  }, { deep: true })

  watch(medicationLogs, (newVal) => {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(newVal))
    } catch (e) {
      console.error('Failed to save medication logs:', e)
    }
  }, { deep: true })

  /**
   * Add a new medication
   * @param {Object} med - { name, dosage, frequency, times: [] }
   */
  const addMedication = (med) => {
    const newMed = {
      id: crypto.randomUUID(),
      ...med,
      startDate: new Date().toISOString(),
      endDate: null,
      history: []
    }
    medications.value.push(newMed)
  }

  /**
   * Update a medication (creates history entry)
   * @param {String} id 
   * @param {Object} updates 
   */
  const updateMedication = (id, updates) => {
    const index = medications.value.findIndex(m => m.id === id)
    if (index === -1) return

    const currentMed = medications.value[index]
    
    // Create a snapshot of the current state for history
    const historyEntry = {
      ...currentMed,
      archivedAt: new Date().toISOString(),
      history: undefined // Don't nest history recursively
    }

    // Apply updates
    medications.value[index] = {
      ...currentMed,
      ...updates,
      history: [...(currentMed.history || []), historyEntry]
    }
  }

  /**
   * Stop taking a medication
   * @param {String} id 
   */
  const stopMedication = (id) => {
    const index = medications.value.findIndex(m => m.id === id)
    if (index !== -1) {
      medications.value[index].endDate = new Date().toISOString()
    }
  }

  /**
   * Get active medications
   */
  const activeMedications = () => {
    return medications.value.filter(m => !m.endDate)
  }

  /**
   * Log a missed dose
   * @param {String} medId 
   * @param {Number} doseIndex
   * @param {String} date - ISO date string (YYYY-MM-DD)
   */
  const logMissedDose = (medId, doseIndex, date = new Date().toISOString().split('T')[0]) => {
    medicationLogs.value.push({
      id: crypto.randomUUID(),
      medId,
      doseIndex,
      date,
      status: 'missed',
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Check if a med was missed on a specific date and dose index
   */
  const isMissed = (medId, doseIndex, date = new Date().toISOString().split('T')[0]) => {
    return medicationLogs.value.some(log => log.medId === medId && log.doseIndex === doseIndex && log.date === date && log.status === 'missed')
  }

  /**
   * Remove a missed dose log (mark as taken again)
   */
  const removeMissedDose = (medId, doseIndex, date = new Date().toISOString().split('T')[0]) => {
    const index = medicationLogs.value.findIndex(log => log.medId === medId && log.doseIndex === doseIndex && log.date === date && log.status === 'missed')
    if (index !== -1) {
      medicationLogs.value.splice(index, 1)
    }
  }

  /**
   * Check if ANY dose of a medication was missed on a specific date
   * Used by Calendar to show missed med indicators
   */
  const hasAnyMissedDose = (medId, date = new Date().toISOString().split('T')[0]) => {
    return medicationLogs.value.some(log => log.medId === medId && log.date === date && log.status === 'missed')
  }

  return {
    medications,
    medicationLogs,
    addMedication,
    updateMedication,
    stopMedication,
    activeMedications,
    logMissedDose,
    removeMissedDose,
    isMissed,
    hasAnyMissedDose
  }
}
