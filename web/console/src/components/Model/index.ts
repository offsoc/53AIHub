import channelApi, { transformSelectData } from '@/api/modules/channel/index'
import cache from '@/utils/cache'

export const loadModels = (type?: string): Promise<any[]> => {
  return cache.getOrFetch(`modelList_${type}`, () =>
    channelApi.listv2().then(res => {
      const modelList = res.map(item => transformSelectData(item, type))
      return modelList
    })
  )
}

// 导出组件
export { default as ModelView } from './view.vue'
export { default as ModelSelect } from './select.vue'
