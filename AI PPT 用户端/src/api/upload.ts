import request from './request'

/**
 * 上传文件到后端
 * 后端接口：POST /app-api/infra/file/upload  (multipart/form-data)
 * 返回：文件 URL
 */
export async function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const url: string = await request.post('/infra/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 大文件需要更长超时
      onUploadProgress: (e: any) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    return url
  } catch (err) {
    // 后端不可用时：返回本地 Object URL 作为 fallback
    console.warn('[Upload] 后端不可用，使用本地预览 URL fallback', err)
    return URL.createObjectURL(file)
  }
}

/**
 * 批量上传文件
 */
export async function uploadFiles(
  files: File[],
  onFileProgress?: (index: number, percent: number) => void
): Promise<string[]> {
  const urls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const url = await uploadFile(files[i], (p) => onFileProgress?.(i, p))
    urls.push(url)
  }
  return urls
}
