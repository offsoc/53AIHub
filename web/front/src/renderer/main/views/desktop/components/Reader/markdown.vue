<template>
  <MarkdownEditor v-model="markdown"></MarkdownEditor>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MarkdownEditor from '@/components/Markdown/editor.vue'

import TurndownService from 'turndown'

const props = withDefaults(
  defineProps<{
    content: string
    type?: 'html' | 'markdown'
  }>(),
  {
    content: '',
    type: 'markdown'
  }
)
const markdown = ref<string>('')

const turndownService = new TurndownService({
  headingStyle: 'atx'
})

onMounted(() => {
  markdown.value = props.type === 'html' ? turndownService.turndown(props.content) : props.content
})
</script>

<style></style>
