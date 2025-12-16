<template>
  <ElContainer class="bg-white h-full">
    <ElAside width="280px" class="flex flex-col px-5 py-6 box-border border-r border-[#e5e5e5]">
      <div class="flex items-center gap-2">
        <ElInput
          v-model="filterForm.groupKeyword"
          class="flex-1 h-[36px]"
          size="default"
          clearable
          :prefix-icon="Search"
          :placeholder="$t('internal_user.group.search_placeholder')"
          @change="fetchGroupData"
        />
      </div>
      <ul v-loading="groupLoading" class="flex-1 h-0 w-full box-border mt-4 overflow-auto">
        <li
          v-for="(item, index) in groupData"
          :key="item.group_id"
          class="group w-full box-border flex items-center gap-2 cursor-pointer hover:bg-[#f5f7fa]"
          @click="handleGroupClick(item)"
        >
          <div
            class="flex-1 w-0 box-border text-sm truncate rounded-md py-2 px-4 hover:bg-[#F5F8FF]"
            :class="[filterForm.groupId === item.group_id ? 'text-[#3664EF]' : 'text-[#333]']"
            :title="item.group_name"
          >
            {{ item.group_name || '--' }}
          </div>
          <ElDropdown @command="handleGroupCommand($event, item, index)">
            <span>
              <ElIcon class="text-[#999] rotate-90 mr-2 cursor-pointer invisible group-hover:visible">
                <MoreFilled />
              </ElIcon>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="rename">
                  {{ $t('action_rename') }}
                </ElDropdownItem>
                <ElDropdownItem command="delete">
                  <span class="text-[#F56C6C]">
                    {{ $t('action_delete') }}
                  </span>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </li>
        <ElEmpty v-if="!groupData.length" class="mt-10" :description="$t('no_data')" />
      </ul>
      <div class="w-full flex items-center gap-2 mt-4">
        <ElButton type="primary" plain size="large" class="mx-auto !border-none" @click="handleGroupCommand('create')">
          +{{ $t('internal_user.group.create') }}
        </ElButton>
      </div>
    </ElAside>
    <ElMain>
      <div class="h-[36px] flex items-center">
        <label
          class="cursor-pointer"
          :class="[filterForm.activeTabIndex === 0 ? 'text-[#3664EF]' : 'text-[#333]']"
          @click="handleTabChange(0)"
        >
          {{ $t('internal_user.group.member') }}
        </label>
        <ElDivider direction="vertical" />
        <label
          class="cursor-pointer"
          :class="[filterForm.activeTabIndex === 1 ? 'text-[#3664EF]' : 'text-[#333]']"
          @click="handleTabChange(1)"
        >
          {{ $t('internal_user.group.usable') }}
        </label>
      </div>
      <div v-if="filterForm.activeTabIndex === 0">
        <div class="flex items-center justify-between h-[40px] gap-4">
          <h1 :title="activeGroupInfo.group_name" class="truncate">
            {{ activeGroupInfo.group_name || '--' }}
          </h1>
          <div class="flex items-center gap-4">
            <ElInput
              v-model="userFilterForm.keyword"
              style="width: 268px"
              size="large"
              clearable
              :prefix-icon="Search"
              :placeholder="$t('internal_user.organization.all_search_placeholder')"
              @change="refresh"
            />
            <DeptMemberPicker @confirm="handleUserAddConfirm">
              <template #trigger>
                <ElButton class="min-w-[100px]" type="primary" size="large"> + {{ $t('action_add') }} </ElButton>
              </template>
            </DeptMemberPicker>
          </div>
        </div>
        <TablePlus
          class="mt-4"
          :data="userTableData"
          :total="userTableTotal"
          style="width: 100%"
          header-row-class-name="rounded overflow-hidden"
          header-cell-class-name="!bg-[#F6F7F8] !h-[60px] !border-none"
          :loading="userLoading"
          max-height="calc(100vh - 360px)"
          @page-current-change="onUserPageChange"
          @page-size-change="onUserPageSizeChange"
        >
          <ElTableColumn
            :label="$t('internal_user.account.name')"
            min-width="140"
            prop="nickname"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <SvgIcon
                class="inline-block mr-2"
                :name="row.resource_type === 'department' ? 'department' : 'member'"
                width="16px"
                height="16px"
                color="#999"
              />
              {{ row.nickname || row.name || '--' }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('internal_user.account.mobile')"
            min-width="140"
            prop="mobile"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span :class="{ 'text-[#9B9B9B]': !row.mobile }">{{ row.mobile || '--' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('internal_user.account.department')"
            min-width="140"
            prop="department"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row.dept_names || enterpriseStore.info.name || '--' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('operation')" width="80" fixed="right" align="right">
            <template #default="{ row }">
              <ElButton
                class="text-[#5A6D9E] !bg-transparent"
                type="text"
                :loading="row.deleting"
                @click="handleUserRemove(row)"
              >
                {{ $t('action_remove') }}
              </ElButton>
            </template>
          </ElTableColumn>
        </TablePlus>
      </div>
      <div v-else-if="filterForm.activeTabIndex === 1">
        <div class="flex items-center gap-3 mt-2">
          <ElButton
            v-for="item in availableBtns"
            :key="item.type"
            class="h-[36px] leading-[36px] px-3 text-sm rounded-md"
            :class="
              filterForm.activeAvailableTabIndex === item.type
                ? 'text-[#3664EF] bg-[#E9EFFF]'
                : 'text-[#4F5052] bg-[#EEF0F4]'
            "
            @click="handleAvailableTabChange(item.type)"
          >
            {{ item.label }}
          </ElButton>
        </div>
        <ResourcePicker
          v-model="availableData"
          :group-type="filterForm.activeAvailableTabIndex"
          class="mt-4"
          @confirm="handleResourceAddConfirm"
          @remove="handleResourceRemove"
        />
      </div>
    </ElMain>

    <GroupAddDialog ref="groupAddRef" />
  </ElContainer>
</template>

<script setup lang="ts">
import { MoreFilled, Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import GroupAddDialog from '../components/group-add-dialog.vue'
import { groupApi } from '@/api/modules/group'
import { GROUP_TYPE, GroupType, ResourceType, RESOURCE_TYPE } from '@/constants/group'
import { useEnterpriseStore } from '@/stores'
import ResourcePicker from '@/components/ResourcePicker/index.vue'

const enterpriseStore = useEnterpriseStore()
const availableBtns = [
  {
    type: GROUP_TYPE.AGENT,
    label: window.$t('module.agent'),
  },
  {
    type: GROUP_TYPE.PROMPT,
    label: window.$t('module.prompt'),
  },
  {
    type: GROUP_TYPE.AI_LINK,
    label: window.$t('module.ai_toolbox'),
  },
]
const groupAddRef = ref()
const filterForm = reactive<{
  groupKeyword: string
  groupId: number
  activeTabIndex: number
  activeAvailableTabIndex: GroupType
}>({
  groupKeyword: '',
  groupId: 0,
  activeTabIndex: 0,
  activeAvailableTabIndex: GROUP_TYPE.AGENT,
})
const groupData = ref([])
const groupLoading = ref(false)

const activeGroupInfo = computed(() => {
  return groupData.value.find(item => item.group_id === filterForm.groupId) || {}
})

const fetchGroupData = async () => {
  groupLoading.value = true
  const list = await groupApi.list({ params: { group_type: GROUP_TYPE.INTERNAL_USER } }).finally(() => {
    groupLoading.value = false
  })
  groupData.value = list.filter(item => item.group_name && item.group_name.includes(filterForm.groupKeyword))
  if (!filterForm.groupId) filterForm.groupId = (groupData.value[0] || {}).group_id || 0
}
const handleGroupClick = (data = {}) => {
  filterForm.groupId = data.group_id
  refresh()
}
const handleGroupCommand = async (command: string, data: any, index: number) => {
  switch (command) {
    case 'create':
    case 'rename':
      groupAddRef.value.open({
        data,
        success: () => {
          fetchGroupData()
        },
      })
      break
    case 'delete':
      await ElMessageBox.confirm(window.$t('group_delete_confirm'), window.$t('action_delete'))
      await groupApi.delete({ data: { group_id: data.group_id } })
      ElMessage.success(window.$t('action_delete_success'))
      fetchGroupData()
      break
  }
}

const handleTabChange = (index: number) => {
  filterForm.activeTabIndex = index
  refresh()
}
const handleAvailableTabChange = (index: GroupType) => {
  if (index === filterForm.activeAvailableTabIndex) return
  filterForm.activeAvailableTabIndex = index
  fetchResourceData()
}
const refresh = () => {
  if (filterForm.activeTabIndex === 0) {
    userFilterForm.page = 1
    fetchUserData()
  }
  if (filterForm.activeTabIndex === 1) {
    fetchResourceData()
  }
}

const userFilterForm = reactive({
  keyword: '',
  page: 1,
  pageSize: 10,
})
const userTableData = ref([])
const userTableTotal = ref(0)
const userLoading = ref(false)
const fetchUserData = async () => {
  userLoading.value = true
  const { total = 0, list = [] } = await groupApi
    .user_list({
      group_id: filterForm.groupId,
      keyword: userFilterForm.keyword,
      offset: (userFilterForm.page - 1) * userFilterForm.pageSize,
      limit: userFilterForm.pageSize,
    })
    .finally(() => {
      userLoading.value = false
    })
  userTableTotal.value = total
  userTableData.value = [...list]
}
const onUserPageChange = (page: number) => {
  userFilterForm.page = page
  fetchUserData()
}
const onUserPageSizeChange = (pageSize: number) => {
  userFilterForm.pageSize = pageSize
  refresh()
}
const handleUserAddConfirm = async ({ value = [] } = {}) => {
  if (!filterForm.groupId) return ElMessage.warning(window.$t('internal_user.group.create_tip'))
  const department_ids = value.filter(item => +item.did).map(item => +item.did)
  const user_ids = value.filter(item => +item.user_id).map(item => +item.user_id)
  const data = {
    group_id: filterForm.groupId,
    department_ids,
    user_ids,
  }
  await groupApi.batch_add_user(data)
  ElMessage.success(window.$t('action_add_success'))
  refresh()
}
const handleUserRemove = async (data = {}) => {
  await ElMessageBox.confirm(window.$t('internal_user.group.remove_user_confirm'), window.$t('tip'))
  await groupApi.remove_user({
    group_id: filterForm.groupId,
    permission_ids: [data.permission_id],
  })
  ElMessage.success(window.$t('action_remove_success'))
  fetchUserData()
}

const availableData = ref([])
const resourceType = computed<ResourceType>(() => {
  switch (filterForm.activeAvailableTabIndex) {
    case GROUP_TYPE.AGENT:
      return RESOURCE_TYPE.AGENT
    case GROUP_TYPE.PROMPT:
      return RESOURCE_TYPE.PROMPT
    case GROUP_TYPE.AI_LINK:
      return RESOURCE_TYPE.AI_LINK
    default:
      return RESOURCE_TYPE.AGENT
  }
})

const idName = computed(() => {
  return resourceType.value === RESOURCE_TYPE.AGENT
    ? 'agent_id'
    : resourceType.value === RESOURCE_TYPE.PROMPT
      ? 'prompt_id'
      : 'id'
})

const fetchResourceData = async () => {
  const { list = [] } = await groupApi.resource_list({
    id: filterForm.groupId,
    params: {
      offset: 0,
      limit: 1000,
      resource_type: resourceType.value,
    },
  })
  availableData.value = list
}

const handleResourceAddConfirm = async ({ value = [] } = {}) => {
  if (!filterForm.groupId) return ElMessage.warning(window.$t('internal_user.group.create_tip'))
  const resource_ids = value.filter(item => +item[idName.value]).map(item => +item[idName.value])
  const data = {
    id: filterForm.groupId,
    request: {
      resource_ids,
      resource_type: resourceType.value,
    },
  }
  await groupApi.batch_add_resource(data)
  ElMessage.success(window.$t('action_add_success'))
  refresh()
}

const handleResourceRemove = ({ value = [] } = {}) => {
  const resource_ids = value.filter(item => +item[idName.value]).map(item => +item[idName.value])
  let confirmText = ''
  switch (resourceType.value) {
    case RESOURCE_TYPE.AGENT:
      confirmText = window.$t('internal_user.group.remove_agent_confirm')
      break
    case RESOURCE_TYPE.PROMPT:
      confirmText = window.$t('internal_user.group.remove_prompt_confirm')
      break
    case RESOURCE_TYPE.AI_LINK:
      confirmText = window.$t('internal_user.group.remove_ai_toolkit_confirm')
      break
  }
  ElMessageBox.confirm(confirmText, window.$t('tip'))
    .then(async () => {
      await groupApi.remove_resource({
        id: filterForm.groupId,
        request: {
          resource_ids,
          resource_type: resourceType.value,
        },
      })
      ElMessage.success(window.$t('action_remove_success'))
      fetchResourceData()
    })
    .catch(() => {})
}

onMounted(async () => {
  await fetchGroupData()
  refresh()
})
</script>
