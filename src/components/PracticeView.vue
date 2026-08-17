<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { pinyin } from 'pinyin-pro'
import { useStore } from '../store/useStore'
import { getCharPool, getWordPool, getArticle, getArticles, shuffle } from '../data/words'
import { PINYIN_GROUPS, analyzePinyinError, pinyinInGroup } from '../data/pinyinGroups'
import { reviewSuccess, reviewFail, isDue } from '../utils/review'
import wubi86 from '../data/wubi86'
import wubiWords from '../data/wubiWords'
import { rootName } from '../data/wubiRoots'
import { buildShareText, renderShareImage, modeLabel } from '../utils/share'

const store = useStore()

const mode = ref(store.settings.mode)
const items = ref([])
const currentIndex = ref(0)
const currentInput = ref('')
const wrongCount = ref(0)
const startTime = ref(null)
const finished = ref(false)
const elapsed = ref(0)
const lastError = ref(null)
const lastResult = ref(null)
const showShare = ref(false)
const shareImage = ref('')
const shareCopied = ref(false)
let timer = null

const modes = [
  { value: 'char', label: '单字' },
  { value: 'word', label: '词组' },
  { value: 'article', label: '文章' },
  { value: 'wrong', label: '错词复习' },
  { value: 'pinyin', label: '拼音专项' },
  { value: 'wubi', label: '五笔' },
  { value: 'custom', label: '自定义' }
]

const articles = getArticles()
const isWubiMode = computed(() => mode.value === 'wubi')
const isPinyinInput = computed(() => !isWubiMode.value)

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

function getWubiCodes(char) {
  const codes = wubi86[char]
  return codes ? codes.split(',') : []
}

function getPinyinFocusChars(groupId) {
  const group = groupId === 'all' ? null : PINYIN_GROUPS.find((g) => g.id === groupId)
  const result = []
  for (const c of getCharPool()) {
    const ps = getPinyins(c)
    if (ps.length === 0) continue
    if (!group) {
      if (PINYIN_GROUPS.some((g) => ps.some((p) => pinyinInGroup(p, g)))) result.push(c)
    } else if (ps.some((p) => pinyinInGroup(p, group))) {
      result.push(c)
    }
  }
  return result
}

function startSession(list) {
  items.value = list
  currentIndex.value = 0
  currentInput.value = ''
  wrongCount.value = 0
  lastError.value = null
  finished.value = false
  showShare.value = false
  startTime.value = Date.now()
  elapsed.value = 0
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    elapsed.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
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
    let wrongs = store.wrongWords
    if (store.settings.reviewEnabled) wrongs = wrongs.filter(isDue)
    if (wrongs.length === 0) {
      chars = []
    } else {
      const pool = wrongs.map((w) => w.text)
      chars = shuffle(pool).slice(0, Math.min(30, pool.length)).join('').split('')
    }
  } else if (mode.value === 'pinyin') {
    chars = shuffle(getPinyinFocusChars(store.settings.pinyinGroup)).slice(0, store.settings.charCount)
  } else if (mode.value === 'wubi') {
    if (store.settings.wubiType === 'word') {
      const words = Object.keys(wubiWords)
      if (words.length === 0) {
        items.value = []
        finished.value = true
        if (timer) clearInterval(timer)
        return
      }
      startSession(
        shuffle(words)
          .slice(0, 20)
          .map((w) => ({ char: w, pinyins: [], wubiCodes: [wubiWords[w]], status: 'pending' }))
      )
      return
    }
    chars = shuffle(getCharPool()).slice(0, store.settings.charCount)
  } else if (mode.value === 'custom') {
    const words = store.customWords
    if (words.length === 0) {
      chars = []
    } else {
      const pool = shuffle(words).slice(0, Math.min(30, words.length))
      const expanded = []
      for (const w of pool) {
        const customPinyins = w.pinyin ? w.pinyin.trim().split(/\s+/) : []
        const cArr = w.text.split('')
        cArr.forEach((c, i) => {
          expanded.push({
            char: c,
            pinyins: customPinyins[i] ? [customPinyins[i]] : getPinyins(c)
          })
        })
      }
      startSession(expanded.map((e) => ({ ...e, wubiCodes: [], status: 'pending' })))
      return
    }
  }

  if (chars.length === 0) {
    items.value = []
    finished.value = true
    if (timer) clearInterval(timer)
    return
  }

  startSession(
    chars.map((c) => ({
      char: c,
      pinyins: getPinyins(c),
      wubiCodes: getWubiCodes(c),
      status: 'pending'
    }))
  )
}

function recordWrong(item) {
  const existing = store.wrongWords.find((w) => w.text === item.char)
  if (existing) {
    existing.count++
    existing.lastWrong = Date.now()
    if (store.settings.reviewEnabled) Object.assign(existing, reviewFail())
  } else {
    store.wrongWords.push({
      text: item.char,
      pinyin: item.pinyins[0] || '',
      count: 1,
      lastWrong: Date.now(),
      ...(store.settings.reviewEnabled ? reviewFail() : {})
    })
  }
}

function onCorrect(item) {
  if (mode.value === 'wrong' && store.settings.reviewEnabled) {
    const existing = store.wrongWords.find((w) => w.text === item.char)
    if (existing) Object.assign(existing, reviewSuccess(existing))
  }
}

function finish() {
  finished.value = true
  if (timer) clearInterval(timer)
  const duration = Math.max(1, Math.round((Date.now() - startTime.value) / 1000))
  const total = items.value.length
  const accuracy = total > 0 ? Math.round(((total - wrongCount.value) / total) * 100) : 100
  const wpm = Math.round((total / duration) * 60)
  const result = {
    id: Date.now(),
    date: new Date().toISOString(),
    mode: mode.value,
    total,
    wrong: wrongCount.value,
    wpm,
    accuracy,
    duration
  }
  store.history.unshift(result)
  if (store.history.length > 200) store.history = store.history.slice(0, 200)
  lastResult.value = result
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

    if (isWubiMode.value) {
      const matched = item.wubiCodes.some((c) => c === newInput)
      const isPrefix = item.wubiCodes.some((c) => c.startsWith(newInput))
      if (matched) {
        item.status = 'correct'
        currentInput.value = ''
        lastError.value = null
        currentIndex.value++
        if (currentIndex.value >= items.value.length) finish()
      } else if (isPrefix) {
        currentInput.value = newInput
      } else {
        if (item.status !== 'wrong') {
          item.status = 'wrong'
          wrongCount.value++
          recordWrong(item)
        }
        lastError.value = { correct: item.wubiCodes[0] || '', wrong: newInput, analysis: null }
        currentInput.value = ''
      }
    } else {
      const matched = item.pinyins.some((p) => p === newInput)
      const isPrefix = item.pinyins.some((p) => p.startsWith(newInput))
      if (matched) {
        item.status = 'correct'
        currentInput.value = ''
        lastError.value = null
        onCorrect(item)
        currentIndex.value++
        if (currentIndex.value >= items.value.length) finish()
      } else if (isPrefix) {
        currentInput.value = newInput
      } else {
        if (item.status !== 'wrong') {
          item.status = 'wrong'
          wrongCount.value++
          recordWrong(item)
        }
        const correct = item.pinyins[0] || ''
        lastError.value = { correct, wrong: newInput, analysis: analyzePinyinError(correct, newInput) }
        currentInput.value = ''
      }
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

// 分享
function openShare() {
  if (!lastResult.value) return
  showShare.value = true
  shareCopied.value = false
  shareImage.value = renderShareImage(lastResult.value)
}

async function copyShareText() {
  if (!lastResult.value) return
  const text = buildShareText(lastResult.value)
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  shareCopied.value = true
}

function downloadShareImage() {
  if (!shareImage.value) return
  const a = document.createElement('a')
  a.href = shareImage.value
  a.download = `typepinyin-share-${Date.now()}.png`
  a.click()
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
const hasCustomWords = computed(() => store.customWords.length > 0)
const currentModeLabel = computed(() => modeLabel(mode.value))

// 五笔字根提示（单字模式）
const wubiRootsHint = computed(() => {
  if (!isWubiMode.value || store.settings.wubiType !== 'char') return ''
  const item = currentItem.value
  if (!item || !item.wubiCodes || item.wubiCodes.length === 0) return ''
  const full = item.wubiCodes[item.wubiCodes.length - 1]
  return full
    .split('')
    .map((k) => `${k}·${rootName(k)}`)
    .join('  ')
})

const emptyText = computed(() => {
  if (mode.value === 'wrong') {
    if (!hasWrongWords.value) return '错词本还是空的，先去练习打错几个字吧'
    if (store.settings.reviewEnabled) return '今天没有到期的复习词，去练习页打几个字吧'
    return '错词本还是空的，先去练习打错几个字吧'
  }
  if (mode.value === 'custom') return '自定义词库是空的，去「设置」页导入词库吧'
  if (mode.value === 'pinyin') return '当前分组没有匹配的字，换个分组试试'
  return '暂无内容'
})

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
    </div>

    <div v-if="mode === 'article'" class="mode-extra">
      <select v-model="store.settings.articleIndex" @change="buildItems">
        <option v-for="(a, i) in articles" :key="i" :value="i">{{ a.title }}</option>
      </select>
    </div>

    <div v-if="mode === 'pinyin'" class="mode-extra">
      <select v-model="store.settings.pinyinGroup" @change="buildItems">
        <option value="all">全部易错拼音</option>
        <option v-for="g in PINYIN_GROUPS" :key="g.id" :value="g.id">{{ g.name }}（{{ g.desc }}）</option>
      </select>
    </div>

    <div v-if="mode === 'wubi'" class="mode-extra">
      <select v-model="store.settings.wubiType" @change="buildItems">
        <option value="char">单字</option>
        <option value="word">词组</option>
      </select>
    </div>

    <div v-if="finished && items.length === 0" class="empty">
      {{ emptyText }}
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
          <span v-if="isWubiMode && currentItem && store.settings.wubiHint" class="hint">
            {{ currentItem.wubiCodes[0] ? currentItem.wubiCodes[0].length + ' 码' : '无编码' }}
          </span>
          <span v-else-if="store.settings.showPinyin && currentItem && isPinyinInput" class="hint">
            {{ currentItem.pinyins[0] }}
          </span>
        </div>
        <div v-if="wubiRootsHint" class="roots-hint">{{ wubiRootsHint }}</div>
        <div v-if="lastError" class="error-tip">
          <template v-if="lastError.analysis">
            <span class="err-badge">{{ lastError.analysis.group.name }}</span>
            <span>易混：{{ lastError.analysis.from }} ↔ {{ lastError.analysis.to }}，正确拼音 {{ lastError.correct }}</span>
          </template>
          <template v-else>
            <span v-if="isWubiMode">正确编码：{{ lastError.correct }}</span>
            <span v-else>正确拼音：{{ lastError.correct }}</span>
          </template>
        </div>
        <div class="stats">
          <div>速度 <b>{{ wpm }}</b> 字/分</div>
          <div>正确率 <b>{{ accuracy }}%</b></div>
          <div>用时 <b>{{ elapsed }}s</b></div>
          <div>进度 <b>{{ currentIndex }}/{{ total }}</b></div>
        </div>
        <div class="tip">
          {{ isWubiMode ? (store.settings.wubiType === 'word' ? '输入词组五笔编码（86 版，4 码）' : '输入五笔编码（86 版，最多 4 码）') : '请切换到英文输入法，输入拼音（不带声调）' }} · 点击区域可重新开始
        </div>
      </div>

      <div v-else class="result">
        <h2>{{ currentModeLabel }}练习完成</h2>
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
        <div class="result-actions">
          <button class="btn-primary" @click="restart">再来一次</button>
          <button class="btn-ghost" @click="openShare">分享成绩</button>
        </div>

        <div v-if="showShare" class="share-panel">
          <img :src="shareImage" alt="分享卡片" class="share-img" />
          <div class="share-actions">
            <button class="btn-ghost" @click="copyShareText">
              {{ shareCopied ? '已复制' : '复制文案' }}
            </button>
            <button class="btn-ghost" @click="downloadShareImage">下载图片</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
