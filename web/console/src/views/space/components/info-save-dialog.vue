<template>
  <el-dialog
    v-model="visible"
    class="el-dialog--footer-center"
    :title="originData.id ? $t('action.edit') : $t('action.create')"
    destroy-on-close
    center
    :close-on-click-modal="false"
    width="500px"
  >
    <el-form ref="formRef" :model="formData" label-width="108px" require-asterisk-position="right" label-position="top">
      <div class="flex items-center gap-4 mb-[18px]">
        <!-- <el-form-item :label="$t('space.icon')" prop="icon" :rules="rules.icon" required> -->
        <UploadImage v-model="formData.icon" class="w-[60px] h-[60px]" />
        <!-- </el-form-item> -->
        <el-form-item class="flex-1 !mb-0" :label="$t('space.name')" prop="name" :rules="rules.name" required>
          <el-input
            v-model="formData.name"
            size="large"
            :placeholder="$t('space.name_placeholder')"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </div>
      <!-- 成员与权限 -->
      <el-form-item label="成员与权限">
        <template #label>
          <div class="flex items-center justify-between gap-2">
            <span>成员与权限</span>
            <MemberInput @confirm="handleMemberConfirm">
              <template #trigger>
                <el-button class="!-mr-3" type="primary" link>+添加成员</el-button>
              </template>
            </MemberInput>
          </div>
        </template>
        <div class="w-full p-3 flex flex-col bg-[#F7F8FA] rounded-xl">
          <div class="max-h-52 overflow-y-auto">
            <div
              v-for="(member, index) in formData.permissions"
              :key="member.subject_id"
              class="flex items-center justify-between rounded-md py-1.5"
            >
              <div class="flex items-center gap-2">
                <template v-if="member.subject_type === SUBJECT_TYPE.company_all">
                  <img :src="$getRealPath({ url: '/images/space/peoples.png' })" alt="全体成员" class="w-5 h-5" />
                  <span class="text-sm text-[#1D1E1F]">全体成员</span>
                </template>
                <EntityDisplay
                  v-else
                  :id="member.subject_id"
                  :type="member.subject_type === SUBJECT_TYPE.group ? 'group' : 'user'"
                  mode="full"
                  :avatar-size="20"
                />
              </div>
              <div class="flex items-center gap-2">
                <RolePopover
                  v-model="member.permission"
                  :remove="!isSelf(member.subject_id)"
                  :disabled="isSelf(member.subject_id) || isCreator(member.subject_id)"
                  @select="handlePermissionSelect($event, index)"
                />
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 可见性设置 -->
      <el-form-item label="可见性设置">
        <div class="grid grid-cols-2 gap-3">
          <div
            class="rounded-md border p-3 relative cursor-pointer"
            :class="[formData.visibility === VISIBILITY_TYPE.public ? 'bg-[#2563EB14] border-[#2563EB]' : '']"
            @click="formData.visibility = VISIBILITY_TYPE.public"
          >
            <div class="mb-2 flex items-center gap-1">
              <el-icon color="#999" size="16"><View /></el-icon>
              <span class="text-sm text-[#1D1E1F]">可见</span>
            </div>
            <div class="text-xs text-[#939499]">非空间成员也可看查看，并主动申请加入空间内知识库</div>
            <div class="absolute top-1 right-1">
              <el-radio :model-value="formData.visibility" :value="VISIBILITY_TYPE.public" />
            </div>
          </div>
          <div
            class="rounded-md border p-3 relative cursor-pointer"
            :class="[formData.visibility === VISIBILITY_TYPE.private ? 'bg-[#2563EB14] border-[#2563EB]' : '']"
            @click="formData.visibility = VISIBILITY_TYPE.private"
          >
            <div class="mb-2 flex items-center gap-1">
              <el-icon color="#999" size="16"><Hide /></el-icon>
              <span class="text-sm text-[#1D1E1F]">不可见</span>
            </div>
            <div class="text-xs text-[#939499]">仅空间成员可查看，只有获得链接的成员才能申请加入空间内知识库</div>
            <div class="absolute top-1 right-1">
              <el-radio :model-value="formData.visibility" :value="VISIBILITY_TYPE.private" />
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <ElButton v-debounce class="w-24 h-9" type="primary" @click.stop="handleSave">
        {{ $t('action_save') }}
      </ElButton>
      <ElButton class="w-24 h-9 text-[#1D1E1F]" type="info" plain @click.stop="close">
        {{ $t('action_cancel') }}
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import UploadImage from '@/components/Upload/image.vue'
import MemberInput from '@/components/Permission/member-selector.vue'
import RolePopover from '@/components/Permission/selector.vue'
import EntityDisplay from '@/components/EntityDisplay/index.vue'
import {
  PERMISSION_TYPE,
  SUBJECT_TYPE,
  RESOURCE_TYPE,
  type PermissionType,
  VISIBILITY_TYPE,
} from '@/components/Permission/constant'
import spacesApi from '@/api/modules/spaces/index'
import { permissionsApi } from '@/api/modules/permissions'
import type { SpaceItem, SpaceCreateRequest } from '@/api/modules/spaces/types'

import { generateInputRules } from '@/utils/form-rule'
import { useUserStore } from '@/stores/modules/user'

const emit = defineEmits<{
  (e: 'refresh', reset: boolean): void
}>()

const formRef = ref()
const visible = ref(false)
const originData = ref<Partial<SpaceItem>>({})
const userStore = useUserStore()

const formData = reactive<SpaceCreateRequest>({
  name: '',
  description: '',
  icon: '',
  visibility: VISIBILITY_TYPE.public,
  permissions: [],
})

const default_permission = {
  subject_type: SUBJECT_TYPE.company_all,
  subject_id: 0,
  permission: PERMISSION_TYPE.viewer,
}

const isSelf = (subject_id: number) => {
  return subject_id === userStore.info.user_id
}
const isCreator = (subject_id: number) => {
  return subject_id === originData.value.owner_id
}

const rules = {
  name: generateInputRules({ validator: ['text'] }),
  icon: generateInputRules({ validator: ['image'] }),
}

const handleMemberConfirm = data => {
  const permissions = formData.permissions
  data.list.forEach(member => {
    const exist = permissions.find(
      item => item.subject_id === member.subject_id && item.subject_type === member.subject_type
    )
    if (exist) {
      if (isSelf(exist.subject_id)) {
        return
      }
      exist.permission = member.permission
      return
    }

    formData.permissions.push({
      subject_id: member.subject_id,
      permission: member.permission,
      subject_type: member.subject_type,
    })
  })
}

const handlePermissionSelect = (permission: PermissionType, index: number) => {
  if (permission === PERMISSION_TYPE.remove) {
    formData.permissions = formData.permissions.filter((item, i) => i !== index)
  }
}

const open = async (data: SpaceItem = {} as SpaceItem) => {
  formData.name = data.name || ''
  formData.description = data.description || ''
  formData.icon = data.icon || `${window.location.origin}/images/space/logo.png`
  formData.visibility = typeof data.visibility === 'number' ? data.visibility : VISIBILITY_TYPE.public
  originData.value = data || {}
  if (data.id) {
    permissionsApi
      .list({
        resource_type: RESOURCE_TYPE.space,
        resource_id: data.id,
      })
      .then(res => {
        formData.permissions = res.filter(item => item.subject_type !== SUBJECT_TYPE.space_active)
      })
  } else {
    formData.permissions = [
      { ...default_permission },
      {
        subject_type: SUBJECT_TYPE.user,
        subject_id: userStore.info.user_id,
        permission: PERMISSION_TYPE.manage,
      },
    ]
  }
  visible.value = true
}

const close = () => {
  visible.value = false
}

const handleSave = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  const form = {
    ...formData,
    permissions: [...formData.permissions],
  }
  if (originData.value.id) {
    await spacesApi.update(originData.value.id, form)
    ElMessage.success(window.$t('message_status.save_success'))
  } else {
    await spacesApi.create(form)
    ElMessage.success(window.$t('message_status.create_success'))
  }
  emit('refresh', !originData.value.id)
  close()
}

defineExpose({
  open,
  close,
})
</script>
