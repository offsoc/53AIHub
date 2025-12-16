import { ref } from 'vue'
import { userApi, INTERNAL_USER_STATUS_ALL } from '@/api/modules/user'
import { groupApi } from '@/api/modules/group'
import { GROUP_TYPE } from '@/constants/group'
import cache from '@/utils/cache'
import type { EntityType, UserInfo, GroupInfo, EntityInfo, EntityCacheConfig } from '@/types/entity'
import { ENTITY_TYPE } from '@/types/entity'

/**
 * 统一实体信息管理 Composable
 * 提供用户和群组信息获取和缓存功能
 */
export function useEntityInfo() {
  const loading = ref(false)

  // 请求去重：存储正在进行的请求 Promise
  const pendingRequests = new Map<string, Promise<EntityInfo[]>>()

  /**
   * 缓存配置
   */
  const cacheConfig: Record<EntityType, EntityCacheConfig> = {
    [ENTITY_TYPE.USER]: {
      duration: 5, // 5分钟
      keyPrefix: 'all_users_list',
    },
    [ENTITY_TYPE.GROUP]: {
      duration: 5, // 5分钟
      keyPrefix: 'all_groups_list',
    },
  }

  /**
   * 通用的缓存获取方法
   * @param type 实体类型
   * @param fetcher 数据获取函数
   * @returns 实体列表
   */
  const getCachedEntities = async <T extends EntityInfo>(
    type: EntityType,
    fetcher: () => Promise<T[]>
  ): Promise<T[]> => {
    const config = cacheConfig[type]
    const cacheKey = config.keyPrefix

    // 如果已经有正在进行的请求，直接返回该请求的 Promise
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey) as Promise<T[]>
    }
    // 检查缓存
    const cached = await cache.get<T[]>(cacheKey)
    if (cached) {
      return cached
    }

    // 创建新的请求
    const request = (async () => {
      try {
        loading.value = true

        const entities = await cache.getOrFetch(cacheKey, fetcher, config.duration)
        return entities
      } catch (error) {
        console.error(`获取${type === ENTITY_TYPE.USER ? '用户' : '群组'}列表失败:`, error)
        return []
      } finally {
        loading.value = false
        // 清除正在进行的请求标记
        pendingRequests.delete(cacheKey)
      }
    })()

    pendingRequests.set(cacheKey, request)
    return request
  }

  /**
   * 获取所有用户列表（带缓存）
   * @returns 所有用户列表
   */
  const getAllUsers = async (): Promise<UserInfo[]> => {
    return getCachedEntities(ENTITY_TYPE.USER, async () => {
      const params = {
        status: INTERNAL_USER_STATUS_ALL as typeof INTERNAL_USER_STATUS_ALL,
        offset: 0,
        limit: 10000,
      }

      const res = await userApi.fetch_internal_user(params)
      return res.list.map(
        (item: Record<string, unknown>): UserInfo => ({
          user_id: Number(item.user_id) || 0,
          nickname: String(item.nickname || item.name || ''),
          name: String(item.name || ''),
          avatar: String(item.avatar || ''),
          email: String(item.email || ''),
          mobile: String(item.mobile || ''),
          role: Number(item.role) || 1,
          status: Number(item.status) || 1,
          departments: Array.isArray(item.departments) ? item.departments : [],
          created_time: Number(item.created_time) || 0,
          value: Number(item.user_id) || 0,
          label: String(item.nickname || item.name || ''),
        })
      )
    })
  }

  /**
   * 获取所有群组列表（带缓存）
   * @returns 所有群组列表
   */
  const getAllGroups = async (): Promise<GroupInfo[]> => {
    return getCachedEntities(ENTITY_TYPE.GROUP, async () => {
      const res = await groupApi.list({ params: { group_type: GROUP_TYPE.INTERNAL_USER } })
      return res.map(
        (item: Record<string, unknown>): GroupInfo => ({
          group_id: Number(item.group_id) || 0,
          group_name: String(item.group_name || ''),
          sort: Number(item.sort) || 0,
          value: Number(item.group_id) || 0,
          label: String(item.group_name || ''),
          avatar: String(item.avatar || ''),
        })
      )
    })
  }

  /**
   * 根据类型获取所有实体列表
   * @param type 实体类型
   * @returns 实体列表
   */
  const getAllEntities = async (type: EntityType): Promise<EntityInfo[]> => {
    switch (type) {
      case ENTITY_TYPE.USER:
        return getAllUsers()
      case ENTITY_TYPE.GROUP:
        return getAllGroups()
      default:
        return []
    }
  }

  /**
   * 获取用户信息（从缓存的用户列表中查找）
   * @param userId 用户ID
   * @returns 用户信息
   */
  const getUserInfo = async (userId: number): Promise<UserInfo | null> => {
    if (!userId) return null

    try {
      const allUsers = await getAllUsers()
      const user = allUsers.find((item: UserInfo) => +item.user_id === +userId)
      return user || null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 获取群组信息（从缓存的群组列表中查找）
   * @param groupId 群组ID
   * @returns 群组信息
   */
  const getGroupInfo = async (groupId: number): Promise<GroupInfo | null> => {
    if (!groupId) return null

    try {
      const allGroups = await getAllGroups()
      const group = allGroups.find((item: GroupInfo) => +item.group_id === +groupId)
      return group || null
    } catch (error) {
      console.error('获取群组信息失败:', error)
      return null
    }
  }

  /**
   * 统一获取实体信息
   * @param type 实体类型
   * @param id 实体ID
   * @returns 实体信息
   */
  const getEntityInfo = async (type: EntityType, id: number): Promise<EntityInfo | null> => {
    switch (type) {
      case ENTITY_TYPE.USER:
        return getUserInfo(id)
      case ENTITY_TYPE.GROUP:
        return getGroupInfo(id)
      default:
        return null
    }
  }

  /**
   * 批量获取用户信息
   * @param userIds 用户ID数组
   * @returns 用户信息数组
   */
  const getBatchUserInfo = async (userIds: number[]): Promise<UserInfo[]> => {
    if (!userIds.length) return []

    try {
      const allUsers = await getAllUsers()
      const users = allUsers.filter((item: UserInfo) => userIds.includes(+item.user_id))
      return users
    } catch (error) {
      console.error('批量获取用户信息失败:', error)
      return []
    }
  }

  /**
   * 批量获取群组信息
   * @param groupIds 群组ID数组
   * @returns 群组信息数组
   */
  const getBatchGroupInfo = async (groupIds: number[]): Promise<GroupInfo[]> => {
    if (!groupIds.length) return []

    try {
      const allGroups = await getAllGroups()
      const groups = allGroups.filter((item: GroupInfo) => groupIds.includes(+item.group_id))
      return groups
    } catch (error) {
      console.error('批量获取群组信息失败:', error)
      return []
    }
  }

  /**
   * 批量获取实体信息
   * @param type 实体类型
   * @param ids 实体ID数组
   * @returns 实体信息数组
   */
  const getBatchEntityInfo = async (type: EntityType, ids: number[]): Promise<EntityInfo[]> => {
    switch (type) {
      case ENTITY_TYPE.USER:
        return getBatchUserInfo(ids)
      case ENTITY_TYPE.GROUP:
        return getBatchGroupInfo(ids)
      default:
        return []
    }
  }

  /**
   * 清除实体信息缓存
   * @param type 实体类型，不传则清除所有缓存
   * @param id 实体ID，不传则清除该类型的所有缓存
   */
  const clearEntityCache = (type?: EntityType, id?: number) => {
    if (type) {
      const cacheKey = cacheConfig[type].keyPrefix
      // 清除正在进行的请求
      pendingRequests.delete(cacheKey)
      // 清除缓存
      cache.delete(cacheKey)
    } else {
      // 清除所有缓存
      Object.values(cacheConfig).forEach(config => {
        pendingRequests.delete(config.keyPrefix)
        cache.delete(config.keyPrefix)
      })
    }
  }

  /**
   * 清除用户信息缓存（兼容性方法）
   */
  const clearUserCache = () => {
    clearEntityCache(ENTITY_TYPE.USER)
  }

  /**
   * 清除群组信息缓存（兼容性方法）
   */
  const clearGroupCache = () => {
    clearEntityCache(ENTITY_TYPE.GROUP)
  }

  return {
    // 状态
    loading,

    // 统一方法
    getEntityInfo,
    getBatchEntityInfo,
    getAllEntities,
    clearEntityCache,

    // 用户相关方法（兼容性）
    getUserInfo,
    getBatchUserInfo,
    getAllUsers,
    clearUserCache,

    // 群组相关方法（兼容性）
    getGroupInfo,
    getBatchGroupInfo,
    getAllGroups,
    clearGroupCache,
  }
}
