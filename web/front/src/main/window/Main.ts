import { app, BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

const WINDOW_WIDTH = 1280
const WINDOW_HEIGHT = 960

export class MainWin {
  public browser: BrowserWindow | null = null

  public readonly id: number | string

  private static winCounter = 0

  private static readonly CHANNEL = 'win:service'

  constructor(id?: number | string) {
    this.id = id || MainWin.winCounter++
  }

  public create(options: { name?: string; url?: string } = {}): void {
    const browser = new BrowserWindow({
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      frame: false,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        webSecurity: false, // 禁用同源策略（慎用）
        nodeIntegration: true, // 根据需求决定是否开启
        webviewTag: true, // 启用 WebView 标签,
        // 关闭拼写检查器
        spellcheck: false
      }
    })
    options.name = options.name ?? 'main'
    // browser.webContents.openDevTools()
    // this.openDevTools()
    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      browser.loadURL(
        `${process.env.ELECTRON_RENDERER_URL}?window=${options.name}${options.url ? `&url=${options.url}` : ''}#/desktop`
      )
    } else {
      const filePath = join(__dirname, '../renderer/index.html')
      browser.loadFile(filePath, {
        hash: 'desktop',
        query: {
          window: options.name,
          ...(options.url ? { url: options.url } : {})
        }
      })
    }

    this.browser = browser
    this.initBrowserListeners()
    browser.webContents.setWindowOpenHandler((event) => {
      console.log('setWindowOpenHandler')
      this.send(MainWin.CHANNEL, { type: 'new-window', data: { url: event.url } })
      return {
        action: 'deny'
      }
    })
  }

  private initBrowserListeners(): void {
    this.browser?.on('ready-to-show', () => {
      this.browser?.show()
    })
    /**
     * 主窗口关闭事件
     */
    this.browser?.on('close', (e) => {
      console.log('关闭主窗口')
      // app.quit()
      // 当只剩最后一个窗口时退出应用
      if (BrowserWindow.getAllWindows().length === 1) {
        app.quit()
      } else {
        e.preventDefault()
        this.browser?.destroy()
        this.browser = null
      }
    })

    /**
     * 主窗口显示时触发事件
     */
    // this.browser?.on('focus', () => {
    //   console.log('main show')
    // })

    /**
     * 窗口失去焦点事件
     */
    // this.browser?.on('blur', () => {
    //   console.log('main blur')
    // })

    this.browser?.on('maximize', () => {
      this.send(MainWin.CHANNEL, { type: 'maximize' })
    })
    this.browser?.on('unmaximize', () => {
      this.send(MainWin.CHANNEL, { type: 'unmaximize' })
    })
  }

  // 获取窗口状态
  public isDestroyed(): boolean {
    return this.browser?.isDestroyed() ?? true
  }

  public isFocused(): boolean {
    return this.browser?.isFocused() ?? false
  }

  public getBounds(): Electron.Rectangle {
    return this.browser?.getBounds() ?? { x: 0, y: 0, width: 0, height: 0 }
  }

  public openDevTools(): void {
    this.browser?.webContents.openDevTools({ mode: 'detach' })
  }

  public send(type: string, data: any): void {
    this.browser?.webContents.send(type, data)
  }

  // 设置窗口位置
  public setPosition(position: 'left' | 'center' | 'right') {
    if (!this.browser) return

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
    const windowWidth = 400
    const windowHeight = WINDOW_HEIGHT
    let x = 0
    let y = 0

    switch (position) {
      case 'left':
        x = 0
        this.browser.setSize(windowWidth, windowHeight)
        break
      case 'right':
        x = screenWidth - windowWidth
        this.browser.setSize(windowWidth, windowHeight)
        break
      case 'center':
        x = Math.floor((screenWidth - WINDOW_WIDTH) / 2)
        y = Math.floor((windowHeight - windowHeight) / 2)
        this.browser.setSize(WINDOW_WIDTH, windowHeight)
        break
    }

    y = Math.floor((screenHeight - windowHeight) / 2)
    this.browser.setPosition(x, y)
  }

  // 设置置顶
  public setAlwaysOnTop(alwaysOnTop: boolean) {
    this.browser?.setAlwaysOnTop(alwaysOnTop)
  }

  public show() {
    this.browser?.show()
  }

  public hide() {
    if (this.id === 'main') this.browser?.hide()
    else {
      this.destroy()
    }
  }

  public reload() {
    this.browser?.reload()
  }

  public minimize() {
    this.browser?.minimize()
  }

  public maximize() {
    if (!this.browser) return
    if (this.browser.isMaximized()) {
      this.browser.unmaximize()
    } else {
      this.browser.maximize()
    }
  }

  public restore() {
    this.browser?.restore()
  }

  // 添加销毁方法
  public destroy(): void {
    if (this.browser) {
      // 注销快捷键
      this.browser.destroy()
      this.browser = null
    }
  }
}
