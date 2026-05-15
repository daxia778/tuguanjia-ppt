import request from '@/config/axios'

// AI 配置 VO
export interface AiConfigVO {
  id: number
  configKey: string
  configValue: string
  configType: string
  remark: string
}

// 连接测试参数
export interface TestConnectionReqVO {
  type: 'text' | 'image'
  url: string
  apiKey: string
}

// 获取所有 AI 配置
export const getAiConfigList = async () => {
  return await request.get({ url: '/ppt/ai-config/list' })
}

// 更新 AI 配置
export const updateAiConfig = async (data: AiConfigVO) => {
  return await request.put({ url: '/ppt/ai-config/update', data })
}

// 批量更新 AI 配置
export const batchUpdateAiConfig = async (data: AiConfigVO[]) => {
  return await request.put({ url: '/ppt/ai-config/batch-update', data })
}

// 测试 AI 接口连接（通过后端代理，避免 CORS 和 Key 泄漏）
export const testConnection = async (data: TestConnectionReqVO) => {
  return await request.post({ url: '/ppt/ai-config/test-connection', data })
}
