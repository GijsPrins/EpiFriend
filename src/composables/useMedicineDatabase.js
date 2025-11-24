import { ref } from 'vue'
import medicinesData from '../data/medicines.json'

export function useMedicineDatabase() {
  const medicines = ref(medicinesData)

  const searchMedicines = (query) => {
    if (!query) return medicines.value
    const lowerQuery = query.toLowerCase()
    return medicines.value.filter(med => 
      med.name.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    medicines,
    searchMedicines
  }
}
