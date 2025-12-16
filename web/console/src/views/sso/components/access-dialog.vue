<template>
  <el-dialog v-model="visible" class="el-dialog--noheader" width="650px" :close-on-click-modal="false">
    <div class="h-[116px] bg-[#F1F4FD] flex items-center justify-center gap-5 -mx-7 -mt-4 rounded-t-lg">
      <img class="w-12 h-10" alt="" :src="LOGO_MAP[app_type]" />
      <img class="w-[46px] h-[21px]" src="/images/sso/switch.png" alt="" />
      <img class="w-12 h-12" :src="enterpriseStore.info.logo" alt="" />
    </div>
    <span class="absolute right-4 top-4 cursor-pointer p-2" @click="visible = false">
      <el-icon color="#909399" size="20">
        <Close />
      </el-icon>
    </span>

    <div class="text-[#182B50] text-[28px] font-semibold text-center py-10">
      {{ $t('sso.access_title', { title: $t(`sso.${app_type}.abbr_title`) }) }}
    </div>
    <div class="text-[#182B50] text-center text-lg font-semibold">
      {{ $t('sso.access_desc', { title: $t(`sso.${app_type}.abbr_title`) }) }}
    </div>
    <div class="text-[#182B50] text-center text-opacity-80 text-sm mt-3">
      {{ $t('sso.access_desc_v2', { title: $t(`sso.${app_type}.abbr_title`) }) }}
    </div>
    <div class="py-6 flex flex-col items-center gap-5 mt-20">
      <el-button type="primary" size="large" @click="handleInstall">
        {{ $t('sso.goto_access', { title: $t(`sso.${app_type}.abbr_title`) }) }}
      </el-button>
      <el-button style="margin-left: 0" type="primary" link @click="handleRegister">
        {{ $t('sso.goto_register', { title: $t(`sso.${app_type}.abbr_title`) }) }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'

import { useEnterpriseStore, useUserStore } from '@/stores'
import { api_host } from '@/utils/config'
import { dingtalkApi } from '@/api/modules/dingtalk'

type Type = 'wecom' | 'dingtalk'
const LOGO_MAP = {
  wecom: window.$getRealPath({ url: '/images/sso/wecom_v2.png' }),
  dingtalk: window.$getRealPath({ url: '/images/sso/dingtalk.png' }),
}

const user_store = useUserStore()

const enterpriseStore = useEnterpriseStore()
const visible = ref(false)
const app_type = ref<Type>('wecom')
const WECOM_SUITE_ID = import.meta.env.VITE_GLOB_SUITEID

const handleInstall = async () => {
  let url = ''
  if (app_type.value === 'wecom') {
    url = `${api_host}/api/saas/wecom/callback/start-install/${WECOM_SUITE_ID}?tk=${encodeURIComponent(user_store.info.access_token)}`
    window.open(url, '_blank')
    ElMessageBox.confirm(window.$t('sso.auth_completed_tip')).then(() => {
      location.reload()
    })
  } else if (app_type.value === 'dingtalk') {
    const data = await dingtalkApi.dingtalkOauth2({
      redirect_uri: `${window.location.origin}${window.location.pathname}/#/sso`,
    })
    window.open(data.redirect_url, '_blank')
  }
}
const handleRegister = () => {
  let url = ''
  switch (app_type.value) {
    case 'wecom':
      url = 'https://work.weixin.qq.com/wework_admin/register_wx?from=loginpage'
      break
    case 'dingtalk':
      url = 'https://open-dev.dingtalk.com/?spm=dd_developers.header.unLogin.openDevBtn'
      break
  }
  window.open(url, '_blank')
}

defineExpose({
  open({ type }: { type?: Type } = {}) {
    if (type) app_type.value = type
    visible.value = true
  },
})
</script>

<style></style>
