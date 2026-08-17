import { reactive, watch } from 'vue'

const STORAGE_KEY = 'typepinyin-data-v1'

const defaultData = {
  wrongWords: [], // { text, pinyin, count, lastWrong, repetitions, interval, easeFactor, dueDate }
  history: [], // { id, date, mode, total, wrong, wpm, accuracy, duration }
  customWords: [], // 自定义词库 [{ text, pinyin }]
  settings: {
    showPinyin: true,
    mode: 'char', // char | word | article | wrong | pinyin | wubi | custom
    articleIndex: 0,
    charCount: 50,
    pinyinGroup: 'all', // 拼音专项分组
    wubiHint: true, // 五笔模式显示编码长度提示
    reviewEnabled: true // 记忆曲线复习
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
        customWords: data.customWords || [],
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
  store.customWords = []
}

// 自定义词库管理
export function addCustomWords(words) {
  // words: [{ text, pinyin }] 或 [text, ...]
  const list = words.map((w) => {
    if (typeof w === 'string') return { text: w, pinyin: '' }
    return { text: String(w.text || '').trim(), pinyin: String(w.pinyin || '').trim() }
  }).filter((w) => w.text)
  const existing = new Set(store.customWords.map((w) => w.text))
  for (const w of list) {
    if (!existing.has(w.text)) {
      store.customWords.push(w)
      existing.add(w.text)
    }
  }
  return list.length
}

export function removeCustomWord(text) {
  store.customWords = store.customWords.filter((w) => w.text !== text)
}

export function clearCustomWords() {
  store.customWords = []
}

// 数据导出：返回 JSON 字符串
export function exportData() {
  return JSON.stringify(
    {
      app: 'typepinyin',
      version: 1,
      exportedAt: new Date().toISOString(),
      wrongWords: store.wrongWords,
      history: store.history,
      customWords: store.customWords,
      settings: store.settings
    },
    null,
    2
  )
}

// 数据导入：解析 JSON 并合并
export function importData(jsonStr) {
  const data = JSON.parse(jsonStr)
  if (!data || typeof data !== 'object') throw new Error('数据格式不正确')
  if (Array.isArray(data.wrongWords)) store.wrongWords = data.wrongWords
  if (Array.isArray(data.history)) store.history = data.history
  if (Array.isArray(data.customWords)) store.customWords = data.customWords
  if (data.settings && typeof data.settings === 'object') {
    store.settings = { ...store.settings, ...data.settings }
  }
  return true
}
