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
            <h1 class="brand-title" ref="brandTitle">免费创建<br/>你的全新账号。</h1>
            <div class="features-list" ref="featuresList">
              <div class="feature-item">
                <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>注册即赠 30 个生成积分</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>解锁全部 500+ 高级版式</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>永久免费导出原生 PPTX</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Form Area -->
        <div class="auth-form-wrapper" ref="authFormWrapper">
          <div class="form-header" ref="formHeader">
            <h2>创建账号</h2>
            <p>只需几秒钟即可开始你的创作之旅。</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form" id="register-form">
            <div class="form-group form-stagger">
              <label class="form-label" for="nickname">昵称</label>
              <input
                id="nickname"
                v-model="nickname"
                type="text"
                class="input-field"
                placeholder="例如：Alex"
                required
                autocomplete="name"
              />
            </div>
            
            <div class="form-group form-stagger">
              <label class="form-label" for="email">电子邮箱</label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="input-field"
                placeholder="you@example.com"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group form-stagger">
              <label class="form-label" for="password">密码</label>
              <div class="password-wrapper">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input-field pr-10"
                  placeholder="至少包含 8 个字符"
                  required
                  autocomplete="new-password"
                />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                </button>
              </div>
              <!-- Simple password strength indicator -->
              <div class="password-strength" v-if="password">
                <div class="strength-bar" :class="strengthClass"></div>
                <span class="strength-text">{{ strengthText }}</span>
              </div>
            </div>

            <div class="form-group form-stagger">
              <label class="checkbox-label terms-label">
                <input type="checkbox" v-model="agreeTerms" required />
                <span class="checkmark"></span>
                <span>我同意 AIPPT 的 <a href="#" class="link-brand">服务条款</a> 和 <a href="#" class="link-brand">隐私政策</a></span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full form-stagger" :disabled="loading || !agreeTerms" id="register-submit">
              <svg v-if="loading" class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span>{{ loading ? '注册中...' : '免费注册' }}</span>
            </button>
          </form>

          <div class="form-footer form-stagger">
            <p>已有账号？ <router-link to="/login" class="link-brand">立即登录</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import gsap from 'gsap'

const router = useRouter()
const userStore = useUserStore()

const nickname = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const agreeTerms = ref(false)
const loading = ref(false)

// Refs for GSAP
const authCard = ref(null)
const backLink = ref(null)
const authBrand = ref(null)
const brandLogo = ref(null)
const brandTitle = ref(null)
const featuresList = ref(null)
const formHeader = ref(null)
let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    const tl = gsap.timeline()
    
    tl.from(authCard.value, { 
      y: 40, opacity: 0, scale: 0.98, duration: 0.8, ease: 'power3.out' 
    })
    
    .from([brandLogo.value, brandTitle.value], {
      x: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
    }, "-=0.4")
    
    .from(featuresList.value.children, {
      x: -15, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
    }, "-=0.4")
    
    .from(formHeader.value, {
      y: 20, opacity: 0, duration: 0.6, ease: 'power2.out'
    }, "-=0.6")
    .from(document.querySelectorAll('.form-stagger'), {
      y: 15, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out'
    }, "-=0.4")
    
    .from(backLink.value, {
      x: -15, opacity: 0, duration: 0.5, ease: 'power2.out'
    }, "-=0.6")
  })
})

onUnmounted(() => {
  ctx?.revert()
})

const strengthClass = computed(() => {
  const len = password.value.length
  if (len === 0) return ''
  if (len < 6) return 'weak'
  if (len < 10) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  const len = password.value.length
  if (len === 0) return ''
  if (len < 6) return '弱'
  if (len < 10) return '中等'
  return '强'
})

async function handleRegister() {
  if (!email.value || !password.value || !nickname.value || !agreeTerms.value) return
  loading.value = true
  try {
    await userStore.register(email.value, password.value, nickname.value)
    router.push('/')
  } catch (e) {
    console.error('Registration failed:', e)
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
  padding: var(--space-8) 0;
  position: relative;
  background: var(--bg-tertiary);
  overflow: hidden;
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
  min-height: 580px;
  padding: 0;
  overflow: hidden;
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
  margin-bottom: var(--space-8);
  letter-spacing: -1px;
  color: white;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: #cbd5e1;
}

.feature-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

/* Right Form */
.auth-form-wrapper {
  flex: 1;
  padding: var(--space-10) var(--space-12);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: var(--space-6);
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
  gap: var(--space-4);
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

.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--bg-tertiary);
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  transition: all 0.3s;
}

.strength-bar.weak::after { width: 33.33%; background: #ef4444; }
.strength-bar.medium::after { width: 66.66%; background: #eab308; }
.strength-bar.strong::after { width: 100%; background: #10b981; }

.strength-text {
  font-size: 11px;
  color: var(--text-muted);
  width: 24px;
  text-align: right;
}

/* Checkbox */
.checkbox-label {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.terms-label {
  line-height: 1.4;
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
  flex-shrink: 0;
  margin-top: 2px;
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
  margin-top: var(--space-6);
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
