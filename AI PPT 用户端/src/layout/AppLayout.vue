<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header" :class="{ scrolled: isScrolled }">
      <div class="header-inner container">
        <!-- Logo -->
        <router-link to="/" class="logo" id="header-logo">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#brave-gradient)" />
              <path d="M8 9h12M8 14h8M8 19h10" stroke="white" stroke-width="2.5" stroke-linecap="round" />
              <defs>
                <linearGradient id="brave-gradient" x1="0" y1="0" x2="28" y2="28">
                  <stop stop-color="#fb542b" />
                  <stop offset="1" stop-color="#ff151f" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text">AIPPT</span>
        </router-link>

        <!-- Navigation -->
        <nav class="header-nav" id="main-nav">
          <router-link to="/" class="nav-link" active-class="active" :class="{ active: $route.path === '/' }">首页</router-link>
          <router-link to="/generate" class="nav-link" active-class="active">创建</router-link>
          <router-link to="/history" class="nav-link" active-class="active">历史</router-link>
        </nav>

        <!-- Right Side -->
        <div class="header-actions">
          <template v-if="userStore.isLoggedIn">
            <div class="points-badge badge badge-brand" id="points-display">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>{{ userStore.displayPoints }}</span>
            </div>
            <!-- 管理员专属：面板切换按钮 -->
            <button v-if="userStore.isAdmin" class="btn btn-admin-switch" @click="openAdminPanel" title="管理面板" id="admin-switch-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              管理面板
            </button>
            <div class="user-menu" @click="toggleDropdown" id="user-menu-toggle">
              <div class="user-avatar">
                {{ userStore.userInfo?.nickname?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <!-- GSAP Dropdown -->
              <transition @enter="enterDropdown" @leave="leaveDropdown" :css="false">
                <div class="dropdown-menu modern-card" v-show="showDropdown" id="user-dropdown">
                  <div class="dropdown-header">
                    <span class="user-name">{{ userStore.userInfo?.nickname }}</span>
                    <span class="user-email">{{ userStore.userInfo?.email }}</span>
                  </div>
                  <div class="dropdown-divider"></div>
                  <router-link to="/profile" class="dropdown-item" @click="showDropdown = false">个人中心</router-link>
                  <button class="dropdown-item danger" @click="handleLogout" id="logout-btn">退出登录</button>
                </div>
              </transition>
            </div>
          </template>
          <template v-else>
            <a href="/admin/login?from=user" class="btn btn-ghost" id="login-link">登录</a>
            <a href="/admin/login?from=user&action=register" class="btn btn-primary" id="register-link">免费注册</a>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content with GSAP Page Transition -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition @enter="pageEnter" @leave="pageLeave" :css="false" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container footer-inner">
        <div class="footer-grid">
          <div class="footer-brand-col">
            <div class="footer-logo">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#brave-gradient)" />
                <path d="M8 9h12M8 14h8M8 19h10" stroke="white" stroke-width="2.5" stroke-linecap="round" />
              </svg>
              <span>AIPPT</span>
            </div>
            <p class="footer-desc">定义下一代演示文稿 AI 生产力标准。<br/>让灵感瞬间跃然屏上。</p>
            <div class="footer-social">
              <!-- WeChat -->
              <a href="#" class="social-link" title="微信公众号">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
              <!-- Weibo -->
              <a href="#" class="social-link" title="官方微博">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
              </a>
              <!-- Bilibili -->
              <a href="#" class="social-link" title="Bilibili 官方频道">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
              </a>
            </div>
          </div>
          <div class="footer-links-col">
            <h4>产品功能</h4>
            <a href="#">智能排版</a>
            <a href="#">模板库</a>
            <a href="#">数据图表</a>
            <a href="#">导出 PPTX</a>
          </div>
          <div class="footer-links-col">
            <h4>资源</h4>
            <a href="#">帮助中心</a>
            <a href="#">更新日志</a>
            <a href="#">使用教程</a>
            <a href="#">开发者 API</a>
          </div>
          <div class="footer-links-col">
            <h4>关于我们</h4>
            <a href="#">联系我们</a>
            <a href="#">服务条款</a>
            <a href="#">隐私政策</a>
            <a href="#">媒体合作</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 AIPPT. All rights reserved.</p>
          <div class="footer-locale">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>简体中文</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import gsap from 'gsap'

const userStore = useUserStore()
const router = useRouter()

const isScrolled = ref(false)
const showDropdown = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleLogout() {
  userStore.logout()
  showDropdown.value = false
  router.push('/')
}

/** 打开管理面板（同端口代理，同标签页） */
function openAdminPanel() {
  window.location.href = '/admin/'
}

// --- GSAP Animations ---

function enterDropdown(el: Element, done: () => void) {
  gsap.fromTo(el, 
    { y: -10, opacity: 0, transformOrigin: 'top right' },
    { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', onComplete: done }
  )
}

function leaveDropdown(el: Element, done: () => void) {
  gsap.to(el, { y: -5, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: done })
}

function pageEnter(el: Element, done: () => void) {
  gsap.fromTo(el,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', onComplete: done }
  )
}

function pageLeave(el: Element, done: () => void) {
  gsap.to(el, { y: -10, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Header */
.app-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: var(--z-header);
  height: var(--header-height);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
}

.app-header.scrolled {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: var(--border-subtle);
  box-shadow: var(--shadow-sm);
}

.header-inner {
  display: flex; align-items: center; justify-content: space-between; height: 100%;
}

.logo { display: flex; align-items: center; gap: var(--space-3); }
.logo-icon { display: flex; align-items: center; justify-content: center; }
.logo-text { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 800; letter-spacing: -0.5px; }

.header-nav { display: flex; gap: var(--space-8); position: absolute; left: 50%; transform: translateX(-50%); }
.nav-link { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); transition: color 0.2s; position: relative; padding: var(--space-2) 0; }
.nav-link:hover { color: var(--text-primary); }
.nav-link.active { color: var(--brand-orange); }

.header-actions { display: flex; align-items: center; gap: var(--space-4); }

/* User Menu & Points */
.user-menu { position: relative; cursor: pointer; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gradient-brave); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--text-sm); box-shadow: var(--shadow-sm); transition: transform 0.2s; }
.user-menu:hover .user-avatar { transform: scale(1.05); box-shadow: var(--shadow-md); }

.dropdown-menu { position: absolute; top: calc(100% + 12px); right: 0; width: 220px; padding: var(--space-2); z-index: var(--z-header); }
.dropdown-header { padding: var(--space-3); display: flex; flex-direction: column; }
.dropdown-header .user-name { font-weight: 700; font-size: var(--text-sm); color: var(--text-primary); }
.dropdown-header .user-email { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }

.dropdown-item { display: block; padding: var(--space-2) var(--space-3); font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary); border-radius: var(--radius-sm); transition: all 0.2s; text-decoration: none; width: 100%; text-align: left; }
.dropdown-item:hover { background: var(--bg-secondary); color: var(--text-primary); }
.dropdown-item.danger:hover { background: #fef2f2; color: #dc2626; }
.dropdown-divider { height: 1px; background: var(--border-color); margin: var(--space-2) 0; }

/* Admin Panel Switch Button */
.btn-admin-switch {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  font-size: 13px; font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-admin-switch:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.45);
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.app-main { min-height: calc(100vh - var(--header-height)); padding-top: var(--header-height); position: relative; z-index: 10; }

/* Footer */
.app-footer {
  background: #0f172a; /* Premium dark background */
  color: #94a3b8;
  padding: var(--space-20) 0 var(--space-8);
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--space-12);
  margin-bottom: var(--space-16);
}

.footer-brand-col {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--space-4);
}

.footer-logo span {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
}

.footer-desc {
  font-size: var(--text-sm);
  line-height: 1.6;
  margin-bottom: var(--space-6);
  max-width: 300px;
}

.footer-social {
  display: flex;
  gap: var(--space-4);
}

.social-link {
  color: #64748b;
  transition: color 0.2s;
}

.social-link:hover {
  color: white;
}

.footer-links-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.footer-links-col h4 {
  color: white;
  font-weight: 600;
  font-size: var(--text-sm);
  margin-bottom: var(--space-2);
}

.footer-links-col a {
  color: #94a3b8;
  font-size: var(--text-sm);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links-col a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--space-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
}

.footer-locale {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
  cursor: pointer;
  transition: color 0.2s;
}

.footer-locale:hover {
  color: white;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  .footer-bottom {
    flex-direction: column;
    gap: var(--space-4);
    align-items: flex-start;
  }
}
</style>
