<template>
  <img class="h-[160px] bg-[#E5ECFF] rounded-lg" src="/images/glider.png" />
  <div class="flex items-center justify-between py-3 mt-2">
    <div class="text-[#1D1E1F] text-sm font-semibold">启用/禁用</div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="h-10 flex items-center justify-between px-4 border rounded-md">
      <div class="text-sm text-[#1D1E1F]">启用划词菜单栏</div>
      <el-switch v-model="settingStore.glider_enabled"></el-switch>
    </div>
    <div v-if="settingStore.glider_enabled" class="h-10 flex items-center justify-between px-4 border rounded-md">
      <div class="text-sm text-[#1D1E1F]">唤起方式</div>
      <el-dropdown trigger="click">
        <div class="text-sm text-[#1D1E1F]">
          划词立即唤起
          <el-icon>
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>划词后立即唤起</el-dropdown-item>
            <el-dropdown-item>划词后按快捷键唤起</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <template v-if="settingStore.glider_enabled">
    <div class="flex items-center justify-between py-3 mt-2">
      <div class="text-[#1D1E1F] text-sm font-semibold">菜单栏</div>
      <el-button type="primary" plain class="!border-none">系统内置</el-button>
    </div>
    <Sortable v-model="settingStore.glider_menus" identity="value" class="flex flex-col gap-2">
      <template #item="{ item, index }">
        <el-input v-model="item.name" size="large">
          <template #prefix>
            <div class="sort-icon cursor-move">
              <svg-icon size="18" name="drag" class="cursor-move"></svg-icon>
            </div>
          </template>
          <template #suffix>
            <el-tooltip content="系统内置不可编辑" placement="top">
              <svg-icon size="16" name="edit" class="cursor-pointer" @click.stop="handleEdit(item)"></svg-icon>
            </el-tooltip>
            <el-icon color="#1D1E1F" class="ml-2 cursor-pointer" @click.stop="handleDel(item, index)"><Delete /></el-icon>
          </template>
        </el-input>
      </template>
    </Sortable>
    <div>
      <el-button type="primary" plain class="!border-none mt-4" @click="handleAdd">+添加</el-button>
      <el-button type="primary" plain class="!border-none mt-4">官方工具库</el-button>
    </div>
  </template>

  <el-dialog v-model="visible" title="添加工具" width="600px">
    <el-form ref="formRef" :model="form" label-position="top" require-asterisk-position="right">
      <el-form-item label="工具图标和名称" required>
        <el-input v-model="form.name" size="large" placeholder="请输入工具名称"></el-input>
      </el-form-item>
      <el-form-item label="执行Agent" required>
        <el-input v-model="form.value" size="large" placeholder="请输入工具名称"></el-input>
      </el-form-item>
      <el-form-item label="执行指令" required>
        <div class="text-xs text-[#9A9A9A]">
          把
          <span class="text-[#2563EB]">\{\{划词内容}}</span>
          填入到指令内容里，例如：总结以下内容：{{ 划词内容 }}
        </div>
        <el-input class="mt-2" type="textarea" :rows="5" resize="none"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex-center">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button type="default" @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDown, Delete } from '@element-plus/icons-vue'
import Sortable from '@/components/Sortable/index.vue'

import { useBrowserSettingStore } from '@/stores/modules/browser-setting.ts'

const settingStore = useBrowserSettingStore()

const formRef = ref()

const visible = ref(false)
const form = ref({
  name: '',
  value: ''
})

const handleAdd = () => {
  form.value.name = ''
  form.value.value = ''
  visible.value = true
}

const handleEdit = (item) => {
  form.value.name = item.name
  form.value.value = item.value
  visible.value = true
}

const handleDel = async (item, index) => {
  await ElMessageBox.confirm('确认删除吗？')
  settingStore.glider_menus.splice(index, 1)
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    // console.log('form', form.value)
    settingStore.glider_menus.push(form.value)
    visible.value = false
  })
}
</script>

<style scoped></style>
