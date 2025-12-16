<template>
  <div class="w-screen h-screen flex flex-col bg-[#F0F0F0]">
    <!-- tabs -->
    <div class="h-10 flex items-center gap-3">
      <GNBTabs class="flex-1 overflow-hidden" />
      <el-tooltip effect="light" placement="bottom-end" popper-class="!p-0 w-[300px]">
        <template #content>
          <div class="flex items-center gap-2 px-4 py-2 mt-2">
            <img class="flex-none w-10 h-10 rounded-full" :src="avatar" />
            <div class="flex-1 text-sm text-[#1D1E1F] truncate">
              {{ userStore.info.nickname || $t('browser.not_logged_in') }}
            </div>
            <el-button v-if="!userStore.is_login" type="primary" @click="handleImmeidateLogin(true)">
              {{ $t('browser.login') }}
            </el-button>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 border-t">
            <div class="h-8 flex-1 flex items-center gap-3 px-3">
              <img src="/images/blank.png" alt="" class="w-4 h-4" />
              <span class="text-[#1D1E1F] text-sm">{{ $t('browser.window_position') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div
                v-tooltip="{ content: $t('browser.leftWindow') }"
                class="size-6 flex-center rounded bg-[#F0EFEF] cursor-pointer"
                @click="handlePostion('left')"
              >
                <svg-icon name="justify-left"></svg-icon>
              </div>
              <div
                v-tooltip="{ content: $t('browser.centerWindow') }"
                class="size-6 flex-center rounded bg-[#F0EFEF] cursor-pointer"
                @click="handlePostion('center')"
              >
                <svg-icon name="justify-center"></svg-icon>
              </div>
              <div
                v-tooltip="{ content: $t('browser.rightWindow') }"
                class="size-6 flex-center rounded bg-[#F0EFEF] cursor-pointer"
                @click="handlePostion('right')"
              >
                <svg-icon name="justify-right"></svg-icon>
              </div>
              <div class="h-[14px] border-r"></div>
              <div
                v-tooltip="{ content: $t('browser.alwaysOnTop') }"
                class="size-6 flex-center rounded bg-[#F0EFEF] cursor-pointer"
                @click="handleSetAlwaysOnTop"
              >
                <svg-icon name="top" :color="alwaysOnTop ? '#1D1E1F' : '#C4C4C4'"></svg-icon>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2 px-3 py-2 border-t">
            <div class="h-8 flex items-center gap-3 px-3 rounded cursor-pointer hover:bg-[#F0EFEF]" @click="handleTest">
              <div class="size-4 flex-center">
                <svg-icon size="16" name="setting"></svg-icon>
              </div>
              <span class="text-[#1D1E1F] text-sm">{{ '调试' }}</span>
            </div>

            <div class="h-8 flex items-center gap-3 px-3 rounded cursor-pointer hover:bg-[#F0EFEF]" @click="handleSetting">
              <div class="size-4 flex-center">
                <svg-icon size="16" name="setting"></svg-icon>
              </div>
              <span class="text-[#1D1E1F] text-sm">{{ $t('action.setting') }}</span>
            </div>
            <div v-if="userStore.is_login" class="h-8 flex items-center gap-3 px-3 rounded cursor-pointer hover:bg-[#F0EFEF]" @click="handleQuit">
              <div class="size-4 flex-center">
                <svg-icon size="14" name="quit"></svg-icon>
              </div>
              <span class="text-[#1D1E1F] text-sm">{{ $t('login.quit') }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 px-3 py-2 border-t">
            <div
              class="h-8 flex items-center gap-3 px-3 rounded cursor-pointer hover:bg-[#F0EFEF]"
              @click="handleJump('53ai_offical', 'https://www.53ai.com/', { title: '53AI' })"
            >
              <div class="size-4 flex-center">
                <img src="https://www.53ai.com/favicon.ico" class="size-4" />
              </div>
              <span class="text-[#1D1E1F] text-sm">{{ '53AI' }}</span>
            </div>
            <div
              class="h-8 flex items-center gap-3 px-3 rounded cursor-pointer hover:bg-[#F0EFEF]"
              @click="handleJump('53ai_studio', 'http://chatrc.53ai.com/', { title: '53AI Studio' })"
            >
              <div class="size-4 flex-center">
                <img src="https://chat.53ai.com/favicon.ico" class="size-4" />
              </div>
              <span class="text-[#1D1E1F] text-sm">{{ '53AI Studio' }}</span>
            </div>
          </div>
        </template>
        <div class="h-8 flex items-center gap-1 px-2 rounded-full text-[#474747] bg-[#E6E6E6] cursor-pointer nodrag">
          <img class="size-6 rounded-full" :src="avatar" alt="" />
          <svg-icon name="down" size="18"></svg-icon>
        </div>
      </el-tooltip>

      <nav class="flex no-drag">
        <div class="size-10 flex-center cursor-pointer text-[#333333] hover:bg-[#C6CCD1]" @click="minimize">
          <svg-icon name="mini" size="14"></svg-icon>
        </div>
        <div class="size-10 flex-center cursor-pointer text-[#333333] hover:bg-[#C6CCD1]" @click="toggleMaximize">
          <svg-icon :name="isMaximized ? 'zoom-in' : 'zoom-out'" size="14"></svg-icon>
        </div>
        <div class="size-10 flex-center cursor-pointer text-[#333333] hover:bg-[#C6CCD1]" @click="close">
          <svg-icon name="close" size="14"></svg-icon>
        </div>
      </nav>
    </div>

    <!-- 书签 -->
    <!-- <BookMarks></BookMarks> -->
    <!-- 单独的主页，避免tab标签删除后无法正常退出 -->
    <div v-for="tab in tabs" v-show="tab.id === tabsStore.activeId" :key="tab.id" class="flex-1 rounded-t-lg overflow-hidden">
      <template v-if="!tab.render"></template>
      <Browser v-else-if="tab.type === 'browser'" class="h-full" :tab="tab" />
      <component :is="tab.component" v-else-if="tab.type === 'page'" />
      <MultiBrowser v-else-if="tab.type === 'multibrowser'" :tab="tab"></MultiBrowser>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, h } from 'vue'
import GNBTabs from './components/GNBTabs.vue'
import Browser from './components/Browser.vue'
import MultiBrowser from './components/MultiBrowser.vue'

import { useLocalUserStore } from './stores/user'
import { useTabsStore } from './stores/tabs'
import { useUserStore } from '@/stores/modules/user.ts'
import { useBrowserSettingStore } from '@/stores/modules/browser-setting.ts'

const localUserStore = useLocalUserStore()
const settingStore = useBrowserSettingStore()
const userStore = useUserStore()

const tabsStore = useTabsStore()

const isMaximized = ref(false)
const alwaysOnTop = ref(false)
const notification = ref<any>(null)
const percentage = ref(0)

const avatar = computed(() => {
  return userStore.info.avatar || window.$chat53ai.getPublicPath('/images/default_avatar.png')
})

// 为什么要重新拍下序，是因为browser 组件的顺序是根据tabs 中的顺序来的，tabs变动会导致webview丢失报错
const tabs = computed(() => {
  const list = [...tabsStore.tabs]
  list.sort((itemA, itemB) => (itemA.timestamp > itemB.timestamp ? -1 : 1))
  return list
})

// 组合式函数封装通用逻辑
const useWindowActions = () => {
  const minimize = () => window.$chat53ai.$win({ type: 'minimize' })
  const close = () => window.$chat53ai.$win({ type: 'close' })
  const toggleMaximize = () => {
    isMaximized.value = !isMaximized.value
    window.$chat53ai.$win({ type: isMaximized.value ? 'maximize' : 'restore' })
  }

  return { minimize, close, toggleMaximize }
}
const { minimize, close, toggleMaximize } = useWindowActions()

const handlePostion = (position: string) => {
  window.$chat53ai.$win({ type: 'setPosition', data: { position } })
}
const handleSetAlwaysOnTop = () => {
  alwaysOnTop.value = !alwaysOnTop.value
  window.$chat53ai.$win({ type: 'setAlwaysOnTop', data: { alwaysOnTop: alwaysOnTop.value } })
}

const handleTest = () => {
  window.$chat53ai.$win({ type: 'test', data: {} })
}
const handleSetting = () => {
  tabsStore.activeSetting()
}

const handleImmeidateLogin = (isActive = true) => {
  tabsStore.addTab(
    {
      id: 'main',
      title: '首页',
      closable: false,
      ability: false,
      icon: window.$chat53ai.getPublicPath('/images/home.png'),
      defaultUrl: tabsStore.MAIN_URL
    },
    true
  )

  if (isActive) {
    const main = tabsStore.tabs.find((item) => item.id === 'main')
    if (main && main.webview) {
      main.webview.send('agenthub:service', { type: 'login' })
    }
  }
}
const handleQuit = () => {
  tabsStore.closeTab('setting')
  tabsStore.refreshTab('main')
  tabsStore.updateTab('main', {
    title: '首页'
  })
  userStore.logout()
  window.$chat53ai.$win({ type: 'clearSession', data: { url: tabsStore.MAIN_URL } })
}

// 传递配置
const subsriceConfig = () => {
  window.$chat53ai.$win({ type: 'setting', data: JSON.stringify({ ...settingStore.$state }) })
}

const showDownloading = () => {
  notification.value = ElNotification({
    title: window.$t('updater.downloading'),
    message: () =>
      h('div', { class: 'flex flex-col gap-2', percentage }, [
        h(ElProgress, {
          percentage: percentage.value,
          format: (percentage) => `${percentage}%`
        })
      ]),
    duration: 0,
    showClose: false,
    position: 'bottom-right',
    onClose: () => {
      notification.value = null
    }
  })
}

const handleJump = (id: string, defaultUrl: string, options = {}) => {
  tabsStore.addTab({
    id,
    title: '',
    icon: `${defaultUrl}/favicon.ico`,
    ability: false,
    closable: true,
    defaultUrl,
    ...options
  })
}

const showUpdater = async () => {
  // 如果正在下载中，不再显示确认框
  if (notification.value) return
  percentage.value = 0
  await ElMessageBox.confirm(window.$t('updater.newVersion'), window.$t('updater.newVersionTitle'))
  window.$chat53ai.$updater({ type: 'download' })
}
const showDownloaded = async () => {
  if (notification.value) {
    notification.value.close()
    notification.value = null
    percentage.value = 0
  }
  await ElMessageBox.confirm(window.$t('updater.completed'), window.$t('updater.completedTitle'))
  window.$chat53ai.$updater({ type: 'restart' })
}

const initIPCListener = () => {
  window.$chat53ai.$on('win:service', (_event, { type, data } = {}) => {
    console.log(type, data, '成功')
    switch (type) {
      case 'login':
        localUserStore.login(JSON.parse(data))
        subsriceConfig()
        break
      case 'agenthub_login':
        userStore.updateInfo(JSON.parse(data))
        tabsStore.updateTab('main', {
          title: '首页'
        })
        break
      case 'agenthub_logout':
        handleQuit()
        break
      case 'setting':
        settingStore.$patch(JSON.parse(data))
        break
      case 'new-window':
        tabsStore.addTab({
          url: data.url,
          defaultUrl: data.url
        })
        break
      case 'new-tab':
        const tabData = JSON.parse(data)

        if (tabData.urls.length === 1) {
          tabsStore.addTab({
            title: tabData.title,
            type: 'browser',
            closable: tabData.closable === undefined ? true : tabData.closable,
            ability: tabData.ability === undefined ? true : tabData.ability,
            defaultUrl: tabData.urls[0]
          })
        } else {
          const tab = tabsStore.addTab({
            title: tabData.title,
            type: 'multibrowser'
          })
          tabData.urls.forEach((defaultUrl: string) => {
            tabsStore.addChildTab(tab.id, {
              defaultUrl
            })
          })
        }
        break
      case 'maximize':
        isMaximized.value = true
        break
      case 'unmaximize':
        isMaximized.value = false
        break
      case 'glider:setting':
        handleSetting()
        break
      case 'glider:forbid':
        settingStore.glider_enabled = false
        break
    }
  })

  window.$chat53ai.$on('glider:service', (_event, { type, data } = {}) => {
    console.log(type, data, '成功')
    switch (type) {
      case 'login':
        // userStore.login(JSON.parse(data))
        // subsriceConfig()
        break
    }
  })

  window.$chat53ai.$on('updater:service', (_event, { type, data } = {}) => {
    console.log(type, data, '成功')
    switch (type) {
      case 'available':
        showUpdater()
        break
      case 'progress':
        percentage.value = Math.floor(data.percent)

        if (!notification.value) showDownloading()
        break
      case 'error':
        if (notification.value) {
          notification.value.close()
          notification.value = null
        }
        ElMessage.error(data)

        break
      case 'downloaded':
        showDownloaded()
        break
    }
  })
}

// 监听settingStore 中数据变动，并同步到本地
watch(
  settingStore.$state,
  (newValue, oldValue) => {
    console.log('settingStore 发生变化:', newValue, oldValue)
    subsriceConfig()
  },
  { deep: true }
)
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const isMain = params.get('window') === 'main'
  if (isMain) {
    handleImmeidateLogin(false)
  } else {
    tabsStore.addTab({
      title: window.$t('browser.newTab'),
      closable: true,
      defaultUrl: decodeURIComponent(params.get('url') || '')
    })
  }

  initIPCListener()
})
</script>

<style scoped></style>
