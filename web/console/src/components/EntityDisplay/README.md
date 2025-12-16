# EntityDisplay 组件

统一的实体显示组件，支持用户和群组信息的显示。

## 功能特性

- 🔄 **统一接口**: 支持用户和群组的统一显示
- 📦 **智能缓存**: 内置缓存机制，避免重复请求
- 🎨 **多种模式**: 支持头像、名称、完整显示模式
- ⚡ **性能优化**: 请求去重，避免并发重复请求
- 🔧 **向下兼容**: 保持原有 API 完全兼容

## 基本使用

### 1. 使用统一组件

```vue
<template>
  <!-- 显示用户头像 -->
  <EntityDisplay type="user" :id="userId" mode="avatar" />
  
  <!-- 显示群组名称 -->
  <EntityDisplay type="group" :id="groupId" mode="name" />
  
  <!-- 完整显示（头像 + 名称） -->
  <EntityDisplay type="user" :id="userId" mode="full" />
</template>

<script setup lang="ts">
import EntityDisplay from '@/components/EntityDisplay/index.vue'

const userId = ref(123)
const groupId = ref(456)
</script>
```

### 2. 使用 Hook 获取数据

```typescript
import { useEntityInfo } from '@/hooks/useEntityInfo'
import { ENTITY_TYPE } from '@/types/entity'

const { getEntityInfo, getBatchEntityInfo } = useEntityInfo()

// 获取用户信息
const userInfo = await getEntityInfo(ENTITY_TYPE.USER, userId)

// 获取群组信息  
const groupInfo = await getEntityInfo(ENTITY_TYPE.GROUP, groupId)

// 批量获取
const entities = await getBatchEntityInfo([
  { type: ENTITY_TYPE.USER, id: 1 },
  { type: ENTITY_TYPE.GROUP, id: 2 }
])
```

### 3. 兼容性

为了保持向后兼容性，EntityDisplay 组件内部提供了兼容性组件：

```vue
<template>
  <!-- 使用统一的 EntityDisplay 组件 -->
  <EntityDisplay type="user" :entity-id="userId" mode="avatar" />
  <EntityDisplay type="group" :entity-id="groupId" mode="name" />
</template>

<script setup lang="ts">
import EntityDisplay from '@/components/EntityDisplay/index.vue'
</script>
```

新的统一组件提供了更好的性能和一致性。

## API 参考

### EntityDisplay Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'user' \| 'group'` | - | 实体类型 |
| id | `number \| string` | - | 实体ID |
| mode | `'avatar' \| 'name' \| 'full'` | `'avatar'` | 显示模式 |
| avatarSize | `number \| string` | `20` | 头像大小 |
| avatarShape | `'circle' \| 'square'` | `'circle'` | 头像形状 |
| showLoading | `boolean` | `true` | 是否显示加载状态 |
| defaultAvatar | `string` | `''` | 自定义默认头像路径 |

### 显示模式说明

- **avatar**: 仅显示头像
- **name**: 仅显示名称
- **full**: 显示头像 + 名称

## Hook 使用

### 1. 使用统一 Hook

```typescript
import { useEntityInfo } from '@/hooks/useEntityInfo'
import { ENTITY_TYPE } from '@/types/entity'

const { 
  loading,
  getEntityInfo,
  getBatchEntityInfo,
  clearEntityCache 
} = useEntityInfo()

// 获取用户信息
const userInfo = await getEntityInfo(ENTITY_TYPE.USER, 123)

// 获取群组信息
const groupInfo = await getEntityInfo(ENTITY_TYPE.GROUP, 456)

// 批量获取
const users = await getBatchEntityInfo(ENTITY_TYPE.USER, [123, 456])
```

### 2. 使用兼容性 Hook

```typescript
// 原有的 Hook 仍然可用，但建议迁移到统一 Hook
import { useUserInfo } from '@/hooks/useUserInfo'
import { useGroupInfo } from '@/hooks/useGroupInfo'

const { getUserInfo } = useUserInfo()
const { getGroupInfo } = useGroupInfo()
```

## 类型定义

```typescript
// 实体类型
export type EntityType = 'user' | 'group'

// 用户信息
export interface UserInfo {
  user_id: number
  nickname: string
  name: string
  avatar: string
  email: string
  mobile: string
  role: number
  status: number
  departments: unknown[]
  created_time: number
  value: number
  label: string
}

// 群组信息
export interface GroupInfo {
  group_id: number
  group_name: string
  sort: number
  value: number
  label: string
  avatar?: string
}
```

## 迁移指南

### 从旧组件迁移到新组件

#### 旧的 UserDisplay 组件迁移

```vue
<!-- 旧的写法 -->
<UserDisplay 
  :user-id="123" 
  mode="full" 
  :avatar-size="32"
/>

<!-- 新的写法 -->
<EntityDisplay 
  type="user"
  :entity-id="123" 
  mode="full" 
  :avatar-size="32"
/>
```

#### 旧的 GroupDisplay 组件迁移

```vue
<!-- 旧的写法 -->
<GroupDisplay 
  :group-id="456" 
  mode="compact" 
  :show-avatar="false"
/>

<!-- 新的写法 -->
<EntityDisplay 
  type="group"
  :entity-id="456" 
  mode="compact" 
  :show-avatar="false"
/>
```

#### 旧的 Hook 迁移

```vue
<script setup lang="ts">
// 旧的写法
import { useUserInfo } from '@/hooks/useUserInfo'
import { useGroupInfo } from '@/hooks/useGroupInfo'

const { loading: userLoading, getUserInfo } = useUserInfo()
const { loading: groupLoading, getGroupInfo } = useGroupInfo()

// 新的写法
import { useEntityInfo } from '@/hooks/useEntityInfo'
import { ENTITY_TYPE } from '@/types/entity'

const { loading, getEntityInfo } = useEntityInfo()

// 获取用户信息
const userInfo = await getEntityInfo(ENTITY_TYPE.USER, 123)

// 获取群组信息
const groupInfo = await getEntityInfo(ENTITY_TYPE.GROUP, 456)
</script>
```

## 注意事项

1. **缓存机制**: 组件内置了5分钟的缓存机制，相同的请求会复用缓存结果
2. **请求去重**: 并发的相同请求会被合并，避免重复调用 API
3. **错误处理**: 组件内置了错误处理，获取失败时会显示默认状态
4. **性能优化**: 使用了 Vue 3 的响应式系统和组合式 API，性能更优

## 最佳实践

1. **优先使用统一组件**: 新代码建议直接使用 `EntityDisplay` 组件
2. **合理使用缓存**: 利用内置缓存机制，避免不必要的 API 调用
3. **类型安全**: 使用 TypeScript 类型定义，确保类型安全
4. **错误边界**: 在关键位置添加错误处理逻辑