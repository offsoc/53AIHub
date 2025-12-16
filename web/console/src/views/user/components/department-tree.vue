<template>
  <div class="flex flex-col h-full">
    <div class="px-4 py-4 flex items-center gap-2">
      <ElInput
        v-model="filterForm.keyword"
        class="flex-1 h-[36px]"
        size="default"
        clearable
        :prefix-icon="Search"
        :placeholder="$t('internal_user.organization.all_search_placeholder')"
        @change="refresh"
      />
      <!-- 授权企业微信后 是不允许添加的 -->
      <ElIcon
        v-if="!isSsoSync"
        size="18"
        color="#333333"
        class="cursor-pointer"
        @click="handleCommand('add_children', treeData[0], 0)"
      >
        <Plus />
      </ElIcon>
    </div>
    <div v-loading="loading" class="px-4 min-h-[300px] flex-1 h-0 overflow-auto">
      <ElTree
        v-show="isSsoSync && isWecomSync ? !isSearch : true"
        ref="treeRef"
        node-key="bind_value"
        :data="treeData"
        :class="[searchData.member.length ? 'hidden-empty-block' : '']"
        style="--el-tree-node-content-height: 32px"
        :expand-on-click-node="false"
        :default-expanded-keys="isSearch ? [] : defaultExpandedKeys"
        :filter-node-method="filterNode"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="w-full flex items-center gap-2 group pr-2">
            <SvgIcon name="department" width="16px" height="16px" color="#57A1FF" />
            <div class="flex-1 w-0 text-[#333] text-sm truncate" :title="data.label">
              <OpenData type="departmentName" :openid="data.bind_value" :text="data.label" />
            </div>
            <template v-if="isSsoSync">
              <div v-if="data.value === treeData[0].value && organization.syncing" class="demo-progress flex-none">
                <el-progress :percentage="organization.progress" />
              </div>
              <El-Button
                v-if="data.value === treeData[0].value"
                v-debounce
                v-tooltip="{ content: $t('sso.sync_corp') }"
                link
                @click.stop="handleSyncDepartment"
              >
                <ElIcon size="16" color="#333333">
                  <Refresh />
                </ElIcon>
              </El-Button>
            </template>
            <template v-else>
              <ElDropdown v-if="!isSearch" @command="handleCommand($event, data, data.index)">
                <span>
                  <ElIcon class="text-[#999] rotate-90 mr-2 cursor-pointer invisible group-hover:visible">
                    <MoreFilled />
                  </ElIcon>
                </span>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="add_children">
                      {{ $t('internal_user.department.add_children') }}
                    </ElDropdownItem>
                    <template v-if="data.did">
                      <ElDropdownItem command="update_name">
                        {{ $t('internal_user.department.update_name') }}
                      </ElDropdownItem>
                      <ElDropdownItem v-if="data.index > 0" command="move_up">
                        {{ $t('internal_user.department.move_up') }}
                      </ElDropdownItem>
                      <ElDropdownItem v-if="data.lastIndex > data.index" command="move_down">
                        {{ $t('internal_user.department.move_down') }}
                      </ElDropdownItem>
                      <ElDropdownItem command="delete">
                        {{ $t('internal_user.department.delete') }}
                      </ElDropdownItem>
                    </template>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </template>
          </div>
        </template>
      </ElTree>
      <ul v-if="isSearch" class="pb-4 w-full box-border">
        <li
          v-for="item in searchData.department"
          :key="item.bind_value"
          class="w-full box-border flex items-center gap-2 cursor-pointer p-2 hover:bg-[#f5f7fa]"
          @click="handleNodeClick(item)"
        >
          <SvgIcon name="department" width="16px" height="16px" color="#57A1FF" />
          <div class="flex-1 w-0 text-[#333] text-sm truncate" :title="item.name">
            <OpenData type="departmentName" :openid="item.bind_value" :text="item.name" />
          </div>
        </li>
        <li
          v-for="item in searchData.member"
          :key="item.did"
          class="w-full box-border flex items-center gap-2 cursor-pointer p-2 hover:bg-[#f5f7fa]"
          @click="handleNodeClick(item)"
        >
          <SvgIcon name="member" width="16px" height="16px" />
          <div class="flex-1 w-0 text-[#333] text-sm truncate" :title="isDingtalkSync ? item.name : item.nickname">
            <OpenData type="userName" :openid="item.bind_value" :text="isDingtalkSync ? item.name : item.nickname" />
          </div>
        </li>
      </ul>
    </div>
    <div v-if="isSsoSync" class="flex-none h-11 flex items-center gap-2 px-4 border-t">
      <div class="flex-1 flex items-center gap-1">
        <img :src="$getRealPath({ url: `/images/sso/${isWecomSync ? 'wecom' : 'dingtalk'}.png` })" class="size-4" />
        <span class="text-sm text-[#182B50]">
          {{ isWecomSync ? $t('sso.wecom.sync_tip') : $t('sso.dingtalk.sync_tip') }}
        </span>
      </div>
      <el-link
        class="px-1 cursor-pointer"
        :href="
          isWecomSync
            ? 'https://work.weixin.qq.com/login'
            : 'https://oa.dingtalk.com/index.htm#/microApp/microAppListNew'
        "
        target="_blank"
        :underline="false"
      >
        <svg-icon name="setting" width="16px" color="rgba(24, 43, 80, 0.3)" />
      </el-link>
    </div>
    <DepartmentAddDialog ref="departmentAddRef" />
  </div>
</template>

<script setup lang="ts">
import { MoreFilled, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import DepartmentAddDialog from './department-add-dialog.vue'

import { departmentApi } from '@/api/modules/department'
import { INTERNAL_USER_STATUS_ALL, userApi } from '@/api/modules/user'

import { ENTERPRISE_SYNC_FROM } from '@/constants/enterprise'
import type { EnterpriseSyncFrom } from '@/constants/enterprise'
import { wecomApi } from '@/api/modules/wecom'
import dingtalkApi from '@/api/modules/dingtalk'

const props = withDefaults(
  defineProps<{
    syncFrom: EnterpriseSyncFrom
  }>(),
  {
    syncFrom: ENTERPRISE_SYNC_FROM.DEFAULT,
  }
)

const emit = defineEmits<{
  (e: 'nodeClick', result: { data: any }): void
}>()

const treeRef = ref()
const filterForm = reactive({
  keyword: '',
})

const departmentAddRef = ref()
const treeData = ref([])

const searchData = reactive({
  department: [],
  member: [],
})
const loading = ref(false)
const rootData = ref({})

const isSearch = computed(() => !!filterForm.keyword)
const isSsoSync = computed(() => props.syncFrom !== ENTERPRISE_SYNC_FROM.DEFAULT)
const isWecomSync = computed(() => props.syncFrom === ENTERPRISE_SYNC_FROM.WECOM)
const isDingtalkSync = computed(() => props.syncFrom === ENTERPRISE_SYNC_FROM.DINGTALK)

const organization = reactive({
  syncing: false,
  progress: 0,
})

const refresh = async () => {
  searchData.member = []
  searchData.department = []
  // 搜索部门、成员
  if (isSearch.value) {
    if (isSsoSync.value) {
      if (isWecomSync.value) {
        const res = await wecomApi.contact_search({ keyword: filterForm.keyword })
        const result = res.data.query_result
        if (result.party?.department_id?.length) {
          searchData.department = result.party.department_id.map(item => {
            const node = treeRef.value.getNode(item)
            if (node) return node.data

            return {
              bind_value: item,
              name: item,
            }
          })
        }
        if (result.user?.userid?.length) {
          searchData.member = result.user.userid.map(item => {
            return {
              bind_value: item,
              nickname: item,
            }
          })
        }
        return
      }
      if (isDingtalkSync.value) {
        const list = await dingtalkApi.contact_search({ keyword: filterForm.keyword })
        searchData.member = list.map(item => {
          return {
            ...item,
            nickname: item.bind_value,
          }
        })
        treeRef.value.filter(filterForm.keyword)
        return
      }
    }
    treeRef.value.filter(filterForm.keyword)
    return fetchDepartmentList()
  }
  return fetchDepartmentTree()
}
// 获取筛选的成员
const fetchDepartmentList = async () => {
  loading.value = true
  const { list = [] } = await userApi
    .fetch_internal_user({
      from: props.syncFrom,
      status: INTERNAL_USER_STATUS_ALL,
      keyword: filterForm.keyword,
      offset: 0,
      limit: 10000,
    })
    .finally(() => {
      loading.value = false
    })
  searchData.member = list.map((item = {}) => {
    item.name = rootData.value.name
    return item
  })
}
const fetchDepartmentTree = async () => {
  loading.value = true
  treeData.value = await departmentApi.fetch_department_tree({ from: props.syncFrom }).finally(() => {
    loading.value = false
  })
  rootData.value = treeData.value[0]
}
const handleCommand = async (command: string, data: any, index: number) => {
  const parentNode = treeRef.value.getNode(data.bind_value) || {}
  const parentData = parentNode.data || {}
  const parentChildren = parentData.children || []
  const prevData = parentChildren[index - 1] || {}
  const nextData = parentChildren[index + 1] || {}
  switch (command) {
    case 'add_children':
      departmentAddRef.value.open({
        parentDid: data.did,
        parentChildren: data.children,
        success: refresh,
      })
      break
    case 'update_name':
      departmentAddRef.value.open({
        data,
        success: ({ data: newData = {} } = {}) => {
          data.name = data.label = newData.name
        },
      })
      break
    case 'move_up':
      loading.value = true
      await Promise.all([
        departmentApi.save({ did: data.did, name: data.name, pdid: data.pdid, sort: prevData.sort }),
        departmentApi.save({ did: prevData.did, name: prevData.name, pdid: prevData.pdid, sort: data.sort }),
      ]).finally(() => {
        loading.value = false
      })
      ElMessage.success(window.$t('action_save_success'))
      refresh()
      break
    case 'move_down':
      loading.value = true
      await Promise.all([
        departmentApi.save({ did: data.did, name: data.name, pdid: data.pdid, sort: nextData.sort }),
        departmentApi.save({ did: nextData.did, name: nextData.name, pdid: nextData.pdid, sort: data.sort }),
      ]).finally(() => {
        loading.value = false
      })
      ElMessage.success(window.$t('action_save_success'))
      refresh()
      break
    case 'delete':
      await ElMessageBox.confirm(window.$t('internal_user.department.delete_confirm'), window.$t('tip'))
      loading.value = true
      await departmentApi.delete(data.did).finally(() => {
        loading.value = false
      })
      ElMessage.success(window.$t('action_delete_success'))
      refresh()
      break
  }
}

const defaultExpandedKeys = ref([0])
const handleNodeExpand = (data: any, node: any, comp: any) => {
  defaultExpandedKeys.value.push(data.did)
}
const handleNodeCollapse = (data: any, node: any, comp: any) => {
  defaultExpandedKeys.value = defaultExpandedKeys.value.filter(key => key !== data.did)
}
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value) || data.bind_value.includes(value)
}
const handleNodeClick = (data: any) => {
  emit('nodeClick', { data })
}

let timer: NodeJS.Timeout | null = null
const handleClearTimeout = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 同步进度
const loadSyncProgress = (isInited = false) => {
  handleClearTimeout()
  departmentApi
    .sync_progress(props.syncFrom)
    .then(async ({ data: { progress = 1, status = 'running', message = '' } }: any = {}) => {
      if (isInited) {
        if (status === 'running') {
          organization.syncing = true
          organization.progress = Number(progress)
          timer = setTimeout(() => {
            loadSyncProgress()
          }, 5000)
        }
      } else if (status === 'completed') {
        ElMessage.success(message)
        organization.syncing = false
        organization.progress = 0
        await fetchDepartmentTree()
        handleNodeClick(treeData.value[0])
      } else if (status === 'running') {
        organization.progress = Number(progress)
        timer = setTimeout(() => {
          loadSyncProgress()
        }, 5000)
      } else if (status === 'failed') {
        organization.progress = Number(progress)
        ElMessage.error(window.$t('action_sync_failed'))
      }
    })
}
const handleSyncDepartment = async () => {
  await departmentApi.sync(props.syncFrom)
  ElMessage.success(window.$t('action_sync_start'))
  organization.syncing = true
  loadSyncProgress()
}

onMounted(() => {
  if (props.syncFrom !== ENTERPRISE_SYNC_FROM.DEFAULT) {
    // 进入页面先查询同步进度，如果是在同步过程中要展示同步进度
    loadSyncProgress(true)
  }
  fetchDepartmentTree()
})

onUnmounted(() => {
  handleClearTimeout()
})

defineExpose({
  refresh,
})
</script>

<style scoped>
::v-deep(.hidden-empty-block .el-tree__empty-block) {
  display: none;
}

.demo-progress .el-progress--line {
  width: 100px;
}
.demo-progress ::v-deep(.el-progress__text) {
  min-width: 36px;
}
</style>
