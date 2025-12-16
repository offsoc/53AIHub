<template>
  <slot name="prefix" />
  <template v-if="isSsoSync && values.length && syncValue.value === ENTERPRISE_SYNC_FROM.WECOM">
    <template v-for="(value, index) in values" :key="value">
      <ww-open-data :type="type" :openid="value" />
      <template v-if="index !== values.length - 1"> , </template>
    </template>
  </template>
  <template v-else>
    {{ text }}
  </template>
  <slot name="suffix" />
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { ENTERPRISE_SYNC_FROM, type EnterpriseSyncFrom } from '@/constants/enterprise'
import wecomInstance from '@/utils/wecom'

import { useSso } from '@/hooks/useSso'

type Type = 'userName' | 'memberName' | 'wxUserName' | 'departmentName'

const props = withDefaults(
  defineProps<{
    source?: EnterpriseSyncFrom
    type: Type
    openid?: any
    text?: string
  }>(),
  {
    source: ENTERPRISE_SYNC_FROM.DEFAULT,
    type: 'userName',
    openid: '',
    text: '',
  }
)

const { isSsoSync, loadSyncSetting, syncValue } = useSso()

const values = computed(() => {
  if (props.openid) {
    const list = props.openid.split(',')
    return props.type === 'departmentName' ? list.filter(item => item > 0) : list
  }

  return []
})

onMounted(async () => {
  await loadSyncSetting()
})

watch([() => props.openid, () => props.source], () => {
  if (isSsoSync.value && props.openid && syncValue.value.value === ENTERPRISE_SYNC_FROM.WECOM) {
    wecomInstance().then(() => {
      window.WWOpenData.bind(document.querySelector('ww-open-data'))
    })
  }
})
</script>

<style></style>

<!-- <template>
  <slot name="prefix" />
  <template v-if="syncValue.value !== ENTERPRISE_SYNC_FROM.DEFAULT">
    <template v-for="(item, index) in bindvalue" :key="index">
      <ww-open-data
        v-if="organization_from_wecom"
        :type="type === 'departmentName' ? 'departmentName' : 'userName'"
        :openid="item.bindvalue"
      />
      <dt-open-data
        v-if="organization_from_dingtalk"
        :open-type="type === 'departmentName' ? 'deptName' : 'userName'"
        :open-id="item.bindvalue"
      />
      <template v-if="index !== bindvalue.length - 1"> 、 </template>
    </template>
  </template>
  <template v-else>
    {{ text }}
  </template>
  <slot name="suffix" />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
// import unit from '@/components/Unit2'
import wecomInstance from '@/utils/wecom'
import { useEnterpriseStore } from '@/stores'
import { useSso } from '@/hooks/useSso'
import { ENTERPRISE_SYNC_FROM } from '@/constants/enterprise'

type Type = 'userName' | 'memberName' | 'wxUserName' | 'departmentName'

const props = withDefaults(
  defineProps<{
    // source?: '53ai' | 'wecom' | 'dingtalk'
    type: Type
    value?: any
    openid?: any
    text?: string
  }>(),
  {
    // source: '53ai',
    type: 'userName',
    value: '',
    openid: '',
    text: '',
  }
)
const { syncValue, loadSyncSetting } = useSso()
const enterpriseStore = useEnterpriseStore()
const bindvalue = ref([])

const UNIT_GET_MAP = {
  userName: 'getUser',
  wxUserName: 'getWxUser',
  memberName: 'getMember',
  departmentName: 'getDepartment',
}

const organization_from_wecom = computed(() => syncValue.value.value === ENTERPRISE_SYNC_FROM.WECOM)
const organization_from_dingtalk = computed(() => syncValue.value.value === ENTERPRISE_SYNC_FROM.DINGTALK)

onMounted(async () => {
  await loadSyncSetting()
})

let dt_open_init_flag = Boolean(window.DTOpenData._corpId)
watch(
  [() => props.value, () => props.openid, () => organization_from_dingtalk.value, () => organization_from_wecom.value],
  async () => {
    const { info: { dingtalk_info } = {} } = enterpriseStore
    bindvalue.value = []
    // await unit.instance()
    if (organization_from_wecom.value) {
      await wecomInstance()
    } else if (organization_from_dingtalk.value) {
      if (!dt_open_init_flag) dt_open_init_flag = window.DTOpenData.init(dingtalk_info?.corpId)
    }

    if (String(props.openid) && typeof props.openid !== 'undefined') {
      const value = Array.isArray(props.openid) ? props.openid : [props.openid]
      bindvalue.value = value.map(bindvalue => ({ bindvalue }))
    }
    await nextTick()
    if (organization_from_wecom.value) window.WWOpenData.bind(document.querySelector('ww-open-data'))
    else if (organization_from_dingtalk.value) {
      window.DTOpenData.update(document.querySelectorAll('dt-open-data'))
    }
  },
  {
    immediate: true,
  }
)
</script>

<style></style> -->
