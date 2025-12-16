<template>
  <ElButton
    class="absolute top-6 right-8 !p-0 !border-none !outline-none !bg-transparent !leading-1 !h-auto hover:opacity-70"
    type="default"
    text
    @click="emits('login')"
  >
    <SvgIcon class="mr-1" name="account" width="13" />
    {{ $t('action_login') }}
  </ElButton>
  <ElForm ref="form_ref" v-loading="loading" class="relative max-w-[440px] w-full" :model="form" label-position="top">
    <h4 class="text-3xl text-[#1D1E1F] font-bold text-center mb-10">
      <!-- #ifndef KM -->
      {{ $t('apply.create_title', { project: 'Hub' }) }}
      <!-- #endif -->
      <!-- #ifdef KM -->
      {{ $t('apply.create_title', { project: 'KM' }) }}
      <!-- #endif -->
    </h4>
    <template v-if="active_step === 0">
      <ElFormItem
        prop="enterprise_name"
        :rules="generateInputRules({ message: 'apply.enterprise_not_empty', validator: ['text'] })"
      >
        <template #label>
          <span class="text-[#1D1E1F]">{{ $t('name') }}</span>
        </template>
        <ElInput
          v-model="form.enterprise_name"
          style="--el-input-height: 44px"
          size="large"
          :placeholder="$t(`apply.enterprise_name_placeholder`)"
          clearable
        />
      </ElFormItem>
      <ElFormItem
        prop="domain"
        :rules="[
          {
            validator: (rule, value, callback, message) => domainValidator({ rule, value, callback, message }),
            trigger: 'blur',
          },
        ]"
      >
        <template #label>
          <span class="text-[#1D1E1F]">{{ $t('apply.domain') }}</span>
        </template>
        <ElInput
          v-model="form.domain"
          style="--el-input-height: 44px"
          class="domain-input"
          size="large"
          :placeholder="$t(`apply.domain_placeholder`)"
          clearable
        >
          <template #append>
            <div class="w-[130px] border-[1px] border-[#e6e8eb] rounded-r-md bg-white">
              <!-- #ifndef KM -->
              53ai.com
              <!-- #endif -->
              <!-- #ifdef KM -->
              km.53ai.com
              <!-- #endif -->
            </div>
          </template>
        </ElInput>
      </ElFormItem>
      <ElFormItem
        prop="username"
        :rules="
          generateInputRules({
            message: 'login.mobile_placeholder',
            validator: ['text', 'mobile'],
          })
        "
        class="relative"
      >
        <template #label>
          <span class="text-[#1D1E1F]">{{ $t('mobile') }}</span>
        </template>
        <ElInput
          v-model="form.username"
          style="--el-input-height: 44px"
          autocomplete="off"
          name="prevent_autofill_username"
          size="large"
          :placeholder="$t('login.mobile_placeholder')"
          clearable
          :disabled="user_store.info.username"
          @input="checkAccount"
          @blur="checkAccount"
        />
        <div
          v-if="!user_store.info.username && isAccountValidNow && !isAccountExists"
          class="text-xs leading-3 absolute top-full left-0 translate-y-[2px] text-[#07C160]"
        >
          {{ $t('apply.mobile_unregistered_tip') }}
        </div>
      </ElFormItem>
      <transition name="fade-slow">
        <ElFormItem
          v-if="!user_store.info.username && isAccountValid"
          class="relative"
          prop="verify_code"
          :rules="generateInputRules({ message: 'verification_code_placeholder' })"
        >
          <template #label>
            <span class="text-[#1D1E1F]">{{ $t('verification_code') }}</span>
          </template>
          <VerificationCodeInput
            ref="verify_code_input_ref"
            v-model="form.verify_code"
            :account="form.username"
            :disabled="!isAccountValid"
          />
        </ElFormItem>
      </transition>
      <transition name="fade-slow">
        <ElFormItem
          v-if="!user_store.info.username && isAccountValid && !isAccountExists"
          class="relative"
          prop="password"
          :rules="[
            ...generateInputRules({
              message: 'login.password_placeholder',
              validator: ['password'],
            }),
            {
              min: 8,
              max: 20,
              message: $t('login.password_length_v2'),
              trigger: 'blur',
            },
          ]"
        >
          <template #label>
            <span class="text-[#1D1E1F]">{{ $t('password') }}</span>
          </template>
          <ElInput
            v-model="form.password"
            style="--el-input-height: 44px"
            size="large"
            type="password"
            show-password
            clearable
            :placeholder="$t('login.password_placeholder')"
            @keyup.enter="onNextStep"
          />
        </ElFormItem>
      </transition>
      <ElButton
        type="primary"
        round
        class="w-full mt-6 !h-10"
        :loading="submitting"
        :disabled="comfirmBtnDisabled"
        @click.stop="onNextStep"
      >
        {{ $t('action_confirm') }}
      </ElButton>
    </template>
    <template v-else-if="active_step === 1">
      <div
        class="h-[424px] p-10 box-border bg-[#EFF9FF] rounded-lg flex flex-col items-center justify-center text-center"
      >
        <div class="flex items-center justify-center gap-2">
          <ElIcon color="#4CBF65" size="28">
            <CircleCheckFilled />
          </ElIcon>
          <span class="text-[#1D1E1F] text-2xl font-bold">{{ $t('apply.waiting_audit') }}</span>
        </div>
        <div class="text-[#666] text-sm mt-4">
          {{ $t('apply_success_desc') }}
        </div>
        <img class="w-[148px] object-contain mt-14" src="//chat.53ai.com/images/upgrade-qrcode.png" />
      </div>
    </template>
  </ElForm>
</template>

<script setup lang="ts">
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { onMounted, onUnmounted, reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useEnterpriseStore, useUserStore } from '@/stores'
import { generateInputRules } from '@/utils/form-rule'
import eventBus from '@/utils/event-bus'
import { domainApi } from '@/api/modules/domain'
import { authApi } from '@/api/modules/auth'

const emits = defineEmits<{
  (e: 'login'): void
  (e: 'list'): void
}>()

const user_store = useUserStore()
const enterprise_store = useEnterpriseStore()
const form_ref = ref()
const verify_code_input_ref = ref()
const active_step = ref(0)
const form = reactive({
  enterprise_name: '',
  domain: '',
  username: '',
  verify_code: '',
  password: '',
})
const submitting = ref(false)
const loading = ref(false)
const isAccountValid = ref(false)
const isAccountExists = ref(true)
const isAccountValidNow = ref(true)

// 按钮是否禁用
const comfirmBtnDisabled = computed(() => {
  // 已登录
  if (user_store.info.username) {
    return !(form.enterprise_name && form.domain)
  }
  // 未登录但手机号已注册
  if (isAccountExists.value) {
    return !(form.enterprise_name && form.domain && form.username && form.verify_code)
  }
  // 未登录且手机号未注册
  return !(form.enterprise_name && form.domain && form.username && form.verify_code && form.password)
})

// 域名校验
const domainValidator = async ({ rule, value, callback, message } = {}) => {
  if (!/^[a-z0-9-]{5,20}$/.test(form.domain)) {
    callback('请使用小写字母或数字或"-"，且不少于5个字符不超过20个字符')
    return
  }
  try {
    const { available } = await domainApi.checkIsDomainExists(form.domain)
    if (!available) {
      // callback(`${form.domain} 已被使用，试试其他域名吧~`)
      callback(window.$t('apply.domain_already_use', { domain: form.domain }))
    }
  } catch (error) {
    callback(window.$t('apply.domain_already_use', { domain: form.domain }))
  }
}

// 手机号校验
const checkAccount = async () => {
  try {
    await form_ref.value.validateField('username')
    isAccountValid.value = true
    isAccountValidNow.value = true
    const { exists = false } = await authApi.checkAccount({ data: { account: form.username } })
    isAccountExists.value = exists
  } catch (err) {
    isAccountValidNow.value = false
  }
}

const reset = () => {
  form.enterprise_name = ''
  form.domain = ''
  form.username = ''
  form.verify_code = ''
  form.password = ''
}

// 手机验证码登录
const mobileLogin = async () => {
  await user_store.login({ type: 'mobile', data: form, hideError: true }).catch(err => {
    ElMessage.warning(
      window.$t(
        err.origin_message === 'unauthorized'
          ? 'response_message.user_not_found'
          : 'response_message.username_or_password_is_incorrect'
      )
    )
    return Promise.reject(err)
  })
}

// 注册
const register = async () => {
  await user_store
    .login({
      type: 'password',
      data: {
        username: form.username,
        password: form.password,
        verify_code: form.verify_code,
      },
      hideError: false,
    })
    .catch(err => {
      return Promise.reject(err)
    })
}

// 设置初始密码
const setPassword = async () => {
  await user_store
    .resetPassword({
      data: {
        mobile: form.username,
        email: '',
        new_password: form.password,
        confirm_password: form.password,
        verify_code: form.verify_code,
      },
    })
    .catch(err => {
      return Promise.reject(err)
    })
}

// 申请创建企业
const createEnterprise = async () => {
  await enterprise_store
    .apply({
      data: {
        contact_name: form.enterprise_name,
        enterprise_name: form.enterprise_name,
        domain: form.domain,
        phone: form.username,
        email: '',
      },
      hideError: false,
    })
    .then(() => {
      emits('list')
      ElMessage.success(window.$t('apply.create_success'))
    })
}

const onNextStep = async () => {
  try {
    await form_ref.value.validate()
  } catch (error) {
    return
  }
  switch (active_step.value) {
    case 0:
      submitting.value = true
      try {
        // 已登录-创建企业
        if (user_store.info.username) {
          await createEnterprise()
        } else {
          // 未登录
          // 验证码校验
          const valid = await verify_code_input_ref.value.validateCode()
          if (!valid) {
            submitting.value = false
            return
          }
          // 手机号未注册
          if (!isAccountExists.value) {
            // 注册
            await register()
            // 设置初始密码
            await setPassword()
          }
          // 验证码登录
          await mobileLogin()
          // 创建企业
          await createEnterprise()
          reset()
        }
      } catch (error) {
        console.log('error', error)
        submitting.value = false
      }
      break
    case 1:
      break
    default:
      break
  }
}

const onLanguageChange = () => {
  if (form_ref.value) form_ref.value.clearValidate()
}

onMounted(async () => {
  form.username = user_store.info.username
  const { access_token } = user_store.info
  if (access_token) {
    loading.value = true
    // 待审核
    const { list = [] } = await enterprise_store.loadListData({ data: { status: 0 } }).finally(() => {
      loading.value = false
    })
    if (list.length > 0) active_step.value = 1
  }
  eventBus.on('language-change', onLanguageChange)
  if (localStorage.getItem('login_type')) {
    localStorage.removeItem('login_type')
  }
})

onUnmounted(() => {
  eventBus.off('language-change', onLanguageChange)
})

defineExpose({
  reset,
})
</script>

<style scoped lang="scss">
:deep(.domain-input .el-input-group__append) {
  padding: 0 !important;
  text-align: center;
}

.fade-slow-enter-from,
.fade-slow-leave-to {
  opacity: 0;
}
.fade-slow-enter-active,
.fade-slow-leave-active {
  transition: all 0.5s linear;
}
.fade-slow-enter-to {
  opacity: 1;
}

::v-deep(.el-step__line) {
  left: 70% !important;
  right: -30% !important;
  background-color: #e9ebee !important;
}
::v-deep(.el-step__title) {
  margin-top: 8px;
  font-weight: 400 !important;
}
::v-deep(.el-step__head.is-finish .el-step__line) {
  background-color: #3664ef !important;
}
</style>
