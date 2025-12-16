import service from '../config'
import { handleError } from '../errorHandler'

export const conversation = {
  list() {
    return service.get(`/api/conversations`, { requiresAuth: true }).catch(handleError)
  },
  create(data: { agent_id: number, title: string }) {
    return service.post(`/api/conversations`, data).catch(handleError)
  },
  edit(id: number, data: { title: string }) {
    return service.put(`/api/conversations/${id}`, data).catch(handleError)
  },
  del(id: number) {
    return service.delete(`/api/conversations/${id}`).catch(handleError)
  },
  messasges(id: number, params: { keyword?: string, offset?: number, limit?: number } = {}) {
    return service.get(`/api/conversations/${id}/messages`, { params }).catch(handleError)
  }
}
export default conversation

