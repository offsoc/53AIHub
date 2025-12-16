<template>
  <ElButton
    class="absolute top-6 right-8 !p-0 !border-none !outline-none !bg-transparent !leading-1 !h-auto hover:opacity-70"
    type="default"
    text
    @click="createNewEnterprise"
  >
    <SvgIcon class="mr-1" name="create" width="13" />
    {{ $t('create_new_enterprise') }}
  </ElButton>
  <ElForm ref="form_ref" class="relative max-w-[440px] w-full" :model="form" label-position="top">
    <h4 class="text-3xl text-[#1D1E1F] font-bold text-center mb-10">
      {{ $t(`login.${form.type}_login`) }}
    </h4>
    <template v-if="form.type === 'mobile'">
      <ElFormItem
        prop="username"
        :rules="generateInputRules({ message: 'login.mobile_placeholder', validator: ['text', 'mobile'] })"
      >
        <template #label>
          <span class="text-[#1D1E1F]">{{ $t('mobile') }}</span>
        </template>
        <ElInput
          v-model="form.username"
          style="--el-input-height: 44px"
          autocomplete="new-username"
          name="prevent_autofill_username"
          size="large"
          :placeholder="$t('login.mobile_placeholder')"
          clearable
          @input="checkAccountValidation"
          @blur="checkAccountValidation"
        />
      </ElFormItem>
      <ElFormItem
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
        <div
          class="absolute left-0 -bottom-7 text-xs text-[#9A9A9A]"
          v-html="
            $t('login.agree_and_policy', {
              agree: `<span class=\'agree-hook cursor-pointer text-[#4F5052] text-xs mx-1 -mt-0.5 underline underline-offset-4\'>${$t('login.agree')}</span>`,
              policy: `<span class=\'policy-hook cursor-pointer text-[#4F5052] text-xs mx-1 -mt-0.5 underline underline-offset-4\'>${$t('login.policy')}</span>`,
            })
          "
        />
      </ElFormItem>
      <ElButton
        type="primary"
        round
        class="w-full mt-10 !h-10"
        :disabled="!form.username || !form.verify_code"
        :loading="submitting"
        @click="onLogin"
      >
        {{ $t('action_login') }}
      </ElButton>
    </template>
    <template v-if="form.type === 'password'">
      <ElFormItem
        prop="username"
        :rules="generateInputRules({ message: 'login.account_placeholder', validator: ['text'] })"
      >
        <template #label>
          <span class="text-[#1D1E1F]">{{ $t('account') }}</span>
        </template>
        <ElInput
          v-model="form.username"
          style="--el-input-height: 44px"
          size="large"
          :placeholder="$t('login.account_placeholder')"
          clearable
        />
      </ElFormItem>
      <ElFormItem
        class="relative"
        prop="password"
        :rules="[
          ...generateInputRules({ message: 'login.password_placeholder', validator: ['password'] }),
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
          @keyup.enter="onLogin"
        />
        <div class="w-full absolute right-0 -bottom-9 flex justify-between items-center">
          <div
            class="text-xs text-[#9A9A9A]"
            v-html="
              $t('login.agree_and_policy', {
                agree: `<span class=\'agree-hook cursor-pointer text-[#4F5052] text-xs mx-1 -mt-0.5 underline underline-offset-4\'>${$t('login.agree')}</span>`,
                policy: `<span class=\'policy-hook cursor-pointer text-[#4F5052] text-xs mx-1 -mt-0.5 underline underline-offset-4\'>${$t('login.policy')}</span>`,
              })
            "
          />
          <ElButton type="text" class="bg-transparent text-sm" @click="onForgetPassword">
            {{ $t('login.forget_password') }}
          </ElButton>
        </div>
      </ElFormItem>
      <ElButton
        type="primary"
        round
        class="w-full mt-10 !h-10"
        :disabled="!form.username || !form.password"
        :loading="submitting"
        @click="onLogin"
      >
        {{ $t('action_login') }}
      </ElButton>
    </template>
    <template v-if="form.type === 'wechat'">
      <WeChat @oauth-success="handleOauthSuccess" />
    </template>
    <template v-if="form.type === 'bind_mobile'">
      <ElFormItem
        prop="username"
        class="mt-5"
        label-position="top"
        :rules="generateInputRules({ message: 'login.mobile_placeholder', validator: ['text', 'mobile'] })"
      >
        <template #label>
          <span class="text-[#1D1E1F]">{{ $t('mobile') }}</span>
        </template>
        <ElInput
          v-model="form.username"
          style="--el-input-height: 44px"
          autocomplete="new-username"
          name="prevent_autofill_username"
          size="large"
          :placeholder="$t('login.mobile_placeholder')"
          clearable
        />
      </ElFormItem>
      <ElFormItem
        class="relative"
        prop="verify_code"
        :rules="generateInputRules({ message: 'verification_code_placeholder' })"
      >
        <VerificationCodeInput ref="verify_code_input_ref" v-model="form.verify_code" :account="form.username" />
      </ElFormItem>
      <ElButton
        type="primary"
        round
        class="w-full mt-8 !h-10"
        :disabled="!form.username || !form.verify_code"
        :loading="submitting"
        @click="onLogin"
      >
        {{ $t('action_confirm') }}
      </ElButton>
    </template>
    <ElDivider class="!w-[80%] !mx-auto">
      <span class="text-[#9A9A9A]">{{ $t('other_login_method') }}</span>
    </ElDivider>
    <div class="flex justify-around text-sm">
      <div
        v-for="item in loginWayOptions"
        :key="item.type"
        class="w-14 flex flex-col items-center gap-3 cursor-pointer hover:opacity-70"
        :class="form.type === item.type ? 'text-[#2563eb]' : 'text-[#4f5052]'"
        @click="handleLoginWayChange(item.type)"
      >
        <SvgIcon :name="item.icon" width="25" :color="form.type === item.type ? '#2563eb' : '#4f5052'" />
        {{ item.label }}
      </div>
    </div>
  </ElForm>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import WeChat from './wechat.vue'
import { useUserStore } from '@/stores'
import { generateInputRules } from '@/utils/form-rule'
import { validateFormField } from '@/utils/form-validator'
import eventBus from '@/utils/event-bus'

const emits = defineEmits<{
  (e: 'forget'): void
  (e: 'register'): void
  (e: 'apply'): void
  (e: 'login-success'): void
  (e: 'list'): void
}>()

interface loginWayOption {
  type: 'mobile' | 'wechat' | 'password'
  icon: string
  label: string
}
const loginWayOptions: loginWayOption[] = [
  {
    type: 'wechat',
    icon: 'wechat-new',
    label: window.$t('wechat'),
  },
  {
    type: 'password',
    icon: 'account',
    label: window.$t('account_psd'),
  },
  {
    type: 'mobile',
    icon: 'mobile-new',
    label: window.$t('mobile_login'),
  },
]

const user_store = useUserStore()
const form_ref = ref()
const verify_code_input_ref = ref()
const form = reactive({
  type: 'password',
  username: '',
  password: '',
  verify_code: '',
})
const submitting = ref(false)
const oauth_data = ref<any>({})
const isAccountValid = ref(false)

const createNewEnterprise = () => {
  emits('apply')
}

// 检查账号验证状态
const checkAccountValidation = async () => {
  isAccountValid.value = await validateFormField(form_ref, 'username')
}

const onLanguageChange = () => {
  if (form_ref.value) form_ref.value.clearValidate()
  // form_ref.value.validate()
}

const reset = () => {
  form.type = 'password'
  form.username = ''
  form.password = ''
  form.verify_code = ''
}
const onLogin = async () => {
  const valid = await form_ref.value.validate()
  if (!valid) return
  submitting.value = true
  if (form.type.includes('mobile')) {
    const valid = await verify_code_input_ref.value.validateCode()
    if (!valid) return (submitting.value = false)
  }
  if (form.type === 'bind_mobile') {
    await user_store.bind_wechat({
      mobile: form.username,
      verify_code: form.verify_code,
      openid: oauth_data.value.openid,
      unionid: oauth_data.value.unionid,
      nickname: oauth_data.value.nickname,
      from: 'saas',
    })
  } else {
    const data = await user_store
      .login({ type: form.type, data: form, hideError: true })
      .catch(err => {
        // if (err.code == RESPONSE_CODE_UNAUTHORIZED_ERROR && err.origin_message == 'unauthorized: user not found') {
        // 	onRegister()
        // } else ElMessage.warning(window.$t(err.message))
        ElMessage.warning(
          window.$t(
            err.origin_message === 'unauthorized'
              ? 'response_message.user_not_found'
              : 'response_message.username_or_password_is_incorrect'
          )
        )
        return Promise.reject(err)
      })
      .finally(() => {
        submitting.value = false
      })
  }
  ElMessage.success(window.$t('action_login_success'))
  emits('list')
  reset()
}

const handleOauthSuccess = async (data: any) => {
  await user_store.wechat_login({ unionid: data.unionid, from: 'saas' }).catch(err => {
    oauth_data.value = data
    form.type = 'bind_mobile'
    return Promise.reject(err)
  })
  emits('list')
  ElMessage.success(window.$t('action_login_success'))
  reset()
}

const onForgetPassword = () => {
  emits('forget')
}
const onRegister = () => {
  emits('register')
}
const onPasswordLogin = () => {
  form.username = ''
  form.password = ''
  form.verify_code = ''
  form.type = 'password'
}
const onMobileLogin = () => {
  form.username = ''
  form.password = ''
  form.verify_code = ''
  form.type = 'mobile'
}
const onWechatLogin = () => {
  form.type = 'wechat'
}
const onGoogleLogin = () => {
  ElMessage.warning(window.$t('feature_coming_soon'))
}
const handleLoginWayChange = (type: 'mobile' | 'wechat' | 'password') => {
  if (type === 'mobile') onMobileLogin()
  if (type === 'wechat') onWechatLogin()
  if (type === 'password') onPasswordLogin()
}
const onAgree = () => {
  ElMessage.warning(window.$t('feature_coming_soon'))
}
const onPolicy = () => {
  ElMessage.warning(window.$t('feature_coming_soon'))
}

onMounted(() => {
  const agree_hook_el = form_ref.value.$el.querySelector('.agree-hook')
  agree_hook_el.onclick = onAgree
  const policy_hook_el = form_ref.value.$el.querySelector('.policy-hook')
  policy_hook_el.onclick = onPolicy
  eventBus.on('language-change', onLanguageChange)
})
onUnmounted(() => {
  eventBus.off('language-change', onLanguageChange)
})
defineExpose({
  reset,
})
</script>

<style>
.dialog .el-dialog__header {
  border: none !important;
}
</style>
