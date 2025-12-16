import { defineStore } from 'pinia'
import { shallowRef, defineAsyncComponent } from 'vue'

export const useTabsStore = defineStore('tabs', {
  state: (): {
    tabs: Browser.Tab[]
    activeId: number
  } => ({
    tabs: [] as Browser.Tab[],
    activeId: 0
  }),

  getters: {
    activeTab: (state) => state.tabs.find((t) => t.id === state.activeId),
    // MAIN_URL: () => location.origin + location.pathname
    MAIN_URL: () => window.location.origin + window.location.pathname
    // MAIN_URL: () => 'http://ziroom.hub.53ai.com/'
  },
  actions: {
    // addTab(tab: Omit<Browser.Tab, 'id' | 'loading' | 'defaultUrl' | 'type' | 'icon' | 'timestamp'>, isActive = true) {
    pureAddTab(tab: Partial<Browser.Tab>) {
      const newTab = {
        defaultUrl: '',
        loading: 'none',
        type: 'browser',
        id: Math.random() * 1e17,
        title: '',
        url: '',
        closable: true,
        ability: true,
        timestamp: Date.now(),
        icon: window.$chat53ai.getPublicPath('/images/blank.png'),
        component: tab.type === 'page' ? shallowRef() : '',
        browsers: tab.type === 'multibrowser' ? [] : '',
        render: true,
        webview: null,
        ...tab
      }
      return newTab
    },
    addTab(tab: Partial<Browser.Tab>, isActive = true) {
      const newTab = this.pureAddTab(tab)
      if (this.tabs.some((t) => t.id === newTab.id)) {
        this.setActive(newTab.id)
        return
      }
      this.tabs.push(newTab)
      if (isActive) {
        this.activeId = newTab.id
      }
      return newTab
    },
    addChildTab(tabId: number | string, tab: Partial<Browser.Tab>) {
      const index = this.tabs.findIndex((t) => t.id === tabId)
      if (index > -1) {
        this.tabs[index].browsers?.push(this.pureAddTab({ ...tab, width: null }))
      }
    },
    closeTab(tabId: number | string) {
      this.tabs = this.tabs.filter((t) => t.id !== tabId)
      if (this.activeId === tabId) {
        this.activeId = this.tabs[this.tabs.length - 1]?.id || 0
      }
    },
    updateTab(tabId: number | string, updates: Partial<Browser.Tab>) {
      const index = this.tabs.findIndex((t) => t.id === tabId)
      if (index > -1) {
        this.tabs[index] = { ...this.tabs[index], ...updates }
      }
    },
    refreshTab(tabId: number | string) {
      const tab = this.tabs.find((t) => t.id === tabId)
      if (tab) {
        if (tab.webview) {
          tab.webview.reload()
        } else {
          tab.render = false
          setTimeout(() => {
            tab.render = true
          }, 200)
        }
      }
    },
    updateChildTab(parent: Browser.Tab, tabId: number | string, updates: Partial<Browser.Tab>) {
      const index = parent.browsers.findIndex((t) => t.id === tabId)
      if (index > -1) {
        parent.browsers[index] = { ...parent.browsers[index], ...updates }
      }
    },
    setActive(tabId: number | string) {
      if (this.tabs.some((t) => t.id === tabId)) {
        this.activeId = tabId
      }
    },
    activeSetting() {
      this.addTab(
        {
          id: 'setting',
          title: window.$t('action.setting'),
          closable: true,
          ability: false,
          icon: window.$chat53ai.getPublicPath('/images/setting.png'),
          type: 'page',
          component: defineAsyncComponent(() => import('@/views/profile/index.vue'))
        },
        true
      )
    }
  }
})
