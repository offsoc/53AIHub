<template>
  <el-dialog v-model="visible" width="700px" :close-on-click-modal="false" class="api-access-dialog">
    <template #title>{{ $t('sso.api_access.title') }}</template>
    <div class="bg-[#F6F9FC] p-4 leading-[1.85] relative change-line-text">
      {{ $t('sso.access_method') }}<br />
      {{ $t('sso.method_tip1') }}<br />
      {{ $t('sso.method_tip2') }}<span class="text-[#FA5151]">{{ link }}</span>
      <ElButton text class="p-0 w-4 h-4" type="default" @click="handleCopy('link')">
        <ElIcon :size="16" class="ml-2">
          <CopyDocument />
        </ElIcon> </ElButton
      ><br />
      <span v-if="isEncryptionEnabled"
        >{{ $t('sso.method_tip3') }}<br />
        <span class="pl-2">- username ：{{ $t('sso.username_tip') }}<br /></span>
        <span class="pl-2">- timestamp : {{ $t('sso.timestamp_tip') }}<br /></span>
        <span class="pl-2"
          >- sign ：{{ $t('sso.sign_tip', { timestamp: timestamp, username: userStore.info.username }) }}</span
        ></span
      >
      <el-link type="primary" class="right-4 top-4" style="position: absolute">{{
        $t('sso.API_documentation')
      }}</el-link>
    </div>
    <div class="mt-4">
      {{ $t('sso.enable_encryption') }}
      <el-switch v-model="isEncryptionEnabled" class="ml-2" />
    </div>
    <div v-if="isEncryptionEnabled" class="mt-2">
      Secret
      <span class="ml-2 mr-2">{{ secret }}</span>
      <ElButton text class="p-0 w-4 h-4" type="default" @click="handleCopy('secret')">
        <ElIcon :size="16" class="ml-2">
          <CopyDocument />
        </ElIcon>
      </ElButton>
      <ElButton text class="p-0" type="primary" @click="handleRecreateSecret">{{
        $t('action_restart_generation')
      }}</ElButton>
    </div>
    <div class="flex justify-center mt-8">
      <el-button type="primary" class="w-24 h-9" @click="handleSaveConfig">{{ $t('action_confirm') }}</el-button>
      <el-button class="w-24 h-9" @click="visible = false">{{ $t('action_cancel') }}</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { copyToClip } from '@/utils/copy'
import { generateSignParams } from '@/api/signature'
import { domainApi } from '@/api/modules/domain/index'
import enterpriseApi from '@/api/modules/enterprise'
import { useUserStore } from '@/stores/modules/user'
import md5 from '@/utils/md5'
import { processExclusiveDomainData, processIndependentDomainData } from '@/api/modules/domain/transform'

const emit = defineEmits(['refresh'])

const userStore = useUserStore()

const visible = ref(false)
const domain = ref('')
const isEncryptionEnabled = ref(false)
const secret = ref('')
const timestamp = ref()

interface SsoContent {
  encrypt_enabled: boolean
  secret: string
}

// 链接
const link = computed(() => {
  let url = `${domain.value}/index/apilogin`
  const username = userStore.info.username
  if (isEncryptionEnabled.value) {
    const sign = md5(`timestamp=${timestamp.value}&username=${username}${secret.value}`)
    url += `?timestamp=${timestamp.value}&username=${username}&sign=${sign}`
  } else {
    url += `?username=${username}`
  }
  return url
})

// 复制
const handleCopy = async (type: string) => {
  try {
    const copyStr = type === 'link' ? link.value : secret.value
    await copyToClip(copyStr)
    ElMessage.success(window.$t('action_copy_success'))
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 重新生成secret
const handleRecreateSecret = () => {
  secret.value = generateSignParams().sign
}

// 保存
const handleSaveConfig = async () => {
  const content = {
    encrypt_enabled: isEncryptionEnabled.value,
    secret: secret.value,
  }
  const saveRes: any = await enterpriseApi.save_enterprise_config('auth_sso', {
    content: JSON.stringify(content),
    enabled: true,
  })
  if (saveRes.code === 0) {
    ElMessage.success(window.$t(`sso.save_success`))
    visible.value = false
    emit('refresh')
  }
}

const open = async (content: SsoContent) => {
  isEncryptionEnabled.value = content.encrypt_enabled
  secret.value = content.secret
  if (!secret.value) {
    secret.value = generateSignParams().sign
  }
  timestamp.value = Math.floor(Date.now() / 1000)
  visible.value = true
}

onMounted(async () => {
  // 获取域名
  const { exclusive_domains = [], independent_domains = [] } = await domainApi.list()
  // 专属域名
  const exclusiveDomainUrl = processExclusiveDomainData(exclusive_domains[0] || {})
  // 独立域名
  const independentDomainUrl = processIndependentDomainData(independent_domains[0] || {})
  domain.value = independentDomainUrl || exclusiveDomainUrl
})

defineExpose({
  open,
})
</script>

<style>
.api-access-dialog {
  padding-bottom: 30px;
}
</style>
