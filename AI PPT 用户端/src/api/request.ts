import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

const request: AxiosInstance = axios.create({
  baseURL: '/app-api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 读取 token：优先用户前端的，其次管理系统的 ACCESS_TOKEN
    let token = localStorage.getItem('token')
    if (!token) {
      const admin = localStorage.getItem('ACCESS_TOKEN')
      if (admin) {
        try {
          const parsed = JSON.parse(admin)
          token = typeof parsed === 'object' ? (parsed.c || '') : String(parsed)
        } catch { token = admin }
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    // ruoyi-vue-pro standard response format: { code: 0, data: ..., msg: '' }
    if (data.code === 0) {
      return data.data
    }
    // Token expired
    if (data.code === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login?from=user'
      return Promise.reject(new Error('登录已过期'))
    }
    return Promise.reject(new Error(data.msg || '请求失败'))
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default request
