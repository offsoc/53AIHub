import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import path from 'path'

// Custom APIs for renderer
const $chat53ai = {
  $win: ({ type, data }) => ipcRenderer.invoke('win:service', { type, data }),
  $updater: ({ type, data }) => ipcRenderer.invoke('updater:service', { type, data }),
  $agenthub: ({ type, data }) => ipcRenderer.invoke('agenthub:service', { type, data }),
  $bookmarks: ({ type, data }) => ipcRenderer.invoke('bookmarks:service', { type, data }),
  $on: (event, callback) => ipcRenderer.on(event, callback),
  $off: (event, callback) => ipcRenderer.off(event, callback),
  $once: (event, callback) => ipcRenderer.once(event, callback),
  getPreloadPath: () => {
    return 'file://' + path.join(__dirname, './index.js')
  },
  getPublicPath: (name) => {
    return 'file://' + path.join(__dirname, '../renderer/', name)
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('$chat53ai', $chat53ai)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.$chat53ai = $chat53ai
}
