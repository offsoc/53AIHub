import { BrowserWindow, ipcMain, screen } from 'electron'
import { SystemTypeEnum } from '../enums/SystemTypeEnum'

import { WEB_HOST } from '../host'

import path from 'path'

export class FastChatWin {
  private static instance: FastChatWin | null = null
  private browser: BrowserWindow | null = null
  private ipcHanlder: any = null
  private static readonly CHANNEL = 'fastchat:service'

  constructor() {
    this.initIpcListeners()
  }

  static get shared(): FastChatWin | null {
    if (!FastChatWin.instance) {
      FastChatWin.instance = new FastChatWin()
    }
    return FastChatWin.instance
  }


  initIpcListeners(): void {
    this.ipcHanlder = (_event, { type, data }) => {
      console.log(data)
      switch (type) {
        case 'close':
          this.hide()
          break
      }
    }
    ipcMain.on(FastChatWin.CHANNEL, this.ipcHanlder);
  }

  create(): void {
    const browser = new BrowserWindow({
      width: 478,
      height: 590,
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
      type: SystemTypeEnum.isMac() ? 'panel' : 'toolbar',
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/fastChat.js'),
        sandbox: false,
        // 关闭检测同源策略
        webSecurity: false,
        // 关闭拼写检查器
        spellcheck: false
      }
    })
    // 禁用按下F11全屏事件
    browser.setFullScreenable(false)
    // 打开开发者工具
    // browser.webContents.openDevTools({ mode: 'detach' })

    browser.loadURL(WEB_HOST + '/#/desktop/fastchat')
    this.browser = browser
  }

  show(): void {
    this.browser?.setAlwaysOnTop(true, 'pop-up-menu', 1)
    this.browser?.setVisibleOnAllWorkspaces(true)

    // 获取到鼠标的横坐标和纵坐标
    const point = screen.getCursorScreenPoint()
    const currentScrren = screen.getDisplayNearestPoint(point)
    const width = currentScrren.bounds.width
    const x = currentScrren.bounds.x
    const size = 600
    const position = Math.ceil((width - size) / 2)
    // 设置坐标的同时设置宽高 否则在多显示器且显示器之间缩放比例不一致的情况下来回切换会导致悬浮球显示错位
    this.browser?.setBounds({
      x: x + position,
      // 屏幕三分之一的地方，有些电脑设置放大后，固定200会溢出屏幕导致显示异常
      y: currentScrren.bounds.y + Math.ceil(currentScrren.bounds.height * 0.3),
      width: size,
      height: size
    })
    this.browser?.showInactive()
  }

  hide(): void {
    this.browser?.hide()
  }

  send(type: string, data: any): void {
    if (this.browser === null) {
      return
    }
    this.browser?.webContents.send(FastChatWin.CHANNEL, {
      type: type,
      data: data
    })
  }

  destroy(): void {
    ipcMain.off(FastChatWin.CHANNEL, this.ipcHanlder)
    this.hide()
    if (this.browser) {
      this.browser.destroy()
      this.browser = null
    }
    FastChatWin.instance = null
  }
}
