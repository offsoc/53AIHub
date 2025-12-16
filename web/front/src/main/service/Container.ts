import { BrowserView, BrowserViewConstructorOptions } from 'electron'
import GNBEventBus from '../helper/event-bus'
import { handleOpenWindow, startDevToolsIfNeed } from '../helper/web'

/**
 * Web 容器选项
 */
export interface GDWebContainerOptions extends BrowserViewConstructorOptions {
  /**
   * 是否使用加载视图
   */
  useLoadingView?: boolean
  /**
   * 是否使用错误视图
   */
  useErrorView?: boolean
  /**
   * 是否需要使用网页标题和图标
   */
  useHTMLTitleAndIcon?: boolean
}

/**
 * Web 容器
 */
export class GDWebContainer {
  /**
   * 唯一 ID
   */
  public readonly id: number
  /**
   * 封装的视图
   */
  public readonly context: BrowserView
  public leftContext: BrowserView
  public rightContext: BrowserView
  /**
   * 禁用关闭能力
   */
  public disableClose = false
  /**
   * 配置项
   */
  private options: GDWebContainerOptions
  /**
   * 加载地址
   */
  private url?: string
  /**
   * 是否已初始化
   */
  private initialized = false

  constructor(options: GDWebContainerOptions = {}) {
    const defaultOptions: GDWebContainerOptions = {
      useLoadingView: false,
      useErrorView: false,
      useHTMLTitleAndIcon: false
    }
    this.options = {
      ...defaultOptions,
      ...options
    }
    // this.context = new BrowserView(this.options)
    // this.context.setBackgroundColor('rgba(255, 255, 255, 1)')

    this.leftContext = new BrowserView(this.options)
    this.rightContext = new BrowserView(this.options)
    // 设置背景色
    this.leftContext.setBackgroundColor('rgba(255, 255, 255, 1)')
    this.rightContext.setBackgroundColor('rgba(255, 255, 255, 1)')

    this.context = this.leftContext
    this.id = this.leftContext.webContents.id
  }

  /**
   * 加载链接
   * @param url 链接
   */
  public async loadURL(url: string): Promise<void> {
    this.url = url
    if (!this.initialized) {
      this.setup()
      this.initialized = true
    }
    this.context.webContents.loadURL(this.url)
  }

  /**
   * 重新加载
   */
  public reload() {
    if (this.url) {
      this.context.webContents.loadURL(this.url)
    } else {
      this.context.webContents.reload()
    }
  }

  /**
   * 设置选项
   * @param options 选项
   */
  public async setOptions(options: GDWebContainerOptions) {
    this.options = {
      ...this.options,
      ...options
    }
  }


  /**
   * 新增布局设置方法
   */
  public setContainerBounds(parentWidth: number, parentHeight: number) {
    const leftWidth = parentWidth - 400 // 左侧自适应宽度
    const rightWidth = 400 // 右侧固定宽度

    // 设置左视图布局
    this.leftContext.setBounds({
      x: 0,
      y: 32,
      width: leftWidth,
      height: parentHeight
    })

    // 设置右视图布局
    this.rightContext.setBounds({
      x: leftWidth,
      y: 32,
      width: rightWidth,
      height: parentHeight
    })
  }

  /**
   * 执行 JS 方法
   */
  public executeJavaScript(script: string) {
    if (this.context?.webContents?.isDestroyed()) {
      return
    }
    return this.context?.webContents?.executeJavaScript(script).catch((error) => {
      console.error(error)
    })
  }

  /**
   * 获取当前 URL
   */
  public getURL() {
    return this.url
  }

  // ================ Setter Getter ================= //
  private _title = ''
  private _icon = ''

  /**
   * 标题
   */
  public get title() {
    return this._title
  }
  public get icon() {
    return this._icon
  }

  public set title(value: string) {
    this._title = value
    this.options.useHTMLTitleAndIcon &&
      GNBEventBus.shared.emit({
        eventName: 'desktop.onTabTitle',
        data: { id: this.id, title: this.title, icon: this.icon }
      })
  }

  public set icon(value: string) {
    this._icon = value
    this.options.useHTMLTitleAndIcon &&
      GNBEventBus.shared.emit({
        eventName: 'desktop.onTabTitle',
        data: { id: this.id, title: this.title, icon: this.icon }
      })
  }

  // ================ Private Methods ================= //
  private setup() {
    // 配置页面信息
    this.configDocumentInfo()

    this.context.webContents.on('render-process-gone', (_event, details) => {
      console.error(details)
    })
    // this.context.webContents.openDevTools({ mode: 'detach' })
    handleOpenWindow(this.context.webContents)

    startDevToolsIfNeed(this.context.webContents)
  }

  private configDocumentInfo() {
    this.context.webContents.on('dom-ready', async () => {
      const title = this.context.webContents.getTitle()
      if (!this.title && title) {
        this.title = title
      }
    })
    this.context.webContents.on('page-favicon-updated', (_, favicons) => {
      this.icon = favicons && favicons[0] ? favicons[0] : ''
    })
  }
}
