import { createApp } from 'vue'
import { ElTooltip } from 'element-plus'
import type { DirectiveBinding } from 'vue'

const destroyTooltip = (el: any) => {
  if (el._tipapp) {
    el._tipapp.unmount()
    el._tiproot && el._tiproot.remove()
    el._tipapp = null
    el._tiproot = null
  }
}
/**
 * 创建tooltip，这里采用element-plus的tooltip组件
 * @param el
 * @param binding
 */
const createTooltip = (el: any, binding: DirectiveBinding) => {
  /**
   * 判断是否显示tooltip
   * 如果传值为true，则显示tooltip
   * 否则，autoShowToolTip 自动判断是否显示tooltip
   */
  // 获取指令绑定的值
  const bindingValue = binding.value || {}
  // 判断是否显示tooltip
  const isShow = typeof bindingValue === 'object' ? true : autoShowToolTip(el, binding)

  destroyTooltip(el)
  // 创建组件，显示tooltip
  if (isShow) {
    // 判断是否有根元素，存在，则移除
    const elRoot = document.querySelector('#agenthub_tooltip_root')
    if (elRoot)
      elRoot.remove()

    // 初始化 根元素
    el._tiproot = null
    el._tipapp = null
    const id = 'agenthub_tooltip_root'
    const _tiproot = document.createElement('div')
    _tiproot.id = id
    _tiproot.classList.add('_tiproot')

    // 获取配置参数
    const content = typeof bindingValue === 'object' && bindingValue.content ? bindingValue.content : el.innerHTML
    const placement = typeof bindingValue === 'object' && bindingValue.placement ? bindingValue.placement : 'top'
    const effect = typeof bindingValue === 'object' && bindingValue.effect ? bindingValue.effect : 'dark'
    const trigger = typeof bindingValue === 'object' && bindingValue.trigger ? bindingValue.trigger : 'hover'

    // 通过createApp 创建实例组件
    const _tipapp = createApp(ElTooltip, {
      trigger,
      virtualRef: el,
      rawContent: true,
      placement,
      effect,
      virtualTriggering: true,
      content,
    })

    el._tiproot = _tiproot
    el._tipapp = _tipapp
    // body添加根元素
    document.body.appendChild(_tiproot)
    // 将新组件挂载到根元素
    if (_tipapp && _tiproot)
      el._tipapp.mount(`#${id}`)
  }
}

/**
 * 判断宽度和高度是否自动展示提示内容
 * @param el
 * @param binding
 * @returns
 */
const autoShowToolTip = (el: any, binding: DirectiveBinding) => {
  /**
   * 通过创建range 获取元素内容的宽度和高度
   */
  const range = document.createRange()
  range.setStart(el, 0)
  if (el && el.childNodes.length)
    range.setEnd(el, el.childNodes.length)

  let rangeWidth = range.getBoundingClientRect().width
  let rangeHeight = range.getBoundingClientRect().height
  const offsetWidth = rangeWidth - Math.floor(rangeWidth)
  const offsetHeight = rangeHeight - Math.floor(rangeHeight)
  if (offsetWidth < 0.001)
    rangeWidth = Math.floor(rangeWidth)

  if (offsetHeight < 0.001)
    rangeHeight = Math.floor(rangeHeight)

  // 计算元素在页面中的宽度、高度
  const style: any = window.getComputedStyle(el, null)
  const maxWidth = parseInt(style.maxWidth) || parseInt(style.width || style.width) || 0
  const maxHeight = parseInt(style.height)
  // 获取元素的padding
  const pLeft = style['padding-left']
  const pRight = style['padding-right']
  const pTop = style['padding-top']
  const pBottom = style['padding-bottom']
  // 计算最终宽度、高度
  const finalWidth = rangeWidth + parseInt(pLeft) + parseInt(pRight)
  const finalHeight = rangeHeight + parseInt(pTop) + parseInt(pBottom)

  if (finalWidth > maxWidth || finalHeight > maxHeight)
    return true

  return false
}

/**
 * 指令 tooltip
 * 使用方式：
 * <div v-tooltip></div>                           - 自动判断是否显示
 * <div v-tooltip="true"></div>                    - 强制显示
 * <div v-tooltip="{ content: '自定义内容' }"></div> - 自定义内容
 * <div v-tooltip="{ placement: 'bottom', effect: 'light', trigger: 'click', content: '自定义内容' }"></div> - 完整配置
 */
export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    createTooltip(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    createTooltip(el, binding)
  },
  unmounted(el: HTMLElement) {
    destroyTooltip(el)
  },
}
