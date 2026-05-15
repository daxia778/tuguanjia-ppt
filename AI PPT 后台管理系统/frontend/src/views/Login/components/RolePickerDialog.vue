<template>
  <Teleport to="body">
    <transition @enter="enter" @leave="leave" :css="false">
      <div v-if="visible" class="role-picker-overlay">
        <div class="role-picker-card" ref="card">
          <!-- Header -->
          <div class="rp-header">
            <div class="rp-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2>欢迎回来，{{ nickname }}</h2>
            <p>请选择你想要进入的工作区</p>
          </div>

          <!-- Cards -->
          <div class="rp-grid">
            <!-- Admin Dashboard -->
            <button class="rp-option" @click="goAdmin" ref="optionAdmin">
              <div class="rp-option-icon admin-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3>管理面板</h3>
              <p>查看数据、管理用户与系统配置</p>
            </button>

            <!-- User Frontend -->
            <button class="rp-option" @click="goUser" ref="optionUser">
              <div class="rp-option-icon user-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3>创建 PPT</h3>
              <p>进入工作台，体验 AI 生成演示文稿</p>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import gsap from 'gsap'

defineOptions({ name: 'RolePickerDialog' })

const props = defineProps<{
  visible: boolean
  nickname: string
  redirectPath?: string  // 用户前端的来源 redirect
}>()

const emit = defineEmits<{
  (e: 'go-admin'): void
  (e: 'go-user', redirect: string): void
}>()

const card = ref<HTMLElement>()
const optionAdmin = ref<HTMLElement>()
const optionUser = ref<HTMLElement>()

function enter(el: Element, done: () => void) {
  // Overlay fade
  gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
  // Card slide up
  nextTick(() => {
    if (card.value) {
      gsap.fromTo(card.value,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.3)', delay: 0.1 }
      )
    }
    // Stagger options
    const options = [optionAdmin.value, optionUser.value].filter(Boolean)
    if (options.length) {
      gsap.fromTo(options,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.3, onComplete: done }
      )
    } else {
      done()
    }
  })
}

function leave(el: Element, done: () => void) {
  gsap.to(el, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: done })
}

function goAdmin() {
  emit('go-admin')
}

function goUser() {
  emit('go-user', props.redirectPath || '/')
}
</script>

<style scoped>
.role-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.role-picker-card {
  width: 520px;
  max-width: 90vw;
  background: rgba(15, 15, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.rp-header {
  text-align: center;
  margin-bottom: 32px;
}

.rp-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.rp-avatar svg {
  width: 28px;
  height: 28px;
}

.rp-header h2 {
  color: #f1f5f9;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}

.rp-header p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.rp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.rp-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 20px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #e2e8f0;
}

.rp-option:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.rp-option-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.rp-option-icon svg {
  width: 24px;
  height: 24px;
}

.admin-icon {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.user-icon {
  background: linear-gradient(135deg, #fb542b, #ff151f);
  color: white;
}

.rp-option h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #f1f5f9;
}

.rp-option p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
}

.rp-option:hover h3 {
  color: white;
}

.rp-option:hover .admin-icon {
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.5);
}

.rp-option:hover .user-icon {
  box-shadow: 0 4px 16px rgba(251, 84, 43, 0.5);
}

@media (max-width: 480px) {
  .rp-grid {
    grid-template-columns: 1fr;
  }
  .role-picker-card {
    padding: 28px;
  }
}
</style>
