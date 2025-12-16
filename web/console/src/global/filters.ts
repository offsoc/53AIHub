import { App } from 'vue'
import { getFormatTimeStamp, getSimpleDateFormatString } from '@/utils/moment'

const filters = {
  addCommasToNumber(number: number | string) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },
  formatTime(time: number) {
    return getFormatTimeStamp(time)
  },
  formatDate(time: number, format = 'YYYY-MM-DD hh:mm') {
    return getSimpleDateFormatString({
      date: time,
      format,
    })
  },
  formatSecret(secret: string) {
    return `${secret.slice(0, 4)}****${secret.slice(-4)}`
  },
} as const

// 定义过滤器类型
export type GlobalFilters = typeof filters

/**
 * 设置全局过滤器
 * @param app Vue 应用实例
 */
export function setupFilter(app: App) {
  app.config.globalProperties.$filters = filters
}
