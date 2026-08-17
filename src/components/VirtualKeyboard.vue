<script setup>
import { computed } from 'vue'
import { FINGERING_MAP, FINGER_LABELS } from '../data/fingering'

const props = defineProps({
  target: { type: String, default: '' },
  hint: { type: Object, default: null }
})

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
]

const hintText = computed(() => {
  if (!props.hint) return ''
  const handLabel = props.hint.hand === 'left' ? '左手' : '右手'
  const fingerLabel = FINGER_LABELS[props.hint.finger] || props.hint.finger
  return `${handLabel} ${fingerLabel}`
})

function keyClass(key) {
  const meta = FINGERING_MAP[key]
  const classes = ['keyboard-key']
  if (meta) {
    classes.push(`hand-${meta.hand}`)
    classes.push(`finger-${meta.finger}`)
  }
  if (props.target && key === props.target.toLowerCase()) {
    classes.push('target')
  }
  return classes.join(' ')
}
</script>

<template>
  <div class="keyboard">
    <div v-for="(row, i) in ROWS" :key="i" class="keyboard-row">
      <div
        v-for="k in row"
        :key="k"
        :class="keyClass(k)"
      >
        {{ k }}
      </div>
    </div>
    <div v-if="hintText" class="keyboard-hint">
      请用 <strong>{{ hintText }}</strong> 按下高亮键位
    </div>
    <div v-else-if="target" class="keyboard-hint">
      目标键位：<strong>{{ target.toUpperCase() }}</strong>
    </div>
  </div>
</template>
