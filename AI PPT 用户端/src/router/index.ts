import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// ── 读取管理系统的共享 Token（同源 localStorage）──
function getSharedToken(): string {
  // 1. 读自己的 token
  const own = localStorage.getItem('token')
  if (own) return own
  // 2. 读管理系统的 ACCESS_TOKEN（web-storage-cache 格式：{c: value, e: expiry}）
  const admin = localStorage.getItem('ACCESS_TOKEN')
  if (admin) {
    try {
      const parsed = JSON.parse(admin)
      return parsed.c || parsed
    } catch {
      return admin
    }
  }
  return ''
}

const routes: RouteRecordRaw[] = [
  // ── /login → 跳转到管理系统登录页（同端口，反向代理）──
  {
    path: '/login',
    name: 'Login',
    beforeEnter: (to) => {
      const redirect = (to.query.redirect as string) || '/'
      window.location.href = `/admin/login?from=user&redirect=${encodeURIComponent(redirect)}`
      return false // 阻止 Vue Router 继续
    },
    // 需要一个占位 component，否则 Vue Router 报错
    component: { template: '<div>Redirecting...</div>' },
    meta: { title: '登录', guest: true },
  },
  // ── /register → 跳转到管理系统注册页 ──
  {
    path: '/register',
    name: 'Register',
    beforeEnter: () => {
      window.location.href = '/admin/login?from=user&redirect=/&action=register'
      return false
    },
    component: { template: '<div>Redirecting...</div>' },
    meta: { title: '注册', guest: true },
  },
  {
    path: '/',
    component: () => import('@/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'generate',
        name: 'Generate',
        component: () => import('@/views/Generate/index.vue'),
        meta: { title: '生成 PPT', requiresAuth: true },
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/History/index.vue'),
        meta: { title: '生成历史', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile/index.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  // Set page title
  const title = to.meta.title as string
  document.title = title ? `${title} — AI PPT` : 'AI PPT'

  const token = getSharedToken()

  if (to.meta.requiresAuth && !token) {
    // 未登录 → 跳转到管理系统登录页（同端口代理）
    const redirect = to.fullPath
    window.location.href = `/admin/login?from=user&redirect=${encodeURIComponent(redirect)}`
    return
  }

  next()
})

export default router
