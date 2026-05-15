<template>
  <div :class="prefixCls" class="relative h-[100vh] w-full overflow-hidden bg-[#09090b]">
    <!-- GSAP Film Strips Background -->
    <div class="film-container absolute inset-0 w-[150vw] h-[150vh] left-[-25vw] top-[-25vh]">
      <!-- Column 1 (Scrolls Down) -->
      <div class="film-column column-down">
        <div v-for="i in 16" :key="`c1-${i}`" class="film-item" :style="{ backgroundColor: svgIcons[(i-1+0)%8].color }">
          <svg class="neo-svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><g v-html="svgIcons[(i-1+0)%8].path" /></svg>
        </div>
      </div>
      <!-- Column 2 (Scrolls Up) -->
      <div class="film-column column-up">
        <div v-for="i in 16" :key="`c2-${i}`" class="film-item" :style="{ backgroundColor: svgIcons[(i-1+2)%8].color }">
          <svg class="neo-svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><g v-html="svgIcons[(i-1+2)%8].path" /></svg>
        </div>
      </div>
      <!-- Column 3 (Scrolls Down) -->
      <div class="film-column column-down">
        <div v-for="i in 16" :key="`c3-${i}`" class="film-item" :style="{ backgroundColor: svgIcons[(i-1+4)%8].color }">
          <svg class="neo-svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><g v-html="svgIcons[(i-1+4)%8].path" /></svg>
        </div>
      </div>
      <!-- Column 4 (Scrolls Up) -->
      <div class="film-column column-up">
        <div v-for="i in 16" :key="`c4-${i}`" class="film-item" :style="{ backgroundColor: svgIcons[(i-1+6)%8].color }">
          <svg class="neo-svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><g v-html="svgIcons[(i-1+6)%8].path" /></svg>
        </div>
      </div>
      <!-- Column 5 (Scrolls Down) -->
      <div class="film-column column-down">
        <div v-for="i in 16" :key="`c5-${i}`" class="film-item" :style="{ backgroundColor: svgIcons[(i-1+1)%8].color }">
          <svg class="neo-svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><g v-html="svgIcons[(i-1+1)%8].path" /></svg>
        </div>
      </div>
    </div>

    <!-- Texture Overlay for Thick Line Elements -->
    <div class="texture-overlay absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-30"></div>

    <!-- Overlay to dim background and make form pop -->
    <div class="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>

    <!-- Main Content Wrapper -->
    <div class="relative z-20 h-full flex flex-col md:flex-row items-center justify-center lg:justify-between px-10 md:px-20 lg:px-32 gap-10">
      
      <!-- Left side Welcome Text -->
      <div class="hidden lg:flex flex-col text-white flex-1 min-w-0 mb-10 md:mb-0">
        <div class="flex items-center gap-5 mb-10">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600 via-violet-500 to-blue-500 border-[3px] border-black shadow-[4px_4px_0px_#000] relative overflow-hidden">
            <!-- Subtle inner glow -->
            <div class="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 rounded-2xl"></div>
            <svg viewBox="0 0 40 40" fill="none" class="w-10 h-10 relative z-10" xmlns="http://www.w3.org/2000/svg">
              <!-- Clean bold AI letterform -->
              <text x="20" y="28" text-anchor="middle" fill="white" font-size="20" font-weight="900" font-family="system-ui, -apple-system, sans-serif" letter-spacing="0">AI</text>
              <!-- Elegant sparkle top-right -->
              <path d="M32 6 L33 9 L36 10 L33 11 L32 14 L31 11 L28 10 L31 9 Z" fill="white" opacity="0.85"/>
              <!-- Small sparkle accent -->
              <path d="M8 8 L8.6 9.5 L10 10 L8.6 10.5 L8 12 L7.4 10.5 L6 10 L7.4 9.5 Z" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <span class="text-4xl font-black tracking-tight">AI PPT</span>
        </div>
        
        <TransitionGroup appear enter-active-class="animate__animated animate__fadeInUp" tag="div">
          <h1 key="1" class="text-6xl xl:text-8xl font-black mb-8 leading-tight tracking-tight">
            下一代<br/>智能演示平台
          </h1>
          <p key="2" class="text-lg font-medium mb-8 max-w-md leading-relaxed opacity-80">
            通过强大的AI引擎，一键生成极具设计感的演示文稿，让思想的传递更简单、更震撼。
          </p>
        </TransitionGroup>
      </div>

      <!-- Right side Login Box -->
      <div class="w-full min-w-[420px] max-w-[480px] flex-shrink-0">

        <Transition appear enter-active-class="animate__animated animate__zoomIn">
          <!-- Glassmorphism Card -->
          <div class="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <!-- Glow effects behind the card inside its overflow -->
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50"></div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50"></div>
            
            <div class="relative z-10">
              <!-- Mobile view Title -->
              <div class="lg:hidden flex items-center justify-center mb-8 text-white">
                <span class="text-2xl font-bold tracking-tight">AI PPT</span>
              </div>
              
              <!-- 账号登录 -->
              <LoginForm v-if="getLoginState === LoginStateEnum.LOGIN" />
              <!-- 手机登录 -->
              <MobileForm v-if="getLoginState === LoginStateEnum.MOBILE" />
              <!-- 二维码登录 -->
              <QrCodeForm v-if="getLoginState === LoginStateEnum.QR_CODE" />
              <!-- 注册 -->
              <RegisterForm v-if="getLoginState === LoginStateEnum.REGISTER" />
              <!-- 三方登录 -->
              <SSOLoginVue v-if="getLoginState === LoginStateEnum.SSO" />
              <!-- 忘记密码 -->
              <ForgetPasswordForm v-if="getLoginState === LoginStateEnum.RESET_PASSWORD" />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'
import gsap from 'gsap'

import { LoginForm, MobileForm, QrCodeForm, RegisterForm, SSOLoginVue, ForgetPasswordForm } from './components'
import { LoginStateEnum, useLoginState } from './components/useLogin'

defineOptions({ name: 'Login' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('login')
const { getLoginState } = useLoginState()

const svgIcons = [
  { name: 'sun', color: '#fbbf24', path: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>' },
  { name: 'computer', color: '#3b82f6', path: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
  { name: 'mobile', color: '#a855f7', path: '<rect x="5" y="2" width="14" height="20" rx="3"/><line x1="10" y1="18" x2="14" y2="18"/>' },
  { name: 'ppt', color: '#ef4444', path: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h4a2.5 2.5 0 0 1 0 5H8z"/><line x1="8" y1="13" x2="8" y2="17"/>' },
  { name: 'cloud', color: '#64748b', path: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 1 0 0-10z"/>' },
  { name: 'bolt', color: '#10b981', path: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  { name: 'clock', color: '#ec4899', path: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/>' },
  { name: 'rocket', color: '#06b6d4', path: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>' }
]

let ctx: gsap.Context

onMounted(() => {
  // GSAP Animations for Film Strip effect
  ctx = gsap.context(() => {
    // We tilt the whole container to create diagonal film strips
    gsap.set('.film-container', {
      rotation: -15,
      scale: 1.3,
      force3D: true
    })

    // Animate columns moving down (seamless loop: -50% to 0%)
    gsap.set('.column-down', { yPercent: -50 })
    gsap.to('.column-down', {
      yPercent: 0,
      ease: 'none',
      duration: 30,
      repeat: -1,
      force3D: true
    })

    // Animate columns moving up (seamless loop: 0% to -50%)
    gsap.set('.column-up', { yPercent: 0 })
    gsap.to('.column-up', {
      yPercent: -50,
      ease: 'none',
      duration: 35,
      repeat: -1,
      force3D: true
    })
  })
})

onUnmounted(() => {
  if (ctx) ctx.revert()
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.film-container {
  display: flex;
  gap: 2vw;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}

/* Rough texture overlay with thick diagonal lines */
.texture-overlay {
  background-image: repeating-linear-gradient(
    45deg,
    #000 0,
    #000 4px,
    transparent 4px,
    transparent 12px
  );
  background-size: 16px 16px;
}

.film-column {
  display: flex;
  flex-direction: column;
  gap: 2vw;
  width: 18vw;
}

.film-item {
  width: 100%;
  padding-bottom: 140%; /* aspect ratio */
  position: relative;
  /* Neo-brutalism thick borders and harsh shadows */
  border: 4px solid #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 12px 12px 0px rgba(0, 0, 0, 1);
  will-change: transform;
}

.neo-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  opacity: 0.95;
}

/* Glassmorphism with Neo-brutalism touch */
.glass-card {
  background: rgba(9, 9, 11, 0.55) !important;
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  /* Neo-brutalism thick border */
  border: 4px solid #000;
  box-shadow: 16px 16px 0px rgba(0, 0, 0, 1);
  color: #e2e8f0;
}

.light .glass-card {
  background: rgba(9, 9, 11, 0.55) !important;
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border: 4px solid #000;
  box-shadow: 16px 16px 0px rgba(0, 0, 0, 1);
  color: #e2e8f0;
}

:deep(.login-form .el-form-item__label) {
  color: #e2e8f0 !important;
}

.light :deep(.login-form .el-form-item__label) {
  color: #334155 !important;
}

</style>

<style lang="scss">
/* Login form styling for dark glass card */
.login-form {
  /* Input fields */
  .el-input__wrapper {
    background-color: rgba(255, 255, 255, 0.08) !important;
    border: 2px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    padding: 6px 16px !important;
    transition: border-color 0.2s ease;
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.3) !important;
    }
    &.is-focus {
      border-color: #7c3aed !important;
    }
  }
  
  .el-input__inner {
    color: #f1f5f9 !important;
    font-size: 15px;
    &::placeholder {
      color: rgba(255, 255, 255, 0.4) !important;
    }
  }
  
  .el-input__prefix .el-icon,
  .el-input__suffix .el-icon {
    color: rgba(255, 255, 255, 0.5) !important;
  }
  
  /* Checkbox */
  .el-checkbox__label {
    color: rgba(255, 255, 255, 0.7) !important;
  }
  
  /* Links */
  .el-link {
    color: rgba(255, 255, 255, 0.7) !important;
    &:hover {
      color: #a78bfa !important;
    }
  }

  /* Divider */
  .el-divider__text {
    background-color: transparent;
    color: rgba(255, 255, 255, 0.5);
  }
  .el-divider {
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  /* Card inside form */
  .el-card {
    background-color: transparent;
    border-color: rgba(255,255,255,0.1);
  }

  /* Other login buttons (手机登录, 二维码登录, 注册) */
  .el-button--default {
    background-color: rgba(255, 255, 255, 0.08) !important;
    border: 2px solid rgba(255, 255, 255, 0.15) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    border-radius: 12px !important;
    &:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
      color: #fff !important;
    }
  }

  /* Social login icons */
  .anticon, .iconify {
    color: rgba(255, 255, 255, 0.5) !important;
    &:hover {
      color: #a78bfa !important;
    }
  }
}
</style>
