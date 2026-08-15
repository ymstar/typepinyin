import { reactive, watch } from 'vue'

const STORAGE_KEY = 'typepinyin-data-v1'

const defaultData = {
  wrongWords: [], // { text, pinyin, count, lastWrong }
  history: [], // { id, date, mode, total, wrong, wpm, accuracy, duration }
  settings: {
    showPinyin: true,
    mode: 'char', // char | word | article | wrong
    articleIndex: 0,
    charCount: 50
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return {
        ...defaultData,
        ...data,
        settings: { ...defaultData.settings, ...(data.settings || {}) }
      }
    }
  } catch (e) {
    // ignore
  }
  return JSON.parse(JSON.stringify(defaultData))
}

const store = reactive(load())

watch(
  store,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch (e) {
      // ignore
    }
  },
  { deep: true }
)

export function useStore() {
  return store
}

export function resetAllData() {
  store.wrongWords = []
  store.history = []
}
