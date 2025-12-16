import service from '../config'
import { handleError } from '../errorHandler'

export interface PermissionListRequest {
  resource_type: number
  resource_id?: string
  subject_type?: number
  subject_id?: number
  permission?: number
}

export interface PermissionItem {
  created_time: number
  eid: number
  id: number
  permission: number
  resource_id: number
  resource_type: number
  subject_id: number
  subject_type: number
  updated_time: number
}
export type PermissionListResponse = PermissionItem[]

export interface PermissionCreateRequest {
  permission: {
    subject_type: number
    subject_id: number
    permission: number
  }[]
}

export const permissionsApi = {
  list(params: PermissionListRequest): Promise<PermissionListResponse> {
    return service
      .get('/api/permissions', { params })
      .then(res => res.data)
      .catch(handleError)
  },
  update(permission_id: PermissionItem['id'], data: { permission: number }) {
    return service.put(`/api/permissions/${permission_id}`, data).catch(handleError)
  },
  delete(permission_id: PermissionItem['id']) {
    return service.delete(`/api/permissions/${permission_id}`).catch(handleError)
  },
  create(resource_type: number, resource_id: number, data: PermissionCreateRequest) {
    return service.post(`/api/permissions/${resource_type}/${resource_id}`, data).catch(handleError)
  },
}

export default permissionsApi
