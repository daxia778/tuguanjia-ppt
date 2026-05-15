import request from '@/config/axios'

// 积分账户 VO
export interface UserPointsVO {
  id: number
  userId: number
  balance: number
  totalEarned: number
  totalSpent: number
  createTime: Date
}

// 积分流水 VO
export interface PointsFlowVO {
  id: number
  userId: number
  userNickname: string // 用户昵称（冗余字段，避免 N+1 查询）
  flowType: number
  bizType: string
  bizId: string
  amount: number
  balanceAfter: number
  operator: string
  remark: string
  createTime: Date
}

// 积分调整参数
export interface PointsAdjustReqVO {
  userId: number
  amount: number
  remark: string
}

// 查询积分流水分页
export const getPointsFlowPage = async (params: any) => {
  return await request.get({ url: '/ppt/points-flow/page', params })
}

// 查询用户积分账户分页
export const getUserPointsPage = async (params: any) => {
  return await request.get({ url: '/ppt/user-points/page', params })
}

// 管理员调整积分
export const adjustUserPoints = async (data: PointsAdjustReqVO) => {
  return await request.put({ url: '/ppt/user-points/adjust', data })
}

// 导出积分流水
export const exportPointsFlow = (params: any) => {
  return request.download({ url: '/ppt/points-flow/export-excel', params })
}
