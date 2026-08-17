// 练习结果分享：文本文案 + Canvas 分享卡片

const MODE_LABELS = {
  char: '单字',
  word: '词组',
  article: '文章',
  wrong: '错词复习',
  pinyin: '拼音专项',
  wubi: '五笔',
  custom: '自定义',
  fingering: '指法'
}

export function modeLabel(mode) {
  return MODE_LABELS[mode] || mode
}

// 生成文本分享文案
export function buildShareText(r) {
  const lines = [
    '【TypePinyin 打字练习】',
    `模式：${modeLabel(r.mode)}`,
    `速度：${r.wpm} 字/分`,
    `正确率：${r.accuracy}%`,
    `总字数：${r.total} · 打错：${r.wrong}`,
    `用时：${r.duration}s`,
    `日期：${new Date(r.date).toLocaleString('zh-CN')}`,
    '一次敲击，一点进步。'
  ]
  return lines.join('\n')
}

// 绘制分享卡片，返回 dataURL（PNG）
export function renderShareImage(r) {
  const W = 1200
  const H = 630
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // 背景
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1e1e2e')
  bg.addColorStop(1, '#2a2a3e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 顶部装饰线
  ctx.fillStyle = '#f9e2af'
  ctx.fillRect(0, 0, W, 8)

  // 标题
  ctx.fillStyle = '#f9e2af'
  ctx.font = 'bold 56px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('TypePinyin · 中文拼音打字练习', W / 2, 110)

  // 模式标签
  ctx.fillStyle = '#a6adc8'
  ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(`模式：${modeLabel(r.mode)}`, W / 2, 170)

  // 主数据：速度
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 120px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(String(r.wpm), W / 2 - 200, 330)
  ctx.fillStyle = '#a6adc8'
  ctx.font = '32px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('字/分', W / 2 - 200, 380)

  // 主数据：正确率
  ctx.fillStyle = '#a6e3a1'
  ctx.font = 'bold 120px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(r.accuracy + '%', W / 2 + 200, 330)
  ctx.fillStyle = '#a6adc8'
  ctx.font = '32px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('正确率', W / 2 + 200, 380)

  // 分隔线
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(120, 440)
  ctx.lineTo(W - 120, 440)
  ctx.stroke()

  // 底部信息
  ctx.fillStyle = '#cdd6f4'
  ctx.font = '30px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(`总字数 ${r.total} · 打错 ${r.wrong} · 用时 ${r.duration}s`, W / 2, 500)

  ctx.fillStyle = '#a6adc8'
  ctx.font = '26px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(new Date(r.date).toLocaleString('zh-CN'), W / 2, 550)

  // 底部 slogan
  ctx.fillStyle = '#f9e2af'
  ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('一次敲击，一点进步', W / 2, 600)

  return canvas.toDataURL('image/png')
}
