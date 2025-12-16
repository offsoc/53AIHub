<template>
  <div class="flex flex-col bg-white p-6 mt-3 box-border h-[calc(100vh-160px)] overflow-auto">
    <el-empty
      description="还未接入联网搜索，来添加联网搜索吧~"
      :image="$getRealPath({ url: '/images/empty.png' })"
      :image-size="110"
    >
      <el-button class="border-none w-28 h-9" type="primary" plain @click="showAccessDrawer = true">+添加</el-button>
    </el-empty>

    <!-- 解析方法配置列表 -->
    <div class="space-y-4">
      <div
        v-if="bochaSetting && bochaSetting.id"
        class="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <!-- 左侧：图标和名称 -->
        <div class="flex-none w-[170px] flex items-center gap-3">
          <img :src="$getRealPath({ url: '/images/tools/bocha.png' })" alt="博查（API）" class="size-8" />
          <h4 class="flex-1 text-sm font-medium text-gray-900">博查（API）</h4>
          <div class="border-r h-3 w-px"></div>
        </div>

        <!-- 中间：服务器地址 -->
        <div class="flex-1 px-6 flex items-center gap-2 overflow-hidden">
          <div class="flex items-center gap-1">
            <span class="text-sm text-[#999]">API Key：</span>
            <span class="flex-1 text-sm text-[#1D1E1F] truncate">{{
              $filters.formatSecret(bochaSetting.setting['api-key'])
            }}</span>
          </div>
        </div>

        <!-- 右侧：开关和操作按钮 -->
        <div class="flex items-center gap-4 ml-2">
          <el-switch v-model="bochaSetting.setting.enabled" />
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
          <div
            class="flex items-center justify-between px-5 py-4 rounded-md bg-[#F8F9FA]"
            @click="openHighPrecisionDialog"
          >
            <div class="flex items-center gap-3">
              <div class="size-10">
                <img :src="$getRealPath({ url: '/images/tools/bocha.png' })" alt="博查（API）" class="size-10" />
              </div>
              <span class="text-base font-medium text-[#1D1E1F]">博查（API）</span>
            </div>
            <el-button type="primary" class="!border-none" plain @click="showBochaDialog = true">添加</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 博查（API）配置对话框 -->
    <el-dialog v-model="showBochaDialog" width="600px" :before-close="handleDialogClose">
      <template #header>
        <div class="flex items-center gap-2">
          <img :src="$getRealPath({ url: '/images/tools/bocha.png' })" alt="博查（API）" class="size-8" />
          <span class="text-base font-medium text-[#1D1E1F]">博查（API）</span>
        </div>
      </template>
      <div class="space-y-4">
        <el-form ref="settingFormRef" :model="settingForm" label-position="top">
          <el-form-item label="API Key" prop="api-key" :rules="generateFormRules({ validator: ['required'] })">
            <el-input v-model="settingForm['api-key']" size="large" placeholder="请输入api-key" clearable />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button size="large" @click="showBochaDialog = false">取消</el-button>
        <el-button v-debounce size="large" type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormInstance } from 'element-plus'
import { generateFormRules } from '@/utils/form-rule.v2'

const showAccessDrawer = ref(false)
const showBochaDialog = ref(false)
const bochaSetting = ref({
  id: '23',
  setting: {
    'api-key': '',
  },
})

const settingForm = ref({
  'api-key': '',
})
const settingFormRef = ref<FormInstance>()

const handleDrawerClose = () => {
  showAccessDrawer.value = false
}

const openHighPrecisionDialog = () => {
  showAccessDrawer.value = true
}
</script>

<style scoped></style>
