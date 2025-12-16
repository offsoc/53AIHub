// src/service/MouseEventsHandler.ts
import { app, BrowserWindow, screen } from 'electron'
import { uIOhook, UiohookMouseEvent } from 'uiohook-napi'
import GlobalShortcutEvent from './GlobalShortcutEvent'
import { SystemTypeEnum } from '../enums/SystemTypeEnum'
import path from 'path'
import { spawn } from 'child_process'


type Position = { x: number; y: number }
type ShowHandler = (point: any, text: string) => void
type HideHandler = () => void

export class MouseEventsHandler {
  private mousedownInfo: UiohookMouseEvent | null = null
  private mousedownTime = 0
  private showHandler: ShowHandler
  private hideHandler: HideHandler

  private isShowing = false
  private scaleFactor: number = 1
  private lastText: string = ''


  constructor(showHandler: ShowHandler, hideHandler: HideHandler
  ) {
    this.showHandler = showHandler
    this.hideHandler = hideHandler
    this.init()
    this.updateScaleFactor()
  }

  private init(): void {
    uIOhook.start()

    uIOhook.on('mousedown', this.handleMouseDown.bind(this))
    uIOhook.on('mouseup', this.handleMouseUp.bind(this))
    uIOhook.on('click', this.handleClick.bind(this))
  }

  private updateScaleFactor(): void {
    if (process.platform !== 'win32') {
      this.scaleFactor = 1
      return
    }
    const currentWindow = BrowserWindow.getFocusedWindow()
    const targetDisplay = currentWindow
      ? screen.getDisplayNearestPoint(currentWindow.getBounds())
      : screen.getPrimaryDisplay()

    this.scaleFactor = targetDisplay.scaleFactor
  }

  private scalePosition(position: Position): Position {
    console.log('scalePosition', position)
    return {
      x: Math.round(position.x / this.scaleFactor),
      y: Math.round(position.y / this.scaleFactor)
    }
  }

  private async handleMouseDown(e: UiohookMouseEvent): Promise<void> {
    if (e.button === 1) {
      this.mousedownInfo = e
      this.mousedownTime = Date.now()
    } else {
      this.mousedownTime = 0
    }
  }
  private async getSelectedText(): Promise<string | null> {
    return GlobalShortcutEvent.getSelectedText().catch(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return GlobalShortcutEvent.getSelectedText();
    })
  }

  private isMouseSelectTextStatus(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!SystemTypeEnum.isWin()) {
        return resolve(1)
      }
      let mouseSelectTextStatusPath
      if (app.isPackaged) {
        mouseSelectTextStatusPath = path.join(
          __dirname,
          '../../../app.asar.unpacked/plugins/mouse-select-text-status.exe'
        )
      } else {
        mouseSelectTextStatusPath = path.join(__dirname, '../../plugins/mouse-select-text-status.exe')
      }
      const selectStatusSpawn = spawn(mouseSelectTextStatusPath)
      // 执行成功回调
      selectStatusSpawn.stdout.on('data', (data) => {
        resolve(Number(data.toString()))
      })
      // 执行失败回调
      selectStatusSpawn.stderr.on('data', (data) => {
        reject(data)
      })
    })
  }

  private async handleMouseUp(e: UiohookMouseEvent): Promise<void> {
    if (this.mousedownTime && Date.now() - this.mousedownTime >= 200) {
      if (e.button === 1 && this.mousedownInfo) {
        if (this.mousedownInfo.x !== e.x || this.mousedownInfo.y !== e.y) {
          const isSelected = await this.isMouseSelectTextStatus()
          const selectedText = await this.getSelectedText()
          const text = isSelected ? selectedText : ''
          // 如果是划自己的弹窗 则不显示
          const selfWindow = BrowserWindow.getFocusedWindow()
          console.log('text:', text)
          console.log('isSelected:', isSelected)
          console.log('selfWindow', selfWindow)
          if (!text || text === this.lastText) return
          // 应添加窗口位置变化时的缩放因子更新
          this.updateScaleFactor() // 窗口可能被拖动到不同缩放的显示器
          await this.showHandler({
            start: this.scalePosition(this.mousedownInfo),
            end: this.scalePosition(e),
          }, text)
          this.lastText = text
          this.isShowing = true
          return
        }
      }
    }
    this.isShowing = false
    this.mousedownInfo = null
  }

  private async handleClick(_e: UiohookMouseEvent): Promise<void> {
    if (this.isShowing) return
    await new Promise(resolve => setTimeout(resolve, 200));
    this.lastText = ''
    this.hideHandler()
  }

  public destroy(): void {
    uIOhook.off('mousedown', this.handleMouseDown)
    uIOhook.off('mouseup', this.handleMouseUp)
    uIOhook.off('click', this.handleClick)
    uIOhook.stop()
  }
}
