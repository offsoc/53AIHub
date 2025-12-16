import { copyToClip } from '@/utils/copy'

const handler = (el: any, binding: any) => {
  if (el._copyHandler) {
    el.removeEventListener('click', el._copyHandler)
    delete el._copyHandler
  }
  el._copyHandler = () => {
    copyToClip(binding.value)
      .then(() => {
        ElMessage.success(window.$i18nT('action.copy_success'))
      })
  }
  el.addEventListener('click', el._copyHandler)
}
export default {
  mounted: handler,
  updated: handler,
}
