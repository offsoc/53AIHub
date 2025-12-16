<script setup lang="ts">
import { ArrowLeft, ArrowRight, Close } from '@element-plus/icons-vue'
import PromptDetailView from '@/views/prompt/detail/index.vue'

import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavigationStore } from '@/stores/modules/navigation'
import SvgIcon from '@/components/SvgIcon.vue'

const locationHref = window.location.href
const route = useRoute()
const router = useRouter()
const navigationStore = useNavigationStore()

const promptDetailRef = ref<InstanceType<typeof PromptDetailView>>()

const detailData = computed(() => {
  return promptDetailRef.value?.detailData || {}
})

onMounted(() => {
  // navigationStore.fetchNavigations()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <section class="w-11/12 lg:w-4/5 py-6 px-4 mx-auto box-border">
      <div class="relative w-full flex items-center gap-4 box-border">
        <ElBreadcrumb class="flex-1 w-0" :separatorIcon="ArrowRight">
          <ElBreadcrumbItem v-if="navigationStore.homeNavigation.menu_path" :to="navigationStore.homeNavigation.menu_path" replace>
            <span class="text-regular font-normal hover-text-theme">
              {{ navigationStore.homeNavigation.name }}
            </span>
          </ElBreadcrumbItem>
          <ElBreadcrumbItem v-if="navigationStore.promptNavigation.menu_path" :to="navigationStore.promptNavigation.menu_path" replace>
            <span class="text-regular font-normal hover-text-theme">
              {{ navigationStore.promptNavigation.name }}
            </span>
          </ElBreadcrumbItem>
          <ElBreadcrumbItem>
            <span class="text-primary inline-block truncate max-w-[10em] md:max-w-[30rem]" :title="detailData.name">
              {{ detailData.name }}
            </span>
          </ElBreadcrumbItem>
        </ElBreadcrumb>
        <ElButton link @click="promptDetailRef?.showUseCase()">
          <SvgIcon class="mr-1.5" name="layout-split" size="18" />
          {{ $t('chat.usage_guide') }}
        </ElButton>
      </div>
      <PromptDetailView
        ref="promptDetailRef"
        mainClass="!px-0 !max-w-none"
        guideClass="!max-w-none"
        hideMenuHeader
        hideFooter
        showRecommend
        hideContentTitle
        useCaseFixed
      />
    </section>
  </div>
</template>

<style scoped></style>
