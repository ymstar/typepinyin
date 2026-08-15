<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { pinyin } from 'pinyin-pro'
import { useStore } from '../store/useStore'
import { getCharPool, getWordPool, getArticle, getArticles, shuffle } from '../data/words'

const store = useStore()

const mode = ref(store.settings.mode)
const items = ref([])
const currentIndex = ref(0)
const currentInput = ref('')
const wrongCount = ref(0)
const startTime = ref(null)
const finished = ref(false)
const elapsed = ref(0)
let timer = null

const modes = [
  { value: 'char', label: '单字' },
  { value: 'word', label: '词组' },
  { value: 'article', label: '文章' },
  { value: 'wrong', label: '错词复习' }
]

const articles = getArticles()

function getPinyins(char) {
  try {
    const arr = pinyin(char, { toneType: 'none', multiple: true, type: 'array' })
    const set = new Set()
    for (const a of arr) {
      for (const p of String(a).split(',')) {
        const t = p.trim()
        if (t) set.add(t)
      }
    }
    return [...set]
  } catch (e) {
    return []
  }
}

function buildItems() {
  let chars = []
  if (mode.value === 'char') {
    chars = shuffle(getCharPool()).slice(0, store.settings.charCount)
  } else if (mode.value === 'word') {
    const words = shuffle(getWordPool()).slice(0, 20)
    chars = words.join('').split('')
  } else if (mode.value === 'article') {
    const content = getArticle(store.settings.articleIndex).content
    chars = content.replace(/[，。！？、；：""''（）\s]/g, '').split('')
  } else if (mode.value === 'wrong') {
    const wrongs = store.wrongWords
    if (wrongs.length === 0) {
      chars = []
    } else {
      const pool = wrongs.map((w) => w.text)
      chars = shuffle(pool).slice(0, Math.min(30, pool.length)).join('').split('')
    }
  }

  if (chars.length === 0) {
    items.value = []
    finished.value = true
    if (timer) clearInterval(timer)
    return
  }

  items.value = chars.map((c) => ({
    char: c,
    pinyins: getPinyins(c),
    status: 'pending'
  }))
  currentIndex.value = 0
  currentInput.value = ''
  wrongCount.value = 0
  finished.value = false
  startTime.value = Date.now()
  elapsed.value = 0
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

function recordWrong(item) {
  const existing = store.wrongWords.find((w) => w.text === item.char)
  if (existing) {
    existing.count++
    existing.lastWrong = Date.now()
  } else {
    store.wrongWords.push({
      text: item.char,
      pinyin: item.pinyins[0] || '',
      count: 1,
      lastWrong: Date.now()
    })
  }
}

function finish() {
  finished.value = true
  if (timer) clearInterval(timer)
  const duration = Math.max(1, Math.round((Date.now() - startTime.value) / 1000))
  const total = items.value.length
  const accuracy = total > 0 ? Math.round(((total - wrongCount.value) / total) * 100) : 100
  const wpm = Math.round((total / duration) * 60)
  store.history.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    mode: mode.value,
    total,
    wrong: wrongCount.value,
    wpm,
    accuracy,
    duration
  })
  if (store.history.length > 200) store.history = store.history.slice(0, 200)
}

function onKeydown(e) {
  if (finished.value) return
  if (e.key === 'Backspace') {
    currentInput.value = currentInput.value.slice(0, -1)
    return
  }
  if (/^[a-z]$/i.test(e.key)) {
    e.preventDefault()
    const ch = e.key.toLowerCase()
    const item = items.value[currentIndex.value]
    if (!item) return
    const newInput = currentInput.value + ch
    const matched = item.pinyins.some((p) => p === newInput)
    const isPrefix = item.pinyins.some((p) => p.startsWith(newInput))
    if (matched) {
      item.status = 'correct'
      currentInput.value = ''
      currentIndex.value++
      if (currentIndex.value >= items.value.length) {
        finish()
      }
    } else if (isPrefix) {
      currentInput.value = newInput
    } else {
      if (item.status !== 'wrong') {
        item.status = 'wrong'
        wrongCount.value++
        recordWrong(item)
      }
      currentInput.value = ''
    }
  }
}

function switchMode(m) {
  mode.value = m
  store.settings.mode = m
  buildItems()
}

function restart() {
  buildItems()
}

const currentItem = computed(() => items.value[currentIndex.value])
const total = computed(() => items.value.length)
const accuracy = computed(() => {
  if (total.value === 0) return 100
  return Math.round(((total.value - wrongCount.value) / total.value) * 100)
})
const wpm = computed(() => {
  if (elapsed.value <= 0) return 0
  return Math.round((currentIndex.value / elapsed.value) * 60)
})
const hasWrongWords = computed(() => store.wrongWords.length > 0)

function charClass(item, i) {
  if (i < currentIndex.value) return 'char done'
  if (i === currentIndex.value) return 'char current'
  return 'char'
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  buildItems()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="practice">
    <div class="mode-bar">
      <button
        v-for="m in modes"
        :key="m.value"
        :class="{ active: mode === m.value }"
        @click="switchMode(m.value)"
      >
        {{ m.label }}
      </button>
      <select
        v-if="mode === 'article'"
        v-model="store.settings.articleIndex"
        @change="buildItems"
      >
        <option v-for="(a, i) in articles" :key="i" :value="i">{{ a.title }}</option>
      </select>
    </div>

    <div v-if="mode === 'wrong' && !hasWrongWords" class="empty">
      错词本还是空的，先去练习打错几个字吧
    </div>

    <template v-else>
      <div v-if="!finished" class="practice-area" @click="restart">
        <div class="chars">
          <span
            v-for="(item, i) in items"
            :key="i"
            :class="charClass(item, i)"
          >{{ item.char }}</span>
        </div>
        <div class="input-line">
          <span class="current-pinyin">{{ currentInput }}</span>
          <span v-if="store.settings.showPinyin && currentItem" class="hint">
            {{ currentItem.pinyins[0] }}
          </span>
        </div>
        <div class="stats">
          <div>速度 <b>{{ wpm }}</b> 字/分</div>
          <div>正确率 <b>{{ accuracy }}%</b></div>
          <div>用时 <b>{{ elapsed }}s</b></div>
          <div>进度 <b>{{ currentIndex }}/{{ total }}</b></div>
        </div>
        <div class="tip">请切换到英文输入法，输入拼音（不带声调）· 点击区域可重新开始</div>
      </div>

      <div v-else class="result">
        <h2>练习完成</h2>
        <div class="result-grid">
          <div class="result-item">
            <div class="num">{{ wpm }}</div>
            <div class="label">速度（字/分）</div>
          </div>
          <div class="result-item">
            <div class="num">{{ accuracy }}%</div>
            <div class="label">正确率</div>
          </div>
          <div class="result-item">
            <div class="num">{{ total }}</div>
            <div class="label">总字数</div>
          </div>
          <div class="result-item">
            <div class="num">{{ wrongCount }}</div>
            <div class="label">打错字数</div>
          </div>
        </div>
        <button class="btn-primary" @click="restart">再来一次</button>
      </div>
    </template>
  </div>
</template>
