<template>
  <Layout class="px-[60px] py-8">
    <Header :title="$t('module.prompt')">
      <template #right>
        <el-button type="primary" size="large" @click="handleMoreCommand('add')"> + {{ $t('action_add') }} </el-button>
      </template>
    </Header>
    <div class="flex-1 overflow-y-auto bg-white rounded-lg px-10 py-6 mt-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex-1 w-0">
          <GroupTabs
            ref="groupTabsRef"
            v-model="filter_form.group_id"
            type="dropdown"
            :group-type="GROUP_TYPE.PROMPT"
            @change="refresh"
            @get-options="refresh"
          />
        </div>
        <div class="flex-none flex-center gap-3 ml-8">
          <ElInput
            v-model="filter_form.keyword"
            size="large"
            clearable
            :placeholder="$t('prompt.search_placeholder')"
            :suffix-icon="Search"
            @change="refresh"
          />
        </div>
      </div>
      <TablePlus
        header-row-class-name="rounded overflow-hidden"
        header-cell-class-name="!bg-[#F6F7F8] !h-[60px] !border-none"
        :data="table_data"
        :total="table_total"
        :loading="table_loading"
        :page="filter_form.page"
        :limit="filter_form.page_size"
        @page-size-change="onTableSizeChange"
        @page-current-change="onTableCurrentChange"
      >
        <ElTableColumn :label="$t('title')" min-width="140" prop="name" show-overflow-tooltip />
        <ElTableColumn :label="$t('description')" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="!row.description ? 'text-[#999]' : ''">
              {{ row.description || '--' }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('group')" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="!row.group_names || !row.group_names.length ? 'text-[#999]' : ''">
              {{ row.group_names.join('、') || '--' }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('usage_range')" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div :class="!row.user_group_names.length ? 'text-[#999]' : ''">
              <span class="text-[#999]">{{ $t('register_user.title') }}： </span
              >{{ row.user_group_names.join('、') || '--' }}
            </div>
            <div :class="!row.internal_members.length ? 'text-[#999]' : ''">
              <span class="text-[#999]">{{ $t('internal_user.title') }}： </span
              >{{ row.internal_members.join('、') || '--' }}
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('action_enable')" width="100">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleMoreCommand('update_status', row)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('operation')" width="120" align="right" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleMoreCommand('edit', row)">
              {{ $t('action_edit') }}
            </el-button>
            <el-button type="primary" link @click="handleMoreCommand('delete', row)">
              {{ $t('action_delete') }}
            </el-button>
          </template>
        </ElTableColumn>
      </TablePlus>
    </div>
  </Layout>

  <CreateDrawer ref="createRef" />
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CreateDrawer from './components/create-drawer.vue'

import eventBus from '@/utils/event-bus'
import { promptApi } from '@/api/modules/prompt'
import { groupApi, Group } from '@/api/modules/group'
import { GROUP_TYPE } from '@/constants/group'
import { subscriptionApi } from '@/api/modules/subscription'

defineOptions({
  name: 'Prompt',
})

const router = useRouter()

const groupTabsRef = ref()
const createRef = ref()

const filter_form = reactive({
  group_id: [],
  keyword: '',
  page: 1,
  page_size: 10,
})
const table_data = ref([])
const table_total = ref(0)
const table_loading = ref(false)
const internalGroupOptions = ref<Record<number, string>>({})
const subscriptionListOptions = ref<Record<number, string>>({})

const loadSubscriptionList = async () => {
  const subscriptionList = await subscriptionApi.list({ params: { offset: 0, limit: 1000 } })
  subscriptionList.forEach((item: Group) => {
    subscriptionListOptions.value[item.group_id] = item.group_name
  })
}

// 内部成员列表
const loadInternalGroupList = async () => {
  const list = await groupApi.list({ params: { group_type: GROUP_TYPE.INTERNAL_USER } })
  list.forEach((item: Group) => {
    internalGroupOptions.value[item.group_id] = item.group_name
  })
}

// 分组列表
const getGroupList = () => {
  const options = groupTabsRef.value.getData()
  const idNameMap: Record<number, string> = {}
  if (options?.length > 0) {
    options.forEach((item: Group) => {
      idNameMap[item.group_id] = item.group_name
    })
  }
  return idNameMap
}

const fetchPromptData = async () => {
  table_loading.value = true
  const { total = 0, list = [] } = await promptApi
    .list({
      params: {
        group_id: filter_form.group_id.join(','),
        keyword: filter_form.keyword,
        offset: (filter_form.page - 1) * filter_form.page_size,
        limit: filter_form.page_size,
      },
    })
    .finally(() => {
      table_loading.value = false
    })
  table_total.value = total
  table_data.value = []
  await nextTick()
  const options = getGroupList()
  table_data.value = [...list].map(item => {
    item.group_ids = item.group_ids || []
    item.group_names = []
    item.internal_members = []
    item.user_group_names = []
    item.group_ids.forEach((id: number) => {
      if (options[id]) {
        item.group_names.push(options[id])
      }
      if (internalGroupOptions.value[id]) {
        item.internal_members.push(internalGroupOptions.value[id])
      }
      if (subscriptionListOptions.value[id]) {
        item.user_group_names.push(subscriptionListOptions.value[id])
      }
    })
    return item
  })
}
const refresh = async () => {
  filter_form.page = 1
  await loadSubscriptionList()
  return fetchPromptData()
}
const onTableSizeChange = (size: number) => {
  filter_form.page_size = size
  refresh()
}
const onTableCurrentChange = (current: number) => {
  filter_form.page = current
  fetchPromptData()
}
const handleMoreCommand = async (command, data = {}) => {
  switch (command) {
    case 'add':
      createRef.value.open({
        group_ids: filter_form.group_id,
      })
      break
    case 'edit':
      await router.push({
        name: 'PromptCreate',
        query: {
          prompt_id: data.prompt_id,
        },
      })
      break
    case 'delete':
      await ElMessageBox.confirm(window.$t('prompt.delete_confirm'), window.$t('tip'))
      await promptApi.delete({ prompt_id: data.prompt_id })
      ElMessage.success(window.$t('action_delete_success'))
      fetchPromptData()
      break
    case 'update_status':
      await promptApi.update_status({ prompt_id: data.prompt_id, status: data.status })
      ElMessage.success(window.$t('action_save_success'))
      break
  }
}

onMounted(async () => {
  // refresh()
  await loadInternalGroupList()
  eventBus.on('user-login-success', refresh)
  eventBus.on('prompt-create', refresh)
  eventBus.on('prompt-update', fetchPromptData)
})
onUnmounted(() => {
  eventBus.off('user-login-success', refresh)
  eventBus.off('prompt-create', refresh)
  eventBus.off('prompt-update', fetchPromptData)
})
</script>

<style scoped></style>
