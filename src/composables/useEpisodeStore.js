import { ref, watch } from 'vue'

const STORAGE_KEY = 'epifriend_episodes'

export function useEpisodeStore() {
  const loadData = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch (e) {
      console.error('Failed to load episodes:', e)
      return []
    }
  }
  
  const episodes = ref(loadData())

  watch(episodes, (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    } catch (e) {
      console.error('Failed to save episodes:', e)
    }
  }, { deep: true })

  const addEpisode = (episode) => {
    episodes.value.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...episode
    })
  }

  const updateEpisode = (id, updatedFields) => {
    const index = episodes.value.findIndex(e => e.id === id)
    if (index !== -1) {
      episodes.value[index] = { ...episodes.value[index], ...updatedFields }
    }
  }

  const getRecentEpisodes = (limit = 5) => {
    return episodes.value.slice(0, limit)
  }

  return {
    episodes,
    addEpisode,
    updateEpisode,
    getRecentEpisodes
  }
}
