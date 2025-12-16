<template>
  <ElDialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    width="600px"
    destroy-on-close
    append-to-body
  >
    <div
      class="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
    >
      <!-- 模型列表 -->
      <div v-for="platform in modelList" :key="platform.channel_id" class="mb-4 last:mb-0">
        <!-- 平台标题 -->
        <div class="h-9 flex items-center mb-0.5">
          <span class="text-sm font-medium text-[#4F5052]">{{ platform.label }}</span>
        </div>

        <!-- 模型列表 -->
        <div class="space-y-1">
          <div v-for="model in platform.options" :key="model.model_value" class="h-8 flex items-center justify-between">
            <div class="flex items-center flex-1">
              <img :src="model.icon" :alt="model.label" class="size-5 mr-2" />
              <span class="text-sm text-[#1D1E1F]">{{ model.label }}</span>
            </div>
            <el-switch
              v-model="selectedModels[model.model_value]"
              size="small"
              @change="onModelToggle(model.model_value, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="handleCancel">{{ $t('action_cancel') }}</el-button>
      <el-button type="primary" @click="handleConfirm">{{ $t('action_confirm') }}</el-button>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'

import { loadModels } from './index'
import { ModelUseType, MODEL_USE_TYPE } from '@/constants/platform/config'

// 定义类型
interface ModelOption {
  model_value: string
  value: string
  label: string
  icon: string
}

interface PlatformItem {
  channel_id: number
  label: string
  icon: string
  options: ModelOption[]
}

const props = withDefaults(
  defineProps<{
    type?: ModelUseType
    defaultSelected?: string[] // 默认选中的模型
  }>(),
  {
    type: MODEL_USE_TYPE.REASONING,
    defaultSelected: () => [],
  }
)

const emit = defineEmits<{
  (e: 'confirm', selectedModels: string[]): void
  (e: 'cancel'): void
}>()

const visible = ref(false)
const title = ref('逻辑推理模型')
const modelList = ref<PlatformItem[]>([])
const selectedModels = reactive<Record<string, boolean>>({})

// 初始化选中状态
const initializeSelectedModels = () => {
  // 清空之前的状态
  Object.keys(selectedModels).forEach(key => {
    delete selectedModels[key]
  })
  // 设置默认选中状态
  modelList.value.forEach(platform => {
    platform.options.forEach(model => {
      selectedModels[model.model_value] = props.defaultSelected.includes(model.model_value)
    })
  })
}

// 加载模型列表
const loadModelList = async () => {
  try {
    const models = await loadModels(MODEL_USE_TYPE[props.type])
    modelList.value = models

    // 初始化选中状态
    initializeSelectedModels()
  } catch (error) {
    console.error('Failed to load models:', error)
    ElMessage.error('加载模型列表失败')
  }
}

// 打开对话框
const open = () => {
  visible.value = true
  loadModelList()
}

// 关闭对话框
const close = () => {
  visible.value = false
}

// 模型开关切换
const onModelToggle = (modelValue: string, isSelected: boolean) => {
  selectedModels[modelValue] = isSelected
}

// 获取选中的模型列表
const getSelectedModels = (): string[] => {
  return Object.keys(selectedModels).filter(key => selectedModels[key])
}

// 确认选择
const handleConfirm = () => {
  const selected = getSelectedModels()
  emit('confirm', selected)
  close()
}

// 取消选择
const handleCancel = () => {
  emit('cancel')
  close()
}

onMounted(() => {
  // 组件挂载时不自动加载，等待调用 open 方法
})

defineExpose({
  open,
  close,
})
</script>

<style scoped>
/* 开关样式优化 */
:deep(.el-switch) {
  --el-switch-on-color: #409eff;
  --el-switch-off-color: #c0c4cc;
}

:deep(.el-switch__core) {
  border: 1px solid #dcdfe6;
}
</style>
