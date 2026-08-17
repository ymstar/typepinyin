<script setup>
import { computed } from 'vue'
import { useStore } from '../store/useStore'
import { formatDue, isDue } from '../utils/review'

const store = useStore()

const sorted = computed(() =>
  [...store.wrongWords].sort((a, b) => b.count - a.count || b.lastWrong - a.lastWrong)
)

const dueCount = computed(() => store.wrongWords.filter(isDue).length)

function removeWord(text) {
  store.wrongWords = store.wrongWords.filter((w) => w.text !== text)
}

function clearAll() {
  store.wrongWords = []
}
</script>

<template>
  <div>
    <h2 class="section-title">错词本</h2>
    <p class="section-desc">
      练习中打错的字会自动收录到这里，共 {{ store.wrongWords.length }} 个，其中 {{ dueCount }} 个待复习。可在「练习」页选择「错词复习」模式针对性巩固。
    </p>

    <div v-if="sorted.length === 0" class="empty">
      暂无错词，去练习页打几个字吧
    </div>

    <div v-else class="word-list">
      <div v-for="w in sorted" :key="w.text" class="word-item">
        <div>
          <span class="text">{{ w.text }}</span>
          <span class="pinyin">{{ w.pinyin }}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px">
          <span class="count">错 {{ w.count }} 次</span>
          <span v-if="store.settings.reviewEnabled" class="due" :class="{ now: isDue(w) }">
            {{ isDue(w) ? '待复习' : formatDue(w) }}
          </span>
          <button class="btn-danger" style="padding: 4px 12px; font-size: 12px" @click="removeWord(w.text)">
            移除
          </button>
        </div>
      </div>
    </div>

    <div v-if="sorted.length > 0" style="margin-top: 20px; text-align: right">
      <button class="btn-danger" @click="clearAll">清空错词本</button>
    </div>
  </div>
</template>
