import type { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from 'axios'
import { ElMessage } from 'element-plus'
import request from './axios'
import {
  RESPONSE_CODE_MESSAGE_MAP,
  RESPONSE_CODE_NETWORK_ERROR,
  RESPONSE_CODE_TOKEN_EXPIRED_ERROR,
  RESPONSE_CODE_UNAUTHORIZED_ERROR,
  RESPONSE_MESSAGE_MAP,
} from './code'
import { api_host as default_api_host, pathname as default_pathname } from '@/utils/config'
import eventBus from '@/utils/event-bus'
import { useDefaultUser } from '@/stores/modules/user'

export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  responseType?: any
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  signal?: GenericAbortSignal
  hideError?: boolean
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  data: T
  message: string | null
  code: number | string
  response: any
  config: any
}

function http<T = any>({
  url,
  data,
  method,
  pathname,
  api_host,
  headers,
  extra_headers,
  onDownloadProgress,
  signal,
  hideError,
  beforeRequest,
  afterRequest,
  responseType,
  isStream,
  ...config
}: HttpOption) {
  hideError = !!+hideError
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    if (responseType === 'blob') return res
    if (url.includes('console/api')) {
      return res.data
    }

    if (res.data.code === 0 || typeof res.data === 'string') return res.data
    if (!hideError)
      ElMessage.warning(
        window.$t(
          RESPONSE_CODE_MESSAGE_MAP.get(+res.data.code) ||
            RESPONSE_MESSAGE_MAP.get(res.data.message) ||
            res.data.message
        )
      )
    return Promise.reject(res.data)
  }

  const failHandler = (error: Response<Error>) => {
    afterRequest?.()
    const response = error.response || {}
    let response_data = response.data || {}
    if (response_data.error) response_data = response_data.error
    let message =
      RESPONSE_MESSAGE_MAP.get(response_data.message) ||
      RESPONSE_CODE_MESSAGE_MAP.get(+response_data.code) ||
      response_data.message ||
      error.message ||
      RESPONSE_CODE_MESSAGE_MAP.get(RESPONSE_CODE_NETWORK_ERROR)
    const error_config = {
      code: response_data.code,
      message,
      origin_message: response_data.message,
    }
    const user_info = useDefaultUser()
    const is_invalid_user = !user_info.access_token || !user_info.eid
    if (
      !/\/login/.test(location.href) &&
      ([RESPONSE_CODE_TOKEN_EXPIRED_ERROR, RESPONSE_CODE_UNAUTHORIZED_ERROR].includes(
        error_config.code
      ) ||
        is_invalid_user)
    )
      eventBus.emit('user-login-expired')

    if (error.config.url.includes('console/api')) {
      if (!hideError) {
        if (error_config.origin_message.includes('Did not find openai_api_key'))
          message = '嵌入模型不可以用，切换嵌入模型或更换可用的API KEY'
        error_config.message = message
        ElMessage.warning(message)
      }
      // throw new Error(error_config)
      return Promise.reject(error_config)
    }
    if (!hideError && message !== 'canceled') ElMessage.warning(window.$t(message))
    // throw new Error(error_config)
    return Promise.reject(error_config)
  }

  if (isStream) {
    const origin_onDownloadProgress = onDownloadProgress
    onDownloadProgress = (progressEvent = {}) => {
      const { event: { target: { responseText = '' } = {} } = {} } = progressEvent
      let chunks = []
      let intact_content = ''
      let intact_reasoning_content = ''
      if (responseText) {
        chunks = responseText
          .split(/data\:\s*/g)
          .filter(text => text)
          .map(text => {
            try {
              // 找到最后一个完整的JSON对象
              const lastIndex = text.lastIndexOf('}')
              if (lastIndex !== -1) {
                const chunk = text.slice(0, lastIndex + 1)
                return JSON.parse(chunk)
              }
              return null
            } catch (error) {
              console.log(text, error)
              return null
            }
          })
          .filter(item => item)
          .map((item = {}) => {
            const { delta = {} } = (item.choices || [])[0] || {}
            item.content_id = item.content_id || item.id || delta.content_id || delta.id || ''
            item.content = delta.content || ''
            item.reasoning_content = delta.reasoning_content || ''
            item.role = delta.role || ''
            intact_content += item.content
            intact_reasoning_content += item.reasoning_content
            item.intact_content = intact_content
            item.intact_reasoning_content = intact_reasoning_content
            return item
          })
        console.log(chunks)
      }
      origin_onDownloadProgress({ progressEvent, chunks, intact_content, intact_reasoning_content })
    }
  }

  beforeRequest?.()

  method = method || 'GET'
  const params = Object.assign(typeof data === 'function' ? data() : (data ?? {}), {})

  url = url.replace(/\$\{[^}]+\}/g, (...args) => {
    const key = args[0].replace(/\$\{|\}/g, '')
    const value = params[key] || ''
    delete params[key]
    return value
  })
  url = `${api_host || default_api_host}${pathname || default_pathname}${url}`
  switch (method) {
    case 'POST':
      return request
        .post(url, params, { headers, extra_headers, signal, onDownloadProgress, responseType })
        .then(successHandler, failHandler)
    case 'PUT':
      return request
        .put(url, params, { headers, extra_headers, signal, onDownloadProgress, responseType })
        .then(successHandler, failHandler)
    case 'PATCH':
      return request
        .patch(url, params, { headers, extra_headers, signal, onDownloadProgress, responseType })
        .then(successHandler, failHandler)
    case 'DELETE':
      return request.delete(url, { data }).then(successHandler, failHandler)
    default:
      return request
        .get(url, { params, extra_headers, signal, onDownloadProgress, responseType })
        .then(successHandler, failHandler)
  }
}

export function get<T = any>({
  url,
  data,
  method = 'GET',
  onDownloadProgress,
  signal,
  hideError,
  beforeRequest,
  afterRequest,
  responseType,
  ...config
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    onDownloadProgress,
    signal,
    hideError,
    beforeRequest,
    afterRequest,
    responseType,
    ...config,
  })
}

export function post<T = any>({
  url,
  data,
  method = 'POST',
  headers,
  onDownloadProgress,
  signal,
  hideError,
  beforeRequest,
  afterRequest,
  responseType,
  ...config
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    hideError,
    beforeRequest,
    afterRequest,
    responseType,
    ...config,
  })
}

export function del<T = any>({
  url,
  data,
  method = 'DELETE',
  headers,
  onDownloadProgress,
  signal,
  hideError,
  beforeRequest,
  afterRequest,
  responseType,
  ...config
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    hideError,
    beforeRequest,
    afterRequest,
    responseType,
    ...config,
  })
}
export function patch<T = any>({
  url,
  data,
  method = 'PATCH',
  headers,
  onDownloadProgress,
  signal,
  hideError,
  beforeRequest,
  afterRequest,
  responseType,
  ...config
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    hideError,
    beforeRequest,
    afterRequest,
    responseType,
    ...config,
  })
}

export function put<T = any>({
  url,
  data,
  method = 'PUT',
  headers,
  onDownloadProgress,
  signal,
  hideError,
  beforeRequest,
  afterRequest,
  responseType,
  ...config
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    hideError,
    beforeRequest,
    afterRequest,
    responseType,
    ...config,
  })
}

export default post
