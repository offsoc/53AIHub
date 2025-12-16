<template>
  <div class="h-full flex flex-col">
    <div class="flex-none h-16 flex-center bg-white">
      <template v-for="item in menus" :key="item.value">
        <div
          class="h-9 rounded-full flex-center gap-2 px-6 cursor-pointer"
          :class="[item.value === type ? 'text-[#2563EB] shadow' : 'text-[#4F5052]']"
          @click="type = item.value"
        >
          <svg-icon name="inbox" size="16"></svg-icon>
          <span class="text-base">{{ item.label }}</span>
        </div>
      </template>
    </div>
    <LazyComponent class="flex-1 mt-5 overflow-y-auto" name="content" :value="type">
      <HtmlRender :content="content" />
    </LazyComponent>
    <LazyComponent class="flex-1 mt-5 overflow-y-auto" name="knowledge" :value="type">
      <MarkdownRender :content="content" type="html" />
    </LazyComponent>
    <LazyComponent class="flex-1 mt-5 overflow-y-auto" name="summarize" :value="type">
      <SummarizeRender :content="content" type="html" />
    </LazyComponent>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import LazyComponent from '@/components/LazyComponent/index.vue'
import HtmlRender from './html.vue'
import MarkdownRender from './markdown.vue'
import SummarizeRender from './summarize.vue'

const props = withDefaults(
  defineProps<{
    content: string
  }>(),
  {
    content: ''
  }
)
const menus = ref([
  {
    label: window.$t('clean.content'),
    value: 'content'
  },
  {
    label: window.$t('clean.knowledge'),
    value: 'knowledge'
  },
  {
    label: window.$t('clean.summarize'),
    value: 'summarize'
  }
])
const type = ref('content')
</script>


<style>
</style>
