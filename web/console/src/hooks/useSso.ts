import { computed, ref } from 'vue'
import { useSettingStore, useEnterpriseStore } from '@/stores'
import { ENTERPRISE_SYNC_FROM } from '@/constants/enterprise'

import type { EnterpriseSyncFrom } from '@/constants/enterprise'
import cacheManager from '@/utils/cache'

export const useSso = () => {
  const settingStore = useSettingStore()

  const enterprise = useEnterpriseStore()

  const SYNC_VALUE_KEY = 'sso_sync_from'

  const syncValue = ref<{
    key: string
    setting_id: number
    value: EnterpriseSyncFrom
  }>({
    key: SYNC_VALUE_KEY,
    setting_id: 0,
    value: ENTERPRISE_SYNC_FROM.DEFAULT,
  })

  const loadSyncSetting = async () => {
    if (!enterprise.info.is_install_wecom && !enterprise.info.is_install_dingtalk) return
    const value = await cacheManager.getOrFetch(SYNC_VALUE_KEY, () =>
      settingStore.get(SYNC_VALUE_KEY)
    )
    syncValue.value = value || {
      key: SYNC_VALUE_KEY,
      setting_id: 0,
      value: ENTERPRISE_SYNC_FROM.DEFAULT,
    }
  }

  const saveSyncSetting = async (value: string) => {
    const data = await settingStore.save(syncValue.value.setting_id, {
      value,
      key: SYNC_VALUE_KEY,
    })
    cacheManager.delete(SYNC_VALUE_KEY)
    syncValue.value = data
  }

  const isSsoSync = computed(() => syncValue.value.value !== ENTERPRISE_SYNC_FROM.DEFAULT)
  return {
    syncValue,
    isSsoSync,
    loadSyncSetting,
    saveSyncSetting,
  }
}
