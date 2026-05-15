import request from '@/config/axios'

// PPT 任务 VO
export interface PptTaskVO {
  id: number
  taskNo: string
  userId: number
  title: string
  inputText: string
  style: string
  pageCount: number
  pointsCost: number
  status: number
  resultUrl: string
  errorMsg: string
  aiModel: string
  generateDuration: number // 生成耗时（秒）
  downloadCount: number    // 下载次数
  createTime: Date
}

// 查询 PPT 任务分页
export const getPptTaskPage = async (params: any) => {
  return await request.get({ url: '/ppt/task/page', params })
}

// 查询 PPT 任务详情
export const getPptTask = async (id: number) => {
  return await request.get({ url: '/ppt/task/get?id=' + id })
}

// 管理员重试任务
export const retryPptTask = async (id: number) => {
  return await request.post({ url: '/ppt/task/retry?id=' + id })
}
