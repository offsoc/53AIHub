<script setup lang="ts">
import { ArrowDown, Search } from '@element-plus/icons-vue'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import UserAddDialog from '../components/user-internal-add-dialog.vue'
import UserEditDrawer from '../components/user-internal-edit-drawer.vue'
import UserStatus from '../components/user-internal-status.vue'
import OpenData from '@/components/OpenData/index.vue'

import {
  INTERNAL_USER_STATUS_ALL,
  INTERNAL_USER_STATUS_DISABLED,
  INTERNAL_USER_STATUS_ENABLED,
  INTERNAL_USER_STATUS_LABEL_MAP,
  INTERNAL_USER_STATUS_UNDEFINED,
  userApi,
} from '@/api/modules/user'
import departmentApi from '@/api/modules/department'
import { useEnterpriseStore, useUserStore } from '@/stores'

import { ENTERPRISE_SYNC_FROM } from '@/constants/enterprise'
import type { EnterpriseSyncFrom } from '@/constants/enterprise'

interface Member {
  id: number
  mid: number
  eid: number
  name: string
  bind_value: string
  status: number
  from: number
  created_time: number
  updated_time: number
  user_id: number
  username: string
  nickname: string
  avatar: string
  mobile: string
  email: string
  role: number
  user_status: number
  department_relations: {
    id: number
    did: number
    eid: number
    bid: number
    from: number
    created_time: number
    updated_time: number
  }[]
}

interface User {
  user_id: number
  username: string
  nickname: string
  avatar: string
  mobile: string
  email: string
  eid: number
  role: number
  group_id: number
  status: number
  expired_time: number
  last_login_time: number
  access_token: string
  related_id: number
  type: number
  add_admin_time: number
  openid: string
  unionid: string
  departments: null
  memberbindings: {
    id: number
    mid: number
    eid: number
    name: string
    bind_value: string
    status: number
    from: number
    created_time: number
    updated_time: number
  }[]
  group_ids: number[] | null
  created_time: number
  updated_time: number
  hide?: boolean
}

const props = withDefaults(defineProps<{
  syncFrom?: EnterpriseSyncFrom
  department?: any
  filterParams?: {
    keyword?: string
    did?: number
  }
}>(), {
  syncFrom: ENTERPRISE_SYNC_FROM.DEFAULT,
  department: () => ({
    name: '',
    did: 0,
  }),
  filterParams: () => ({}),
})
const enterpriseStore = useEnterpriseStore()
const userStore = useUserStore()

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
const relateRef = ref()
const relateTooltipRef = ref()

const filterForm = reactive({
  status: INTERNAL_USER_STATUS_ALL,
  keyword: '',
  page: 1,
  pageSize: 10,
})
const relate = reactive({
  list: [] as User[],
  keyword: '',
})

const loading = ref(false)
const tableData = ref<Member[]>([])
const tableTotal = ref(0)

const isSsoSync = computed(() => props.syncFrom !== ENTERPRISE_SYNC_FROM.DEFAULT)
const isDingtalkSync = computed(() => props.syncFrom === ENTERPRISE_SYNC_FROM.DINGTALK)

const fetchUserList = async () => {
  if (loading.value)
    return
  loading.value = true
  const params = {
    status: INTERNAL_USER_STATUS_ALL,
    offset: (filterForm.page - 1) * filterForm.pageSize,
    limit: filterForm.pageSize,
    from: props.syncFrom,
    user_status: filterForm.status,
    keyword: '',
    did: props.department.did,
  }
  if (props.filterParams.keyword)
    params.keyword = props.filterParams.keyword

  const res = await userApi.organization(params).finally(() => {
    loading.value = false
  })
  tableData.value = (res.data.data || []).map((item) => {
    item.deleting = false
    item.dept_names = (item.department_relations || []).map(item => item.name).join(',')
    item.dept_dids = (item.department_relations || []).map(item => item.bind_value).join(',')
    return item
  })
  tableTotal.value = +res.data.total_count || 0
}

const refresh = () => {
  filterForm.page = 1
  fetchUserList()
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
    data: {
      ...data,
      status: data.user_status,
      nickname: props.syncFrom === ENTERPRISE_SYNC_FROM.DINGTALK ? data.name : data.nickname
    },
    success: () => {
      fetchUserList()
    },
  })
}
const handleUserDelete = async (data) => {
  await ElMessageBox.confirm(window.$t('module.operation_user_delete_confirm'))
  data.deleting = true

  if (isSsoSync.value)
  	await departmentApi.unbind_member({ user_id: data.user_id, from: Number(props.syncFrom) })
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

const loadUserList = async () => {
  const NO_BIND = 1
  userApi.fetch_internal_user({ limit: 1000, not_bind: NO_BIND, from: props.syncFrom }).then((res) => {
    relate.list = res.list
  })
}
const handleAccountSearch = () => {
  const keyword = relate.keyword.trim()
  if (keyword) {
    relate.list.forEach((item) => {
      item.hide = !item.nickname.includes(keyword)
    })
  }
  else {
    relate.list.forEach((item) => {
      item.hide = false
    })
  }
}
let _currentMember: any
const handleRelate = (e, row) => {
  relate.keyword = ''
  handleAccountSearch()
  loadUserList()
  _currentMember = row
  relateRef.value = e.currentTarget
  relateTooltipRef.value.onOpen()
}
const handleBind = async (member: Member) => {
  await ElMessageBox.confirm(window.$t('sso.bind_member_tip'))
  await departmentApi.bind_member({ bid: _currentMember.id, user_id: member.user_id, from: Number(props.syncFrom) })
  ElMessage.success(window.$t('action_bind_success'))
  loadUserList()
  fetchUserList()

  relateTooltipRef.value.onClose()
}

const handleUnbind = async (member: Member) => {
  await ElMessageBox.confirm(window.$t('sso.unbind_member_tip'))
  await departmentApi.unbind_member({ user_id: member.user_id, from: Number(props.syncFrom) })
  ElMessage.success(window.$t('action_unbind_success'))
  loadUserList()
  fetchUserList()
}

const onStatusChange = (value: number) => {
  filterForm.status = value
  refresh()
}
onMounted(async () => {
  refresh()
})
onUnmounted(() => {
})

defineExpose({
  refresh() {
    nextTick(() => {
      refresh()
    })
  },
})
</script>

<template>
  <div
    class="max-h-ful flex flex-col bg-white py-6 box-border overflow-auto px-5"
  >
    <div class="flex items-center gap-2">
      <!-- <div class="h-[40px] text-[#333] text-xl truncate">
        <OpenData type="departmentName" :openid="department.bind_value" :text="department.name || enterpriseStore.info.name" />
        {{ $t('internal_user.department.member_total_count', { total: tableTotal }) }}
      </div> -->

      <div class="h-[40px] text-[#333] text-xl truncate">
        <OpenData type="departmentName" :openid="department.bind_value > 0 ? department.bind_value : 0" :text="department.name || enterpriseStore.info.name" />
        {{ $t('internal_user.department.member_total_count', { total: tableTotal }) }}
      </div>
    </div>

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
          :label="$t('internal_user.account.nickname')" min-width="140" :prop="isDingtalkSync ? 'name' : 'nickname'"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <OpenData type="userName" :openid="row.bind_value" :text="isDingtalkSync ? row.name : row.nickname" />
              <template v-if="isSsoSync">
                <template v-if="row.user_id">
                  ({{ row.nickname }})
                </template>
                <img v-else :src="$getRealPath({ url: `/images/sso/${isDingtalkSync ? 'dingtalk' : 'wecom'}.png` })" class="size-4">
              </template>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('internal_user.account.mobile')" min-width="140" prop="mobile" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'text-[#9B9B9B]': !row.mobile }">{{ row.mobile || '--' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="$t('internal_user.account.department')" min-width="140" prop="department"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <OpenData type="departmentName" :openid="row.dept_dids" :text="row.dept_names || enterpriseStore.info.name || '--' " />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('internal_user.account.status')" min-width="140" prop="status" show-overflow-tooltip>
          <template #default="{ row }">
            <UserStatus v-model="row.user_status" :user-data="row" button-class="invisible group-hover:visible" />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('operation')" width="130" fixed="right">
          <template #default="{ row }">
            <template v-if="row.user_id">
              <ElButton class="text-[#5A6D9E] !bg-transparent" type="text" @click="handleEdit(row)">
                {{ $t('action_edit') }}
              </ElButton>
              <ElDropdown placement="bottom">
                <div class="text-[#5A6D9E] h-8 flex-center ml-2 !outline-none !border-none">
                  {{ $t('more') }}
                  <ElIcon size="14" class="ml-1">
                    <ArrowDown />
                  </ElIcon>
                </div>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="dialogue_record" @click="handleUnbind(row)">
                      {{ $t('sso.unbind_member') }}
                    </ElDropdownItem>
                    <ElDropdownItem :disabled="Number(row.user_id) === Number(userStore.info.user_id) || isSsoSync" @click="handleUserDelete(row)">
                      {{ $t('action_delete') }}
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </template>
            <el-button v-else type="primary" link @click="handleRelate($event, row)">
              {{ $t('sso.bind_member') }}
            </el-button>
          </template>
        </ElTableColumn>
      </TablePlus>
    </div>

    <UserAddDialog ref="userAddRef" />
    <UserEditDrawer ref="userEditRef" />
  </div>

  <!-- 关联成员 -->
  <el-tooltip
    ref="relateTooltipRef" effect="light" trigger="click" placement="bottom-start" :popper-options="{
      modifiers: [
        {
          name: 'computeStyles',
          options: {
            adaptive: false,
            enabled: false,
          },
        },
      ],
    }" :teleported="false" virtual-triggering :virtual-ref="relateRef" popper-class="relate-tooltip"
    :show-arrow="false"
  >
    <template #content>
      <div class="w-[132px] overflow-hidden">
        <div class="h-10 flex items-center gap-1 border-b px-4 overflow-hidden">
          <el-icon color="rgba(24, 43, 80, 0.3)">
            <Search />
          </el-icon>
          <input
            v-model="relate.keyword" class="flex-1 outline-none overflow-x-auto" type="text" :placeholder="$t('action_search')"
            @input="handleAccountSearch"
          >
        </div>
        <div class="max-h-[200px] overflow-y-auto">
          <template v-for="item in relate.list" :key="item.id">
            <div
              v-if="!item.hide" class="text-[#182B50] text-sm px-4 py-2 cursor-pointer truncate hover:bg-slate-200"
              @click="handleBind(item)"
            >
              {{ item.nickname || '--' }}
            </div>
          </template>
        </div>
      </div>
    </template>
  </el-tooltip>
</template>

<style scoped></style>

<style>
.relate-tooltip {
	padding: 0;
	border: none !important;
	box-shadow: 0ch 0.5ch 1ch rgba(0, 0, 0, 0.1);
	left: -10px !important;
}
</style>
