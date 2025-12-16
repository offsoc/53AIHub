<template>
  <div class="inline-flex items-center">
    <!-- 加载状态 -->
    <template v-if="loading && showLoading">
      <el-skeleton
        v-if="mode === 'avatar'"
        :style="{ '--el-skeleton-circle-size': `${avatarSize}px`, height: `${avatarSize}px` }"
      >
        <template #template>
          <el-skeleton-item variant="circle" />
        </template>
      </el-skeleton>

      <el-skeleton v-else :rows="0" animated :style="{ width: '80px', height: '20px' }" />
    </template>

    <!-- 显示实体头像 -->
    <div v-else-if="mode === 'avatar'" class="inline-flex items-center">
      <el-avatar
        v-if="entityInfo?.avatar"
        :src="String(entityInfo.avatar)"
        :size="Number(avatarSize)"
        :shape="avatarShape"
      />
      <el-avatar
        v-else
        :src="defaultAvatarUrl"
        :size="Number(avatarSize)"
        :shape="avatarShape"
        style="--el-avatar-bg-color: transparent"
      />
    </div>

    <!-- 显示实体名称 -->
    <span v-else-if="mode === 'name'" class="text-sm text-gray-600">
      {{ displayName }}
    </span>

    <!-- 完整显示模式（头像 + 名称） -->
    <div v-else-if="mode === 'full'" class="inline-flex items-center gap-2">
      <el-avatar
        v-if="entityInfo?.avatar"
        :src="String(entityInfo.avatar)"
        :size="Number(avatarSize)"
        :shape="avatarShape"
      />
      <el-avatar
        v-else
        :src="defaultAvatarUrl"
        :size="Number(avatarSize)"
        :shape="avatarShape"
        style="--el-avatar-bg-color: transparent"
      />
      <span class="text-sm text-gray-600">{{ displayName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEntityInfo } from '@/hooks/useEntityInfo'
import type { EntityType, EntityInfo } from '@/types/entity'
import { ENTITY_TYPE } from '@/types/entity'

interface Props {
  /** 实体类型：user | group */
  type?: EntityType
  /** 实体ID */
  id: number | string
  /** 显示模式：avatar | name | full */
  mode?: 'avatar' | 'name' | 'full'
  /** 头像大小 */
  avatarSize?: number | string
  /** 头像形状 */
  avatarShape?: 'circle' | 'square'
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 自定义默认头像路径 */
  defaultAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: ENTITY_TYPE.USER,
  mode: 'avatar',
  avatarSize: 20,
  avatarShape: 'circle',
  showLoading: true,
  defaultAvatar: ''
})

const { getEntityInfo, loading } = useEntityInfo()

const entityInfo = ref<EntityInfo | null>(null)

/**
 * 计算默认头像URL
 */
const defaultAvatarUrl = computed(() => {
  if (props.defaultAvatar) {
    return props.defaultAvatar
  }

  // 根据实体类型返回默认头像
  const defaultAvatars = {
    [ENTITY_TYPE.USER]: '/images/space/people.png',
    [ENTITY_TYPE.GROUP]: '/images/space/group.png'
  }

  const avatarPath = defaultAvatars[props.type] || '/images/space/people.png'
  
  // 使用全局方法获取真实路径
  if (typeof window !== 'undefined' && window.$getRealPath) {
    return window.$getRealPath({ url: avatarPath })
  }
  
  return avatarPath
})

/**
 * 计算显示名称
 */
const displayName = computed(() => {
  if (!entityInfo.value) {
    return props.type === ENTITY_TYPE.USER ? '未知用户' : '未知群组'
  }

  if (props.type === ENTITY_TYPE.USER) {
    const userInfo = entityInfo.value as any
    return userInfo.nickname || userInfo.name || '未知用户'
  } else {
    const groupInfo = entityInfo.value as any
    return groupInfo.group_name || '未知群组'
  }
})

/**
 * 获取实体信息
 */
const fetchEntityInfo = async () => {
  if (!props.id) return
  
  try {
    const info = await getEntityInfo(props.type, Number(props.id))
    entityInfo.value = info
  } catch (error) {
    console.error(`获取${props.type}信息失败:`, error)
    entityInfo.value = null
  }
}

// 监听关键属性变化
watch(
  () => [props.type, props.id],
  () => {
    fetchEntityInfo()
  },
  { immediate: true }
)

onMounted(() => {
  fetchEntityInfo()
})

// 暴露给父组件的方法和数据
defineExpose({
  entityInfo,
  loading,
  refresh: fetchEntityInfo
})
</script>

<style scoped>
/* 组件样式 */
.inline-flex {
  display: inline-flex;
}
</style>