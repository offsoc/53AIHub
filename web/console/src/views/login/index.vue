<template>
  <ElContainer class="w-screen h-screen bg-white">
    <ElAside
      width="55%"
      class="relative bg-[url('/images/login/background.png')] bg-cover bg-center bg-no-repeat max-md:hidden"
    >
      <!-- #ifndef KM -->
      <img
        class="w-[24%] object-contain absolute top-8 left-10"
        :src="$getRealPath({ url: '/images/logo_2.png' })"
        alt=""
      />
      <img
        class="w-[48%] object-contain absolute top-[25%] left-1/2 -translate-x-1/2"
        :src="$getRealPath({ url: '/images/login/title.png' })"
        alt=""
      />
      <img
        class="w-[70%] object-contain absolute top-[32%] left-1/2 -translate-x-1/2"
        :src="$getRealPath({ url: '/images/login/demo.png' })"
        alt=""
      />
      <!-- #endif -->

      <!-- #ifdef KM -->
      <img
        class="w-[24%] object-contain absolute top-8 left-10"
        :src="$getRealPath({ url: '/images/km-logo.png' })"
        alt=""
      />
      <img
        class="w-[68%] object-contain absolute top-[25%] left-1/2 -translate-x-1/2"
        :src="$getRealPath({ url: '/images/login/km-title.png' })"
        alt=""
      />
      <img
        class="w-[80%] object-contain absolute top-[32%] left-1/2 -translate-x-1/2"
        :src="$getRealPath({ url: '/images/login/km-demo.png' })"
        alt=""
      />
      <!-- #endif -->
    </ElAside>
    <ElMain class="relative flex flex-col justify-center items-center pt-10 px-6 box-border overflow-auto">
      <LoginForm
        v-if="form_type === FORM_TYPE.LOGIN"
        @forget="onForgetOpen"
        @register="onRegisterOpen"
        @apply="onApplyOpen"
        @list="onListOpen"
      />
      <CreateNewEnterprise v-else-if="form_type === FORM_TYPE.APPLY" @login="onLoginOpen" @list="onListOpen" />
      <EnterpriseList v-else-if="form_type === FORM_TYPE.LIST" @apply="onApplyOpen" @back="handleBack" />
      <ForgetForm v-else-if="form_type === FORM_TYPE.FORGET" @login="onLoginOpen" @register="onRegisterOpen" />
      <RegisterForm v-else-if="form_type === FORM_TYPE.REGISTER" @login="onLoginOpen" />
    </ElMain>
  </ElContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoginForm from './components/login-form.vue'
import ForgetForm from './components/forget-form.vue'
import RegisterForm from './components/register-form.vue'
import CreateNewEnterprise from './components/create-enterprise-form.vue'
import EnterpriseList from './components/enterprise-list.vue'

const FORM_TYPE = {
  LOGIN: 'login',
  APPLY: 'apply',
  FORGET: 'forget',
  REGISTER: 'register',
  LIST: 'list',
} as const

type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE]

const form_type = ref<FormType>(FORM_TYPE.LOGIN)
const prev_form_type = ref<FormType>(FORM_TYPE.LOGIN)

const onApplyOpen = async () => {
  prev_form_type.value = form_type.value
  form_type.value = FORM_TYPE.APPLY
}
const onForgetOpen = () => {
  prev_form_type.value = form_type.value
  form_type.value = FORM_TYPE.FORGET
}
const onLoginOpen = () => {
  prev_form_type.value = form_type.value
  form_type.value = FORM_TYPE.LOGIN
}
const onRegisterOpen = () => {
  prev_form_type.value = form_type.value
  form_type.value = FORM_TYPE.REGISTER
}
const onListOpen = () => {
  prev_form_type.value = form_type.value
  form_type.value = FORM_TYPE.LIST
}
const handleBack = () => {
  form_type.value = prev_form_type.value
}

onMounted(() => {
  // KM切换企业-点击创建新企业时进入创建页面
  if (localStorage.getItem('login_type') === 'apply') {
    form_type.value = FORM_TYPE.APPLY
  }
})
</script>

<style lang="scss" scoped></style>
