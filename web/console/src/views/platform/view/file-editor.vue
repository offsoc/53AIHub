<template>
  <div v-loading="loading" class="flex flex-col bg-white p-6 mt-3 box-border h-[calc(100vh-160px)] overflow-auto">
    <!-- 解析方法配置列表 -->
    <template v-if="!loading && wpsSetting && wpsSetting.id">
      <div class="space-y-4">
        <!-- WPS WebOffice配置项 -->
        <div
          v-if="wpsSetting && wpsSetting.id"
          class="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <!-- 左侧：图标和名称 -->
          <div class="flex-none w-[170px] flex items-center gap-3">
            <img :src="$getRealPath({ url: '/images/tools/wps-office.png' })" alt="WPS WebOffice" class="size-8" />
            <h4 class="flex-1 text-sm font-medium text-gray-900">WPS WebOffice</h4>
            <div class="border-r h-3 w-px"></div>
          </div>

          <!-- 中间：服务器地址 -->
          <div class="flex-1 px-6 flex items-center gap-2 overflow-hidden">
            <!-- <div class="flex items-center gap-1">
              <span class="text-sm text-[#999]">服务器地址：</span>
              <span class="flex-1 text-sm text-[#1D1E1F] truncate">{{ wpsSetting.setting['server_url'] }}</span>
            </div> -->
            <div class="flex items-center gap-1">
              <span class="text-sm text-[#999]">APPID：</span>
              <span class="flex-1 text-sm text-[#1D1E1F] truncate">{{ wpsSetting.setting['app_id'] }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-sm text-[#999]">AppSecret</span>
              <span class="flex-1 text-sm text-[#1D1E1F] truncate">{{
                $filters.formatSecret(wpsSetting.setting['app_secret'])
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
              <el-button type="primary" link @click="handleEdit">编辑</el-button>
              <el-button link @click="handleDelete">删除</el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 底部操作按钮 -->
      <div class="mt-8">
        <el-button class="w-[108px] border-none" type="primary" plain @click="showAccessDrawer = true">+添加</el-button>
      </div>
    </template>

    <el-empty
      v-if="!loading && !wpsSetting"
      :image="$getRealPath({ url: '/images/empty.png' })"
      :image-size="110"
      description="还未接入文档编辑，来添加文档编辑吧~~"
    >
      <el-button class="border-none w-28 h-9" type="primary" plain @click="showAccessDrawer = true">+添加</el-button>
    </el-empty>

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
          <!-- WPS WebOffice -->
          <div class="flex items-center justify-between px-5 py-4 rounded-md bg-[#F8F9FA]">
            <div class="flex items-center gap-3">
              <div class="size-10">
                <img :src="$getRealPath({ url: '/images/tools/wps-office.png' })" alt="WPS WebOffice" class="size-10" />
              </div>
              <span class="text-base font-medium text-[#1D1E1F]">WPS WebOffice</span>
            </div>
            <el-button
              :disabled="Boolean(wpsSetting && wpsSetting.id)"
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

    <!-- WPS WebOffice配置对话框 -->
    <el-dialog v-model="showHighPrecisionDialog" width="600px" :before-close="handleDialogClose">
      <template #header>
        <div class="flex items-center gap-2">
          <img :src="$getRealPath({ url: '/images/tools/wps-office.png' })" alt="WPS WebOffice" class="size-8" />
          <span class="text-base font-medium text-[#1D1E1F]">WPS WebOffice</span>
        </div>
      </template>
      <div class="space-y-4">
        <!-- 输入表单 -->
        <el-form ref="settingFormRef" :model="settingForm" label-position="top">
          <!-- <el-form-item label="服务地址" prop="server_url" :rules="generateFormRules({ validator: ['required'] })">
            <el-input v-model="settingForm['server_url']" size="large" placeholder="请输入server_url" clearable />
          </el-form-item> -->
          <el-form-item label="APPID" prop="app_id" :rules="generateFormRules({ validator: ['required'] })">
            <el-input v-model="settingForm['app_id']" size="large" placeholder="请输入APPID" clearable />
          </el-form-item>
          <el-form-item label="AppSecret" prop="app_secret" :rules="generateFormRules({ validator: ['required'] })">
            <el-input v-model="settingForm['app_secret']" size="large" placeholder="请输入AppSecret" clearable />
          </el-form-item>
        </el-form>
        <!-- 说明文字 -->
        <div class="p-4 text-sm text-[#1D1E1F] bg-[#F6F9FC]">
          <p class="mb-3">通过调用WPS开放平台服务接口，实现文件的预览和编辑。</p>
          <ol class="list-decimal list-inside space-y-1">
            <li>
              在(<a href="https://solution.wps.cn/" target="_blank" class="text-[#2563EB]">WPS开放平台</a
              >)注册为服务商，按需购买服务:
            </li>
            <li>在【开发者后台-在线编辑预览】下，添加应用，得到APPID、AppSecret；</li>
            <li>
              数据回调地址：<span class="text-[#FA5151]">{{ settingForm.server_url }}/api/wps</span
              ><svg-icon class="inline-block ml-1 cursor-pointer" name="copy" width="18px" @click="handleCopy" />
            </li>
          </ol>
        </div>
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
import { copyToClip } from '@/utils/copy'
import { api_host } from '@/utils/config'

// 表单引用
const settingFormRef = ref<FormInstance>()

const loading = ref(false)
// 抽屉和对话框状态
const showAccessDrawer = ref(false)
const showHighPrecisionDialog = ref(false)
const wpsSetting = ref<PlatformSetting | null>(null)

// WPS WebOffice配置
const settingForm = reactive({
  server_url: api_host,
  app_id: '',
  app_secret: '',
})

// 加载WPS WebOffice配置
const loadWpsSetting = async () => {
  const res = await platformSettingsApi.find({ platform_key: 'wps' })
  if (res && res.length > 0) {
    wpsSetting.value = transformPlatformSetting(res[0])
  }
}

// 打开WPS WebOffice配置对话框
const openHighPrecisionDialog = () => {
  showAccessDrawer.value = false
  showHighPrecisionDialog.value = true
}

// 编辑WPS WebOffice配置
const handleEdit = () => {
  if (wpsSetting.value) {
    settingForm.server_url = api_host
    settingForm.app_id = wpsSetting.value.setting.app_id
    settingForm.app_secret = wpsSetting.value.setting.app_secret
  }
  showHighPrecisionDialog.value = true
}

// 保存WPS WebOffice配置
const handleSave = async () => {
  await settingFormRef.value?.validate()
  if (wpsSetting.value?.id) {
    await platformSettingsApi.update(wpsSetting.value.id, {
      platform_key: 'wps',
      setting: JSON.stringify(settingForm),
      external_id: settingForm.app_id,
    })
  } else {
    await platformSettingsApi.create({
      platform_key: 'wps',
      setting: JSON.stringify(settingForm),
      external_id: settingForm.app_id,
    })
  }
  ElMessage.success('保存成功')
  showHighPrecisionDialog.value = false
  loadWpsSetting()
}

// 删除WPS WebOffice配置
const handleDelete = async () => {
  await ElMessageBox.confirm('确定删除WPS WebOffice配置吗？')
  if (wpsSetting.value?.id) {
    await platformSettingsApi.delete(wpsSetting.value.id)
    wpsSetting.value = null
    ElMessage.success('删除成功')
  }
}

// 复制数据回调地址
const handleCopy = () => {
  copyToClip(`${settingForm.server_url}/api/wps`)
  ElMessage.success('复制成功')
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
  await loadWpsSetting()
  loading.value = false
})
</script>
