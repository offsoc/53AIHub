<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onUnmounted, defineAsyncComponent } from 'vue'
import {
  Close,
  ArrowLeft,
  ArrowRight,
  RefreshRight,
  MoreFilled,
  WarningFilled
} from '@element-plus/icons-vue'

import { useUserStore } from '@/stores/modules/user'
import { useTabsStore } from '../stores/tabs'
import { useBrowserSettingStore } from '@/stores/modules/browser-setting.ts'

const props = withDefaults(
  defineProps<{
    tab: Browser.Tab
    parent?: Browser.Tab | null
  }>(),
  {
    tab: () => ({}),
    parent: null
  }
)

const getPreloadPath = () => {
  return window.$chat53ai.getPreloadPath()
}

const Reader = defineAsyncComponent(() => import('./Reader/index.vue'))
// 添加 Readability 的懒加载
const loadReadability = async () => {
  const { Readability } = await import('@mozilla/readability')
  return Readability
}

// 替换原有的响应式变量
const userStore = useUserStore()
const tabsStore = useTabsStore()
const settingStore = useBrowserSettingStore()

const webviewRef = ref<any>(null)

const isFocus = ref(false)
const isChange = ref(false)
const isSider = ref(false)
const showSider = ref(false)
const isReader = ref(false)
const loadError = ref('')

const cleaning = ref(false)
const contentHtml = ref('')

const webviewEvents = ref<Array<{ event: string; handler: Function }>>([])

const canBack = computed(() => {
  if (!webviewRef.value || props.tab.loading !== 'completed') return false
  return webviewRef.value.canGoBack()
})

const canForward = computed(() => {
  if (!webviewRef.value || props.tab.loading !== 'completed') return false
  return webviewRef.value.canGoForward()
})

const moreMenus = computed(() => {
  return settingStore.toolbar_menus.slice(2)
})

const models = ref([
  {
    name: '百度AI+',
    value: 'baiduai+',
    url: 'https://chat.baidu.com/search?word='
  },
  {
    name: '纳米搜索',
    value: 'n',
    url: 'https://www.n.cn/?q='
  },
  {
    name: '秘塔',
    value: 'metaso',
    url: 'https://metaso.cn/?q='
  },
  {
    name: 'Perplexity',
    value: 'perplexity',
    url: 'https://perplexity.ai/search?q='
  }
])

const historys = ref([
  { name: '百度', url: 'https://www.baidu.com' },
  { name: 'AI知识库|大模型知识库|智能体开发|53AI', url: 'https://www.53ai.com' }
])

let _isClickPanel = false
const handleChange = () => {
  isChange.value = true
  handleFocus()
}
const handleFocus = () => {
  isFocus.value = true
}
const handleBlur = () => {
  setTimeout(() => {
    if (_isClickPanel) {
      _isClickPanel = false
      return
    }
    isFocus.value = false
    isChange.value = false
  }, 200)
}
const handlePanelClick = () => {
  _isClickPanel = true
  // isFocus.value = true
}

const handleBack = () => {
  if (canBack.value && webviewRef.value) {
    webviewRef.value.goBack()
  }
}

const handleForward = () => {
  if (canForward.value && webviewRef.value) {
    webviewRef.value.goForward()
  }
}

const handleRefresh = () => {
  if (webviewRef.value) {
    webviewRef.value.reload()
  }
}

const updateTab = (data = {}) => {
  if (props.parent) {
    tabsStore.updateChildTab(props.parent, props.tab.id, data)
  } else {
    tabsStore.updateTab(props.tab.id, data)
  }
}

const isUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[\w\-.,@?^=%&:/~+#]*$/.test(url)
  }
}

const handleUrl = (value: string) => {
  let targetUrl = value.trim()

  if (!targetUrl) {
    return
  }
  if (isUrl(targetUrl)) {
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`
    }
  } else {
    targetUrl = settingStore.default_search_url.replace('_word_', encodeURIComponent(targetUrl))
  }

  if (props.tab.defaultUrl) {
    updateTab({
      url: targetUrl,
      loading: 'loading'
    })
    nextTick(() => {
      webviewRef.value.loadURL(targetUrl)
    })
  } else {
    updateTab({
      defaultUrl: targetUrl,
      loading: 'loading'
    })
    nextTick(() => {
      initWebviewListener()
    })
  }
  handleBlur()
}

const getWebviewContent = async () => {
  return await webviewRef.value.executeJavaScript(`
    (function() {
      return document.documentElement.innerHTML; // 提取可见文本
    })()
  `)
}

const processLinks = (html: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  doc.querySelectorAll('a').forEach((link) => {
    try {
      const href = link.getAttribute('href') || ''
      if (props.tab.url && !href.startsWith('http')) {
        const base = new URL(props.tab.url)
        link.href = new URL(href, base).href
      }
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    } catch (e) {}
  })

  return doc.body.innerHTML
}
const setContentOfMarkdown = async () => {
  try {
    cleaning.value = true
    const content = await getWebviewContent()
    const doc = document.implementation.createHTMLDocument('')
    doc.documentElement.innerHTML = content
    const Readability = await loadReadability()
    const article = new Readability(doc).parse()

    if (!article) {
      cleaning.value = false
      throw new Error('Failed to parse content')
    }
    contentHtml.value = processLinks(
      `<h1 class="reader-title">${article.title}</h1>${article.content}`
    )
    nextTick(() => {
      cleaning.value = false
    })
  } catch (error) {
    console.error('Content processing failed:', error)
    // 可以添加用户提示
  }
}

// 在现有方法后添加新的解析方法
const handleParseContent = async () => {
  if (!webviewRef.value || props.tab.loading !== 'completed') return

  isSider.value = true
  showSider.value = true
  nextTick(() => {
    setContentOfMarkdown()
  })
}

const handleReader = () => {
  if (props.tab.loading !== 'completed') return
  if (isReader.value) {
    isReader.value = false
    return
  }
  isReader.value = true
  setContentOfMarkdown()
}

const handleMenuCommand = (command) => {
  console.log(command)
  switch (command) {
    case 'setting':
      tabsStore.activeSetting()
      break
    default:
      handleParseContent()
      break
  }
}

const initWebviewListener = () => {
  removeWebviewListener()
  if (webviewRef.value) {
    tabsStore.updateTab(props.tab.id, {
      webview: webviewRef.value
    })
    let hasError = false
    const events = {
      'did-start-loading': () => {
        hasError = false
        isReader.value = false
        contentHtml.value = ''
        updateTab({ loading: 'loading' })
      },
      'did-stop-loading': () => {
        if (!hasError) {
          const url = webviewRef.value.getURL()
          updateTab({
            loading: 'completed',
            url
          })
        }
      },
      'did-navigate': (event) => {
        const { url } = event
        updateTab({
          url: settingStore.default_tab_url === url ? '' : url,
          loading: hasError ? 'error' : 'completed'
        })
      },
      'did-navigate-in-page': (event) => {
        updateTab({
          url: event.url
        })
      },
      'will-navigate': (event) => {
        updateTab({
          url: event.url,
          loading: 'loading'
        })
      },
      // 页面信息更新事件
      'page-title-updated': (event) => {
        if (!props.tab.ability) return
        updateTab({
          title: event.title
        })
      },
      'page-favicon-updated': (event) => {
        if (!props.tab.ability) return
        updateTab({
          icon: event.favicons[0] || ''
        })
      },
      // 错误处理事件
      'did-fail-load': (event) => {
        // 除了主框架的错误，其他的都忽略
        if (!event.isMainFrame) return
        hasError = true
        loadError.value = `加载失败: ${event.errorDescription}`
        console.log(event)
        updateTab({
          loading: 'error'
        })
      },
      // 新增：内容加载完成事件
      'dom-ready': () => {
        // 可以在这里执行一些页面加载完成后的操作
        // 例如：注入自定义脚本或样式
        // 例如：注入自定义脚本
      },
      // 新增：新窗口打开事件
      'new-window': (event) => {
        // 在新标签页中打开链接，而不是在新窗口中
        tabsStore.addTab({ url: event.url })
      },
      // 新增：控制台消息事件
      'console-message': (event) => {
        console.log('Webview console:', event.message)
      }
    }
    Object.keys(events).forEach((eventName) => {
      webviewRef.value.addEventListener(eventName, events[eventName])
      webviewEvents.value.push({
        event: eventName,
        handler: events[eventName]
      })
    })
  }
}

const removeWebviewListener = () => {
  if (webviewRef.value) {
    webviewEvents.value.forEach((event) => {
      webviewRef.value.removeEventListener(event.event, event.handler)
    })
    webviewEvents.value = []
  }
}

const handleIframeMessage = (res) => {
  const { type, from } = res.data
  if (from !== 'chat53ai_extension') return
  if (type === 'close') {
    showSider.value = false
  }
}
onMounted(() => {
  nextTick(() => {
    initWebviewListener()
  })

  window.addEventListener('message', handleIframeMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage)
  removeWebviewListener()
})
</script>

<template>
  <div class="flex flex-col bg-white">
    <!-- 修改所有 currentTab 为 tab -->
    <div v-if="tab.ability" class="flex items-center gap-2 px-4 py-1.5 border-b">
      <div class="flex items-center gap-0.5">
        <div
          class="size-[34px] flex-center rounded-full"
          :class="[canBack ? 'cursor-pointer hover:bg-[#F2F2F2]' : 'cursor-not-allowed']"
          @click="handleBack"
        >
          <el-icon :color="canBack ? '#666666' : '#CCCCCC'">
            <ArrowLeft />
          </el-icon>
        </div>
        <div
          class="size-[34px] flex-center rounded-full"
          :class="[canForward ? 'cursor-pointer hover:bg-[#F2F2F2]' : 'cursor-not-allowed']"
          @click="handleForward"
        >
          <el-icon :color="canForward ? '#666666' : '#CCCCCC'">
            <ArrowRight />
          </el-icon>
        </div>
        <div
          class="size-[34px] flex-center rounded-full hover:bg-[#F2F2F2] cursor-pointer"
          @click="handleRefresh"
        >
          <el-icon color="#666666">
            <RefreshRight />
          </el-icon>
        </div>
      </div>
      <div class="flex-1">
        <div
          class="relative h-full bg-white px-3"
          :class="[tab.url && isFocus && isChange ? 'shadow' : '']"
        >
          <el-input
            v-model="tab.url"
            style="
              --el-border-radius-base: 50px;
              --el-input-bg-color: #edf2fa;
              --el-input-border-color: none;
              --el-input-height: 32px;
              --el-color-primary: #0b57d0;
              --el-input-hover-border-color: transparent;
            "
            class="url-input"
            :disabled="!tab.closable"
            :placeholder="$t('browser.search_placeholder')"
            autocomplete="false"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleChange"
            @keydown.enter="handleUrl(tab.url)"
          >
            <template #prefix>
              <div
                class="size-6 rounded-full bg-white ml-1 overflow-hidden"
                :style="{
                  'background-image': `url(${
                    tab.title === $t('browser.newTab')
                      ? 'https://www.baidu.com/favicon.ico'
                      : tab.icon
                  })`,
                  'background-size': '70%',
                  'background-repeat': 'no-repeat',
                  'background-position': 'center'
                }"
                alt=""
              />
            </template>
          </el-input>
          <div
            v-if="tab.url && isFocus && isChange"
            class="absolute left-0 right-0 z-10 py-4 bg-white px-3 shadow rounded-b"
            @click="handlePanelClick"
          >
            <div
              v-if="isUrl(tab.url)"
              class="h-9 px-4 mb-4 flex items-center gap-3 rounded-full cursor-pointer hover:bg-[#F2F2F2]"
              @click.stop="handleUrl(tab.url)"
            >
              <img
                class="size-4"
                :src="
                  isUrl(tab.url)
                    ? 'https://chat.53ai.com/images/toolbox/website.png'
                    : `https://www.baidu.com/favicon.ico`
                "
              />
              <div class="text-sm text-[#1D1E1F] truncate">{{ tab.url }}</div>
            </div>
            <div class="text-sm text-[#9A9A9A] px-4 mb-2">问答搜索</div>
            <template v-for="item in models" :key="item.value">
              <div
                class="h-9 px-4 mt-1 flex items-center gap-3 rounded-full cursor-pointer hover:bg-[#F2F2F2]"
                @click.stop="handleUrl(item.url + tab.url)"
              >
                <img
                  class="size-4"
                  :src="`https://chat.53ai.com/images/toolbox/${item.value}.png`"
                />
                <div class="text-sm text-[#1D1E1F] truncate">{{ tab.url }}</div>
              </div>
            </template>
            <div class="text-sm text-[#9A9A9A] px-4 mt-4 mb-2">历史记录</div>
            <template v-for="item in historys" :key="item.value">
              <div
                class="h-9 px-4 mt-1 flex items-center gap-3 rounded-full cursor-pointer hover:bg-[#F2F2F2]"
                @click.stop="handleUrl(item.url)"
              >
                <div class="size-4" />
                <div class="text-sm text-[#1D1E1F] truncate">
                  {{ item.name }}-<span class="text-[#177CDD]">{{ item.url }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div
        v-if="
          settingStore.toolbar_enabled &&
          tab.closable &&
          userStore.is_login &&
          (!parent || (parent && parent.browsers.length === 1))
        "
        class="flex items-center gap-1 relative"
      >
        <div
          class="h-8 px-2 rounded-full flex-center gap-1 bg-[#F5F5F5] cursor-pointer hover:bg-[#dbdbdb]"
          @click="handleReader"
        >
          <svg-icon name="clean"></svg-icon>
          <span class="text-sm text-[#1D1E1F]">{{ $t('browser.knowledge_clean') }}</span>
        </div>
        <template v-for="item in settingStore.toolbar_menus.slice(0, 2)" :key="item.value">
          <div
            class="h-8 px-2 rounded-full flex-center gap-1 bg-[#F5F5F5] hover:bg-[#dbdbdb]"
            :class="[
              tab.loading === 'completed' ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
            ]"
            @click="handleParseContent()"
          >
            <svg-icon name="setting" size="16"></svg-icon>
            <span class="text-sm text-[#1D1E1F]">{{ item.name }}</span>
          </div>
        </template>
        <template v-if="moreMenus.length">
          <el-dropdown trigger="click" @command="handleMenuCommand">
            <div class="size-8 flex-center rounded cursor-pointer hover:bg-[#f0f0f0]">
              <el-icon size="14">
                <MoreFilled />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-for="item in moreMenus" :key="item.value">
                  <el-dropdown-item :command="item.value" :disabled="tab.loading !== 'completed'">
                    <svg-icon class="mr-2" name="setting" size="16"></svg-icon>
                    {{ item.name }}
                  </el-dropdown-item>
                </template>
                <el-dropdown-item divided command="setting">
                  <svg-icon class="mr-2" name="setting" size="16"></svg-icon>
                  {{ $t('action.setting') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <div v-loading="cleaning" class="flex-1 relative">
        <webview
          v-if="tab.defaultUrl"
          ref="webviewRef"
          :src="tab.defaultUrl"
          style="height: 100%"
          nodeintegration
          allowpopups
          :preload="getPreloadPath()"
          webpreferences="contextIsolation=no"
        ></webview>

        <div
          v-if="tab.loading === 'error'"
          class="absolute inset-0 flex items-center justify-center bg-white"
        >
          <div class="text-center">
            <el-icon class="text-red-500 text-4xl mb-2">
              <WarningFilled />
            </el-icon>
            <p class="text-lg font-semibold text-gray-800">{{ loadError }}</p>
            <el-button class="mt-4" type="primary" @click="handleRefresh">{{
              $t('browser.reload')
            }}</el-button>
          </div>
        </div>
        <div v-if="isReader" class="absolute inset-0 bg-[#F5F5F5]">
          <Reader :content="contentHtml"></Reader>
        </div>
      </div>

      <div
        v-if="isSider"
        v-show="showSider"
        class="flex-none w-[420px] p-5 border-l overflow-hidden relative"
      >
        <div class="absolute right-1 top-1 cursor-pointer" @click.stop="showSider = false">
          <el-icon>
            <Close></Close>
          </el-icon>
        </div>
        <div class="h-full border rounded overflow-y-auto"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.url-input :deep(.el-input__wrapper) {
  padding: 2px 4px;
}
</style>
