<script setup lang="ts">
import { computed, onMounted, ref, getCurrentInstance } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { useZIndex } from 'element-plus'

// 移除未使用的 ElMessage 导入
const { proxy: _this } = getCurrentInstance()

// 优化 Props 类型定义
interface FullscreenProps {
  target?: string | HTMLElement
  flex?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<FullscreenProps>(), {
  target: 'body',
  flex: false,
  zIndex: 0
})

const emits = defineEmits<{
  (e: 'zoom', value: boolean): void
}>()

const { nextZIndex } = useZIndex()

const contentRef = ref<HTMLElement>()
const isopen = ref(false)
const nodeHeight = ref(0)
const zIndex = ref(0)

const containerClasses = computed(() => ({
  'content-container': true,
  'bg-black bg-opacity-25 overflow-y-auto': isopen.value,
  'content-flex': props.flex,
  [_this.$attrs.class as string]: !!_this.$attrs.class
}))
const handler = () => {
  isopen.value = !isopen.value
  if (isopen.value && !props.zIndex) zIndex.value = nextZIndex()

  emits('zoom', isopen.value)
}

onMounted(() => {
  useResizeObserver(contentRef, ([entry]) => {
    nodeHeight.value = entry.target.scrollHeight
  })
})
</script>

<template>
  <Teleport :to="target" :disabled="!isopen">
    <div ref="contentRef" :class="containerClasses" :style="{ zIndex }">
      <slot :isopen="isopen" :handler="handler" />
    </div>
  </Teleport>
  <div v-if="isopen" :style="{ height: `${nodeHeight}px` }" />
</template>

<style scoped>
.content-container {
  position: absolute;
  inset: 0;
  padding: 16px;
  background: rgb(0 0 0 / 25%);
}

.content-container:deep(> *) {
  width: 100%;
  height: 100%;
  background-color: #fff;
  margin: 0;
}

.content-flex {
  display: flex;
  overflow: hidden;
  flex: 1;
}

.content-flex:deep(> *) {
  flex: 1;
}
</style>
