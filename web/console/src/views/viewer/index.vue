<template>
  <Layout class="px-[60px] py-8">
    <Header :title="$t('module.viewer')" />
    <div
      v-loading="isLoading"
      class="flex-1 flex flex-col bg-white p-6 mt-3 box-border max-h-[calc(100vh-100px)] overflow-auto"
    >
      <!-- 表格内容 -->
      <div class="px-5 py-4 border rounded-md">
        <el-table :data="previewData" header-cell-class-name="!bg-[#F5F6F7] text-[#999999]" cell-class-name="py-3">
          <el-table-column prop="type" label="文档类型" width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <img :src="$getRealPath({ url: `/images/parse/${row.ext}.png` })" class="size-5" />
                <span class="text-sm text-[#4F5052]">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="extensions" label="说明">
            <template #default="{ row }">
              <span class="text-sm text-gray-600">{{ row.extensions }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="parseMethod" label="文档查看" width="200">
            <template #default="{ row }">
              <el-select v-model="row.preview" :disabled="!row.allow_wps" class="w-36 h-9" placeholder="选择查看方法">
                <el-option label="内置查看器" value="default" />
                <el-option v-if="wpsSetting" label="WPS WebOffice" value="wps" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="parseMethod" label="文档编辑" width="200">
            <template #default="{ row }">
              <el-select v-model="row.editor" :disabled="!row.allow_wps" class="w-36 h-9" placeholder="选择编辑方法">
                <el-option label="内置编辑器" value="default" />
                <el-option v-if="wpsSetting" label="WPS WebOffice" value="wps" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 底部操作按钮 -->
      <div class="mt-8">
        <el-button v-debounce class="w-24 h-9" type="primary" @click="handleSave"> 保存 </el-button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import platformSettingsApi from '@/api/modules/platform-settings'
import { transformPlatformSetting } from '@/api/modules/platform-settings/transform'
import type { PlatformSetting } from '@/api/modules/platform-settings/types'
import { settingApi } from '@/api/modules/setting'

const wpsSetting = ref<PlatformSetting | null>(null)
// 解析方法配置

const SETTING_KEY = 'document_js_sdk_setting'
const settingId = ref<number | null>(null)
const isLoading = ref(true)
// 表格数据
const previewData = ref([
  {
    ext: 'doc',
    name: 'Word',
    shortName: 'DOC',
    extensions: 'doc, docx',
    preview: 'default',
    editor: 'default',
    allow_wps: true,
  },
  {
    ext: 'xls',
    name: 'Excel',
    shortName: 'XLS',
    extensions: 'xls, xlsx',
    preview: 'default',
    editor: 'default',
    allow_wps: true,
  },
  {
    ext: 'ppt',
    name: 'PowerPoint',
    shortName: 'PPT',
    extensions: 'ppt, pptx',
    preview: 'default',
    editor: 'default',
    allow_wps: true,
  },
  {
    ext: 'pdf',
    name: 'PDF',
    shortName: 'PDF',
    extensions: 'pdf',
    preview: 'default',
    editor: 'default',
    allow_wps: true,
  },
  {
    ext: 'md',
    name: 'Markdown',
    shortName: 'MD',
    extensions: 'md, txt',
    preview: 'default',
    editor: 'default',
    allow_wps: false,
  },
  {
    ext: 'html',
    name: 'HTML',
    shortName: 'HTML',
    extensions: 'html, htm',
    preview: 'default',
    editor: 'default',
    allow_wps: false,
  },
])

// 加载WPS WebOffice配置
const loadWpsSetting = async () => {
  const res = await platformSettingsApi.find({ platform_key: 'wps' })
  if (res && res.length > 0) {
    wpsSetting.value = transformPlatformSetting(res[0])
  }
}

const loadParseSetting = async () => {
  const res = await settingApi.get(SETTING_KEY)
  if (res.data) {
    settingId.value = res.data.setting_id
    const valueData = JSON.parse(res.data.value)
    previewData.value = previewData.value.map(item => {
      const data = valueData.preview[item.ext]
      const editorData = valueData.editor[item.ext]
      if (data) {
        item.preview = wpsSetting.value ? data : 'default'
      }
      if (editorData) {
        item.editor = wpsSetting.value ? editorData : 'default'
      }
      return item
    })
  }
  isLoading.value = false
}

// 保存设置
const handleSave = async () => {
  const data = {
    key: SETTING_KEY,
    value: JSON.stringify({
      preview: previewData.value.reduce((acc: any, item: any) => {
        acc[item.ext] = item.preview
        return acc
      }, {}),
      editor: previewData.value.reduce((acc: any, item: any) => {
        acc[item.ext] = item.editor
        return acc
      }, {}),
    }),
  }
  if (settingId.value) {
    await settingApi.update(settingId.value, data)
  } else {
    await settingApi.create(data)
  }
  await loadParseSetting()
  // 这里可以添加保存逻辑
  ElMessage.success(window.$t('action_save_success'))
}

onMounted(async () => {
  await loadWpsSetting()
  loadParseSetting()
})
</script>

<style scoped></style>
