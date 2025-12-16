<template>
  <div>
    <DeptMemberPicker
      v-model="memberList"
      :default-first-value="false"
      type="user"
      :show-group="true"
      :allow-select-all-company="true"
      @confirm="handleUserAddConfirm"
    >
      <template #trigger>
        <slot name="trigger" />
      </template>
    </DeptMemberPicker>

    <el-dialog
      :model-value="visible"
      append-to-body
      align-center
      title="添加用户"
      width="400px"
      :close-on-click-modal="false"
      @close="handleCancel"
    >
      <div class="max-h-52 p-3 bg-[#F7F8FA] rounded-md space-y-1.5 overflow-y-auto">
        <template v-for="item in memberList" :key="item.value">
          <div class="h-8 flex items-center justify-between gap-2">
            <img :src="item.avatar" alt="avatar" class="w-5 h-5 rounded-full" />
            <p class="flex-1 text-sm text-[#1D1E1F] truncate">{{ item.label }}</p>
            <RolePopover v-model="item.permission" />
          </div>
        </template>
      </div>

      <template #footer>
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button size="large" type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 用户和分组选择器，用于添加成员并设置权限
import { ref } from 'vue'
import DeptMemberPicker from '@/components/DeptMemberPicker/index.vue'
import RolePopover from './selector.vue'
import { PERMISSION_TYPE, SUBJECT_TYPE, type PermissionType, type SubjectType } from './constant'

type PickerItem = {
  label: string
  value: string
  type: 'member' | 'group' | 'company'
  permission: PermissionType
  avatar: string
}

const emits = defineEmits<{
  (e: 'confirm', value: { list: { subject_id: number; subject_type: SubjectType; permission: PermissionType }[] }): void
}>()

const memberList = ref<PickerItem[]>([])

const visible = ref(false)

const handleUserAddConfirm = (data: any) => {
  memberList.value = data.value.map(item => {
    const isCompany = item.value === 0
    return {
      label: isCompany ? '全体成员' : item.label,
      type: isCompany ? 'company' : item.type,
      value: item.value,
      avatar: isCompany
        ? window.$getRealPath({ url: '/images/space/peoples.png' })
        : window.$getRealPath({ url: '/images/space/people.png' }),
      permission: PERMISSION_TYPE.viewer,
    }
  })
  visible.value = true
}

const handleCancel = () => {
  memberList.value = []
  visible.value = false
}

const handleConfirm = () => {
  const userList = memberList.value.filter(item => item.type === 'member')
  const groupList = memberList.value.filter(item => item.type === 'group')
  const companyList = memberList.value.filter(item => item.type === 'company')

  emits('confirm', {
    list: [
      ...userList.map(item => {
        return {
          subject_id: item.value,
          subject_type: SUBJECT_TYPE.user,
          permission: item.permission,
        }
      }),
      ...groupList.map(item => {
        return {
          subject_id: item.value,
          subject_type: SUBJECT_TYPE.group,
          permission: item.permission,
        }
      }),
      ...companyList.map(item => {
        return {
          subject_id: 0,
          subject_type: SUBJECT_TYPE.company_all,
          permission: item.permission,
        }
      }),
    ],
  })
  handleCancel()
}
</script>

<style scoped></style>
