<template>
  <Layout class="px-[60px] py-8">
    <Header :title="$t('module.chunk_setting')" />

    <div v-loading="isLoading" class="flex-1 flex flex-col bg-white p-6 mt-3 overflow-y-auto">
      <!-- <div
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <div class="flex-1 flex items-center gap-3">
          <img :src="$getRealPath({ url: '/images/tools/textin.png' })" alt="通用文档" class="size-8" />
          <h4 class="text-sm font-medium text-[#1D1E1F]">通用文档</h4>
          <span class="text-sm text-[#999999]">根据智能算法进行分段计算及数据清洗</span>
        </div>

        <div class="flex items-center gap-4 ml-2">
          <div class="border-r h-3 w-px"></div>
          <div class="flex items-center">
            <el-button type="primary" link @click="handleEdit('default')">配置</el-button>
          </div>
        </div>
      </div> -->

      <div class="flex-1 flex flex-col overflow-y-auto">
        <!-- <div class="flex items-center gap-2.5 mb-4">
          <div class="w-1 h-4 bg-[#2563EB]"></div>
          <span class="text-sm text-[#1D1E1F] mr-2">将知识标题添加至</span>
          <el-checkbox v-model="setting.chunking_config.knowledge_chunking.include_title" class="!mr-0" :value="true"
            >知识点</el-checkbox
          >
          <el-checkbox v-model="setting.chunking_config.index_chunking.include_title" :value="true">索引块</el-checkbox>
        </div> -->

        <!-- 知识点配置 -->
        <div class="border rounded">
          <div class="flex items-center gap-2 px-5 py-4 border-b">
            <SvgIcon name="notebook-one" width="16px" height="16px" />
            <h4 class="text-sm text-[#1D1E1F]">知识点</h4>
          </div>
          <div class="py-5 px-10 flex flex-col gap-4">
            <div class="flex items-center">
              <el-radio-group v-model="setting.knowledge_chunking_type">
                <el-radio :value="CHUNK_TYPE.CUSTOM">自定义拆分</el-radio>
                <el-radio :value="CHUNK_TYPE.NONE">不拆分</el-radio>
              </el-radio-group>
            </div>
            <div v-if="setting.knowledge_chunking_type === CHUNK_TYPE.CUSTOM" class="flex items-center gap-2">
              <div
                class="w-[212px] h-9 px-3 border rounded flex items-center gap-1.5 cursor-pointer"
                :class="{
                  'border-[#2563EB]': setting.chunking_config.knowledge_chunking.chunk_mode === CHUNK_MODE.LENGTH,
                }"
                @click="handleChangeChunkMode('knowledge', CHUNK_MODE.LENGTH)"
              >
                <div class="size-5 rounded bg-[#E0EAFF] flex-center text-[#2563EB]">
                  <svg-icon name="list-numbers" width="14px" />
                </div>
                <span class="flex-1 text-sm text-[#1D1E1F]">长度优先</span>
                <el-radio
                  :model-value="setting.chunking_config.knowledge_chunking.chunk_mode"
                  :value="CHUNK_MODE.LENGTH"
                ></el-radio>
              </div>
              <div
                class="w-[212px] h-9 px-3 border rounded flex items-center gap-1.5 cursor-pointer"
                :class="{
                  'border-[#2563EB]': setting.chunking_config.knowledge_chunking.chunk_mode === CHUNK_MODE.IDENTIFIER,
                }"
                @click="handleChangeChunkMode('knowledge', CHUNK_MODE.IDENTIFIER)"
              >
                <div class="size-5 rounded bg-[#FFF1D6] flex-center text-[#F0A105]">#</div>
                <span class="flex-1 text-sm text-[#1D1E1F]">标识符优先</span>
                <el-radio
                  :model-value="setting.chunking_config.knowledge_chunking.chunk_mode"
                  :value="CHUNK_MODE.IDENTIFIER"
                ></el-radio>
              </div>
            </div>
            <div class="p-4 bg-[#F8F9FA] rounded-md">
              <div v-if="setting.knowledge_chunking_type === CHUNK_TYPE.CUSTOM" class="space-y-3 mb-3">
                <div class="flex items-center">
                  <div class="flex-none w-20 text-sm text-[#4F5052]">标识符</div>
                  <el-checkbox-group v-model="setting.knowledge_chunking_rule" class="flex items-center">
                    <el-checkbox class="!mr-0" :value="SPLIT_TYPE.HEADING"></el-checkbox>
                    <div class="flex items-center mr-5">
                      <el-dropdown trigger="click" @command="handleChangeHeading('knowledge', $event)">
                        <div class="flex items-center gap-1">
                          {{ getHeadingLabel('knowledge') }}
                          <el-icon><ArrowDown /></el-icon>
                        </div>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item v-for="item in headerList" :key="item.type" :command="item.type">
                              {{ item.label }}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                    <el-checkbox :value="CHUNK_TYPE.CUSTOM"></el-checkbox>
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-[#4F5052] whitespace-nowrap">指定标识符</span>
                      <div class="w-52 max-w-96">
                        <el-select
                          v-model="setting.knowledge_chunking_input"
                          default-first-option
                          filterable
                          :reserve-keyword="false"
                          multiple
                          allow-create
                          collapse-tags
                          :max-collapse-tags="2"
                        >
                          <el-option v-for="item in knowledgeCommonList" :key="item.value" :value="item.value">
                            {{ item.label }}
                          </el-option>
                        </el-select>
                      </div>
                    </div>
                  </el-checkbox-group>
                </div>
                <div class="flex items-center">
                  <div class="flex-none w-20 text-sm text-[#4F5052]">长度</div>
                  <div>
                    <el-input-number
                      v-model="setting.chunking_config.knowledge_chunking.max_length"
                      class="el-input-number--left"
                      size="large"
                      :min="maxLength.min"
                      :max="maxLength.max"
                      :controls="false"
                      @blur="handleBlurMaxLength('knowledge')"
                    />
                  </div>
                </div>
              </div>

              <div class="flex items-center">
                <div class="flex-none w-20 text-sm text-[#4F5052]">召回语料</div>
                <el-checkbox v-model="setting.chunking_config.knowledge_chunking.include_filename"
                  >叠加文件名</el-checkbox
                >
                <el-checkbox v-model="setting.chunking_config.knowledge_chunking.include_title"
                  >叠加标题及子标题</el-checkbox
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 索引块配置 -->
        <div class="border rounded mt-4">
          <div class="flex items-center gap-2 px-5 py-4 border-b">
            <SvgIcon name="layers" width="16px" height="16px" />
            <h4 class="text-sm text-[#1D1E1F]">检索块</h4>
          </div>
          <div class="py-5 px-10 flex flex-col gap-4">
            <div class="flex items-center">
              <el-radio-group v-model="setting.index_chunking_type">
                <el-radio :value="CHUNK_TYPE.CUSTOM">自定义拆分</el-radio>
                <el-radio :value="CHUNK_TYPE.NONE">不拆分</el-radio>
              </el-radio-group>
            </div>
            <div v-if="setting.index_chunking_type === CHUNK_TYPE.CUSTOM" class="flex items-center gap-2">
              <div
                class="w-[212px] h-9 px-3 border rounded flex items-center gap-1.5 cursor-pointer"
                :class="{
                  'border-[#2563EB]': setting.chunking_config.index_chunking.chunk_mode === CHUNK_MODE.LENGTH,
                }"
                @click="handleChangeChunkMode('index', CHUNK_MODE.LENGTH)"
              >
                <div class="size-5 rounded bg-[#E0EAFF] flex-center text-[#2563EB]">
                  <svg-icon name="list-numbers" width="14px" />
                </div>
                <span class="flex-1 text-sm text-[#1D1E1F]">长度优先</span>
                <el-radio
                  :model-value="setting.chunking_config.index_chunking.chunk_mode"
                  :value="CHUNK_MODE.LENGTH"
                ></el-radio>
              </div>
              <div
                class="w-[212px] h-9 px-3 border rounded flex items-center gap-1.5 cursor-pointer"
                :class="{
                  'border-[#2563EB]': setting.chunking_config.index_chunking.chunk_mode === CHUNK_MODE.IDENTIFIER,
                }"
                @click="handleChangeChunkMode('index', CHUNK_MODE.IDENTIFIER)"
              >
                <div class="size-5 rounded bg-[#FFF1D6] flex-center text-[#F0A105]">#</div>
                <span class="flex-1 text-sm text-[#1D1E1F]">标识符优先</span>
                <el-radio
                  :model-value="setting.chunking_config.index_chunking.chunk_mode"
                  :value="CHUNK_MODE.IDENTIFIER"
                ></el-radio>
              </div>
            </div>
            <div v-if="setting.index_chunking_type === CHUNK_TYPE.CUSTOM" class="p-4 bg-[#F8F9FA] rounded-md space-y-2">
              <!-- 拆分规则 -->
              <div class="flex items-center">
                <div class="flex-none w-20 text-sm text-[#4F5052]">标识符</div>
                <el-checkbox-group v-model="setting.index_chunking_rule" class="flex items-center">
                  <el-checkbox class="!mr-0" :value="SPLIT_TYPE.HEADING"></el-checkbox>
                  <div class="flex items-center mr-5">
                    <el-dropdown trigger="click" @command="handleChangeHeading('index', $event)">
                      <div class="flex items-center gap-1" @click.stop>
                        {{ getHeadingLabel('index') }}
                        <el-icon><ArrowDown /></el-icon>
                      </div>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item v-for="item in headerList" :key="item.type" :command="item.type">
                            {{ item.label }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                  <el-checkbox :value="SPLIT_TYPE.CUSTOM"></el-checkbox>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-[#4F5052] whitespace-nowrap">指定标识符</span>
                    <div class="w-52 max-w-96">
                      <el-select
                        v-model="setting.index_chunking_input"
                        default-first-option
                        filterable
                        :reserve-keyword="false"
                        multiple
                        allow-create
                        collapse-tags
                        :max-collapse-tags="2"
                      >
                        <el-option
                          v-for="item in indexCommonList"
                          :key="item.value"
                          :label="item.value"
                          :value="item.value"
                        >
                          {{ item.label }}
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                </el-checkbox-group>
              </div>

              <!-- 最大长度 -->
              <div class="flex items-center">
                <div class="flex-none w-20 text-sm text-[#4F5052]">长度</div>
                <div>
                  <el-input-number
                    v-model="setting.chunking_config.index_chunking.max_length"
                    class="el-input-number--left"
                    size="large"
                    :min="0"
                    :max="1000000"
                    :controls="false"
                    @blur="handleBlurMaxLength('index')"
                  />
                </div>
              </div>
            </div>

            <div class="p-4 bg-[#F8F9FA] rounded-md space-y-2">
              <!-- 内容概要 -->
              <div class="text-sm text-[#1D1E1F] font-semibold">索引增强</div>
              <div class="flex items-center">
                <div class="flex-none w-20 text-sm text-[#4F5052]">默认索引</div>
                <el-checkbox v-model="setting.chunking_config.index_chunking.include_filename">叠加文件名</el-checkbox>
                <el-checkbox v-model="setting.chunking_config.index_chunking.include_title"
                  >叠加标题及子标题</el-checkbox
                >
              </div>
              <!-- 常见问法 -->
              <div class="flex items-center -mt-2">
                <div class="flex-none w-20 text-sm text-[#4F5052]">自动生成</div>
                <el-checkbox
                  v-model="setting.chunking_config.content_summary.generation_method"
                  :true-value="GENERATION.AI"
                  :false-value="GENERATION.MANUAL"
                  >内容概要</el-checkbox
                >
                <el-checkbox
                  v-model="setting.chunking_config.common_questions.generation_method"
                  :true-value="GENERATION.AI"
                  :false-value="GENERATION.MANUAL"
                  >常见问法</el-checkbox
                >
                <!-- <el-checkbox :value="'graph'">抽取知识图谱</el-checkbox> -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-none">
        <el-button v-debounce type="primary" size="large" class="mt-4" @click="handleConfirm">保存</el-button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import chunkSettingApi from '@/api/modules/chunk-setting'
import type { ChunkSetting } from '@/api/modules/chunk-setting'
import { CHUNK_SETTING_DEFAULT } from '@/constants/chunk'
import { deepCopy } from '@/utils'

interface Setting extends ChunkSetting {
  knowledge_chunking_type: string
  knowledge_chunking_head: string
  knowledge_chunking_input: string[]
  knowledge_chunking_rule: string[]
  index_chunking_type: string
  index_chunking_head: string
  index_chunking_input: string[]
  index_chunking_rule: string[]
}

// 常量配置
const CONFIG = {
  maxLength: { min: 50, max: 50000 },
  headerList: [
    { type: 'h1', label: '一级标题（H1）' },
    { type: 'h2', label: '二级标题（H2）' },
    { type: 'h3', label: '三级标题（H3）' },
    { type: 'h4', label: '四级标题（H4）' },
    { type: 'h5', label: '五级标题（H5）' },
  ],
  commonList: [
    { label: '1 个换行符（\\n）', value: '\\n' },
    { label: '2 个换行符（\\n\\n）', value: '\\n\\n' },
    { label: '句号（。）', value: '。' },
    { label: '感叹号（！）', value: '！' },
    { label: '问号（？）', value: '？' },
    { label: '分号（；）', value: '；' },
    { label: '分割线（---）', value: '---' },
  ],
}

const { maxLength, headerList } = CONFIG

const CHUNK_TYPE = {
  CUSTOM: 'custom',
  NONE: 'none',
}

const SPLIT_TYPE = {
  HEADING: 'heading',
  CUSTOM: 'custom',
}

const GENERATION = {
  MANUAL: 'manual',
  AI: 'ai',
}

const CHUNK_MODE = {
  LENGTH: 'length_first',
  IDENTIFIER: 'identifier_first',
}
const isLoading = ref(false)
const extraSetting = {
  knowledge_chunking_type: CHUNK_TYPE.CUSTOM,
  knowledge_chunking_rule: ['heading'],
  knowledge_chunking_head: headerList[0].type,
  knowledge_chunking_input: [],
  index_chunking_type: CHUNK_TYPE.CUSTOM,
  index_chunking_head: headerList[0].type,
  index_chunking_rule: ['heading'],
  index_chunking_input: [],
}
const setting = ref<Setting>(
  deepCopy({
    ...CHUNK_SETTING_DEFAULT,
    ...extraSetting,
  })
)

const knowledgeCommonList = computed(() => {
  const list = setting.value.knowledge_chunking_input.filter(
    item => !CONFIG.commonList.some(common => common.value === item)
  )
  return CONFIG.commonList.concat(list.map(item => ({ label: item, value: item })))
})

const indexCommonList = computed(() => {
  const list = setting.value.index_chunking_input.filter(
    item => !CONFIG.commonList.some(common => common.value === item)
  )
  return CONFIG.commonList.concat(list.map(item => ({ label: item, value: item })))
})
// 计算属性
const getHeadingLabel = (type: 'knowledge' | 'index') => {
  const chunkHead = type === 'knowledge' ? 'knowledge_chunking_head' : 'index_chunking_head'
  const label = headerList.find(item => item.type === setting.value[chunkHead])?.label
  return label || headerList[0].label
}

const handleChangeHeading = (type: 'knowledge' | 'index', value: string) => {
  const chunkHead = type === 'knowledge' ? 'knowledge_chunking_head' : 'index_chunking_head'
  setting.value[chunkHead] = value
}

const handleChangeChunkMode = (type: 'knowledge' | 'index', value: string) => {
  const config =
    type === 'knowledge'
      ? setting.value.chunking_config.knowledge_chunking
      : setting.value.chunking_config.index_chunking
  config.chunk_mode = value
}

const handleBlurMaxLength = (type: 'knowledge' | 'index') => {
  const config =
    type === 'knowledge'
      ? setting.value.chunking_config.knowledge_chunking
      : setting.value.chunking_config.index_chunking

  if (type === 'knowledge') {
    config.max_length = Math.max(Math.min(config.max_length, maxLength.max), maxLength.min)
    // 同步更新索引块最大长度
    const indexConfig = setting.value.chunking_config.index_chunking
    indexConfig.max_length = Math.max(Math.min(indexConfig.max_length, config.max_length), maxLength.min)
  } else {
    const knowledgeConfig = setting.value.chunking_config.knowledge_chunking
    config.max_length = Math.max(Math.min(config.max_length, knowledgeConfig.max_length), maxLength.min)
  }
}

// 特殊字符映射表：实际值 -> 显示值
const ESCAPE_MAP: Record<string, string> = {
  '\n': '\\n',
  '\n\n': '\\n\\n',
  '\r\n': '\\r\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\b': '\\b',
  '\f': '\\f',
  '\v': '\\v',
}

// 反向映射表：显示值 -> 实际值
const REVERSE_MAP: Record<string, string> = Object.fromEntries(Object.entries(ESCAPE_MAP).map(([k, v]) => [v, k]))

const formatDisplayValue = (value: string) => ESCAPE_MAP[value] ?? value

const parseInputValue = (input: string) => REVERSE_MAP[input] ?? input

const handleConfirm = async () => {
  const data = { chunking_config: deepCopy(setting.value.chunking_config) }

  // // 统一处理拆分规则
  const processSplitRule = (type: 'knowledge' | 'index') => {
    const chunkType = type === 'knowledge' ? 'knowledge_chunking_type' : 'index_chunking_type'
    const chunkInput = type === 'knowledge' ? 'knowledge_chunking_input' : 'index_chunking_input'
    const chunkHead = type === 'knowledge' ? 'knowledge_chunking_head' : 'index_chunking_head'
    const chunkRule = type === 'knowledge' ? 'knowledge_chunking_rule' : 'index_chunking_rule'
    const config = type === 'knowledge' ? data.chunking_config.knowledge_chunking : data.chunking_config.index_chunking

    if (setting.value[chunkType] === CHUNK_TYPE.NONE) {
      config.split_rule = ''
    } else if (setting.value[chunkType] === CHUNK_TYPE.CUSTOM) {
      const split_rule = []
      if (setting.value[chunkRule].includes(SPLIT_TYPE.HEADING)) {
        split_rule.push(setting.value[chunkHead])
      }
      if (setting.value[chunkRule].includes(SPLIT_TYPE.CUSTOM) && setting.value[chunkInput].length > 0) {
        split_rule.push(...setting.value[chunkInput].map(parseInputValue))
      }
      config.split_rule = split_rule.join(',')
    }
  }

  processSplitRule('knowledge')
  processSplitRule('index')
  if (setting.value.knowledge_chunking_type === CHUNK_TYPE.CUSTOM) {
    if (data.chunking_config.knowledge_chunking.split_rule === '') {
      ElMessage.error('知识点拆分规则不能为空')
      return
    }
  }
  if (setting.value.index_chunking_type === CHUNK_TYPE.CUSTOM) {
    if (data.chunking_config.index_chunking.split_rule === '') {
      ElMessage.error('索引块拆分规则不能为空')
      return
    }
  }

  await chunkSettingApi.chunkingConfig.update(data)
  ElMessage.success(window.$t('message_status.save_success'))
}

// 设置拆分规则
const setSplitRule = (config: Setting, prefix: 'knowledge_chunking' | 'index_chunking') => {
  const splitRule = config.chunking_config[prefix].split_rule
  if (splitRule) {
    const rules = splitRule.split(',')
    const headers = headerList.map(item => item.type)
    if (headers.includes(rules[0])) {
      config[`${prefix}_head`] = rules[0]
      config[`${prefix}_input`] = rules.slice(1).map(formatDisplayValue)
    } else {
      config[`${prefix}_input`] = rules.map(formatDisplayValue)
      config[`${prefix}_rule`] = []
    }
    if (config[`${prefix}_input`].length === 0) {
      config[`${prefix}_input`] = [CONFIG.commonList[0].value]
    } else {
      config[`${prefix}_rule`].push(SPLIT_TYPE.CUSTOM)
    }
  } else {
    config[`${prefix}_type`] = CHUNK_TYPE.NONE
  }
  if (config.chunking_config[prefix].chunk_mode === '') {
    config.chunking_config[prefix].chunk_mode = CHUNK_MODE.LENGTH
  }
}

onMounted(async () => {
  isLoading.value = true
  const data = await chunkSettingApi.chunkingConfig.get()
  const config = {
    ...data,
    ...extraSetting,
  }
  setSplitRule(config, 'knowledge_chunking')
  setSplitRule(config, 'index_chunking')
  setting.value = config
  isLoading.value = false
})
</script>

<style scoped></style>

<style>
.allow-create-select .el-select__suffix {
  display: none;
}

.allow-create-select-popper {
  display: none;
}
</style>
