<template>
  <component :is="CurrentComponent" ref="viewRef" :show-channel-config="showChannelConfig" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';
import { AGENT_TYPES } from '@/constants/platform/config';

const props = defineProps<{
  agentType: string
  showChannelConfig?: boolean
}>()

const components = {
  [AGENT_TYPES.PROMPT]: defineAsyncComponent(() => import('./prompt.vue')),
  [AGENT_TYPES.COZE_AGENT_CN]: defineAsyncComponent(() => import('./coze-cn.vue')),
  [AGENT_TYPES.COZE_WORKFLOW_CN]: defineAsyncComponent(() => import('./coze-cn.vue')),
  [AGENT_TYPES.COZE_AGENT_OSV]: defineAsyncComponent(() => import('./coze-osv.vue')),
  [AGENT_TYPES.COZE_WORKFLOW_OSV]: defineAsyncComponent(() => import('./coze-osv.vue')),
  [AGENT_TYPES.DIFY_AGENT]: defineAsyncComponent(() => import('./dify-agent.vue')),
  [AGENT_TYPES.DIFY_WORKFLOW]: defineAsyncComponent(() => import('./dify-agent.vue')),
  [AGENT_TYPES['53AI_AGENT']]: defineAsyncComponent(() => import('./53ai-agent.vue')),
  [AGENT_TYPES['53AI_WORKFLOW']]: defineAsyncComponent(() => import('./53ai-agent.vue')),
  [AGENT_TYPES.APP_BUILDER]: defineAsyncComponent(() => import('./app-builder-agent.vue')),
  [AGENT_TYPES.YUANQI]: defineAsyncComponent(() => import('./yuanqi.vue')),
  [AGENT_TYPES.BAILIAN]: defineAsyncComponent(() => import('./bailian.vue')),
  [AGENT_TYPES.VOLCENGINE]: defineAsyncComponent(() => import('./volcengine.vue')),
  [AGENT_TYPES.FASTGPT_AGENT]: defineAsyncComponent(() => import('./fastgpt-agent.vue')),
  [AGENT_TYPES.FASTGPT_WORKFLOW]: defineAsyncComponent(() => import('./fastgpt-agent.vue')),
  [AGENT_TYPES.MAXKB_AGENT]: defineAsyncComponent(() => import('./maxkb-agent.vue')),
  [AGENT_TYPES.N8N_WORKFLOW]: defineAsyncComponent(() => import('./n8n.vue')),
  [AGENT_TYPES.TENCENT]: defineAsyncComponent(() => import('./tencent.vue')),
}

const viewRef = ref()

// 计算当前需要显示的组件
const CurrentComponent = computed(() => components[props.agentType])

defineExpose({
  get save() {
    return viewRef.value?.save
  },
  get validateForm() {
    return viewRef.value?.validateForm
  },
  get onChannelSave() {
    return viewRef.value?.onChannelSave
  },
})
</script>
