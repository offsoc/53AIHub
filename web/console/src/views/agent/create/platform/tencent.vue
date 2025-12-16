<template>
  <div :class="[showChannelConfig ? '' : 'py-7']">
    <ElForm ref="form_ref" :model="store.form_data" label-width="104px" label-position="top">
      <template v-if="showChannelConfig">
        <div class="text-base text-[#1D1E1F] font-medium mb-3">
          {{ $t('agent_app.tencent') }}
        </div>
        <el-form-item :label="$t('module.website_info_name')">
          <el-select v-model="store.form_data.custom_config.provider_id" size="large" @change="onProviderChange">
            <el-option v-for="item in providers" :key="item.provider_id" :label="item.name" :value="item.provider_id" />
          </el-select>
        </el-form-item>

        <div class="flex items-center gap-4 mb-9">
          <ElFormItem
            class="flex-1 mb-0"
            :label="$t('agent.name')"
            prop="custom_config.tencent_bot_id"
            :rules="generateInputRules({ message: 'form_select_placeholder' })"
          >
            <SelectPlus
              v-model="store.form_data.custom_config.tencent_bot_id"
              size="large"
              :options="bots"
              :use-i18n="false"
              @change="onBotChange"
            />
          </ElFormItem>
        </div>
        <div class="text-base text-[#1D1E1F] font-medium mb-4">
          {{ $t('agent.base_info') }}
        </div>
        <AgentInfo v-model="store.form_data" />
      </template>
      <template v-if="!showChannelConfig">
        <BaseConfig />
        <RelateApp />
        <ExpandConfig />
        <UseScope />
      </template>
      <!-- <div class="border-t mb-4" />
      <LimitConfig /> -->
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AgentInfo from '../components/agent-info.vue'
import BaseConfig from '../components/base-config.vue'
import ExpandConfig from '../components/expand-config.vue'
import UseScope from '../components/use-scope.vue'
import RelateApp from '../components/relate-agents.vue'

import { useAgentFormStore } from '../store'
import { generateInputRules } from '@/utils/form-rule'

import { PROVIDER_VALUES } from '@/constants/platform/config'
import providersApi from '@/api/modules/providers/index'
import { transformProviderList } from '@/api/modules/providers/transform'
import { ProviderItem } from '@/api/modules/providers/types'
import agentApi, { TencentAppItem, transformTencentAppItem } from '@/api/modules/agent'

const props = defineProps({
  showChannelConfig: {
    type: Boolean,
    default: false,
  },
})

const store = useAgentFormStore()

const providers = ref<ProviderItem[]>([])
const bots = ref<TencentAppItem[]>([])

const form_ref = ref()

const validateForm = async () => form_ref.value.validate()

const onBotChange = (data: { value: string; option: any }) => {
  if (!store.agent_id) {
    store.form_data.logo = data.option.icon
    store.form_data.name = data.option.label
    store.form_data.description = data.option.description || ''
  }
  agentApi.tencent.detail(data.value)
}

const loadBots = async () => {
  const customConfig = store.form_data.custom_config
  const list = await agentApi.tencent.bots_list({
    provider_id: customConfig.provider_id,
  })
  bots.value = list.map(transformTencentAppItem)
}

const loadProviders = async () => {
  const list = await providersApi.list({
    providerType: PROVIDER_VALUES.TENCENT,
  })
  providers.value = transformProviderList(list)

  if (providers.value.length && !store.form_data.custom_config.provider_id) {
    store.form_data.custom_config.provider_id = providers.value[0].provider_id
  }
  loadBots()
}

const onProviderChange = () => {
  store.form_data.custom_config.tencent_bot_id = ''
}

onMounted(() => {
  if (props.showChannelConfig) {
    loadProviders()
  }
})

defineExpose({
  validateForm,
})
</script>

<style scoped></style>
