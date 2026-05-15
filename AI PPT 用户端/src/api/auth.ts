import request from './request'

/** 邮箱 + 密码登录 */
export function login(email: string, password: string) {
  return request.post('/member/auth/login', { email, password })
}

/** 邮箱 + 密码注册 */
export function register(email: string, password: string) {
  return request.post('/member/auth/register', { email, password })
}

/** 登出 */
export function logout() {
  return request.post('/member/auth/logout')
}

/** 获取当前用户信息 */
export function getUserInfo() {
  return request.get('/member/user/get')
}
