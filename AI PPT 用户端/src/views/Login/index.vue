<template>
  <div class="auth-page">
    <div class="container auth-container">
      <router-link to="/" class="back-link" ref="backLink">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        返回首页
      </router-link>

      <div class="auth-card modern-card" ref="authCard">
        <!-- Left Branding Area -->
        <div class="auth-brand" ref="authBrand">
          <div class="brand-content">
            <div class="brand-logo" ref="brandLogo">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#brave-gradient)" />
                <path d="M8 9h12M8 14h8M8 19h10" stroke="white" stroke-width="2.5" stroke-linecap="round" />
                <defs>
                  <linearGradient id="brave-gradient" x1="0" y1="0" x2="28" y2="28">
                    <stop stop-color="#fb542b" />
                    <stop offset="1" stop-color="#ff151f" />
                  </linearGradient>
                </defs>
              </svg>
              <span>AIPPT</span>
            </div>
            <h1 class="brand-title" ref="brandTitle">欢迎回到<br/>你的智能工作台。</h1>
            <p class="brand-desc" ref="brandDesc">登录以继续创建专业的演示文稿，释放你的生产力。</p>
          </div>
        </div>

        <!-- Right Form Area -->
        <div class="auth-form-wrapper" ref="authFormWrapper">
          <div class="form-header" ref="formHeader">
            <h2>账号登录</h2>
            <p>请输入你的凭据以访问你的账号。</p>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form" id="login-form">
            <div class="form-group form-stagger">
              <label class="form-label" for="email">账号</label>
              <input
                id="email"
                v-model="email"
                type="text"
                class="input-field"
                placeholder="邮箱 或 用户名"
                required
                autocomplete="username"
              />
            </div>

            <div class="form-group form-stagger">
              <div class="label-row">
                <label class="form-label" for="password">密码</label>
                <a href="#" class="forgot-link">忘记密码？</a>
              </div>
              <div class="password-wrapper">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input-field pr-10"
                  placeholder="请输入密码"
                  required
                  autocomplete="current-password"
                />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                </button>
              </div>
            </div>

            <div class="form-group form-stagger">
              <label class="checkbox-label">
                <input type="checkbox" v-model="rememberMe" />
                <span class="checkmark"></span>
                <span>记住我</span>
              </label>
            </div>

            <transition name="fade">
              <div v-if="errorMsg" class="error-toast">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                {{ errorMsg }}
              </div>
            </transition>

            <button type="submit" class="btn btn-primary btn-lg btn-full form-stagger" :disabled="loading" id="login-submit">
              <svg v-if="loading" class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span>{{ loading ? '登录中...' : '登 录' }}</span>
            </button>
          </form>

          <div class="form-footer form-stagger">
            <p>还没有账号？ <router-link to="/register" class="link-brand">免费注册</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import gsap from 'gsap'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errorMsg = ref('')

// Refs for GSAP
const authCard = ref(null)
const backLink = ref(null)
const authBrand = ref(null)
const brandLogo = ref(null)
const brandTitle = ref(null)
const brandDesc = ref(null)
const formHeader = ref(null)
let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    const tl = gsap.timeline()
    
    // Card reveal
    tl.from(authCard.value, { 
      y: 40, opacity: 0, scale: 0.98, duration: 0.8, ease: 'power3.out' 
    })
    
    // Left branding
    .from([brandLogo.value, brandTitle.value, brandDesc.value], {
      x: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
    }, "-=0.4")
    
    // Right form header only (NOT form elements — to avoid invisible button bug)
    .from(formHeader.value, {
      y: 20, opacity: 0, duration: 0.6, ease: 'power2.out'
    }, "-=0.6")
    
    // Back link
    .from(backLink.value, {
      x: -15, opacity: 0, duration: 0.5, ease: 'power2.out'
    }, "-=0.6")
  })
})

onUnmounted(() => {
  ctx?.revert()
})

async function handleLogin() {
  if (!email.value || !password.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await userStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    errorMsg.value = e?.message || '登录失败，请检查邮箱和密码'
    console.error('Login failed:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  position: relative;
  background: var(--bg-tertiary);
  overflow-x: hidden;
}

.back-link {
  position: absolute;
  top: var(--space-6);
  left: var(--space-6);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: color 0.2s;
  z-index: 10;
}

.back-link:hover {
  color: var(--text-primary);
}

.auth-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.auth-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 480px;
  padding: 0;
  overflow: visible;
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
}

/* Left Branding */
.auth-brand {
  flex: 1;
  background: var(--text-primary);
  padding: var(--space-12);
  display: flex;
  flex-direction: column;
  position: relative;
  color: white;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-16);
}

.brand-logo span {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.brand-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: var(--space-4);
  letter-spacing: -1px;
  color: white;
}

.brand-desc {
  font-size: var(--text-base);
  color: var(--text-muted);
  line-height: 1.6;
}

/* Right Form */
.auth-form-wrapper {
  flex: 1;
  padding: var(--space-8) var(--space-10);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.form-header {
  margin-bottom: var(--space-5);
}

.form-header h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.form-header p {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: var(--text-sm);
  color: var(--brand-orange);
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.password-wrapper {
  position: relative;
}

.pr-10 {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  transition: color 0.2s;
}

.password-toggle:hover {
  color: var(--text-secondary);
}

/* Checkbox */
.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: var(--border-subtle);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkmark {
  background: var(--brand-orange);
  border-color: var(--brand-orange);
}

.checkbox-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.btn-full {
  width: 100%;
  margin-top: var(--space-2);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.form-footer {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.link-brand {
  color: var(--brand-orange);
  font-weight: 600;
}

.link-brand:hover {
  text-decoration: underline;
}

.error-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .auth-card {
    flex-direction: column;
  }
  .auth-brand {
    padding: var(--space-8);
  }
  .auth-form-wrapper {
    padding: var(--space-8);
  }
}
</style>
