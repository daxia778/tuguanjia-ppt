import request from './request'

// ─── PPT 任务 ───

export interface CreateTaskParams {
  title: string
  description?: string
  style: string
  pages: number
}

export interface TaskVO {
  taskNo: string
  title: string
  style: string
  pageCount: number
  pointsCost: number
  status: number     // 0=待生成 1=生成中 2=成功 3=失败
  errorMsg: string
  aiModel?: string
  generateDuration?: number
  slides?: any
  createTime: string
}

/** 创建 PPT 生成任务 */
export function createTask(data: CreateTaskParams) {
  return request.post('/ppt/task/create', data)
}

/** 查询任务状态 */
export function getTaskStatus(taskNo: string): Promise<TaskVO> {
  return request.get('/ppt/task/get', { params: { taskNo } })
}

/** 获取任务列表 */
export function getTaskList(): Promise<TaskVO[]> {
  return request.get('/ppt/task/list')
}

// ─── 积分 ───

export interface PointsBalance {
  balance: number
  totalEarned: number
  totalSpent: number
}

export interface PointsFlow {
  id: number
  userId: number
  flowType: number  // 1=收入 2=支出
  bizType: string   // REDEEM / GENERATE / REGISTER / REFUND
  bizId?: string
  amount: number
  balanceAfter: number
  remark: string
  createTime: string
}

/** 获取积分余额 */
export function getPointsBalance(): Promise<PointsBalance> {
  return request.get('/ppt/points/balance')
}

/** 获取积分流水 */
export function getPointsFlow(): Promise<PointsFlow[]> {
  return request.get('/ppt/points/flow')
}

// ─── 兑换码 ───

/** 使用兑换码 */
export function redeemCode(code: string) {
  return request.post('/ppt/redeem/use', { code })
}
