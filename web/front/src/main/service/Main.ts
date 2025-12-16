import { ipcMain, session, app } from 'electron'
// import GDTabPage from './Page'
import { MainWin } from '../window/Main'
import { HoverMenuWin } from '../window/HoverMenu'
import { MouseEventsHandler } from './MouseEventsHandler'
import { AutoUpdater } from './AutoUpdater'

import AutoLaunch from 'auto-launch'

type IPCHandlerParams = {
  type: string
  data?: unknown
}

const autoLauncher = new AutoLaunch({
  name: '53AI',
  path: process.execPath
})

class MainService {
  private mainWindows: Map<number | string, MainWin> = new Map()
  private activeWindow: MainWin | null = null
  private hoverMenuWin: HoverMenuWin | null = null
  private isLogin: boolean = false
  private loginData: any = null
  private setting: any = {}
  private mouseHandler: any = null

  private static readonly WIN_CHANNEL = 'win:service'

  constructor() {

  }

  public init(): void {
    this.createMainWindow({}, 'main')
    this.listenWindowEvents()

    new AutoUpdater(this)
  }

  public createMainWindow(options = {}, name: string = ''): void {
    const mainWin = new MainWin(name)
    mainWin.create(options)
    this.mainWindows.set(mainWin.id, mainWin)
    this.activeWindow = mainWin

    mainWin.browser?.on('focus', () => {
      const activeWin = Array.from(this.mainWindows.values())
        .find(mw => mw?.id === mainWin.id)
      console.log('main focus id:' + activeWin?.id)
      if (activeWin && activeWin.browser) {
        this.activeWindow = activeWin
      }
    })

    mainWin.browser?.on('ready-to-show', () => {
      if (this.isLogin) {
        this.broadcastToAll(MainService.WIN_CHANNEL, { type: 'login', data: this.loginData })
      }
      this.broadcastToAll(MainService.WIN_CHANNEL, {
        type: 'setting',
        data: JSON.stringify({
          default_browser_enabled: this.checkDefaultBrowser()
        })
      })
    })
  }

  private getActiveWindow(): MainWin | null {
    return this.activeWindow
  }

  public show() {
    this.getActiveWindow()?.show()
  }

  public hide() {
    this.getActiveWindow()?.hide()

  }

  private listenWindowEvents(): void {
    ipcMain.handle(MainService.WIN_CHANNEL, (_event: any, params: IPCHandlerParams) => {
      const mainWin = this.getActiveWindow()
      if (!mainWin) return
      const data = (params.data || {}) as any
      console.log('main win params:' + JSON.stringify(params))
      switch (params.type) {
        case 'minimize':
          mainWin.minimize()
          break
        case 'maximize':
          mainWin.maximize()
          break
        case 'restore':
          mainWin.restore()
          break
        case 'close':
          mainWin.hide()
          break
        case 'login':
          this.handleUserLogin(data)
          break
        case 'agenthub_login':
          this.broadcastToAll(MainService.WIN_CHANNEL, { type: 'agenthub_login', data })
          break
        case 'agenthub_logout':
          this.broadcastToAll(MainService.WIN_CHANNEL, { type: 'agenthub_logout', data })
          break
        case 'logout':
          this.handleUserLogout()
          break
        case 'open':
          mainWin.show()
          this.hoverMenuHide()
          break
        case 'hide':
          mainWin.hide()
          break
        case 'setPosition':
          // left center right
          mainWin.setPosition(data.position)
          break
        case 'test':
          // left center right
          mainWin.openDevTools()
          break
        case 'setAlwaysOnTop':
          mainWin.setAlwaysOnTop(data.alwaysOnTop)
          break
        case 'setting':
          this.handleSetting(data)
          break
        case 'clearSession':
          this.clearSession(data.url)
          break
        case 'glider:setting':
          mainWin.show()
          this.winSend('glider:setting', {})
          break
        case 'glider:forbid':
          this.winSend('glider:forbid', {})
          break
        case 'new-window':
          this.createMainWindow({
            name: 'new-window',
            url: data.url
          })
          break
        case 'new-tab':
          this.winSend('new-tab', data)
          break
        default:
          console.warn(`未知的窗口操作类型: ${params.type}`)
      }
    })
  }

  // private closeWindow(winId: number): void {
  //   const win = this.mainWindows.get(winId)
  //   if (win) {
  //     win.hide()
  //     if (this.mainWindows.size <= 1) {
  //       // 如果是最后一个窗口，只是隐藏
  //       return
  //     }
  //     this.mainWindows.delete(winId)
  //     if (this.activeWindow?.id === winId) {
  //       this.activeWindow = this.mainWindows.values().next().value
  //     }
  //   }
  // }

  private hoverMenuShow(point: any, text: string): void {
    if (!this.isLogin) return
    if (this.hoverMenuWin) {
      this.hoverMenuWin.show(this.setting, point, text)
    }
  }
  private hoverMenuHide(): void {
    if (this.hoverMenuWin) {
      this.hoverMenuWin.hide()
    }
  }

  private handleUserLogin(data: any): void {
    console.log('user login')
    this.broadcastToAll(MainService.WIN_CHANNEL, { type: 'login', data })
    this.isLogin = true
    this.loginData = data

    if (!this.hoverMenuWin) {
      this.hoverMenuWin = HoverMenuWin.shared
    }
  }

  private handleUserLogout(): void {
    console.log('user logout')
    this.isLogin = false
    this.loginData = null
    this.mainWindows.forEach(win => win.reload())

    if (this.hoverMenuWin) {
      this.hoverMenuWin.destroy()
      this.hoverMenuWin = null
    }
    if (this.mouseHandler) {
      this.mouseHandler.destroy()
      this.mouseHandler = null
    }
  }

  private handleSetting(data: any): void {
    this.setting = data ? JSON.parse(data) : {}
    console.log('setting sync')

    // 划词功能
    this.handleGliderSetting()
    // 浏览器默认打开
    this.handleProtocols(['http', 'https'], this.setting.default_browser_enabled)
    // 开机启动
    this.handleAutoLaunch()
  }
  private handleGliderSetting() {
    // 划词功能
    if (this.setting.glider_enabled) {
      if (!this.mouseHandler)
        this.mouseHandler = new MouseEventsHandler(this.hoverMenuShow.bind(this), this.hoverMenuHide.bind(this))
    } else {
      if (this.mouseHandler) {
        this.mouseHandler.destroy()
        this.mouseHandler = null
      }
    }
  }

  private handleProtocols(protocols: string[], enable: boolean): void {
    protocols.forEach(protocol => {
      const isClient = app.isDefaultProtocolClient(protocol)
      const darwinArgs = [
        '--process-path',
        `"${process.execPath}"`,
        '--open-url'
      ]

      if (enable && !isClient) {
        if (process.platform === 'win32') {
          // Windows 平台特殊处理
          app.setAsDefaultProtocolClient(protocol, process.execPath, [
            '--protocol-launcher',
            '%1'
          ])
        } else if (process.platform === 'darwin') {
          app.setAsDefaultProtocolClient(protocol, process.execPath, darwinArgs)
        } else {
          app.setAsDefaultProtocolClient(protocol)
        }
      } else if (!enable && isClient) {
        if (process.platform === 'win32') {
          app.removeAsDefaultProtocolClient(protocol, process.execPath, [
            '--protocol-launcher',
            '%1'
          ])
        } else if (process.platform === 'darwin') {
          app.removeAsDefaultProtocolClient(protocol, process.execPath, darwinArgs)
        } else {
          app.removeAsDefaultProtocolClient(protocol)
        }
      }
    })
  }

  private handleAutoLaunch(): void {
    autoLauncher.isEnabled().then((isEnabled: boolean) => {
      if (this.setting.boot_up_enabled) {
        if (!isEnabled) {
          autoLauncher.enable()
        }
      } else {
        if (isEnabled) {
          autoLauncher.disable()
        }
      }
    })
  }

  private broadcastToAll(event, data: { type: string; data?: any }) {
    this.mainWindows.forEach(win => {
      win.send(event, data)
    })
  }

  winSend(type: string, data: any) {
    this.getActiveWindow()?.send(MainService.WIN_CHANNEL, { type, data })
  }

  updaterSend(type: string, data: any) {
    this.broadcastToAll('updater:service', { type, data })
  }

  private async clearSession(url) {
    const ses = session.defaultSession
    try {
      await ses.clearStorageData({ origin: url, storages: ['cookies', 'localstorage', 'cachestorage', 'indexdb'] })
      return true
    } catch (error) {
      console.error('清除站点数据时出错:', error)
      throw error
    }
  }

  public checkDefaultBrowser() {
    return app.isDefaultProtocolClient('http') && app.isDefaultProtocolClient('https');
  }
}

const mainService = new MainService()
export default mainService
