import { app, Tray, Menu } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import path from 'path'
import { SystemTypeEnum } from './enums/SystemTypeEnum'
import MainService from './service/Main'

// 解决使用 win.hide() 后再使用 win.show() 会引起窗口闪烁问题
app.commandLine.appendSwitch('wm-window-animations-disabled')

if (!SystemTypeEnum.isMac()) {
  // 禁用硬件加速
  app.disableHardwareAcceleration()
}

// 获取单例锁
const gotTheLock = app.requestSingleInstanceLock()
if (gotTheLock) {
  // 当多开时，多个实例执行调用 app.requestSingleInstanceLock() 时
  // 这个事件将在应用程序的首个已经启动的实例中触发
  app.on('second-instance', (_event, commandLine) => {
    if (commandLine.includes('--new-window')) {
      MainService.createMainWindow({ name: 'new-window' })
    } else {
      // 处理协议链接
      const url = commandLine.find((arg) => arg.startsWith('http://') || arg.startsWith('https://'))
      if (url) {
        MainService.winSend('new-window', { url })
      }
    }
  })
  // 处理协议启动
  app.on('open-url', (_event, url) => {
    if (url) {
      MainService.winSend('new-window', { url })
    }
  })
} else {
  // 如果获取单例锁失败，则表明应用程序已启动了
  // 这里直接执行退出当前重复实例即可
  app.quit()
}

// 将 tray 相关逻辑封装成函数
function registerTray(): Tray {
  const iconPath = path.join(app.getAppPath(), 'resources', 'icon.png')
  const tray = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => MainService.show() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])

  tray.on('click', () => MainService.show())
  tray.setToolTip('53AI')
  tray.setContextMenu(contextMenu)

  return tray
}

// 注册任务栏任务
function registerUserTasks(): void {
  app.setUserTasks([
    {
      program: process.execPath,
      arguments: '--new-window',
      iconPath: process.execPath,
      iconIndex: 0,
      title: '新建窗口',
      description: '创建一个新的窗口'
    }
  ])
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.chat53ai')
  MainService.init()

  registerTray()
  registerUserTasks()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)

    // 处理启动参数中的协议链接
    const args = process.argv
    const url = args.find((arg) => arg.startsWith('http://') || arg.startsWith('https://'))
    if (url) {
      MainService.winSend('new-window', { url })
    }
  })
  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler((event) => {
      MainService.winSend('new-window', { url: event.url })
      return { action: 'deny' }
    })
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 优化错误处理
process.on('uncaughtException', (err, _origin) => {
  console.error('Uncaught Exception:', err)
  // 可以添加错误上报逻辑
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', err.stack)
  }
})

// 添加未处理的 Promise 异常处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // 可以添加错误上报逻辑
})
