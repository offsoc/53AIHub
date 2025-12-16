<template>
  <Layout class="px-[60px] py-8">
    <Header :title="$t(route.meta.title)" />
    <div class="bg-white rounded-md overflow-hidden py-8 px-10 mt-5 box-border space-y-10 flex-1 overflow-y-auto">
      <div v-for="item in ssoList" :key="item.type">
        <h1 class="text-lg text-[#1D1E1F] flex items-center gap-2">
          <img :src="$getRealPath({ url: `/images/sso/${item.type}.png` })" class="size-6 object-cover" />
          {{ $t(`sso.${item.type}.title`) }}
        </h1>
        <div class="mt-4 flex flex-wrap items-center gap-4">
          <div class="flex-none w-[300px] min-h-[176px] rounded overflow-hidden border p-5 box-border">
            <h2 class="font-semibold text-[#1D1E1F] h-[26px] relative">
              {{ $t(`sso.${item.type}.access_title`) }}
              <ElTag v-if="installedMap[item.type]" class="ml-2 -mt-1" type="success">
                {{ $t('connected') }}
              </ElTag>
              <el-switch
                v-if="item.type === 'api_access' && isInited"
                v-model="isApiAccessOpened"
                class="top-1/2 right-0 -translate-y-1/2"
                style="position: absolute !important"
                @change="toggleSwitch"
              />
            </h2>
            <p class="text-xs text-[#939499] mt-3">
              {{
                installedMap[item.type]
                  ? `${$t('sso.authorized_enterprise')}： ${enterpriseStore.info[item.type === 'wecom' ? 'wecom_info' : 'dingtalk_info'].corp_name}`
                  : $t(`sso.${item.type}.access_desc`)
              }}
            </p>
            <div class="mt-12">
              <ElButton v-if="installedMap[item.type]" @click="handleUnauthorized({ type: item.type })">
                {{ $t('sso.unauthorized') }}
              </ElButton>
              <template v-else-if="item.type !== 'api_access'">
                <ElButton
                  type="primary"
                  :disabled="['ad_ldap', 'feishu'].includes(item.type)"
                  @click="handleAuthorized({ type: item.type })"
                >
                  {{ $t('sso.auth_access') }}
                </ElButton>
              </template>
              <!-- API接入 -->
              <template v-else>
                <ElButton type="primary" @click="handleAPIAccessSetting">
                  {{ $t('sso.access_setting') }}
                </ElButton>
              </template>
            </div>
          </div>
          <div
            v-if="item.type === 'wecom' || item.type === 'dingtalk'"
            class="relative flex-none w-[300px] min-h-[176px] rounded overflow-hidden border p-5 box-border"
          >
            <h2 class="font-semibold text-[#1D1E1F]">
              {{ $t(`sso.organization_sync`) }}
            </h2>
            <p class="text-xs text-[#939499] mt-3">
              {{ $t(`sso.${item.type}.sync_desc`) }}
            </p>
            <div v-if="installedMap[item.type]" class="absolute right-5 top-4">
              <ElSwitch
                v-debounce
                :model-value="syncValue.value === item.sync_value"
                @change="handleSyncToggle($event, item.sync_value)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <AccessDialog ref="accessRef" />
    <!-- API接入弹窗 -->
    <APIAccessDialog ref="apiAccessRef" @refresh="getEnterpriseConfig" />
  </Layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AccessDialog from './components/access-dialog.vue'
import APIAccessDialog from './components/api-access-dialog.vue'
import { useEnterpriseStore } from '@/stores'
import { useSso } from '@/hooks/useSso'
import enterpriseApi from '@/api/modules/enterprise'

const route = useRoute()
const enterpriseStore = useEnterpriseStore()
const { syncValue, loadSyncSetting, saveSyncSetting } = useSso()

const accessRef = ref<InstanceType<typeof AccessDialog>>()
const apiAccessRef = ref<InstanceType<typeof APIAccessDialog>>()
const isInited = ref(false) // 是否初始化
const isApiAccessOpened = ref(false)
const content = ref()

const ssoList = ref([
  {
    type: 'wecom',
    title: 'sso.wecom.title',
    access_title: 'sso.wecom.access_title',
    access_desc: 'sso.wecom.access_desc',
    sync_desc: 'sso.wecom.sync_desc',
    sync_value: '1',
  },
  // {
  //   type: 'dingtalk',
  //   title: 'sso.dingtalk.title',
  //   access_title: 'sso.dingtalk.access_title',
  //   access_desc: 'sso.dingtalk.access_desc',
  //   sync_desc: 'sso.dingtalk.sync_desc',
  //   sync_value: '2',
  // },
  {
    type: 'ad_ldap',
    title: 'sso.ad_ldap.title',
    access_title: 'sso.ad_ldap.access_title',
    access_desc: 'sso.ad_ldap.access_desc',
    sync_desc: 'sso.ad_ldap.sync_desc',
  },
  {
    type: 'api_access',
    title: 'sso.api_access.title',
    access_title: 'sso.api_access.access_title',
    access_desc: 'sso.api_access.access_desc',
    sync_desc: 'sso.api_access.sync_desc',
  },
  {
    type: 'feishu',
    title: 'sso.feishu.title',
    access_title: 'sso.feishu.access_title',
    access_desc: 'sso.feishu.access_desc',
    sync_desc: 'sso.feishu.sync_desc',
  },
])

const installedMap = computed(() => {
  return {
    wecom: enterpriseStore.info.is_install_wecom,
    dingtalk: enterpriseStore.info.is_install_dingtalk,
  }
})

const handleAuthorized = ({ type }: { type: string }) => {
  accessRef.value?.open({ type })
}

const handleUnauthorized = ({ type }: { type: string }) => {
  let url = ''
  switch (type) {
    case 'wecom':
      url = 'https://work.weixin.qq.com/login'
      break
    case 'dingtalk':
      url = 'https://oa.dingtalk.com/index.htm#/microApp/microAppListNew'
      break
  }
  window.open(url, '_blank')
}
const handleSyncToggle = async (checked: boolean, value: string) => {
  await saveSyncSetting(checked ? value : '0')
}

// 获取企业配置
const getEnterpriseConfig = async () => {
  const { data } = await enterpriseApi.enterprise_config('auth_sso')
  content.value = data.content && JSON.parse(data.content)
  if (!content.value.secret) {
    isInited.value = false
  } else {
    isInited.value = true
    isApiAccessOpened.value = data.enabled
  }
}

// API接入-开关切换
const toggleSwitch = async () => {
  await enterpriseApi.toggle_enterprise_config('auth_sso')
}

// 打开接入设置
const handleAPIAccessSetting = () => {
  apiAccessRef.value?.open(content.value)
}

onMounted(async () => {
  loadSyncSetting()
  getEnterpriseConfig()
})
</script>

<style scoped></style>
