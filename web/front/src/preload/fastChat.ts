import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer

const $chat53ai = {
  $win: ({ type, data }) => ipcRenderer.invoke('win:service', { type, data }),
  $fastchat: ({ type, data }) => ipcRenderer.send('fastchat:service', { type, data }),
  $on: (event, callback) => ipcRenderer.on(event, callback),
  $off: (event, callback) => ipcRenderer.off(event, callback),
  $once: (event, callback) => ipcRenderer.once(event, callback),
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
