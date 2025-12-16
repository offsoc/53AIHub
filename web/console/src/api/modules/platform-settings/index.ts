import service from '@/api/config'
import { handleError } from '@/api/errorHandler'
import type { PlatformSetting, RawPlatformSetting } from './types'

const platformSettingsApi = {
  find(params: { platform_key: string }): Promise<RawPlatformSetting[]> {
    return service
      .get('/api/platform-settings', { params })
      .then(res => res.data)
      .catch(handleError)
  },
  get(id: string): Promise<RawPlatformSetting> {
    return service
      .get(`/api/platform-settings/${id}`)
      .then(res => res.data)
      .catch(handleError)
  },
  create(data: { platform_key: string; setting: string; external_id?: string }): Promise<void> {
    return service
      .post('/api/platform-settings', data)
      .then(res => res.data)
      .catch(handleError)
  },
  update(
    id: string,
    data: { platform_key: string; setting: string; external_id?: string }
  ): Promise<PlatformSetting> {
    return service
      .put(`/api/platform-settings/${id}`, data)
      .then(res => res.data)
      .catch(handleError)
  },
  delete(id: string): Promise<void> {
    return service
      .delete(`/api/platform-settings/${id}`)
      .then(res => res.data)
      .catch(handleError)
  },
}

export default platformSettingsApi
