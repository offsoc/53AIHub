// HoverMenu.ts
import { BrowserWindow, ipcMain, screen } from 'electron'
import { SystemTypeEnum } from '../enums/SystemTypeEnum'
import { FastChatWin } from './FastChat'
import path from 'path'
import { WEB_HOST } from '../host'

export class HoverMenuWin {
  private static instance: HoverMenuWin | null = null

  private fastChatWin: FastChatWin | null = null
  private browser: BrowserWindow | null = null
  private ipcHanlder: any = null
  private static readonly CHANNEL = 'glider:service'

  private selectedText: string = ''
  // 是否点击了hoverMenu
  private isClickHoverMenu: boolean = false

  private lastY: { min: number, max: number } = { min: 0, max: 0 }
  private lastPlacement: string = 'top'

  constructor() {
    this.fastChatWin = new FastChatWin()
    this.fastChatWin.create()
    this.create()
    this.initIpcListeners()
    this.initWinListeners()
  }

  static get shared(): HoverMenuWin {
    if (!HoverMenuWin.instance) {
      HoverMenuWin.instance = new HoverMenuWin()
    }
    return HoverMenuWin.instance
  }
  create(): void {
    const browser = new BrowserWindow({
      width: 40,
      height: 40,
      show: false,
      // 跳过任务栏显示
      skipTaskbar: true,
      // 关闭阴影效果 否则设置了窗口透明清空下 透明处会显示阴影效果
      hasShadow: true,
      // 设置窗口透明
      transparent: true,
      // 设置窗口透明色
      backgroundColor: '#0000',
      // 去除窗口边框
      frame: false,
      // 可调整大小
      resizable: false,
      // 自动隐藏菜单栏
      autoHideMenuBar: true,
      focusable: false,
      type: SystemTypeEnum.isMac() ? 'panel' : 'toolbar',
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/hoverMenu.js'),
        sandbox: false,
        // 关闭检测同源策略
        webSecurity: false,
        // 关闭拼写检查器
        spellcheck: false
      }
    })
    // browser.webContents.openDevTools({ mode: 'detach' })
    // 禁用按下F11全屏事件
    browser.setFullScreenable(false)
    if (false) {
    } else {
      browser.loadURL(WEB_HOST + '/#/desktop/glider')
    }

    this.browser = browser
  }

  initIpcListeners(): void {
    this.ipcHanlder = (_event, { type, data }) => {
      switch (type) {
        case 'select':
          this.fastChatWin?.show()
          this.hide()
          this.fastChatWin?.send('app', data)
          this.fastChatWin?.send('submit', this.selectedText)
          break
        case 'tap':
          this.isClickHoverMenu = true
          break
        case 'hide':
          this.hide()
          break
      }
    }
    ipcMain.on(HoverMenuWin.CHANNEL, this.ipcHanlder)
  }

  initWinListeners(): void {
    this.browser?.on('moved', () => {
      const bounds = this.browser?.getBounds()
      if (!bounds) return
      if (bounds.y < this.lastY.min) {
        this.lastPlacement = 'top'
      } else if (bounds.y > this.lastY.max) {
        this.lastPlacement = 'bottom'
      }
    })
  }

  send(type: string, data: any): void {
    this.browser?.webContents.send(HoverMenuWin.CHANNEL, { type, data })
  }

  show(_setting: any, point: any, text: string): void {
    this.selectedText = text
    this.browser?.setAlwaysOnTop(true, 'pop-up-menu', 1)
    this.browser?.setVisibleOnAllWorkspaces(true)

    const menuWidth = 600
    const menuHeight = 600
    const realHeight = 46
    let x: number = Math.min(point.start.x, point.end.x)
    let y: number = 0

    // 获取鼠标所在的屏幕
    // const displays = screen.getAllDisplays()
    const cursorPoint = { x: point.start.x, y: point.start.y }
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint)


    if (this.lastPlacement === 'top') {
      y = Math.min(point.start.y, point.end.y) - 54
    } else {
      y = Math.max(point.start.y, point.end.y) + 10
    }

    // 确保窗口不超出屏幕边界
    const bounds = currentDisplay.bounds

    // 调整 x 坐标，确保不超出屏幕右侧
    if (x + menuWidth > bounds.x + bounds.width) {
      x = bounds.x + bounds.width - menuWidth
    }

    // 确保不超出屏幕左侧
    if (x < bounds.x) {
      x = bounds.x
    }

    // 调整 y 坐标，确保不超出屏幕底部
    if (y + realHeight > bounds.y + bounds.height) {
      y = bounds.y + bounds.height - realHeight
      this.lastPlacement = 'top' // 强制改为顶部显示
    }

    // 确保不超出屏幕顶部
    if (y < bounds.y) {
      y = bounds.y
      this.lastPlacement = 'bottom' // 强制改为底部显示
    }

    this.lastY = {
      min: Math.min(point.start.y, point.end.y),
      max: Math.max(point.start.y, point.end.y)
    }

    this.browser?.showInactive()
    // 一定要放在showInactive后面，不然位置会不对
    this.browser?.setBounds({
      x,
      y,
      width: menuWidth,
      height: menuHeight
    });

    // this.browser?.webContents.once('did-finish-load', () => {
    //   this.send(HoverMenuWin.CHANNEL, {
    //     type: 'setting',
    //     data: { glider_menus: _setting.glider_menus }
    //   })
    // })
  }
  hide(): void {
    if (this.isClickHoverMenu) {
      this.isClickHoverMenu = false;
      return;
    }
    this.browser?.hide()
  }

  destroy(): void {
    ipcMain.off(HoverMenuWin.CHANNEL, this.ipcHanlder)
    this.hide()

    if (this.fastChatWin) {
      this.fastChatWin.destroy()
      this.fastChatWin = null
    }

    if (this.browser) {
      this.browser.destroy()
      this.browser = null
    }

    HoverMenuWin.instance = null
  }
}
