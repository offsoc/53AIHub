import { app } from 'electron/main'
import { WebContents } from 'electron'



/**
 * 如果需要，开启开发工具
 * 界面操作：连击左边 control 3 次
 */
export function startDevToolsIfNeed(webContents: WebContents) {
  if (!app.isPackaged) {
    let clicks = 0
    let previousClickTime = 0
    webContents.addListener('before-input-event', (_event, input) => {
      if (input.type === 'keyDown' && input.code === 'ControlLeft') {
        const now = +new Date()
        if (now - previousClickTime < 300) {
          clicks++
        } else {
          clicks = 1
        }
        previousClickTime = now

        if (clicks >= 3) {
          webContents.openDevTools({
            mode: 'detach',
            activate: true
          })
          webContents.devToolsWebContents?.focus()
          clicks = 0
        }
      }
    })
  }
}
