// 易错拼音分组：用于错误类型细分与专项练习
// 每个分组包含一组易混淆的拼音片段（声母/韵母）

export const PINYIN_GROUPS = [
  {
    id: 'flat-retroflex',
    name: '平翘舌音',
    desc: 'z/zh、c/ch、s/sh 混淆',
    pairs: [
      ['z', 'zh'],
      ['c', 'ch'],
      ['s', 'sh']
    ]
  },
  {
    id: 'nasal',
    name: '前后鼻音',
    desc: 'an/ang、en/eng、in/ing 等混淆',
    pairs: [
      ['an', 'ang'],
      ['en', 'eng'],
      ['in', 'ing'],
      ['un', 'ong'],
      ['ian', 'iang'],
      ['uan', 'uang']
    ]
  },
  {
    id: 'l-n',
    name: 'l / n 混淆',
    desc: '声母 l 与 n 混淆',
    pairs: [['l', 'n']]
  },
  {
    id: 'f-h',
    name: 'f / h 混淆',
    desc: '声母 f 与 h 混淆',
    pairs: [['f', 'h']]
  },
  {
    id: 'r-l',
    name: 'r / l 混淆',
    desc: '声母 r 与 l 混淆',
    pairs: [['r', 'l']]
  }
]

// 分析错误类型：correct 为正确拼音，wrong 为用户输入的错误拼音
// 返回 { group, from, to } 或 null
export function analyzePinyinError(correct, wrong) {
  if (!correct || !wrong) return null
  for (const group of PINYIN_GROUPS) {
    for (const [a, b] of group.pairs) {
      if (correct.includes(a) && wrong.includes(b)) {
        return { group, from: a, to: b }
      }
      if (correct.includes(b) && wrong.includes(a)) {
        return { group, from: b, to: a }
      }
    }
  }
  return null
}

// 判断某个拼音是否属于某分组（用于专项练习选字）
export function pinyinInGroup(pinyinStr, group) {
  for (const [a, b] of group.pairs) {
    if (pinyinStr.includes(a) || pinyinStr.includes(b)) return true
  }
  return false
}
