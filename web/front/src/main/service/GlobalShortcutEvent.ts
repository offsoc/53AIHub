import { clipboard } from 'electron'
import robotjs from '@jitsi/robotjs'

class GlobalShortcutEvent {
  private static readonly PLATFORM_CMD = process.platform === 'darwin' ? 'command' : 'control'

  static getSelectedText = async () => {
    return new Promise<string>((resolve) => {
      try {
        const lastText = clipboard.readText('clipboard')
        const { PLATFORM_CMD } = GlobalShortcutEvent
        robotjs.keyTap('c', PLATFORM_CMD)

        const newContent = (clipboard.readText('clipboard') || '').trim()
        // 修复静态属性访问方式
        resolve(newContent)

        clipboard.writeText(lastText)
      } catch (error) {
        resolve('')
      }
    })
  }

  registerAll() { }
}
export default GlobalShortcutEvent
