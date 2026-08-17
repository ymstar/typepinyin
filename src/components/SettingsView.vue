<script setup>
import { ref } from 'vue'
import { useStore, resetAllData, addCustomWords, removeCustomWord, clearCustomWords, exportData, importData } from '../store/useStore'

const store = useStore()

const pasteText = ref('')
const importMsg = ref('')
const restoreMsg = ref('')
const showImeGuide = ref(false)

function toggle(key) {
  store.settings[key] = !store.settings[key]
}

function clearData() {
  resetAllData()
}

// 解析文本为词条列表：支持 JSON 或纯文本（每行一个）
// JSON 支持：数组 ["词"] / [{text, pinyin}] / [{word, pinyin}] / 对象映射 {"词":"拼音"} / { words: [...] }
function parseAndAdd(text) {
  const trimmed = text.trim()
  let words
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const data = JSON.parse(trimmed)
    if (Array.isArray(data)) {
      words = data
    } else if (data.words && Array.isArray(data.words)) {
      words = data.words
    } else if (typeof data === 'object') {
      // 对象映射：{ "词": "拼音" }
      words = Object.entries(data).map(([k, v]) => ({ text: k, pinyin: String(v || '') }))
    } else {
      throw new Error('JSON 需为数组、{ words: [...] } 或 { "词": "拼音" } 格式')
    }
  } else {
    words = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
  }
  return addCustomWords(words)
}

function onImportFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const count = parseAndAdd(reader.result)
      importMsg.value = `成功导入 ${count} 个词`
    } catch (err) {
      importMsg.value = '导入失败：' + err.message
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function importFromText() {
  if (!pasteText.value.trim()) return
  try {
    const count = parseAndAdd(pasteText.value)
    importMsg.value = `成功导入 ${count} 个词`
    pasteText.value = ''
  } catch (err) {
    importMsg.value = '导入失败：' + err.message
  }
}

function doExport() {
  const blob = new Blob([exportData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `typepinyin-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function onRestoreFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      importData(reader.result)
      restoreMsg.value = '数据恢复成功'
    } catch (err) {
      restoreMsg.value = '恢复失败：' + err.message
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<template>
  <div>
    <h2 class="section-title">设置</h2>
    <p class="section-desc">所有设置与数据仅保存在本地浏览器，不会上传到任何服务器。</p>

    <div class="setting-group">
      <h3>练习偏好</h3>
      <div class="setting-row">
        <div>
          <div class="label">显示拼音提示</div>
          <div class="desc">练习时在当前字下方显示正确拼音</div>
        </div>
        <div class="switch" :class="{ on: store.settings.showPinyin }" @click="toggle('showPinyin')">
          <span class="knob"></span>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <div class="label">五笔模式显示编码长度</div>
          <div class="desc">在五笔练习时提示当前字是几码字</div>
        </div>
        <div class="switch" :class="{ on: store.settings.wubiHint }" @click="toggle('wubiHint')">
          <span class="knob"></span>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <div class="label">记忆曲线复习</div>
          <div class="desc">错词按遗忘曲线安排复习，答对间隔逐渐拉长</div>
        </div>
        <div class="switch" :class="{ on: store.settings.reviewEnabled }" @click="toggle('reviewEnabled')">
          <span class="knob"></span>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <div class="label">单字模式练习字数</div>
          <div class="desc">每次随机抽取的常用字数量</div>
        </div>
        <input
          v-model.number="store.settings.charCount"
          type="number"
          min="10"
          max="200"
          step="10"
          @change="store.settings.charCount = Math.max(10, Math.min(200, Number(store.settings.charCount) || 50))"
        />
      </div>
    </div>

    <div class="setting-group">
      <h3>自定义词库</h3>
      <p class="group-desc">导入自己的词库用于「自定义」练习模式。支持 TXT（每行一个词/字）或 JSON：数组、{ words: [...] }、对象映射 { "词": "拼音" }（可指定多音字读音）。</p>
      <div class="setting-row">
        <div>
          <div class="label">从文件导入</div>
          <div class="desc">选择 .txt 或 .json 文件</div>
        </div>
        <label class="btn-ghost">
          选择文件
          <input type="file" accept=".txt,.json,text/plain,application/json" style="display: none" @change="onImportFile" />
        </label>
      </div>
      <div class="setting-row" style="flex-direction: column; align-items: stretch; gap: 10px">
        <div>
          <div class="label">粘贴导入</div>
          <div class="desc">每行一个词或字，支持 JSON</div>
        </div>
        <textarea v-model="pasteText" rows="4" placeholder="例如：&#10;苹果&#10;香蕉&#10;葡萄"></textarea>
        <div style="display: flex; justify-content: flex-end">
          <button class="btn-ghost" @click="importFromText">导入</button>
        </div>
      </div>
      <p v-if="importMsg" class="msg">{{ importMsg }}</p>
      <div v-if="store.customWords.length > 0" class="custom-list">
        <div v-for="w in store.customWords" :key="w.text" class="custom-item">
          <span class="text">{{ w.text }}</span>
          <span v-if="w.pinyin" class="pinyin">{{ w.pinyin }}</span>
          <button class="btn-danger" style="padding: 2px 10px; font-size: 12px" @click="removeCustomWord(w.text)">移除</button>
        </div>
      </div>
      <div v-if="store.customWords.length > 0" style="margin-top: 12px; text-align: right">
        <button class="btn-danger" @click="clearCustomWords">清空自定义词库</button>
      </div>
    </div>

    <div class="setting-group">
      <h3>输入法优化引导</h3>
      <p class="group-desc">练习前建议关闭输入法的模糊音与联想，避免干扰打字练习。</p>
      <button class="btn-ghost" @click="showImeGuide = !showImeGuide">
        {{ showImeGuide ? '收起引导' : '查看输入法设置建议' }}
      </button>
      <div v-if="showImeGuide" class="ime-guide">
        <div class="ime-item">
          <div class="ime-name">搜狗拼音</div>
          <div class="ime-steps">设置 → 按键 → 关闭「中英文混合输入」；属性设置 → 高级 → 关闭「模糊音」</div>
        </div>
        <div class="ime-item">
          <div class="ime-name">微软拼音</div>
          <div class="ime-steps">设置 → 时间和语言 → 输入 → 微软拼音 → 常规 → 关闭「模糊拼音」与「中英文自动切换」</div>
        </div>
        <div class="ime-item">
          <div class="ime-name">macOS 拼音</div>
          <div class="ime-steps">系统设置 → 键盘 → 输入法 → 拼音 → 关闭「模糊拼音」；建议开启「使用大写锁定键切换中英文」</div>
        </div>
        <div class="ime-item">
          <div class="ime-name">五笔输入法</div>
          <div class="ime-steps">本工具使用 86 版五笔编码，请选择 86 版码表；关闭「逐键提示」可提升练习难度</div>
        </div>
        <div class="ime-item">
          <div class="ime-name">通用建议</div>
          <div class="ime-steps">练习时切换到英文输入法，避免中文输入法弹候选词干扰；关闭输入法自带的「云联想」</div>
        </div>
      </div>
    </div>

    <div class="setting-group">
      <h3>数据备份</h3>
      <div class="setting-row">
        <div>
          <div class="label">导出数据</div>
          <div class="desc">将错词本、练习记录、自定义词库导出为 JSON 文件</div>
        </div>
        <button class="btn-ghost" @click="doExport">导出</button>
      </div>
      <div class="setting-row">
        <div>
          <div class="label">导入数据</div>
          <div class="desc">从之前导出的 JSON 文件恢复数据</div>
        </div>
        <label class="btn-ghost">
          选择文件
          <input type="file" accept=".json,application/json" style="display: none" @change="onRestoreFile" />
        </label>
      </div>
      <p v-if="restoreMsg" class="msg">{{ restoreMsg }}</p>
    </div>

    <div class="setting-group">
      <h3>数据</h3>
      <div class="setting-row">
        <div>
          <div class="label">清空所有数据</div>
          <div class="desc">删除错词本、自定义词库与全部练习记录，不可恢复</div>
        </div>
        <button class="btn-danger" @click="clearData">清空</button>
      </div>
    </div>
  </div>
</template>
