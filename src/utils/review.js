// 记忆曲线复习（简化 SM-2 间隔重复）
// 每个错词条目维护：repetitions(连续答对次数)、interval(间隔天数)、easeFactor(难度系数)、dueDate(下次复习时间戳)

export const REVIEW_DEFAULTS = {
  repetitions: 0,
  interval: 0,
  easeFactor: 2.5,
  dueDate: 0
}

// 答对：更新复习状态
export function reviewSuccess(item) {
  const reps = (item.repetitions || 0) + 1
  let interval
  if (reps === 1) interval = 1
  else if (reps === 2) interval = 3
  else if (reps === 3) interval = 7
  else if (reps === 4) interval = 14
  else interval = Math.round((item.interval || 14) * (item.easeFactor || 2.5))
  const easeFactor = Math.max(1.3, (item.easeFactor || 2.5) + 0.1)
  return {
    repetitions: reps,
    interval,
    easeFactor,
    dueDate: Date.now() + interval * 24 * 60 * 60 * 1000
  }
}

// 答错：重置复习状态
export function reviewFail() {
  return {
    repetitions: 0,
    interval: 1,
    easeFactor: Math.max(1.3, 2.5 - 0.2),
    dueDate: Date.now() + 24 * 60 * 60 * 1000
  }
}

// 是否到期需要复习
export function isDue(item) {
  return !item.dueDate || item.dueDate <= Date.now()
}

// 格式化下次复习时间
export function formatDue(item) {
  if (!item.dueDate) return '待复习'
  const diff = item.dueDate - Date.now()
  if (diff <= 0) return '现在'
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days >= 1) return `${days} 天后`
  const hours = Math.floor(diff / (60 * 60 * 1000))
  if (hours >= 1) return `${hours} 小时后`
  const mins = Math.max(1, Math.floor(diff / (60 * 1000)))
  return `${mins} 分钟后`
}
