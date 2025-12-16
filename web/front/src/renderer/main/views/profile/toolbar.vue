<template>
  <img class="h-[280px] bg-[#E5ECFF] rounded-lg" src="/images/toolbar.png" />
  <div class="flex items-center justify-between py-3 mt-2">
    <div class="text-[#1D1E1F] text-sm font-semibold">启用/禁用</div>
  </div>
  <div class="h-10 flex items-center justify-between px-4 border rounded-md">
    <div class="text-sm text-[#1D1E1F]">启用网页工具栏</div>
    <el-switch v-model="settingStore.toolbar_enabled"></el-switch>
  </div>
  <template v-if="settingStore.toolbar_enabled">
    <div class="flex items-center justify-between py-3 mt-2">
      <div class="text-[#1D1E1F] text-sm font-semibold">工具栏</div>
      <el-button type="primary" plain class="!border-none">系统内置</el-button>
    </div>

    <Sortable v-model="settingStore.toolbar_menus" identity="value" class="flex flex-col gap-2">
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
  </template>

  <el-button type="primary" plain class="!border-none mt-4">+添加</el-button>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'

import Sortable from '@/components/Sortable/index.vue'

import { useBrowserSettingStore } from '@/stores/modules/browser-setting.ts'

const settingStore = useBrowserSettingStore()
</script>

<style scoped></style>
