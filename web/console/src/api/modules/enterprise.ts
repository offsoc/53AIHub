import service from '../config'
import { handleError } from '../errorHandler'

export const enterpriseApi = {
  enterprise_config(type: 'smtp' | 'auth_sso') {
    return service.get(`/api/enterprise-configs/${type}`).catch(handleError)
  },
  save_enterprise_config(type: 'smtp' | 'auth_sso', params: { content: string; enabled: boolean }) {
    return service.post(`/api/enterprise-configs/${type}`, params).catch(handleError)
  },
  toggle_enterprise_config(type: 'smtp' | 'auth_sso') {
    return service.put(`/api/enterprise-configs/${type}/toggle`).catch(handleError)
  },
}

export default enterpriseApi
