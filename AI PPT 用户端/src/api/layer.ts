import axios from 'axios'

/**
 * Layer Studio 引擎 API
 * 本地开发：Vite 代理 /layer-api → localhost:5555/api
 * 生产环境：替换为海外中转站地址
 */
const layer = axios.create({
  baseURL: '/layer-api',
  timeout: 180000, // AI 生图需要较长时间
})

// ── Step 1: AI 生图 ──

/** 根据 prompt 生成 PPT 设计图 */
export async function generateImage(prompt: string): Promise<{ image: string; size: string }> {
  const { data } = await layer.post('/step1', { prompt })
  if (!data.success) throw new Error(data.error || '生成失败')
  return { image: data.image, size: data.size }
}

/** 上传图片作为原图 */
export async function uploadImage(file: File): Promise<{ image: string; size: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await layer.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  if (!data.success) throw new Error(data.error || '上传失败')
  return { image: data.image, size: data.size }
}

// ── Pipeline: 全自动管线 ──

/** 一键执行完整管线（生图→分离→提取→组装） */
export async function runPipeline(prompt: string): Promise<{
  pptx: string
  totalTime: string
  elementsCount: number
  log: string[]
}> {
  const { data } = await layer.post('/pipeline', { prompt }, { timeout: 600000 })
  if (!data.success) throw new Error(data.error || '管线执行失败')
  return {
    pptx: data.pptx,
    totalTime: data.total_time,
    elementsCount: data.elements_count,
    log: data.log || [],
  }
}

// ── 状态查询 ──

/** 获取 Layer Studio 工作流状态 */
export async function getStatus(): Promise<any> {
  const { data } = await layer.get('/status')
  return data
}

/** 检查 Layer Studio 是否在线 */
export async function isOnline(): Promise<boolean> {
  try {
    await layer.get('/status', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}
