<template>
  <Layout class="px-[60px] py-8">
    <Header :title="$t('module.parse')" />
    <div
      v-loading="isLoading"
      class="flex-1 flex flex-col bg-white p-6 mt-3 box-border max-h-[calc(100vh-100px)] overflow-auto"
    >
      <!-- 文档解析配置卡片 -->
      <!-- 表格头部 -->

      <!-- 表格内容 -->
      <div class="px-5 py-4 border rounded-md">
        <el-table :data="tableData" header-cell-class-name="!bg-[#F5F6F7] text-[#999999]" cell-class-name="py-3">
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

          <el-table-column prop="parseMethod" label="解析" width="200">
            <template #default="{ row }">
              <el-select v-model="row.func" class="w-36 h-9" placeholder="选择解析方法">
                <el-option label="标准解析" value="default" />
                <el-option v-if="textinSetting" label="高精解析" value="textin" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="parseMethod" label="拆分" width="200">
            <template #default="{ row }">
              <el-select v-model="row.split" class="w-36 h-9" :disabled="true" placeholder="选择拆分方法">
                <el-option label="通用文档" value="default" />
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

const textinSetting = ref<PlatformSetting | null>(null)
// 解析方法配置

const SETTING_KEY = 'document_setting'
const settingId = ref<number | null>(null)
const isLoading = ref(true)
// 表格数据
const tableData = ref([
  {
    ext: 'doc',
    name: 'Word',
    shortName: 'DOC',
    extensions: 'doc, docx',
    func: 'default',
    split: 'default',
  },
  {
    ext: 'xls',
    name: 'Excel',
    shortName: 'XLS',
    extensions: 'xls, xlsx',
    func: 'default',
    split: 'default',
  },
  {
    ext: 'ppt',
    name: 'PowerPoint',
    shortName: 'PPT',
    extensions: 'ppt, pptx',
    func: 'default',
    split: 'default',
  },
  {
    ext: 'pdf',
    name: 'PDF',
    shortName: 'PDF',
    extensions: 'pdf',
    func: 'default',
    split: 'default',
  },
])

// 加载高精解析配置
const loadTextinSetting = async () => {
  const res = await platformSettingsApi.find({ platform_key: 'textin' })
  if (res && res.length > 0) {
    textinSetting.value = transformPlatformSetting(res[0])
  }
}

const loadParseSetting = async () => {
  const res = await settingApi.get(SETTING_KEY)
  if (res.data) {
    settingId.value = res.data.setting_id
    const valueData = JSON.parse(res.data.value)
    tableData.value = tableData.value.map(item => {
      const data = valueData.find((data: any) => data.ext === item.ext)
      if (data) {
        item.func = textinSetting.value ? data.func : 'default'
        item.split = data.split || 'default'
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
    value: JSON.stringify(
      tableData.value.map(item => ({
        ext: item.ext,
        func: item.func,
        split: item.split,
      }))
    ),
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
  await loadTextinSetting()
  loadParseSetting()
})
</script>

<style scoped></style>
