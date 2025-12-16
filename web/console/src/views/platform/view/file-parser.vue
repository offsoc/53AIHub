<template>
  <div v-loading="loading" class="flex flex-col bg-white p-6 mt-3 box-border h-[calc(100vh-160px)] overflow-auto">
    <!-- 页面标题 -->
    <div class="flex items-center gap-2.5 mb-6">
      <h3 class="text-base font-medium text-[#1D1E1F]">解析配置</h3>
      <p class="text-xs text-[#999999]">按文档类型设置解析方法和输出内容</p>
    </div>

    <!-- 解析方法配置列表 -->
    <div class="space-y-4">
      <!-- 标准解析配置项 -->
      <div
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <!-- 左侧：图标和名称 -->
        <div class="flex-none w-[170px] flex items-center gap-3">
          <img :src="$getRealPath({ url: '/images/tools/markitdown.png' })" alt="标准解析" class="size-8" />
          <h4 class="flex-1 text-sm font-medium text-gray-900">标准解析</h4>
          <!-- <div class="border-r h-3 w-px"></div> -->
        </div>

        <!-- 中间：服务器地址 -->
        <!-- <div class="flex-1 px-6">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">服务器地址:</span>
            <span class="text-sm text-gray-900 font-mono">https://markdown.53ai.com</span>
          </div>
        </div> -->

        <!-- 右侧：开关和操作按钮 -->
        <!-- <div class="flex items-center gap-4">
          <el-switch v-model="parseConfigs.standard.enabled" size="large" />
          <div class="flex items-center gap-2">
            <el-button type="primary" size="small" @click="testConnection('standard')"> 测试 </el-button>
            <div class="w-px h-4 bg-gray-300"></div>
            <el-button type="primary" size="small" link @click="editConfig('standard')"> 编辑 </el-button>
          </div>
        </div> -->
      </div>

      <!-- 高精解析配置项 -->
      <div
        v-if="textinSetting && textinSetting.id"
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <!-- 左侧：图标和名称 -->
        <div class="flex-none w-[170px] flex items-center gap-3">
          <img :src="$getRealPath({ url: '/images/tools/textin.png' })" alt="高精解析" class="size-8" />
          <h4 class="flex-1 text-sm font-medium text-gray-900">高精解析</h4>
          <div class="border-r h-3 w-px"></div>
        </div>

        <!-- 中间：服务器地址 -->
        <div class="flex-1 px-6 flex items-center gap-2 overflow-hidden">
          <div class="flex items-center gap-1">
            <span class="text-sm text-[#999]">x-ti-app-id：</span>
            <span class="flex-1 text-sm text-[#1D1E1F] truncate">{{ textinSetting.setting['x-ti-app-id'] }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-sm text-[#999]">x-ti-secret-code：</span>
            <span class="flex-1 text-sm text-[#1D1E1F] truncate">{{
              $filters.formatSecret(textinSetting.setting['x-ti-secret-code'])
            }}</span>
          </div>
        </div>

        <!-- 右侧：开关和操作按钮 -->
        <div class="flex items-center gap-4 ml-2">
          <div class="border-r h-3 w-px"></div>
          <!-- <el-switch v-model="parseConfigs.precise.enabled" size="large" /> -->
          <div class="flex items-center">
            <!-- <el-button type="primary" size="small" @click="testConnection('precise')"> 测试 </el-button> -->
            <!-- <div class="w-px h-4 bg-gray-300"></div> -->
            <el-button type="primary" link @click="handleEdit('textin')">编辑</el-button>
            <el-button link @click="handleDelete">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="mt-8">
      <el-button class="w-[108px] border-none" type="primary" plain @click="showAccessDrawer = true">+添加</el-button>
    </div>

    <!-- 选择接入抽屉 -->
    <el-drawer
      v-model="showAccessDrawer"
      title="选择接入"
      direction="rtl"
      size="700px"
      :before-close="handleDrawerClose"
    >
      <div class="p-4">
        <div class="space-y-3">
          <!-- 高精解析 -->
          <div class="flex items-center justify-between px-5 py-4 rounded-md bg-[#F8F9FA]">
            <div class="flex items-center gap-3">
              <div class="size-10">
                <img :src="$getRealPath({ url: '/images/tools/textin.png' })" alt="高精解析" class="size-10" />
              </div>
              <span class="text-base font-medium text-[#1D1E1F]">高精解析</span>
            </div>
            <el-button
              :disabled="Boolean(textinSetting && textinSetting.id)"
              type="primary"
              class="!border-none"
              plain
              @click="openHighPrecisionDialog"
              >添加</el-button
            >
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 高精解析配置对话框 -->
    <el-dialog v-model="showHighPrecisionDialog" width="600px" :before-close="handleDialogClose">
      <template #header>
        <div class="flex items-center gap-2">
          <img :src="$getRealPath({ url: '/images/tools/textin.png' })" alt="高精解析" class="size-8" />
          <span class="text-base font-medium text-[#1D1E1F]">高精解析</span>
        </div>
      </template>
      <div class="space-y-4">
        <!-- 说明文字 -->
        <div class="p-4 text-sm text-[#1D1E1F] bg-[#F6F9FC]">
          <p class="mb-3">通过调用Textin的服务开放接口,实现对文件内容的解析。</p>
          <ol class="list-decimal list-inside space-y-1">
            <li>
              前往Textin工作台(<a
                href="https://www.textin.com/console/dashboard/overview"
                target="_blank"
                class="text-[#2563EB]"
                >https://www.textin.com/console/dashboard/overview</a
              >):
            </li>
            <li>在【账号与开发者信息】下,复制「x-ti-app-id」和「x-ti-secret-code」;</li>
          </ol>
        </div>

        <!-- 输入表单 -->
        <el-form ref="settingFormRef" :model="settingForm" label-position="top">
          <el-form-item label="x-ti-app-id" prop="x-ti-app-id" :rules="generateFormRules({ validator: ['required'] })">
            <el-input v-model="settingForm['x-ti-app-id']" size="large" placeholder="请输入x-ti-app-id" clearable />
          </el-form-item>
          <el-form-item
            label="x-ti-secret-code"
            prop="x-ti-secret-code"
            :rules="generateFormRules({ validator: ['required'] })"
          >
            <el-input
              v-model="settingForm['x-ti-secret-code']"
              size="large"
              placeholder="请输入x-ti-secret-code"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button size="large" @click="showHighPrecisionDialog = false">取消</el-button>
        <el-button v-debounce size="large" type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { FormInstance } from 'element-plus'
import { generateFormRules } from '@/utils/form-rule.v2'

import platformSettingsApi from '@/api/modules/platform-settings'
import { transformPlatformSetting } from '@/api/modules/platform-settings/transform'
import type { PlatformSetting } from '@/api/modules/platform-settings/types'

// 抽屉和对话框状态
const settingFormRef = ref<FormInstance>()

const loading = ref(false)

const showAccessDrawer = ref(false)
const showHighPrecisionDialog = ref(false)
const textinSetting = ref<PlatformSetting | null>(null)

// 高精解析配置
const settingForm = reactive({
  'x-ti-app-id': '',
  'x-ti-secret-code': '',
})

// 加载高精解析配置
const loadTextinSetting = async () => {
  const res = await platformSettingsApi.find({ platform_key: 'textin' })
  if (res && res.length > 0) {
    textinSetting.value = transformPlatformSetting(res[0])
  }
}

// 打开高精解析配置对话框
const openHighPrecisionDialog = () => {
  showAccessDrawer.value = false
  showHighPrecisionDialog.value = true
}

// 编辑高精解析配置
const handleEdit = () => {
  if (textinSetting.value) {
    settingForm['x-ti-app-id'] = textinSetting.value.setting['x-ti-app-id']
    settingForm['x-ti-secret-code'] = textinSetting.value.setting['x-ti-secret-code']
  }
  showHighPrecisionDialog.value = true
}

// 保存高精解析配置
const handleSave = async () => {
  await settingFormRef.value?.validate()
  if (textinSetting.value?.id) {
    await platformSettingsApi.update(textinSetting.value.id, {
      platform_key: 'textin',
      setting: JSON.stringify(settingForm),
    })
  } else {
    await platformSettingsApi.create({
      platform_key: 'textin',
      setting: JSON.stringify(settingForm),
    })
  }
  ElMessage.success('保存成功')
  showHighPrecisionDialog.value = false
  loadTextinSetting()
}

// 删除高精解析配置
const handleDelete = async () => {
  await ElMessageBox.confirm('确定删除高精解析配置吗？')
  if (textinSetting.value?.id) {
    await platformSettingsApi.delete(textinSetting.value.id)
    textinSetting.value = null
    ElMessage.success('删除成功')
  }
}

// 抽屉关闭处理
const handleDrawerClose = (done: () => void) => {
  done()
}

// 对话框关闭处理
const handleDialogClose = (done: () => void) => {
  // 可以在这里添加关闭前的确认逻辑
  done()
}
onMounted(async () => {
  loading.value = true
  await loadTextinSetting()
  loading.value = false
})
</script>
