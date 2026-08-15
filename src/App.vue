<script setup>
import { ref } from 'vue'
import PracticeView from './components/PracticeView.vue'
import WordBookView from './components/WordBookView.vue'
import StatsView from './components/StatsView.vue'
import SettingsView from './components/SettingsView.vue'

const tab = ref('practice')

const tabs = [
  { value: 'practice', label: '练习' },
  { value: 'wordbook', label: '错词本' },
  { value: 'stats', label: '统计' },
  { value: 'settings', label: '设置' }
]
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <span class="logo">拼</span>
      <span>TypePinyin</span>
      <span class="sub">中文拼音打字练习</span>
    </div>
    <nav class="nav">
      <button
        v-for="t in tabs"
        :key="t.value"
        :class="{ active: tab === t.value }"
        @click="tab = t.value"
      >
        {{ t.label }}
      </button>
    </nav>
  </header>

  <main class="main">
    <PracticeView v-if="tab === 'practice'" />
    <WordBookView v-else-if="tab === 'wordbook'" />
    <StatsView v-else-if="tab === 'stats'" />
    <SettingsView v-else />
  </main>

  <footer class="footer">
    TypePinyin · 一次敲击，一点进步 · 数据仅保存在本地浏览器
  </footer>
</template>
