export type { EntityType, EntityInfo, UserInfo, GroupInfo, EntityDisplayConfig } from '@/types/entity'

/**
 * EntityDisplay 组件实例类型
 */
export interface EntityDisplayInstance {
  entityInfo: EntityInfo | null
  loading: boolean
  refresh: () => Promise<void>
}

/**
 * 组件事件类型
 */
export interface EntityDisplayEmits {
  /** 实体信息加载完成 */
  (e: 'loaded', info: EntityInfo | null): void
  /** 实体信息加载失败 */
  (e: 'error', error: Error): void
  /** 点击实体 */
  (e: 'click', info: EntityInfo | null): void
}