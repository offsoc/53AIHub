<template>
  <div>
    <ElButton
      class="absolute top-6 left-8 !p-0 !border-none !outline-none !bg-transparent !leading-1 !h-auto hover:opacity-70"
      type="default"
      text
      @click="emits('back')"
    >
      <SvgIcon class="mr-1" name="back" width="13" />
      {{ $t('return') }}
    </ElButton>
    <ElButton
      class="absolute top-6 right-8 !p-0 !border-none !outline-none !bg-transparent !leading-1 !h-auto hover:opacity-70"
      type="default"
      text
      @click="createNewEnterprise"
    >
      <SvgIcon class="mr-1" name="create" width="13" />
      {{ $t('create_new_enterprise') }}
    </ElButton>
    <h4 class="text-3xl text-[#1D1E1F] font-bold text-center mb-8">
      {{ $t('login.select_enterprise') }}
    </h4>
    <ul v-loading="loading" class="w-[400px] max-h-[440px] pr-1 box-border overflow-auto flex flex-col gap-4">
      <li
        v-for="item in enterprise_list"
        :key="item.apply_id"
        class="flex items-center border rounded-sm p-4 cursor-pointer hover:border-[#3664EF] relative"
        @click="handleEnterpriseSelect({ data: item })"
      >
        <img class="flex-none mr-4 w-[60px] h-[60px] object-cover rounded" :src="item.logo" />
        <div class="w-[230px] mr-1">
          <div class="max-w-64 text-base text-[#182B50] truncate flex items-center">
            <span v-tooltip="'auto'" class="tooltip-title">{{ item.name || '- -' }}</span>
            <ElTag v-if="item.is_admin" type="warning" effect="light" class="ml-2">
              {{ $t('role.admin') }}
            </ElTag>
          </div>
          <div v-tooltip="'auto'" class="text-sm text-[#9A9A9A] mt-2 tooltip-title">
            {{ item.domain || '- -' }}
          </div>
        </div>
        <ElTag v-if="item.is_process" type="warning" effect="light">
          {{ $t('apply.process') }}
        </ElTag>
        <ElTag v-else-if="item.is_expired" type="info" effect="light">
          {{ $t('apply.expired') }}
        </ElTag>
        <ElTag v-else-if="item.is_reject" type="danger" effect="light">
          {{ $t('apply.reject') }}
        </ElTag>
        <ElIcon
          v-else-if="item.is_loading"
          size="18"
          color="#999"
          class="animate-spin absolute top-1/2 -translate-y-1/2 right-6"
        >
          <Loading />
        </ElIcon>
        <ElIcon v-else size="18" class="absolute top-1/2 -translate-y-1/2 right-6">
          <ArrowRight />
        </ElIcon>
      </li>
    </ul>
    <ElButton
      type="primary"
      text
      class="relative mt-4 !bg-transparent left-1/2 -translate-x-1/2"
      @click.stop="loadEnterpriseList"
    >
      {{ $t('apply.refresh_list') }}
    </ElButton>
    <div
      class="flex items-center text-sm text-[#5B6A91] cursor-pointer w-max mx-auto mt-2"
      @click="service_visible = true"
    >
      <SvgIcon name="service" width="14px" height="14px" class="mr-2" />
      {{ $t('apply.contact_customer_service') }}
    </div>
  </div>
  <ServiceDialog v-model:visible="service_visible" :title="$t('apply.contact_customer_service_v2')" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, ArrowRight } from '@element-plus/icons-vue'
import { useEnterpriseStore, useUserStore } from '@/stores'
import { sleep } from '@/utils'
import systemLogApi from '@/api/modules/system-log'
import { SYSTEM_LOG_ACTION } from '@/constants/system-log'

const emits = defineEmits<{
  (e: 'apply', data?: string): void
  (e: 'back'): void
}>()

const user_store = useUserStore()
const enterprise_store = useEnterpriseStore()

const loading = ref(false)
const enterprise_list = ref([])
const service_visible = ref(false)

const createNewEnterprise = () => {
  emits('apply', user_store.info.username)
}

// 检查是否存在eid参数，如果存在，则直接跳转
const getUrlSearchEid = (): string | null => {
  const search = window.location.search
  const params = new URLSearchParams(search)
  const redirect = params.get('redirect') || ''
  const newParams = new URLSearchParams(`?${redirect.split('?')[1] || ''}`)
  const eid = newParams.get('eid')
  if (eid) {
    return eid
  }
  return null
}

const handleEnterpriseSelect = async ({ data = {} } = {}) => {
  if (data.is_process) return ElMessage.warning(window.$t('apply.process'))
  if (data.is_reject) return ElMessage.warning(data.reject_reason || window.$t('apply.reject'))
  if (data.is_expired) return (service_visible.value = true)
  if (data.is_loading) return

  data.is_loading = true
  if (!data.eid) {
    // 考虑申请流程存在异步情况，需要多次请求
    const { apply_id } = data
    let request_count = 0
    const refreshData = async () => {
      const { list = [] } = await enterprise_store.loadListData({ data: { status: -1 } })
      request_count++
      const apply_data = list.find(item => item.apply_id == apply_id)
      if (!apply_data.eid && request_count < 5) {
        await sleep(1)
        await refreshData()
      }
      data.eid = apply_data.eid || 0
      return apply_data.eid
    }
    await refreshData()
    data.is_loading = false
    if (!data.eid) return ElMessage.warning('Invalid eid')
  }

  await enterprise_store.loadDetailData({ data: { eid: data.eid } })
  await systemLogApi.create({
    action: SYSTEM_LOG_ACTION.LOGIN,
    content: '登录',
  })

  // 重置加载状态
  data.is_loading = false

  // 构建目标URL
  // #ifdef KM
  if (window.parent) {
    const eid = getUrlSearchEid()
    window.parent.postMessage(
      {
        action: 'saas-login-success',
        eid: data.eid,
        access_token: user_store.info.access_token,
        allowd_redirect: eid ? String(data.eid) === eid : true,
      },
      '*'
    )
  } else {
    window.location.reload()
  }
  // #endif

  // #ifndef KM
  const targetUrl = `${data.domain}?access_token=${user_store.info.access_token}&eid=${data.eid}`
  if (window.parent) {
    window.parent.postMessage({
      action: 'saas-login-redirect',
      url: targetUrl,
    })
  }
  // #endif
}

const loadEnterpriseList = async () => {
  loading.value = true
  const { list = [] } = await enterprise_store.loadListData({ data: { status: -1 } }).finally(() => {
    loading.value = false
  })
  enterprise_list.value = list

  const eid = getUrlSearchEid()

  if (eid) {
    const corp = list.find(item => String(item.eid) === eid)

    if (corp) handleEnterpriseSelect({ data: corp })
  }
}

onMounted(() => {
  loadEnterpriseList()
})
</script>

<style scoped>
.tooltip-title {
  max-width: 220px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
