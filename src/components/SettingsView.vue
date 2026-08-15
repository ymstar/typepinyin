<script setup>
import { useStore, resetAllData } from '../store/useStore'

const store = useStore()

function toggle(key) {
  store.settings[key] = !store.settings[key]
}

function clearData() {
  resetAllData()
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
      <h3>数据</h3>
      <div class="setting-row">
        <div>
          <div class="label">清空所有数据</div>
          <div class="desc">删除错词本与全部练习记录，不可恢复</div>
        </div>
        <button class="btn-danger" @click="clearData">清空</button>
      </div>
    </div>
  </div>
</template>
