<template>
  <Sortable
    class="flex items-center gap-1.5 drag py-1.5 px-2"
    identity="id"
    ref="sortableRef"
    :props="{
      handle: '.sort-icon',
      filter: '.filtered',
      animation: 150,
      onMove: function (event) {
        // 获取目标位置的索引
        const newIndex = '' + event.related.dataset.index
        // 禁止移动到第一个或最后一个位置
        if (newIndex === '0' || newIndex === '-1') {
          return false // 阻止移动
        }
        return true // 允许移动
      }
    }"
    v-model="tabsStore.tabs"
  >
    <template #item="{ item, index }">
      <div
        class="flex-1 h-7 flex items-center gap-2 px-2 rounded-md max-w-50 min-w-[28px] cursor-pointer relative select-none no-drag group"
        :data-index="index"
        :class="[
          activeTabId === item.id
            ? 'bg-[#FFFFFF] text-[#1D1E1F] rounded-b-none'
            : 'text-[#182B50] hover:bg-[#CCD0D5]'
        ]"
        @click="tabsStore.setActive(item.id)"
        :draggable="['index', 'setting'].includes(item.id) ? false : true"
        @dragstart="handleDragStart($event, item)"
        @dragend="handleDragEnd($event, item)"
      >
        <div class="flex items-center gap-2 overflow-hidden flex-grow">
          <div
            class="size-4 flex-center overflow-hidden transition-all duration-300"
            :class="[['index'].includes(item.id) ? 'filtered' : 'sort-icon']"
          >
            <el-icon v-if="item.loading === 'loading'" class="animate-spin" size="14">
              <Loading />
            </el-icon>
            <img v-else-if="item.icon" class="size-4" :src="item.icon" />
            <svg-icon v-else name="tab" color="#666666"></svg-icon>
          </div>
          <div
            class="text-xs text-#182B50 flex-1 truncate overflow-hidden transition-all duration-300"
            :class="[['index'].includes(item.id) ? 'filtered' : 'sort-icon']"
          >
            {{ item.title }}
          </div>
        </div>
        <div
          v-if="item.closable"
          class="size-4 flex-center rounded-full hover:bg-[#DDDDDE] shrink-0"
          @click.stop="tabsStore.closeTab(item.id)"
        >
          ×
        </div>

        <!-- 左右竖线 -->
        <div
          class="absolute -left-[4px] top-1.5 w-0.5 h-4 bg-[#CECECE] group-hover:bg-[#F0F0F0] group-hover:z-10"
          :class="[activeTabId === item.id ? 'bg-[#F0F0F0] z-10' : '']"
          v-if="index > 0"
        ></div>
        <div
          class="absolute -right-[4px] top-1.5 w-0.5 h-4 bg-[#CECECE] group-hover:bg-[#F0F0F0] group-hover:z-10"
          :class="[activeTabId === item.id ? 'bg-[#F0F0F0] z-10' : '']"
        ></div>
        <!-- 底部边角 -->
        <div
          v-if="activeTabId === item.id"
          class="absolute left-0 right-0 -bottom-1.5 h-1.5 bg-white"
        >
          <div class="absolute -left-2 bottom-0 size-2 bg-[#fff] overflow-hidden">
            <div class="absolute right-0 bottom-0 size-4 bg-[#F0F0F0] rounded-full"></div>
          </div>
          <div class="absolute -right-2 bottom-0 size-2 bg-[#fff] overflow-hidden">
            <div class="absolute left-0 bottom-0 size-4 bg-[#F0F0F0] rounded-full"></div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div
        class="flex-none size-7 flex-center cursor-pointer rounded-full hover:bg-[#A8C7FA] no-drag filtered"
        data-index="-1"
        @click="handleAddTab"
      >
        <el-icon color="#474747" size="14">
          <Plus />
        </el-icon>
      </div>
    </template>
  </Sortable>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus, Loading } from '@element-plus/icons-vue'
import Sortable from '@/components/Sortable/index.vue'

import { useTabsStore } from '../stores/tabs'
import { useBrowserSettingStore } from '@/stores/modules/browser-setting.ts'

// 替换原有的响应式变量
const tabsStore = useTabsStore()
const settingStore = useBrowserSettingStore()

const sortableRef = ref()

const activeTabId = computed({
  get: () => tabsStore.activeId,
  set: (val) => tabsStore.setActive(val)
})

const handleAddTab = () => {
  tabsStore.addTab({
    title: window.$t('browser.newTab'),
    closable: true,
    url: '',
    defaultUrl: settingStore.default_tab_url
  })
}

// 添加 handleDragStart 函数
const handleDragStart = (e: DragEvent, item: Browser.Tab) => {
  if (e.dataTransfer) {
    // 设置拖拽数据，这样其他应用或窗口可以接收这些数据
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        id: item.id,
        title: item.title,
        url: item.url || item.defaultUrl
      })
    )

    // 设置允许的效果
    e.dataTransfer.effectAllowed = 'copy'
    // // 可选：设置自定义拖动图像
    // if (item.icon) {
    //   const img = new Image()
    //   img.src = item.icon
    //   e.dataTransfer.setDragImage(img, 10, 10)
    // }
  }
}
const handleDragEnd = (e: Event, item: Browser.Tab) => {
  // 获取窗口尺寸
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // 获取鼠标位置
  const mouseX = e.clientX
  const mouseY = e.clientY

  const sortableElement = sortableRef.value?.$el

  // 判断鼠标是否在窗口外
  const isOutsideBrowser =
    mouseX <= 0 || mouseY <= 0 || mouseX >= windowWidth || mouseY >= windowHeight

  const isOutsideSortable = sortableElement
    ? !sortableElement.contains(document.elementFromPoint(mouseX, mouseY))
    : false
  if (isOutsideBrowser || isOutsideSortable) {
    console.log('元素被拖放到浏览器外部', {
      item,
      position: { x: mouseX, y: mouseY }
    })
    // new-window
    window.$chat53ai.$win({
      type: 'new-window',
      data: {
        title: item.title,
        url: encodeURIComponent(item.url || item.defaultUrl)
      }
    })

    tabsStore.closeTab(item.id)

    // 在这里处理元素被拖放到浏览器外的逻辑
    // 例如：创建新窗口、发送到其他应用等

    // 如果是Electron应用，可以通过IPC发送消息给主进程
    // if (window.electron) {
    //   console.log('haha')
    //   // window.electron.ipcRenderer.send('tab-dragged-outside', {
    //   //   tabData: {
    //   //     id: item.id,
    //   //     title: item.title,
    //   //     url: item.url || item.defaultUrl
    //   //   },
    //   //   position: { x: mouseX, y: mouseY }
    //   // })
    // }
  } else {
    console.log('元素在浏览器内部拖放完成')
  }
}

// 事件监听

onMounted(() => {})
</script>

<style scoped></style>
