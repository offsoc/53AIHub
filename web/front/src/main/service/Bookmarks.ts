const { app } = require('electron')
const fs = require('fs')
const path = require('path')

class BookmarkManager {
  private bookmarksFile: string
  private bookmarks: any[]
  constructor() {
    this.bookmarksFile = path.join(app.getPath('userData'), 'bookmarks.json')
    this.bookmarks = this.loadBookmarks()
  }

  loadBookmarks() {
    try {
      if (fs.existsSync(this.bookmarksFile)) {
        const data = fs.readFileSync(this.bookmarksFile, 'utf8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    }
    return []
  }

  saveBookmarks() {
    try {
      fs.writeFileSync(this.bookmarksFile, JSON.stringify(this.bookmarks), 'utf8')
    } catch (error) {
      console.error('Error saving bookmarks:', error)
    }
  }

  addBookmark(title, url) {
    this.bookmarks.push({ title, url, createdAt: new Date().toISOString() })
    this.saveBookmarks()
  }

  removeBookmark(url) {
    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.url !== url)
    this.saveBookmarks()
  }

  getAllBookmarks() {
    return this.bookmarks
  }

  importChromeBookmarks() {
    try {
      // Chrome 书签文件的默认路径
      const chromeBookmarksPath = path.join(
        process.env.LOCALAPPDATA,
        'Google/Chrome/User Data/Default/Bookmarks'
      )

      if (!fs.existsSync(chromeBookmarksPath)) {
        throw new Error('找不到 Chrome 书签文件')
      }

      const bookmarksData = fs.readFileSync(chromeBookmarksPath, 'utf8')
      const bookmarksJson = JSON.parse(bookmarksData)

      // 递归解析书签
      const parseBookmarks = (node) => {
        const results: any = []
        if (node.type === 'url') {
          results.push({
            title: node.name,
            url: node.url,
            createdAt: new Date(node.date_added / 1000).toISOString()
          })
        } else if (node.children) {
          node.children.forEach(child => {
            results.push(...parseBookmarks(child))
          })
        }
        return results
      }

      // 解析书签栏和其他书签
      const bookmarkBar = bookmarksJson.roots.bookmark_bar
      const otherBookmarks = bookmarksJson.roots.other

      const newBookmarks = [
        ...parseBookmarks(bookmarkBar),
        ...parseBookmarks(otherBookmarks)
      ]

      // 合并书签，避免重复
      const existingUrls = new Set(this.bookmarks.map(b => b.url))
      const uniqueNewBookmarks = newBookmarks.filter(b => !existingUrls.has(b.url))

      this.bookmarks = [...this.bookmarks, ...uniqueNewBookmarks]
      this.saveBookmarks()

      return uniqueNewBookmarks.length
    } catch (error) {
      console.error('导入 Chrome 书签时出错:', error)
      throw error
    }
  }
}

module.exports = BookmarkManager