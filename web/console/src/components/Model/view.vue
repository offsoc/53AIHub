<template>
  <div class="model-display">
    <div v-if="isLoading" class="flex items-center gap-2">
      <div class="w-5 h-5 flex items-center justify-center animate-spin">
        <el-icon size="12px" color="#999">
          <Loading />
        </el-icon>
      </div>
    </div>
    <div v-else-if="modelInfo" class="flex items-center gap-2">
      <img
        v-if="modelInfo.icon"
        :src="modelInfo.icon"
        :alt="modelInfo.label"
        class="w-5 h-5 object-contain"
        @error="handleImageError"
      />
      <span class="text-sm text-gray-700 whitespace-nowrap">{{ modelInfo.label }}</span>
    </div>
    <div v-else class="flex items-center gap-2">
      <div class="w-5 h-5 bg-gray-200 rounded flex items-center justify-center" v-if="showIcon">
        <el-icon size="12px" color="#999">
          <QuestionFilled />
        </el-icon>
      </div>
      <span class="text-sm text-gray-500 whitespace-nowrap">{{ '已删除' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { QuestionFilled, Loading } from '@element-plus/icons-vue'
import { loadModels } from './index'

interface ModelInfo {
  icon: string
  label: string
  value: string
}

interface Props {
  channelId: string | number
  model: string
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  channelId: '',
  model: '',
  showIcon: true,
})

const modelInfo = ref<ModelInfo | null>(null)
const isLoading = ref(true)

// 计算模型信息的组合值
const modelValue = computed(() => {
  if (props.channelId && props.model) {
    return `${props.channelId}_${props.model}`
  }
  return ''
})

// 加载模型信息
const loadModelInfo = async () => {
  if (!props.channelId || !props.model) {
    modelInfo.value = null
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    const modelList = await loadModels()

    // 在所有渠道中查找匹配的模型
    for (const channel of modelList) {
      const matchedOption = channel.options?.find(option => option.value === modelValue.value)

      if (matchedOption) {
        modelInfo.value = {
          icon: matchedOption.icon,
          label: matchedOption.label,
          value: matchedOption.value,
        }
        break
      }
    }

    // 如果没有找到完全匹配的，尝试只匹配模型名称
    if (!modelInfo.value) {
      for (const channel of modelList) {
        const matchedOption = channel.options?.find(option => {
          // 从 option.value 中提取模型名称进行比较
          const parts = option.value.split('_')
          const modelName = parts[1] // 第二部分是模型名称
          return modelName === props.model
        })

        if (matchedOption) {
          modelInfo.value = {
            icon: matchedOption.icon,
            label: matchedOption.label,
            value: matchedOption.value,
          }
          break
        }
      }
    }
  } catch (error) {
    console.error('Failed to load model info:', error)
    modelInfo.value = null
  } finally {
    isLoading.value = false
  }
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 监听参数变化
watch(
  [() => props.channelId, () => props.model],
  () => {
    loadModelInfo()
  },
  { immediate: true }
)

onMounted(() => {
  loadModelInfo()
})
</script>

<style scoped>
.model-display {
  display: inline-flex;
  align-items: center;
}
</style>
