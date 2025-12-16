<template>
  <el-popover
    ref="popoverRef"
    placement="right-end"
    popper-class="!p-0"
    trigger="click"
    :teleported="teleported"
    :width="260"
    :append-to="appendTo"
  >
    <div class="flex flex-col gap-0.5 px-1 py-1.5">
      <template v-for="opt in roleOptions" :key="opt.value">
        <div v-if="opt.color" class="border-t my-1"></div>
        <button
          type="button"
          class="relative px-3 py-2 rounded hover:bg-[#2563EB14] text-left"
          :class="[currentValue === opt.value ? 'bg-[#2563EB14]' : '']"
          @click="handleSelect(opt.value)"
        >
          <div
            v-if="currentValue === opt.value"
            class="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-4 rounded-full bg-[#2563EB]"
          ></div>
          <div class="text-sm" :class="[opt.color ? `text-[${opt.color}]` : 'text-[#1D1E1F]']">
            {{ opt.title }}
          </div>
          <div v-if="opt.desc" class="text-xs text-[#939499]">{{ opt.desc }}</div>
        </button>
      </template>
    </div>
    <template #reference>
      <el-button :link="link" :type="type" :disabled="disabled">
        <span class="text-sm">{{ displayLabel }}</span>
        <el-icon v-if="!disabled" class="ml-1"><ArrowDown /></el-icon>
      </el-button>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
// 权限选择下拉组件，用于选择不同的权限级别
import { computed, type ComputedRef, ref } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import type { ElButton, ElPopover } from 'element-plus';
import { PERMISSION_TYPE, type PermissionType, RESOURCE_TYPE, ResourceType } from './constant';

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    resourceType?: ResourceType
    link?: boolean
    type?: (typeof ElButton)['type']
    inherit?: boolean
    none?: boolean
    remove?: boolean
    disabled?: boolean
    teleported?: boolean
    appendTo?: string | HTMLElement
  }>(),
  {
    modelValue: '',
    resourceType: () => RESOURCE_TYPE.space,
    link: true,
    type: 'default',
    inherit: false,
    none: false,
    remove: false,
    disabled: false,
    teleported: true,
    appendTo: 'body',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: PermissionType): void
  (e: 'select', value: PermissionType): void
}>()

const popoverRef = ref<InstanceType<typeof ElPopover>>()

type RoleItem = { title: string; value: PermissionType; desc?: string; color?: string }
const roleOptions: ComputedRef<RoleItem[]> = computed(() => {
  let options = [
    {
      title: props.resourceType === RESOURCE_TYPE.space ? '继承团队空间权限' : '继承上级权限',
      desc: props.resourceType === RESOURCE_TYPE.space ? '继承团队空间权限' : '继承上级权限',
      value: PERMISSION_TYPE.inherit,
      color: '',
    },
    { title: '可管理', desc: '可编辑/下载/导出，添加成员', value: PERMISSION_TYPE.manage },
    { title: '可编辑知识&语料', desc: '可编辑知识和语料', value: PERMISSION_TYPE.edit_all },
    { title: '可编辑知识', desc: '编辑知识，不可编辑语料', value: PERMISSION_TYPE.edit_knowledge },
    { title: '可查看/导出', desc: '可查看及下载导出', value: PERMISSION_TYPE.view_and_export },
    { title: '仅查看', desc: '仅查看，不可下载导出', value: PERMISSION_TYPE.viewer },
    { title: '无权限', desc: '无权限，不可见', value: PERMISSION_TYPE.none, color: '' },
    { title: '移除', value: PERMISSION_TYPE.remove, color: '' },
  ]
  if (!props.inherit) {
    options = options.filter(o => o.value !== PERMISSION_TYPE.inherit)
  }
  if (!props.none) {
    options = options.filter(o => o.value !== PERMISSION_TYPE.none)
  }
  if (!props.remove) {
    options = options.filter(o => o.value !== PERMISSION_TYPE.remove)
  }

  const removeOption = options.find(o => o.value === PERMISSION_TYPE.remove)
  const noneOption = options.find(o => o.value === PERMISSION_TYPE.none)

  if (removeOption) {
    removeOption.color = '#FA5151'
  } else if (noneOption) {
    noneOption.color = '#FA5151'
  }
  return options
})

const currentValue = computed(() => props.modelValue)
const displayLabel = computed(() => roleOptions.value.find(o => o.value === currentValue.value)?.title || '')

const handleSelect = (value: PermissionType) => {
  emit('update:modelValue', value)
  emit('select', value)
  popoverRef.value?.hide()
}
</script>

<style scoped></style>
