import axios from 'axios'

/**
 * Layer Studio 引擎 API
 * 本地开发：Vite 代理 /layer-api → localhost:5555/api
 */
const layer = axios.create({
  baseURL: '/layer-api',
  timeout: 180000,
})

// ── 类型定义 ──

export interface PipelineEvent {
  type: 'phase' | 'phase_info' | 'layer_done' | 'diag_result' | 'warning' | 'error' | 'done'
  step?: string
  message?: string
  detail?: string
  layer?: string
  url?: string          // layer_done 时的图层 URL
  elapsed_s?: number
  pptx_file?: string    // done 时的 PPTX 路径
  size_kb?: number
  [key: string]: any
}

export interface PipelineResult {
  pptxFile: string       // PPTX 下载路径 (e.g. /workspace/session_xxx/pptx_output.pptx)
  originalImage: string  // 原图路径
  elapsed: number        // 总耗时(秒)
  sizeKb: number
}

// ── Step 1: AI 生图 ──

/** 根据 prompt 生成 PPT 设计图 */
export async function generateImage(prompt: string): Promise<{ image: string; size: string }> {
  const { data } = await layer.post('/step1', { prompt })
  if (!data.success) throw new Error(data.error || '生成失败')
  return { image: data.image, size: data.size }
}

// ── 完整管线：Step1 生图 + 六层分离 + 自动组装 ──

/**
 * 运行 Layer Studio 完整管线
 * 1. POST /step1 生成原图
 * 2. POST /layer-separate (SSE) 六层分离 + 自动组装 PPTX
 *
 * @param prompt 用户创作指令
 * @param onEvent SSE 事件回调（实时推送进度）
 * @returns PPTX 文件信息
 */
export async function runFullPipeline(
  prompt: string,
  onEvent: (event: PipelineEvent) => void
): Promise<PipelineResult> {
  // ── Phase 1: 生成原图 ──
  onEvent({
    type: 'phase',
    step: 'step1',
    message: '🎨 AI 正在生成 PPT 设计图...',
    detail: '根据创作指令生成 16:9 横版 PPT 版式设计图',
  })

  let originalImage = ''
  try {
    const res = await generateImage(prompt)
    originalImage = res.image
    onEvent({
      type: 'layer_done',
      layer: 'original',
      url: originalImage,
      message: `✅ 原图生成完成 (${res.size})`,
    })
  } catch (err: any) {
    const errMsg = err?.response?.data?.error || err?.message || '生图失败'
    onEvent({ type: 'error', message: `❌ 原图生成失败: ${errMsg}` })
    throw new Error(`原图生成失败: ${errMsg}`)
  }

  // ── Phase 2: 六层分离 + 自动组装 (SSE) ──
  onEvent({
    type: 'phase',
    step: '0/5',
    message: '🔄 启动图层分离管线...',
    detail: '六层级联分离 + 文字/形状/像素提取 + PPTX 组装',
  })

  return new Promise<PipelineResult>((resolve, reject) => {
    // 使用 fetch 读取 SSE（因为需要 POST，EventSource 只支持 GET）
    fetch('/layer-api/layer-separate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(response => {
        if (!response.ok) {
          reject(new Error(`图层分离请求失败: HTTP ${response.status}`))
          return
        }
        const reader = response.body?.getReader()
        if (!reader) {
          reject(new Error('无法读取 SSE 流'))
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        function processChunk(chunk: string) {
          buffer += chunk
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留未完成的行

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const event: PipelineEvent = JSON.parse(line.slice(6))
              onEvent(event)

              if (event.type === 'done') {
                resolve({
                  pptxFile: event.pptx_file || '',
                  originalImage,
                  elapsed: event.elapsed_s || 0,
                  sizeKb: event.size_kb || 0,
                })
              }
              if (event.type === 'error') {
                reject(new Error(event.message || '管线执行失败'))
              }
            } catch {
              // 忽略解析失败的行
            }
          }
        }

        function read(): void {
          reader!.read().then(({ done, value }) => {
            if (done) {
              // 处理剩余 buffer
              if (buffer.trim()) processChunk('\n')
              return
            }
            processChunk(decoder.decode(value, { stream: true }))
            read()
          }).catch(err => {
            reject(new Error(`SSE 流读取中断: ${err.message}`))
          })
        }

        read()
      })
      .catch(err => {
        reject(new Error(`连接 Layer Studio 失败: ${err.message}`))
      })
  })
}

// ── 状态查询 ──

/** 检查 Layer Studio 是否在线 */
export async function isOnline(): Promise<boolean> {
  try {
    await layer.get('/status', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}
