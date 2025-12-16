import { ipcMain, app } from 'electron'
import { autoUpdater } from 'electron-updater'

type IPCHandlerParams = {
  type: string
  data?: unknown
}

export class AutoUpdater {
  private mainWin: any | null = null
  private static readonly CHANNEL = 'updater:service'
  constructor(mainWin) {
    this.mainWin = mainWin
    // 新增开发模式强制更新配置
    // autoUpdater.forceDevUpdateConfig = true
    // 可选：手动触发下载
    autoUpdater.autoDownload = false

    this.listenEvents()
    this.listenWindowEvents()
  }
  listenEvents() {
    autoUpdater.setFeedURL({
      url: 'http://oss.ibos.cn/common/53ai/app/',
      provider: 'generic'
    })
    autoUpdater.on('update-available', () => {
      // 显示更新提示
      this.mainWin?.updaterSend('available')
    })
    autoUpdater.on('update-not-available', () => {
      // 没有可用的更新
    })
    autoUpdater.on('error', (err) => {
      // 更新发生错误
      console.error('Update error:', err)
      this.mainWin?.updaterSend('error', err.message)
    })
    autoUpdater.on('update-downloaded', () => {
      // 下载完成
      this.mainWin?.updaterSend('downloaded')
    })
    autoUpdater.on('download-progress', (progress) => {
      // 下载进度
      this.mainWin?.updaterSend('progress', progress)
    })
  }

  private listenWindowEvents(): void {
    ipcMain.handle(AutoUpdater.CHANNEL, async (_event: any, params: IPCHandlerParams): Promise<boolean | void | string> => {
      switch (params.type) {
        case 'check':
          try {
            const info = await autoUpdater.checkForUpdates()
            const hasUpdate = info ? (info?.updateInfo.version !== app.getVersion()) : false
            // if (hasUpdate)
            //   this.mainWin?.updaterSend('available')
            return hasUpdate
          } catch (error) {
            return false
          }
          break
        // 开始下载
        case 'download':
          autoUpdater.downloadUpdate()
          break
        // 重启
        case 'restart':
          autoUpdater.quitAndInstall()
          break
        case 'version':
          return app.getVersion()
          break
        default:
          console.warn(`未知的窗口操作类型: ${params.type}`)
      }
    })
  }

}
