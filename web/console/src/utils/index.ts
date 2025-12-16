/**
 * 判断在对象数据中是否有效值
 * @param { string | number | symbol } key 对象键值
 * @param { object } source 对象数据
 * @returns { boolean }
 */
export const isValidKeyInObject = (
  key: string | number | symbol | keyof typeof source = '',
  source: any = {}
) => {
  return !!(key && source && Object.keys(source).length && key in source && source[key])
}
export const typeOfData = source => {
  return Object.prototype.toString.call(source).slice(8, -1)
}
/**
 * 系列化对象为 search 参数
 * @param { object } source 参数
 * @returns { string }
 */
export const serialize = (source: any) => {
  return Object.keys(source)
    .filter(key => isValidKeyInObject(key, source))
    .sort()
    .map(key => {
      let value: any = source[key]
      if (typeOfData(value) === 'object') value = JSON.stringify(value)
      else if (typeOfData(value) === 'array') value = value.join(',')
      return `${key}=${value}`
    })
    .join('&')
}

/**
 *
 */
export const joinUrl = (url, paramStr) => {
  if (typeof url === 'string') return url + (url.includes('?') ? '&' : '?') + paramStr

  return ''
}

/**
 * 获取日期的时间戳
 */
export const getTimeStamp = (str: string) => {
  return new Date(str.replace(/-/g, '/')).getTime()
}

/**
 * 深拷贝
 */
export const deepCopy = (obj, ignore: string[] = []): any => {
  if (obj === null || typeof obj !== 'object') {
    // 如果是基本类型或 null，则直接返回
    return obj
  }

  if (Array.isArray(obj)) {
    // 如果是数组，则创建一个新数组并递归复制每个元素
    return obj.map(item => deepCopy(item, ignore))
  }
  if (obj instanceof Date) return obj

  // 如果是对象，则创建一个新对象并递归复制每个属性
  const newObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !ignore.includes(key)) newObj[key] = deepCopy(obj[key], ignore)
  }

  return newObj
}

/**
 * 继承
 * @param target
 * @param source
 * @returns
 */
export const assign = (target, ...source) => {
  for (const i in source) {
    if (!source.hasOwnProperty(i)) continue

    const object = source[i]
    if (typeof object === 'object' && object !== null) {
      Object.keys(object).forEach(key => {
        const value = object[key]
        if (Array.isArray(value)) target[key] = value
        else if (typeof value === 'object' && value !== null)
          target[key] = assign({}, target[key] || {}, value)
        else target[key] = value
      })
    } else {
      target[i] = object
    }
  }
  return target
}

export const generateRandomId = (length: number, isvar = false, isUuid = false): string => {
  const numberChars = '0123456789' // 数字字符集
  const nonNumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' // 非数字字符集
  const characters = nonNumericChars + numberChars
  let result = ''

  // 生成第一个字符，如果isvar为true，则从非数字字符中选取
  if (isvar) result += nonNumericChars[Math.floor(Math.random() * nonNumericChars.length)]
  else result += characters[Math.floor(Math.random() * characters.length)]

  // 生成剩余的字符
  for (let i = 1; i < length; i++)
    result += characters[Math.floor(Math.random() * characters.length)]

  if (isUuid) {
    result = result.toLowerCase()
    return result.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
  }

  return result
}

export const sleep = (time: number) => {
  return new Promise(resolve => {
    let timer: any
    timer = setTimeout(() => {
      resolve()
      clearTimeout(timer)
    }, time * 1000)
  })
}

/**
 * 删除js地址
 */
export const removeScript = (src: string) => {
  const node = document.querySelector(`script[src="${src}"]`)
  if (node) node.remove()
}

/**
 *
 * @param src 加载js地址
 */
export const loadScript = (src: string, cache = true) => {
  return new Promise((resolve, reject) => {
    const node = document.querySelector(`script[src="${src}"]`)
    if (node) {
      if (cache) return resolve()
      node.remove()
    }

    const element = document.createElement('script')
    element.src = src
    element.referrerpolicy = 'origin'
    element.onload = function () {
      resolve()
    }
    element.onerror = function () {
      reject()
    }
    document.body.appendChild(element)
  })
}

export const compare = (obj1, obj2, fields?: any[] = []) => {
  let object1 = {}
  let object2 = {}
  if (fields && fields.length) {
    fields.forEach(field => {
      object1[field] = obj1[field]
      object2[field] = obj2[field]
    })
  } else {
    object1 = obj1
    object2 = obj2
  }
  return JSON.stringify(object1) === JSON.stringify(object2)
}

/**
 * 是不是空对象
 */
export const isEmptyObject = obj => {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

// 判断是否是function或Promise
export const isFunction: (_function: any, onlyFunction?: boolean) => boolean = (
  _function = null,
  onlyFunction = false
) => Boolean(typeof _function === 'function' || (!onlyFunction && _function instanceof Promise))
export const isObject = (value: any) => typeof value === 'object' && value !== null

// Promise按顺序逐个执行
export const runResolvers = (resolvers = [() => Promise.resolve()]) => {
  let resolver = Promise.resolve()
  const results = []
  const errors = []
  while (resolvers.length) {
    const task = resolvers.shift()
    resolver = resolver.finally(() =>
      task()
        .then(res => results.push(res))
        .catch(err => errors.push(err))
    )
  }
  return resolver
    .then(() => results)
    .catch(() => errors)
    .finally(() => ({ resultList: results, errorList: errors }))
}

export const generateUUID = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const temp_url = URL.createObjectURL(new Blob())
  const uuid = temp_url.toString()
  URL.revokeObjectURL(temp_url)
  return uuid.substr(uuid.lastIndexOf('/') + 1)
}

const idleQueue = []
let isRunning = false
let _runTimer: any

const executeNextTask = deadline => {
  if (isRunning || !idleQueue.length) return

  isRunning = true
  const task = idleQueue.shift()

  try {
    task(deadline)
  } catch (error) {
    console.error('Error executing idle task:', error)
  } finally {
    isRunning = false
    requestIdleCallback(executeNextTask)
  }
}
/**
 * 空闲时间执行任务
 */
export const runOnIdle = (callback, options = {}) => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(executeNextTask, options)
  } else {
    console.warn('requestIdleCallback is not supported. Falling back to setTimeout.')
    _runTimer = setTimeout(deadline => {
      try {
        callback(deadline)
      } catch (error) {
        console.error('Error executing idle function:', error)
      }
      clearTimeout(_runTimer)
    }, 0)
  }
}

export const isInternalNetwork = () => {
  const hostname = window.location.hostname

  // 检查localhost和其他本地主机名
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) {
    return true
  }

  // 检查IPv4内网地址范围
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const parts = hostname.split('.').map(Number)

    // 检查地址合法性
    if (parts.some(p => p < 0 || p > 255)) return false

    // 私有地址段判断
    return (
      parts[0] === 10 || // 10.0.0.0/8
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
      (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
      (parts[0] === 169 && parts[1] === 254)
    ) // APIPA 169.254.0.0/16
  }

  // 检查IPv6内网地址
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const ip = hostname.slice(1, -1)
    return (
      ip === 'fc00:' || // IPv6私有地址范围 (fc00::/7)
      ip === 'fd00:' ||
      ip.startsWith('fe80:')
    ) // 链路本地地址 (fe80::/10)
  }

  // 检查常见内网域名后缀
  return /\.(local|lan|intranet|internal|priv)$/i.test(hostname)
}

/**
 * 解析JSON
 * @param json
 * @param defaultValue
 * @returns
 */
export const JSONParse = (json: string, defaultValue: any = {}) => {
  try {
    return JSON.parse(json)
  } catch (error) {
    return defaultValue
  }
}
