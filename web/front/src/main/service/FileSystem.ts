import fs from 'fs'
import path from 'path'

interface IFileNode {
  name: string
  type: 'file' | 'directory'
  content?: string
  children?: IFileNode[]
  path: string
}

export class FileSystem {
  private root: IFileNode

  constructor() {
    this.root = {
      name: 'root',
      type: 'directory',
      children: [],
      path: '/'
    }
  }

  // 创建目录
  createDirectory(dirPath: string): void {
    const parts = dirPath.split('/').filter(Boolean)
    let current = this.root
    let currentPath = ''

    for (const part of parts) {
      currentPath += '/' + part
      let node = current.children?.find(child => child.name === part)
      
      if (!node) {
        node = {
          name: part,
          type: 'directory',
          children: [],
          path: currentPath
        }
        current.children = current.children || []
        current.children.push(node)
      }
      
      current = node
    }
  }

  // 创建文件
  createFile(filePath: string, content: string = ''): void {
    const parts = filePath.split('/').filter(Boolean)
    const fileName = parts.pop()
    if (!fileName) return

    // 确保父目录存在
    const dirPath = '/' + parts.join('/')
    this.createDirectory(dirPath)

    // 找到父目录
    const parentDir = this.findNode(dirPath)
    if (!parentDir || parentDir.type !== 'directory') return

    // 创建文件节点
    const fileNode: IFileNode = {
      name: fileName,
      type: 'file',
      content: content,
      path: dirPath + '/' + fileName
    }

    parentDir.children = parentDir.children || []
    const existingFile = parentDir.children.findIndex(child => child.name === fileName)
    if (existingFile !== -1) {
      parentDir.children[existingFile] = fileNode
    } else {
      parentDir.children.push(fileNode)
    }
  }

  // 获取目录结构
  getStructure(): IFileNode {
    return this.root
  }

  // 保存到实际文件系统
  save(basePath: string): void {
    const savePath = path.resolve(basePath, 'filesystem.json')
    fs.writeFileSync(savePath, JSON.stringify(this.root, null, 2), 'utf-8')
  }

  // 从文件系统加载
  load(basePath: string): void {
    const loadPath = path.resolve(basePath, 'filesystem.json')
    if (fs.existsSync(loadPath)) {
      const data = fs.readFileSync(loadPath, 'utf-8')
      this.root = JSON.parse(data)
    }
  }

  // 查找节点
  private findNode(nodePath: string): IFileNode | null {
    if (nodePath === '/') return this.root

    const parts = nodePath.split('/').filter(Boolean)
    let current = this.root

    for (const part of parts) {
      const found = current.children?.find(child => child.name === part)
      if (!found) return null
      current = found
    }

    return current
  }

  // 读取文件内容
  readFile(filePath: string): string | null {
    const node = this.findNode(filePath)
    if (!node || node.type !== 'file') return null
    return node.content || null
  }
}

/* 
import { FileSystem } from './service/FileSystem'

// 创建文件系统实例
const fs = new FileSystem()

// 创建目录
fs.createDirectory('/documents/work')
fs.createDirectory('/documents/personal')

// 创建文件
fs.createFile('/documents/work/report.txt', '这是工作报告内容')
fs.createFile('/documents/personal/notes.txt', '这是个人笔记')

// 读取文件内容
const content = fs.readFile('/documents/work/report.txt')
console.log('文件内容:', content)

// 获取目录结构
const structure = fs.getStructure()
console.log('目录结构:', JSON.stringify(structure, null, 2))

// 保存文件系统状态
fs.save('./data')

// 加载文件系统状态
const newFs = new FileSystem()
newFs.load('./data') */