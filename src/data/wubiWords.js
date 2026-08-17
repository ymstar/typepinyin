// 五笔 86 版词组码表（基于单字码表按词组编码规则生成）
// 规则：二字词=前两字各取前两码；三字词=前两字首码+第三字前两码；
//       四字词=每字首码；多字词=前三字首码+末字首码
import wubi86 from './wubi86'
import { getWordPool } from './words'

function getFullCode(char) {
  const codes = wubi86[char]
  if (!codes) return ''
  const parts = codes.split(',')
  return parts[parts.length - 1]
}

function wordCode(word) {
  const chars = word.split('')
  const codes = chars.map(getFullCode)
  if (codes.some((c) => !c)) return null
  if (chars.length === 2) return codes[0].slice(0, 2) + codes[1].slice(0, 2)
  if (chars.length === 3) return codes[0][0] + codes[1][0] + codes[2].slice(0, 2)
  if (chars.length === 4) return codes.map((c) => c[0]).join('')
  return codes[0][0] + codes[1][0] + codes[2][0] + codes[codes.length - 1][0]
}

// 常用三字 / 四字 / 多字词
const EXTRA_WORDS = [
  '计算机', '互联网', '图书馆', '办公室', '会议室', '火车站', '飞机场', '幼儿园', '博物馆', '体育馆',
  '实验室', '教学楼', '宿舍楼', '电影院', '音乐厅', '美术馆', '科技馆', '动物园', '植物园', '游乐园',
  '对不起', '没关系', '谢谢你', '不客气', '辛苦了', '没问题', '不知道', '为什么', '怎么样', '怎么办',
  '中华人民共和国', '社会主义', '现代化', '改革开放', '市场经济', '科学技术', '人工智能', '大数据', '云计算', '物联网',
  '一带一路', '共同富裕', '高质量发展', '科技创新', '数字经济', '绿色发展', '乡村振兴', '文化自信', '民族复兴', '中国梦'
]

const WORDS = [...new Set([...getWordPool(), ...EXTRA_WORDS])]

const wubiWords = {}
for (const w of WORDS) {
  const code = wordCode(w)
  if (code) wubiWords[w] = code
}

export default wubiWords
