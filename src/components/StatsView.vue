<script setup>
import { computed } from 'vue'
import { useStore } from '../store/useStore'

const store = useStore()

const totalSessions = computed(() => store.history.length)
const totalChars = computed(() => store.history.reduce((s, h) => s + h.total, 0))
const avgWpm = computed(() => {
  if (store.history.length === 0) return 0
  return Math.round(store.history.reduce((s, h) => s + h.wpm, 0) / store.history.length)
})
const avgAccuracy = computed(() => {
  if (store.history.length === 0) return 0
  return Math.round(store.history.reduce((s, h) => s + h.accuracy, 0) / store.history.length)
})

const modeLabels = {
  char: '单字',
  word: '词组',
  article: '文章',
  wrong: '错词复习',
  pinyin: '拼音专项',
  wubi: '五笔',
  custom: '自定义'
}

// 最近 7 天练习字数柱状图
const last7 = computed(() => {
  const days = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    const count = store.history
      .filter((h) => {
        const hd = new Date(h.date)
        return (
          hd.getFullYear() === d.getFullYear() &&
          hd.getMonth() === d.getMonth() &&
          hd.getDate() === d.getDate()
        )
      })
      .reduce((s, h) => s + h.total, 0)
    days.push({ key, count })
  }
  const max = Math.max(1, ...days.map((d) => d.count))
  return days.map((d) => ({ ...d, height: Math.max(2, Math.round((d.count / max) * 100)) }))
})

function fmtDate(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <div>
    <h2 class="section-title">统计</h2>
    <p class="section-desc">你的打字练习数据，全部保存在本地浏览器。</p>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="num">{{ totalSessions }}</div>
        <div class="label">练习次数</div>
      </div>
      <div class="stat-card">
        <div class="num">{{ totalChars }}</div>
        <div class="label">累计字数</div>
      </div>
      <div class="stat-card">
        <div class="num">{{ avgWpm }}</div>
        <div class="label">平均速度（字/分）</div>
      </div>
      <div class="stat-card">
        <div class="num">{{ avgAccuracy }}%</div>
        <div class="label">平均正确率</div>
      </div>
    </div>

    <h3 style="font-size: 15px; margin-bottom: 12px">最近 7 天练习量</h3>
    <div class="chart">
      <div v-for="d in last7" :key="d.key" class="bar-wrap">
        <div class="bar" :style="{ height: d.height + '%' }"></div>
        <div class="bar-label">{{ d.key }}</div>
      </div>
    </div>

    <h3 style="font-size: 15px; margin-bottom: 12px">历史记录</h3>
    <div v-if="store.history.length === 0" class="empty">还没有练习记录</div>
    <div v-else class="history-list">
      <div v-for="h in store.history" :key="h.id" class="history-item">
        <div style="display: flex; align-items: center; gap: 10px">
          <span class="mode-tag">{{ modeLabels[h.mode] || h.mode }}</span>
          <span>{{ fmtDate(h.date) }}</span>
        </div>
        <div class="nums">{{ h.wpm }} 字/分 · {{ h.accuracy }}% · {{ h.total }} 字</div>
      </div>
    </div>
  </div>
</template>
