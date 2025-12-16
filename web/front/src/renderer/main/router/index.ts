import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { checkPermission } from '@/utils/permission'
import useEnv from '@/hooks/useEnv'

import { useUserStore } from '@/stores/modules/user'
import { useNavigationStore } from '@/stores/modules/navigation'
import { useEnterpriseStore } from '@/stores/modules/enterprise'
import { NAVIGATION_TYPE } from '@/constants/navigation'

const { isOpLocalEnv } = useEnv()

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: () => {
      return window.innerWidth < 768 || window.electron ? '/agent' : '/index'
    },
    // redirect: '/index',
    component: () => import('@/layout/index.vue'),
    // component: () => import('@/views/index/agent/index.vue'),
    children: [
      {
        path: '/chat',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue')
      },
      {
        path: '/agent',
        name: 'Agent',
        component: () => import('@/views/agent/index.vue')
      },
      {
        path: '/toolkit',
        name: 'Toolkit',
        component: () => import('@/views/toolkit/index.vue')
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          pass: true,
          auth: !window.$isElectron
        }
      },
      {
        path: '/toolbox',
        name: 'Toolbox',
        component: () => import('@/views/desktop/tools/index.vue')
      },
      {
        path: '/prompt',
        name: 'Prompt',
        component: () => import('@/views/prompt/index.vue')
      },
      {
        path: '/prompt/:prompt_id',
        name: 'PromptDetail',
        component: () => import('@/views/prompt/detail/index.vue'),
        meta: {
          parentName: 'Prompt'
        }
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: {
          pass: true,
          auth: true
        }
      }
    ]
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('@/views/index/layout.vue'),
    children: [
      {
        path: '/index-redirect',
        name: 'HomeRedirect',
        component: () => import('@/views/index/redirect.vue')
      },
      {
        path: '/index',
        name: 'HomeIndex',
        component: () => import('@/views/index/index.vue')
      },
      {
        path: '/index/agent',
        name: 'HomeAgent',
        component: () => import('@/views/index/agent/index.vue')
      },
      {
        path: '/index/chat',
        name: 'HomeChat',
        component: () => import('@/views/index/agent/chat.vue')
      },
      {
        path: '/index/prompt',
        name: 'HomePrompt',
        component: () => import('@/views/index/prompt/index.vue')
      },
      {
        path: '/index/prompt/:prompt_id',
        name: 'HomePromptDetail',
        component: () => import('@/views/index/prompt/detail.vue')
      },
      {
        path: '/index/toolkit',
        name: 'HomeToolkit',
        component: () => import('@/views/index/toolkit.vue')
      }
    ]
  },
  {
    path: '/share/chat',
    name: 'ShareChat',
    component: () => import('@/views/share/chat.vue'),
    meta: {
      pass: true
    }
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('@/components/Lead/index.vue')
  },
  {
    path: '/desktop',
    name: 'Desktop',
    component: () => import('@/views/desktop/index.vue')
  },
  {
    path: '/svglist',
    name: 'Svg',
    component: () => import('@/views/svglist/index.vue')
  }
]

export const isHashRouter = !!window.electron
export const isHistoryRouter = !window.electron

export const router = createRouter({
  // electron环境 需要使用hash跳转
  history: isHashRouter ? createWebHashHistory() : createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 添加路由守卫
router.beforeEach(async (to, _from, next) => {
  const isGuidePath = to.path === '/guide'
  if (isGuidePath && _from.path === '/') {
    next()
    return
  }

  if (isOpLocalEnv.value) {
    try {
      const { system } = await import('@/api/modules/system')
      const res = await system.init()
      if (!res.data && !isGuidePath) {
        next('/guide')
        return
      }
      if (res.data && isGuidePath) {
        next('/index')
        return
      }
    } catch (error) {
      console.log(error)
    }
  }

  const userStore = useUserStore()

  // 单点登录
  if (to.path === '/index/apilogin') {
    await userStore.sso_login()
    next('/')
    return
  }

  const isLoggedIn = localStorage.getItem('access_token') // 或其他判断用户是否登录的方法
  if (isLoggedIn) {
    userStore.getUserInfo()
  }

  const enterpriseStore = useEnterpriseStore()
  if (!enterpriseStore.display_name) await enterpriseStore.loadInfo()
  const isWebsite = !enterpriseStore.isSoftStyle
  const isIndex = to.path.startsWith('/index')
  const isPass = to.meta.pass

  if (isPass || window.electron) {
  } else if (isIndex && !isWebsite) {
    next('/agent')
  } else if (!isIndex && isWebsite) {
    next('/')
  }
  if (to.meta.auth) {
    // 使用统一的认证检查
    if (!isLoggedIn) {
      await checkPermission()
      next('/') // 重定向到首页
      return
    }
  }
  next()
})

// 动态加载路由
export const initialDynamicRoutes = async () => {
  const enterpriseStore = useEnterpriseStore()
  const parentName = enterpriseStore.isSoftStyle ? 'Home' : 'Index'
  const parentRoute = router.getRoutes().find((item) => item.name === parentName)
  const navigationStore = useNavigationStore()
  await navigationStore.fetchNavigations()
  // 自定义页
  const customNavigations = navigationStore.navigations.filter(
    (item) => item.type === NAVIGATION_TYPE.CUSTOM
  )
  customNavigations.forEach((item) => {
    let childRoute: any = null
    if (parentRoute) {
      if (enterpriseStore.isSoftStyle) {
        childRoute = {
          path: item.jump_path,
          name: `Home${item.name}`,
          component: () => import(`@/views/custom/index.vue`),
          meta: {
            softCustom: true
          }
        }
      } else {
        childRoute = {
          path: item.menu_path,
          name: `Home${item.name}`,
          component: () => import(`@/views/custom/index.vue`)
        }
      }
    }
    router.addRoute(parentName, childRoute)
  })
  router.addRoute({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    // redirect: '/404',
    redirect: '/agent'
  })
  router.addRoute({
    path: '/index/:pathMatch(.*)*',
    name: 'IndexNotFound',
    redirect: () => {
      const redirect = window.location.hash.replace('#', '')
      return `/index-redirect?redirect=${redirect}`
    }
  })
}

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
  await initialDynamicRoutes()
  // 动态路由加载完成后，确认当前路径有效并重新激活它
  const { fullPath } = router.currentRoute.value
  const isMatched = router.resolve(fullPath).matched.length > 0
  if (isMatched && fullPath !== '/') {
    await router.replace(fullPath)
  }
}
