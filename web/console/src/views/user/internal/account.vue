<script setup lang="ts">
import { ArrowDown, Search } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import UserAddDialog from '../components/user-internal-add-dialog.vue'
import UserEditDrawer from '../components/user-internal-edit-drawer.vue'
import UserStatus from '../components/user-internal-status.vue'
import DialogueRecordDrawer from '@/components/DialogueRecord/drawer.vue'

import {
  INTERNAL_USER_STATUS_ALL,
  INTERNAL_USER_STATUS_DISABLED,
  INTERNAL_USER_STATUS_ENABLED,
  INTERNAL_USER_STATUS_LABEL_MAP,
  INTERNAL_USER_STATUS_UNDEFINED,
  userApi,
} from '@/api/modules/user'
import { groupApi, Group } from '@/api/modules/group'
import { GROUP_TYPE } from '@/constants/group'
import { useEnterpriseStore, useUserStore } from '@/stores'
import { useEnv } from '@/hooks/useEnv'

import { ENTERPRISE_SYNC_FROM } from '@/constants/enterprise'
import type { EnterpriseSyncFrom } from '@/constants/enterprise'

const props = withDefaults(defineProps<{
    syncFrom?: EnterpriseSyncFrom
}>(), {
    syncFrom: ENTERPRISE_SYNC_FROM.DEFAULT,
})

const enterpriseStore = useEnterpriseStore()
const userStore = useUserStore()
const router = useRouter()
const { isWorkEnv } = useEnv()

const statusOptions = [
  INTERNAL_USER_STATUS_ALL,
  INTERNAL_USER_STATUS_UNDEFINED,
  INTERNAL_USER_STATUS_ENABLED,
  INTERNAL_USER_STATUS_DISABLED,
].map(value => ({
  value,
  label: INTERNAL_USER_STATUS_LABEL_MAP.get(value),
}))
const userAddRef = ref()
const userEditRef = ref()
const filterForm = reactive({
  status: -1,
  keyword: '',
  page: 1,
  pageSize: 10,
})
const loading = ref(false)
const groupData = ref<Record<number, string>>({})
const tableData = ref([])
const tableTotal = ref(0)

const isSsoSync = computed(() => props.syncFrom !== ENTERPRISE_SYNC_FROM.DEFAULT)

const onStatusChange = (value: number) => {
  filterForm.status = value
  refresh()
}
const refresh = () => {
  filterForm.page = 1
  fetchUserList()
}

const fetchGroupData = async () => {
  const list = await groupApi.list({ params: { group_type: GROUP_TYPE.INTERNAL_USER } })
  list.forEach((item: Group) => {
    groupData.value[item.group_id] = item.group_name
  })
}

const fetchUserList = async () => {
  if (loading.value)
    return
  loading.value = true
  const params = {
    status: filterForm.status,
    keyword: filterForm.keyword,
    offset: (filterForm.page - 1) * filterForm.pageSize,
    limit: filterForm.pageSize,
    from: props.syncFrom,
  }

  if (params.status < 0)
    delete params.status
  const { total = 0, list = [] } = await userApi.fetch_internal_user(params).finally(() => {
    loading.value = false
  })
  tableData.value = list.map((item) => {
    item.deleting = false
    item.group_names = (item.group_ids ?? [])
      .reduce((names: string[], id: number) => {
        const name = groupData.value[id]
        if (name) names.push(name)
        return names
      }, [])
      .join('、')
    return item
  })
  tableTotal.value = +total || 0
}
const handleAdd = () => {
  userAddRef.value.open({
    success: () => {
      refresh()
    },
  })
}
const handleEdit = (data) => {
  userEditRef.value.open({
    data,
    success: () => {
      fetchUserList()
    },
  })
}
const onUserDelete = async (data) => {
  await ElMessageBox.confirm(window.$t('module.operation_user_delete_confirm'))
  data.deleting = true
  await userApi.delete_user({ user_id: data.user_id }).finally(() => {
    data.deleting = false
  })
  ElMessage.success(window.$t('action_delete_success'))
  fetchUserList()
}
const onPageSizeChange = (pageSize: number) => {
  filterForm.pageSize = pageSize
  refresh()
}
const onPageChange = (page: number) => {
  filterForm.page = page
  fetchUserList()
}
const dialogueRecordRef = ref()
const handleMoreCommand = (command, data = {}) => {
  switch (command) {
    case 'dialogue_record':
      dialogueRecordRef.value.open({ type: 'user', relatedId: data.user_id })
      break
    case 'delete':
      onUserDelete(data)
      break
  }
}

onMounted(async () => {
  await fetchGroupData()
  refresh()
})
onUnmounted(() => {
})
</script>

<template>
  <div
    class="max-h-ful flex flex-col bg-white py-6 box-border overflow-auto px-8"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <ElDropdown placement="bottom" @command="onStatusChange">
          <div
            class="!border-none !outline-none h-9 flex-center px-5 gap-1.5 rounded-2xl bg-[#F6F7F8] text-xs text-[#1D1E1F] cursor-pointer"
          >
            {{ $t(statusOptions.find((item) => item.value === filterForm.status)?.label || 'internal_user.status.all')
            }}
            <ElIcon size="14" color="#9EA5B6">
              <ArrowDown />
            </ElIcon>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem v-for="item in statusOptions" :key="item.value" :command="item.value">
                {{ $t(item.label) }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <div class="flex-center gap-3">
        <ElInput
          v-model="filterForm.keyword" style="width: 268px" size="large" clearable
          :suffix-icon="Search" :placeholder="$t('internal_user.account.search_placeholder')" @change="refresh"
        />
        <ElButton v-if="!isSsoSync" class="min-w-[100px]" type="primary" size="large" @click="handleAdd">
          + {{ $t('action_add') }}
        </ElButton>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-white rounded-lg mt-4">
      <TablePlus
        :data="tableData" :total="tableTotal" style="width: 100%"
        header-row-class-name="rounded overflow-hidden" header-cell-class-name="!bg-[#F6F7F8] !h-[60px] !border-none"
        row-class-name="group" :loading="loading" @page-current-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <ElTableColumn
          :label="$t('internal_user.account.nickname')" min-width="140" prop="nickname"
          show-overflow-tooltip
        />
        <ElTableColumn :label="$t('internal_user.account.mobile')" min-width="140" prop="mobile" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'text-[#9B9B9B]': !row.mobile }">{{ row.mobile || '--' }}</span>
          </template>
        </ElTableColumn>
        <!-- <ElTableColumn v-if="!isOrganization" :label="$t('internal_user.account.group')" min-width="140" prop="group"
					show-overflow-tooltip>
					<template #default="{ row }">
						<span :class="{ 'text-[#9B9B9B]': !row.group }">{{ row.group || '--' }}</span>
					</template>
				</ElTableColumn> -->
        <ElTableColumn
          :label="$t('internal_user.account.department')" min-width="140" prop="department"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.dept_names || enterpriseStore.info.name || '--' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('internal_user.group.title')" min-width="140" prop="group" show-overflow-tooltip>
          <template #default="{ row }"> {{ row.group_names || '--' }} </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('internal_user.account.status')" min-width="140" prop="status" show-overflow-tooltip>
          <template #default="{ row }">
            <UserStatus v-model="row.status" :user-data="row" button-class="invisible group-hover:visible" />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('operation')" width="120" fixed="right" align="right">
          <template #default="{ row }">
            <ElButton class="text-[#5A6D9E] !bg-transparent" type="text" @click="handleEdit(row)">
              {{ $t('action_edit') }}
            </ElButton>
            <!-- <ElButton class="text-[#5A6D9E]" type="text" @click="handleRecord(row)">
							{{ $t('usage_record') }}
						</ElButton> -->
            <ElDropdown v-if="!isWorkEnv" placement="bottom" @command="handleMoreCommand($event, row)">
              <div class="text-[#5A6D9E] h-8 flex-center ml-2 !outline-none !border-none">
                {{ $t('more') }}
                <ElIcon size="14" class="ml-1">
                  <ArrowDown />
                </ElIcon>
              </div>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="dialogue_record">
                    {{ $t('dialogue_record') }}
                  </ElDropdownItem>
                  <ElDropdownItem :disabled="row.user_id == userStore.info.user_id" command="delete">
                    {{ $t('action_delete') }}
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
            <ElButton
              v-else class="text-[#5A6D9E] !bg-transparent !w-[30px] text-left" type="text" :loading="row.deleting"
              :disabled="row.user_id == userStore.info.user_id" @click="onUserDelete(row)"
            >
              {{ row.user_id == userStore.info.user_id ? '--' : $t('action_delete') }}
            </ElButton>
          </template>
        </ElTableColumn>
      </TablePlus>
    </div>

    <UserAddDialog ref="userAddRef" />
    <UserEditDrawer ref="userEditRef" />
    <DialogueRecordDrawer ref="dialogueRecordRef" />
  </div>
</template>

<style scoped></style>
