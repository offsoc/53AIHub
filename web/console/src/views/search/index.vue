<template>
  <Layout class="px-[60px] py-8">
    <Header :title="$t('module.search')" />
    <div
      v-loading="isLoading"
      class="flex-1 flex flex-col bg-white p-6 mt-3 box-border max-h-[calc(100vh-100px)] overflow-auto"
    >
      <div class="max-w-3xl">
        <div class="flex mb-4">
          <div class="flex-none w-[100px] h-10 flex items-center justify-between gap-2">
            <div class="text-sm text-[#1D1E1F]">
              {{ $t('base_setting') }}
            </div>
          </div>

          <el-input
            v-model="form.settings.opening_statement"
            type="textarea"
            :rows="8"
            resize="none"
            class="w-full"
            :maxlength="200"
            show-word-limit
          />
        </div>
        <div class="w-full flex mb-4">
          <div class="flex-none w-[100px] h-10 flex items-center justify-between gap-2">
            <div class="text-sm text-[#1D1E1F]">
              {{ $t('suggested_questions') }}
            </div>
          </div>
          <div class="flex-1">
            <Sortable v-model="form.settings.suggested_questions" identity="id" class="w-full flex flex-col gap-4">
              <template #item="{ item }">
                <div class="flex items-center border px-2 border-[#DCDFE6] rounded-sm">
                  <div class="sort-icon cursor-move">
                    <svg-icon name="drag" width="16px" height="32px" color="#a1a5af" />
                  </div>
                  <div class="flex-1">
                    <el-input
                      v-model="item.content"
                      size="large"
                      style="
                        --el-input-border-color: none;
                        --el-input-hover-border-color: none;
                        --el-input-focus-border-color: none;
                      "
                      :placeholder="$t('form_input_placeholder')"
                      :maxlength="50"
                      show-word-limit
                      class="w-full"
                    />
                  </div>
                  <el-icon class="ml-4 cursor-pointer" color="rgba(24, 43, 80, 0.4)" @click="handleDel(item.id)">
                    <Delete />
                  </el-icon>
                </div>
              </template>
            </Sortable>
            <div class="flex items-center gap-2 mt-4">
              <el-button size="large" type="primary" plain class="border-none" @click="handleAdd">
                +{{ $t('action_add') }}
              </el-button>
              <p class="text-sm text-[#999999]">最多可设置4个问题</p>
            </div>
          </div>
        </div>
        <div class="flex mb-4">
          <div class="flex-none w-[100px] h-10 flex items-center justify-between gap-2">
            <div class="text-sm text-[#1D1E1F]">
              {{ $t('over_response') }}
            </div>
          </div>
          <MarkdownEditor
            v-model="form.settings.out_of_range_reply.reply"
            type="simple"
            class="w-full"
            height="200px"
          />
        </div>
        <div class="flex mb-4">
          <div class="flex-none w-[100px] h-10 flex items-center justify-between gap-2">
            <div class="text-sm text-[#1D1E1F]">
              {{ '模型设置' }}
            </div>
          </div>
          <div class="flex items-center flex-wrap gap-2 mb-2">
            <ModelView
              v-for="item in modelList"
              :key="item.channel_id"
              class="h-9 px-3 border rounded"
              :channel-id="item.channel_id"
              :model="item.model"
            />
            <el-button link type="primary" @click="handleModelSelect">
              {{ $t('action_add') }}
            </el-button>
          </div>
        </div>
        <div class="flex mb-4">
          <div class="flex-none w-[100px] h-10 flex items-center justify-between gap-2">
            <div class="text-sm text-[#1D1E1F]">
              {{ '重排序模型' }}
            </div>
          </div>
          <div class="max-w-72">
            <ModelSelect v-model="rerankModel" clearable :type="MODEL_USE_TYPE.RERANKER" />
          </div>
        </div>
        <div v-if="false" class="flex mb-4">
          <div class="flex-none w-[100px] h-10 flex items-center justify-between gap-2">
            <div class="text-sm text-[#1D1E1F]">
              {{ '知识库检索' }}
            </div>
          </div>
          <div class="max-w-72">
            <ModelSelect v-model="rerankModel" clearable :type="MODEL_USE_TYPE.RERANKER" />
          </div>
        </div>
      </div>
      <div class="mt-5">
        <el-button v-debounce type="primary" size="large" @click="handleSave">
          {{ $t('action_save') }}
        </el-button>
      </div>
    </div>
    <ModelDialog
      ref="modelDialogRef"
      :default-selected="modelList.map(item => `${item.channel_id}_${item.model}_${item.channel_type}`)"
      @confirm="handleModelConfirm"
    />
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Delete } from '@element-plus/icons-vue'

import MarkdownEditor from '@/components/Markdown/editor.vue'
import Sortable from '@/components/Sortable/index.vue'
import ModelSelect from '@/components/Model/select.vue'
import ModelDialog from '@/components/Model/dialog.vue'
import ModelView from '@/components/Model/view.vue'

import { MODEL_USE_TYPE } from '@/constants/platform/config'
import { deepCopy, generateRandomId } from '@/utils'

import agentsApi from '@/api/modules/agents/index'
import { transformAgentInfo } from '@/api/modules/agents/transform'

import { useEnterpriseStore } from '@/stores'

const enterpriseStore = useEnterpriseStore()

const MAX_QUESTION_LENGTH = 4

const DEFAULT_SETTINGS = {
  name: '',
  logo: '',
  description: '',
  model: '',
  enable: true,
  agent_type: 0,
  channel_type: 0,
  prompt: '',
  sort: 0,
  configs: { completion_params: { temperature: 0.2, top_p: 0.75, presence_penalty: 0.5, frequency_penalty: 0.5 } },
  custom_config: {
    agent_type: 'prompt',
    provider_id: 0,
    channel_id: 0,
    channel_config: {},
    file_parse: { enable: false },
    image_parse: { enable: false },
    agent_mode: 'chat',
  },
  settings: {
    opening_statement: `你好，我是${enterpriseStore.info.name}助手。无论你有什么问题，我都会尽我所能为你提供帮助和支持。`,
    suggested_questions: [
      { id: generateRandomId(10), content: '最近几年哪几个行业的前景不错？' },
      { id: generateRandomId(10), content: '说说AI行业的发展趋势和重要事件' },
    ],
    out_of_range_reply: {
      enable: true,
      reply: '当前问题可能因内容未收录、解析中或权限限制无法解答。',
    },
    rerank_config: {
      rerank_model: '',
      rerank_channel_type: 0,
      rerank_channel_id: 0,
    },
  },
}

const modelDialogRef = ref<InstanceType<typeof ModelDialog>>()

const isLoading = ref(false)
const form = ref({
  ...deepCopy(DEFAULT_SETTINGS),
})
const modelList = ref<{ channel_id: number; channel_type: number; model: string }[]>([])
const rerankModel = ref('')

const handleAdd = () => {
  const questions = form.value.settings.suggested_questions
  if (questions.length >= MAX_QUESTION_LENGTH) {
    ElMessage.error(`${window.$t('max_add_tip', { max: MAX_QUESTION_LENGTH })}`)
    return
  }
  questions.push({ id: generateRandomId(10), content: '' })
}

const handleDel = (id: number) => {
  form.value.settings.suggested_questions = form.value.settings.suggested_questions.filter(item => item.id !== id)
}

const handleModelSelect = () => {
  modelDialogRef.value?.open()
}

const handleModelConfirm = (selectedModels: string[]) => {
  modelList.value = selectedModels.map(item => {
    const [channel_id, model, channel_type] = item.split('_')
    return {
      channel_id: Number(channel_id),
      channel_type: Number(channel_type),
      model,
    }
  })
}

const loadModelList = async () => {
  const result = await agentsApi.models.list(form.value.agent_id)
  modelList.value = result.agent_models
}

const loadList = async () => {
  isLoading.value = true
  const result = await agentsApi.group({ group_id: 0 })
  const agent = result.agents[0] ? transformAgentInfo(result.agents[0]) : deepCopy(DEFAULT_SETTINGS)

  form.value = agent
  if (agent.agent_id) {
    if (agent.settings.rerank_config.rerank_channel_id && agent.settings.rerank_config.rerank_model) {
      rerankModel.value = `${agent.settings.rerank_config.rerank_channel_id}_${agent.settings.rerank_config.rerank_model}`
    }
    loadModelList()
  }
  isLoading.value = false
}

const modelsSave = async (agent_id: number) => {
  await agentsApi.models.batch({
    agent_id,
    models: modelList.value.map(item => ({
      channel_id: item.channel_id,
      channel_type: item.channel_type,
      model: item.model,
    })),
  })
}

const handleSave = async () => {
  const data = deepCopy(form.value)
  if (!modelList.value.length) {
    ElMessage.error('请选择模型')
    return
  }
  const model = modelList.value[0]
  data.channel_type = model.channel_type
  data.model = model.model

  const [rerank_channel_id, rerank_model_name, rerank_channel_type] = (rerankModel.value || '').split('_')
  data.settings.rerank_config.rerank_channel_type = rerank_channel_type || 0
  data.settings.rerank_config.rerank_channel_id = rerank_channel_id || 0
  data.settings.rerank_config.rerank_model = rerank_model_name || ''

  data.settings.suggested_questions = data.settings.suggested_questions.filter(item => item.content.trim())

  data.configs = JSON.stringify(data.configs)
  data.tools = JSON.stringify(data.tools)
  data.use_cases = JSON.stringify(data.use_cases)
  data.custom_config = JSON.stringify(data.custom_config)
  data.settings = JSON.stringify(data.settings)

  let agent_id = 0
  if (form.value.agent_id) {
    agent_id = form.value.agent_id
    await agentsApi.update(form.value.agent_id, data)
  } else {
    const result = await agentsApi.create(data)
    agent_id = result.agent_id
  }
  await modelsSave(agent_id)
  ElMessage.success(window.$t('action_save_success'))
}

onMounted(async () => {
  loadList()
})
</script>

<style scoped></style>
