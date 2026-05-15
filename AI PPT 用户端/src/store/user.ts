import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'
import * as pptApi from '@/api/ppt'

/**
 * 读取共享 Token（同源 localStorage）
 * 优先读用户前端自己的 token，再读管理系统的 ACCESS_TOKEN
 */
function getSharedToken(): string {
  const own = localStorage.getItem('token')
  if (own) return own
  // 管理系统 web-storage-cache 格式: {c: "token-value", e: expiryTimestamp}
  const admin = localStorage.getItem('ACCESS_TOKEN')
  if (admin) {
    try {
      const parsed = JSON.parse(admin)
      return typeof parsed === 'object' ? (parsed.c || '') : String(parsed)
    } catch {
      return admin
    }
  }
  return ''
}

export interface UserInfo {
  id: number
  nickname: string
  email: string
  avatar?: string
  points: number
  totalEarned?: number
  totalSpent?: number
  roles?: string[]       // 角色列表（admin / user）
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getSharedToken())
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const points = computed(() => userInfo.value?.points ?? 0)

  /** 管理员判定（后端角色 or mock admin） */
  const isAdmin = computed(() =>
    userInfo.value?.roles?.includes('admin') ||
    userInfo.value?.roles?.includes('super_admin') ||
    userInfo.value?.nickname === 'admin' ||
    false
  )

  /** 积分显示：管理员显示 ∞ */
  const displayPoints = computed(() =>
    isAdmin.value ? '∞' : String(userInfo.value?.points ?? 0)
  )

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('token', t)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    // 同时清理管理系统的 Token（同源共享）
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('REFRESH_TOKEN')
  }

  /** 登录 — 调用后端 /app-api/member/auth/login */
  async function login(email: string, password: string) {
    try {
      const data: any = await authApi.login(email, password)
      setToken(data.accessToken)
      await fetchUserInfo()
    } catch {
      // 后端不可用时 Mock 登录
      console.warn('[Mock] 后端不可用，使用 Mock 登录')
      setToken('mock-token-' + Date.now())
      const isAdminLogin = email === 'admin' || email === 'admin@test.com'
      setUserInfo({
        id: isAdminLogin ? 0 : 1,
        nickname: isAdminLogin ? 'admin' : (email.split('@')[0] || 'user'),
        email: isAdminLogin ? 'admin@system.local' : email,
        points: isAdminLogin ? 999999 : 200,
        totalEarned: isAdminLogin ? 999999 : 500,
        totalSpent: 0,
        roles: isAdminLogin ? ['admin', 'super_admin'] : ['user'],
      })
    }
    return true
  }

  /** 注册 — 调用后端 /app-api/member/auth/register */
  async function register(email: string, password: string) {
    const data: any = await authApi.register(email, password)
    setToken(data.accessToken)
    await fetchUserInfo()
    return true
  }

  /** 获取用户信息 + 积分余额 */
  async function fetchUserInfo() {
    try {
      const [info, balance]: any[] = await Promise.all([
        authApi.getUserInfo(),
        pptApi.getPointsBalance().catch(() => null),
      ])
      setUserInfo({
        id: info.id,
        nickname: info.nickname,
        email: info.email,
        points: balance?.balance ?? info.points ?? 0,
        totalEarned: balance?.totalEarned ?? 0,
        totalSpent: balance?.totalSpent ?? 0,
        roles: info.roles ?? [],
      })
    } catch {
      // 后端不可用时：如果有 mock token 则保留 mock 用户
      if (token.value.startsWith('mock-')) {
        if (!userInfo.value) {
          setUserInfo({ id: 1, nickname: 'admin', email: 'admin@test.com', points: 200, totalEarned: 500, totalSpent: 300 })
        }
      } else {
        clearAuth()
      }
    }
  }

  /** 刷新积分余额 */
  async function refreshPoints() {
    try {
      const balance: any = await pptApi.getPointsBalance()
      if (userInfo.value) {
        userInfo.value.points = balance.balance
        userInfo.value.totalEarned = balance.totalEarned
        userInfo.value.totalSpent = balance.totalSpent
      }
    } catch {
      // ignore
    }
  }

  /** 登出 */
  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    clearAuth()
  }

  // 页面加载时，如果有 token 则自动获取用户信息
  if (token.value) {
    fetchUserInfo()
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    points,
    displayPoints,
    setToken,
    setUserInfo,
    logout,
    login,
    register,
    fetchUserInfo,
    refreshPoints,
  }
})
