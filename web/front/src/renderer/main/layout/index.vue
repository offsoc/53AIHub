<template>
  <div class="h-full flex">
    <Sider v-if="showSidebar"></Sider>
    <main ref="mainRef" class="flex-1 overflow-y-auto">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" v-if="!route?.meta?.softCustom" :key="route.path" />
        <!-- 软件模式下自定义页面 -->
        <SoftCustom v-else></SoftCustom>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEnterpriseStore } from '@/stores/modules/enterprise'
import { useAgentStore } from '@/stores/modules/agent'

import Sider from './sider.vue'
import SoftCustom from '@/views/custom/index.vue'

const mainRef = ref<HTMLElement>()
const route = useRoute()
const enterpriseStore = useEnterpriseStore()
const agentStore = useAgentStore()

provide('mainRef', mainRef)

const showSidebar = computed(() => {
  const routes = ['Chat', 'Agent', 'Toolkit', 'Prompt', 'PromptDetail', 'Profile', 'Order']
  return (routes.includes(route.name as string) && enterpriseStore.isSoftStyle) || route?.meta?.softCustom
})

watch(
  () => agentStore.boxHeight,
  (newHeight) => {
    mainRef.value.scrollTop = newHeight
  }
)

onMounted(() => {})
</script>

<style></style>
