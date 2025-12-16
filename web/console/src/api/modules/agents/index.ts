import service from '../../config'
import { handleError } from '../../errorHandler'

export interface RawAgentInfo {
  agent_id: number
  eid: number
  name: string
  logo: string
  sort: number
  description: string
  channel_type: number
  model: string
  prompt: string
  configs: string
  tools: string
  group_id: number
  use_cases: string
  created_by: number
  custom_config: string
  settings: string
  user_group_ids: number[]
  enable: boolean
  conversation_count: number
  agent_type: number
  created_time: number
  updated_time: number
}

export interface AgentInfo
  extends Omit<RawAgentInfo, 'settings' | 'tools' | 'use_cases' | 'custom_config' | 'configs'> {
  settings: Record<string, any>
  tools: Record<string, any>
  use_cases: Record<string, any>
  custom_config: Record<string, any>
  configs: Record<string, any>
}

interface AgentInfoResponse {
  agents: RawAgentInfo[]
  count: number
}

interface AgentInfoRequest {
  channel_type: number
  group_id: number
  configs: string
  logo: string
  name: string
  description: string
  model: string
  prompt: string
  sort: number
  tools: string
  use_cases: string
  user_group_ids: number[]
  custom_config: string
  settings: string
  enable: boolean
  agent_type: number
  subscription_group_ids: number[]
}

interface RawAgentModelInfo {
  agent_id: number
  channel_id: number
  channel_type: number
  created_time: number
  eid: number
  id: number
  model: string
  updated_time: number
}

interface RawAgentModelRequest {
  channel_id: number
  channel_type: number
  model: string
}

interface AgentModelResponse {
  agent_models: RawAgentModelInfo[]
  count: number
}

const agentsApi = {
  group(params: {
    group_id: number
    keyword?: string
    offset?: number
    limit?: number
  }): Promise<AgentInfoResponse> {
    return service
      .get('/api/agents/group', { params })
      .then(res => res.data)
      .catch(handleError)
  },
  create(data: AgentInfoRequest): Promise<RawAgentInfo> {
    return service
      .post('/api/agents', data)
      .then(res => res.data)
      .catch(handleError)
  },
  update(agent_id: RawAgentInfo['agent_id'], data: AgentInfoRequest) {
    return service
      .put(`/api/agents/${agent_id}`, data)
      .then(res => res.data)
      .catch(handleError)
  },
  delete(agent_id: RawAgentInfo['agent_id']) {
    return service.delete(`/api/agents/${agent_id}`).catch(handleError)
  },
  models: {
    list(agent_id: RawAgentInfo['agent_id']): Promise<AgentModelResponse> {
      return service
        .get(`/api/agents/${agent_id}/models`)
        .then(res => res.data)
        .catch(handleError)
    },
    batch(data: { agent_id: RawAgentInfo['agent_id']; models: RawAgentModelRequest[] }) {
      return service
        .post('/api/agents/models/batch', data)
        .then(res => res.data)
        .catch(handleError)
    },
    create(agent_id: RawAgentInfo['agent_id'], data: RawAgentModelRequest) {
      return service
        .get(`/api/agents/${agent_id}/models`, { params: data })
        .then(res => res.data)
        .catch(handleError)
    },
    update(agent_id: RawAgentInfo['agent_id'], model_id: number, data: RawAgentModelRequest) {
      return service
        .put(`/api/agents/${agent_id}/models/${model_id}`, { params: data })
        .then(res => res.data)
        .catch(handleError)
    },
    delete(agent_id: RawAgentInfo['agent_id'], model_id: number) {
      return service
        .delete(`/api/agents/${agent_id}/models/${model_id}`)
        .then(res => res.data)
        .catch(handleError)
    },
  },
}

export default agentsApi
