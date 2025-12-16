<template>
  <div class="h-full flex relative" ref="containerRef" :class="{ 'select-none': isResizing }">
    <template v-for="(item, index) in tab.browsers" :key="item.id">
      <Browser
        class="flex-1"
        :style="{ flexBasis: item.width ? item.width + '%' : '0%' }"
        :parent="tab"
        :tab="item"
      />
      <!-- webview 会导致mousemove无法执行，所以要添加一层遮罩 -->
      <div class="absolute inset-0" v-if="isResizing"></div>
      <div
        v-if="index < tab.browsers.length - 1"
        class="w-1 hover:bg-blue-400 cursor-col-resize relative z-10"
        @mousedown="handleStartResize($event, index, tab)"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Browser from './Browser.vue'

const props = withDefaults(
  defineProps<{
    tab: Browser.Tab
  }>(),
  {
    tab: () => ({})
  }
)

const containerRef = ref<HTMLElement | null>(null)

// 添加拖拽相关的状态和方法
const isResizing = ref(false)
const currentResizeIndex = ref(-1)
const currentResizeTab = ref(null)
const startX = ref(0)

const handleStartResize = (e: MouseEvent, index: number, tab: any) => {
  e.preventDefault() // 添加防止默认行为

  isResizing.value = true
  currentResizeIndex.value = index
  currentResizeTab.value = tab
  startX.value = e.clientX
  document.body.style.cursor = 'col-resize'

  // 添加全局事件监听
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value || !currentResizeTab.value) return
  e.preventDefault() // 添加防止默认行为
  console.log(e)
  // 使用 requestAnimationFrame 来优化性能

  const dx = e.clientX - startX.value
  const container = containerRef.value
  if (!container) return

  const totalWidth = container.offsetWidth
  const browsers = currentResizeTab.value.browsers

  // 计算新的宽度百分比
  const leftBrowser = browsers[currentResizeIndex.value]
  const rightBrowser = browsers[currentResizeIndex.value + 1]

  const leftWidth = leftBrowser.width || 100 / browsers.length
  const rightWidth = rightBrowser.width || 100 / browsers.length

  const deltaPercent = (dx / totalWidth) * 100

  // 确保最小宽度为20%
  const minWidth = 20
  const newLeftWidth = Math.min(Math.max(leftWidth + deltaPercent, minWidth), 100 - minWidth)
  const newRightWidth = Math.min(Math.max(rightWidth - deltaPercent, minWidth), 100 - minWidth)

  leftBrowser.width = newLeftWidth
  rightBrowser.width = newRightWidth

  startX.value = e.clientX
}

const stopResize = () => {
  isResizing.value = false
  currentResizeIndex.value = -1
  currentResizeTab.value = null
  document.body.style.cursor = ''

  // 移除全局事件监听
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
}
</script>

<style>
</style>
