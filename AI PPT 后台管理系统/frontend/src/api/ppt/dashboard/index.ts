import request from '@/config/axios'

// 仪表盘汇总数据 VO
export interface DashboardSummaryVO {
  todayNewUsers: number
  totalUsers: number
  todayGenerateCount: number
  totalPointsSpent: number
  todayRedeemCount: number
  totalPointsBalance: number
}

// 趋势数据 VO
export interface DashboardTrendVO {
  dates: string[]
  newUsers: number[]
  generateCount: number[]
  pointsSpent: number[]
  redeemCount: number[]
}

// 获取仪表盘汇总数据
export const getDashboardSummary = async () => {
  return await request.get({ url: '/ppt/dashboard/summary' })
}

// 获取趋势数据
export const getDashboardTrend = async (params: { days: number }) => {
  return await request.get({ url: '/ppt/dashboard/trend', params })
}
