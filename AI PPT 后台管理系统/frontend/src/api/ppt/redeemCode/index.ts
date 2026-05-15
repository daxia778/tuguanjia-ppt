import request from '@/config/axios'

// 兑换码 VO
export interface RedeemCodeVO {
  id: number
  code: string
  points: number
  batchNo: string
  status: number
  usedBy: number
  usedTime: Date
  expireTime: Date
  remark: string
  creator: string
  createTime: Date
}

// 兑换码统计 VO
export interface RedeemCodeStatsVO {
  totalCount: number
  usedCount: number
  unusedCount: number
  expiredCount: number
  invalidatedCount: number
  usageRate: number
}

// 批量生成参数
export interface RedeemCodeGenerateReqVO {
  count: number
  points: number
  expireTime?: Date
  remark: string
}

// 查询兑换码分页
export const getRedeemCodePage = async (params: any) => {
  return await request.get({ url: '/ppt/redeem-code/page', params })
}

// 批量生成兑换码
export const generateRedeemCode = async (data: RedeemCodeGenerateReqVO) => {
  return await request.post({ url: '/ppt/redeem-code/generate', data })
}

// 作废兑换码
export const invalidateRedeemCode = async (id: number) => {
  return await request.put({ url: '/ppt/redeem-code/invalidate?id=' + id })
}

// 兑换码统计
export const getRedeemCodeStats = async () => {
  return await request.get({ url: '/ppt/redeem-code/statistics' })
}

// 导出兑换码
export const exportRedeemCode = (params: any) => {
  return request.download({ url: '/ppt/redeem-code/export-excel', params })
}
