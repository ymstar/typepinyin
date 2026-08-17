// 26 键键盘指法数据
// 每个字母对应：hand（左手/右手）、finger（手指）、row（上/中/下行）

export const FINGERING_MAP = {
  q: { hand: 'left', finger: 'pinky', row: 'top' },
  w: { hand: 'left', finger: 'ring', row: 'top' },
  e: { hand: 'left', finger: 'middle', row: 'top' },
  r: { hand: 'left', finger: 'index', row: 'top' },
  t: { hand: 'left', finger: 'index', row: 'top' },
  y: { hand: 'right', finger: 'index', row: 'top' },
  u: { hand: 'right', finger: 'index', row: 'top' },
  i: { hand: 'right', finger: 'middle', row: 'top' },
  o: { hand: 'right', finger: 'ring', row: 'top' },
  p: { hand: 'right', finger: 'pinky', row: 'top' },

  a: { hand: 'left', finger: 'pinky', row: 'home' },
  s: { hand: 'left', finger: 'ring', row: 'home' },
  d: { hand: 'left', finger: 'middle', row: 'home' },
  f: { hand: 'left', finger: 'index', row: 'home' },
  g: { hand: 'left', finger: 'index', row: 'home' },
  h: { hand: 'right', finger: 'index', row: 'home' },
  j: { hand: 'right', finger: 'index', row: 'home' },
  k: { hand: 'right', finger: 'middle', row: 'home' },
  l: { hand: 'right', finger: 'ring', row: 'home' },

  z: { hand: 'left', finger: 'pinky', row: 'bottom' },
  x: { hand: 'left', finger: 'ring', row: 'bottom' },
  c: { hand: 'left', finger: 'middle', row: 'bottom' },
  v: { hand: 'left', finger: 'index', row: 'bottom' },
  b: { hand: 'left', finger: 'index', row: 'bottom' },
  n: { hand: 'right', finger: 'index', row: 'bottom' },
  m: { hand: 'right', finger: 'index', row: 'bottom' }
}

export const FINGERING_SCOPES = [
  { value: 'home', label: '基准键位（ASDF JKL）' },
  { value: 'top', label: '上行字母（QWERTY UIOP）' },
  { value: 'bottom', label: '下行字母（ZXCVBNM）' },
  { value: 'mixed', label: '混合字母（全部 26 键）' },
  { value: 'left', label: '左手专区' },
  { value: 'right', label: '右手专区' },
  { value: 'finger-pinky', label: '小指训练' },
  { value: 'finger-ring', label: '无名指训练' },
  { value: 'finger-middle', label: '中指训练' },
  { value: 'finger-index', label: '食指训练' }
]

const ROW_KEYS = {
  top: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  home: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  bottom: ['z', 'x', 'c', 'v', 'b', 'n', 'm']
}

const HAND_KEYS = {
  left: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'],
  right: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']
}

const FINGER_KEYS = {
  'left-pinky': ['q', 'a', 'z'],
  'left-ring': ['w', 's', 'x'],
  'left-middle': ['e', 'd', 'c'],
  'left-index': ['r', 't', 'f', 'g', 'v', 'b'],
  'right-index': ['y', 'u', 'h', 'j', 'n', 'm'],
  'right-middle': ['i', 'k'],
  'right-ring': ['o', 'l'],
  'right-pinky': ['p']
}

export const FINGER_LABELS = {
  pinky: '小指',
  ring: '无名指',
  middle: '中指',
  index: '食指'
}

export function getKeyMeta(char) {
  const c = String(char).toLowerCase()
  return FINGERING_MAP[c] || null
}

export function getFingeringKeys(scope) {
  if (scope === 'mixed') return Object.keys(FINGERING_MAP)
  if (scope === 'home') return [...ROW_KEYS.home]
  if (scope === 'top') return [...ROW_KEYS.top]
  if (scope === 'bottom') return [...ROW_KEYS.bottom]
  if (scope === 'left') return [...HAND_KEYS.left]
  if (scope === 'right') return [...HAND_KEYS.right]
  if (scope?.startsWith('finger-')) {
    const finger = scope.replace('finger-', '')
    const result = []
    for (const [combinedFinger, keys] of Object.entries(FINGER_KEYS)) {
      if (combinedFinger.split('-')[1] === finger) {
        result.push(...keys)
      }
    }
    return result
  }
  return [...ROW_KEYS.home]
}

// 根据当前输入，返回拼音/五笔下一个待输入的英文字母
export function nextExpectedChar(item, input) {
  if (!item) return ''
  const target = (item.pinyins?.[0] || item.wubiCodes?.[0] || '').toLowerCase()
  if (!target) return ''
  const idx = (input || '').length
  return target[idx] || ''
}

export function createDefaultFingeringStats() {
  const keys = {}
  const fingers = {}
  for (const k of Object.keys(FINGERING_MAP)) {
    keys[k] = { total: 0, wrong: 0 }
  }
  for (const fingerKey of Object.keys(FINGER_KEYS)) {
    fingers[fingerKey] = { total: 0, wrong: 0 }
  }
  return { keys, fingers }
}
