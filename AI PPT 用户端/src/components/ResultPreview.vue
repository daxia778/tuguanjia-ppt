<template>
  <div class="result-preview">
    <!-- Empty State -->
    <div v-if="state === 'idle'" class="preview-empty">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
      </div>
      <h3>准备就绪</h3>
      <p>输入创作指令，AI 引擎将自动完成全套 PPT 生成流程。</p>
      <p class="hint-text">整个流程大约需要 5-7 分钟，请耐心等待</p>
    </div>

    <!-- Loading State — 管线进度 -->
    <div v-else-if="state === 'loading'" class="preview-loading">
      <!-- 步骤计数 + 百分比 -->
      <div class="step-header">
        <span class="step-counter" v-if="currentStep > 0">
          步骤 {{ currentStep }} / {{ totalSteps }}
        </span>
        <span class="step-percent">{{ Math.round(progress || 0) }}%</span>
      </div>

      <!-- 进度条 -->
      <div class="loading-bar">
        <div class="loading-bar-fill" :style="{ width: (progress || 0) + '%' }"></div>
      </div>

      <!-- 步骤节点指示器 -->
      <div class="step-dots">
        <div v-for="i in totalSteps" :key="i" class="step-dot"
          :class="{
            'dot-done': i < currentStep,
            'dot-active': i === currentStep,
            'dot-pending': i > currentStep
          }"
        >
          <span class="dot-icon" v-if="i < currentStep">✓</span>
          <span class="dot-icon" v-else-if="i === currentStep">
            <svg class="dot-spinner" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          </span>
          <span class="dot-icon" v-else>{{ i }}</span>
          <span class="dot-label">{{ stepNames[i - 1] }}</span>
        </div>
      </div>

      <!-- 当前步骤详情 -->
      <div class="step-info">
        <h3 class="loading-title">{{ stepTitle || 'AI 引擎启动中...' }}</h3>
        <p class="loading-sub">{{ stepDetail || '' }}</p>
      </div>

      <!-- 已用时间 + 预估剩余 -->
      <div class="time-info" v-if="elapsedSec > 0">
        <span class="time-elapsed">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          已用时 {{ formatTime(elapsedSec) }}
        </span>
        <span class="time-estimate" v-if="estimatedRemain > 0">
          · 预计还需 {{ formatTime(estimatedRemain) }}
        </span>
      </div>

      <!-- 已完成图层缩略图 -->
      <div class="layer-thumbs" v-if="completedLayers && completedLayers.length">
        <div class="layer-thumb" v-for="(l, i) in completedLayers" :key="i">
          <img :src="l.url" :alt="l.label" />
          <span class="layer-label">{{ l.label }}</span>
        </div>
      </div>

      <!-- 日志流 -->
      <div class="log-stream" v-if="logMessages && logMessages.length">
        <p v-for="(msg, i) in logMessages.slice(-3)" :key="i" class="log-line">{{ msg }}</p>
      </div>
    </div>

    <!-- Result State — PPTX 完成 -->
    <div v-else-if="state === 'done'" class="preview-done">
      <div class="result-header">
        <span class="badge-done">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          生成完成
        </span>
        <span class="badge-time" v-if="elapsedSec > 0">耗时 {{ formatTime(elapsedSec) }}</span>
        <h3>{{ resultTitle }}</h3>
        <p class="result-meta" v-if="pptxSizeKb">PPTX · {{ pptxSizeKb }}KB · {{ styleName }}</p>
      </div>

      <!-- 原图预览 -->
      <div class="slide-viewer" v-if="originalImageUrl">
        <div class="slide-canvas">
          <img :src="originalImageUrl" class="slide-img" />
        </div>
      </div>

      <!-- 已完成图层缩略图 -->
      <div class="layer-thumbs done-thumbs" v-if="completedLayers && completedLayers.length">
        <div class="layer-thumb" v-for="(l, i) in completedLayers" :key="i">
          <img :src="l.url" :alt="l.label" />
          <span class="layer-label">{{ l.label }}</span>
        </div>
      </div>

      <div class="result-actions">
        <a v-if="pptxFileUrl" :href="pptxFileUrl" download class="btn btn-primary btn-lg action-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          下载 PPTX
        </a>
        <button class="btn btn-ghost action-full" @click="$emit('reset')">创建新文稿</button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="state === 'error'" class="preview-error">
      <div class="err-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
      </div>
      <h3>生成失败</h3>
      <p>{{ errorMsg }}</p>
      <button class="btn btn-primary" @click="$emit('retry')">重新尝试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const TOTAL_STEPS = 7
const stepNames = ['生成原图', '背景分离', '前景生成', '元素分离', '文字提取', '形状分离', 'PPTX组装']

const props = defineProps<{
  state: 'idle' | 'loading' | 'done' | 'error'
  progress?: number
  progressText?: string
  // 管线进度
  currentStep?: number
  stepTitle?: string
  stepDetail?: string
  elapsedSec?: number
  completedLayers?: { url: string; label: string }[]
  logMessages?: string[]
  // 结果
  resultTitle?: string
  styleName?: string
  pptxFileUrl?: string
  pptxSizeKb?: number
  originalImageUrl?: string
  errorMsg?: string
  // 兼容旧版
  slides?: any[]
  theme?: string
}>()

defineEmits<{
  (e: 'download'): void
  (e: 'reset'): void
  (e: 'retry'): void
}>()

const totalSteps = TOTAL_STEPS

// 根据进度和步骤预估剩余时间
const estimatedRemain = computed(() => {
  const elapsed = props.elapsedSec || 0
  const pct = props.progress || 0
  if (elapsed < 5 || pct < 5) return 0 // 数据不足
  const totalEstimate = elapsed / (pct / 100)
  const remain = Math.ceil(totalEstimate - elapsed)
  return remain > 0 ? remain : 0
})

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}

const current = ref(0)
defineExpose({ current })
</script>

<style scoped>
.result-preview {
  flex: 1; display: flex;
  align-items: center; justify-content: center;
  background: var(--bg-secondary); padding: var(--space-6);
  border: 1px solid var(--border-color); border-radius: var(--radius-lg);
  transition: all 0.3s;
}

/* Empty */
.preview-empty { text-align: center; color: var(--text-muted); }
.empty-icon {
  width: 64px; height: 64px; background: white;
  border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto var(--space-4); border-radius: var(--radius-lg);
  color: var(--text-secondary);
}
.preview-empty h3 { font-size: var(--text-xl); margin-bottom: var(--space-2); color: var(--text-primary); }
.hint-text { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-2); }

/* ── Loading ── */
.preview-loading { text-align: center; width: 100%; max-width: 480px; }

/* 步骤计数头 */
.step-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: var(--space-2);
}
.step-counter {
  font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.step-percent {
  font-size: var(--text-sm); font-weight: 700; color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/* 进度条 */
.loading-bar { height: 6px; background: var(--bg-tertiary); border-radius: 9999px; overflow: hidden; margin-bottom: var(--space-4); }
.loading-bar-fill {
  height: 100%; border-radius: 9999px; transition: width 0.6s ease;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
  position: relative;
}
.loading-bar-fill::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 1.8s infinite;
}
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

/* 步骤节点指示器 */
.step-dots {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: var(--space-4); gap: 2px;
}
.step-dot {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  flex: 1; min-width: 0;
}
.dot-icon {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; transition: all 0.3s;
}
.dot-done .dot-icon { background: #10b981; color: white; }
.dot-active .dot-icon {
  background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}
.dot-pending .dot-icon { background: var(--bg-tertiary); color: var(--text-muted); }
.dot-label {
  font-size: 9px; color: var(--text-muted); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; max-width: 50px;
}
.dot-active .dot-label { color: #6366f1; font-weight: 600; }
.dot-done .dot-label { color: #10b981; }
.dot-spinner { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 步骤详情 */
.step-info { margin-bottom: var(--space-3); }
.loading-title { font-size: var(--text-base); margin-bottom: 4px; color: var(--text-primary); font-weight: 600; }
.loading-sub { font-size: var(--text-xs); color: var(--text-secondary); min-height: 16px; line-height: 1.4; }

/* 时间信息 */
.time-info {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3);
}
.time-elapsed { display: inline-flex; align-items: center; gap: 3px; }
.time-estimate { color: #6366f1; font-weight: 500; }

/* 图层缩略图 */
.layer-thumbs {
  display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
  margin-top: var(--space-3); padding-top: var(--space-3);
  border-top: 1px solid var(--border-color);
}
.layer-thumb {
  width: 48px; display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.layer-thumb img {
  width: 48px; height: 30px; object-fit: cover; border-radius: 3px;
  border: 1px solid var(--border-color);
}
.layer-label { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.done-thumbs { margin-top: var(--space-3); }

/* 日志流 */
.log-stream {
  margin-top: var(--space-3); padding: var(--space-2) var(--space-3);
  background: rgba(0,0,0,0.03); border-radius: var(--radius-sm);
  text-align: left; max-height: 64px; overflow: hidden;
}
.log-line {
  font-size: 10px; color: var(--text-muted); line-height: 1.6;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.log-line:last-child { color: var(--text-secondary); }

/* ── Done ── */
.preview-done { width: 100%; }
.result-header { margin-bottom: var(--space-4); }
.badge-done { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: var(--text-xs); font-weight: 600; border-radius: 9999px; margin-bottom: var(--space-2); }
.badge-time { display: inline-flex; padding: 4px 10px; background: #f0f0ff; color: #6366f1; font-size: var(--text-xs); font-weight: 500; border-radius: 9999px; margin-bottom: var(--space-2); margin-left: 6px; }
.result-header h3 { font-size: var(--text-xl); line-height: 1.3; }
.result-meta { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }

/* Slide Viewer */
.slide-viewer { display: flex; flex-direction: column; gap: var(--space-3); }
.slide-canvas {
  border-radius: var(--radius-md); padding: 0;
  aspect-ratio: 16 / 10; display: flex; flex-direction: column;
  position: relative; overflow: hidden; border: 1px solid var(--border-color);
}
.slide-img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md); }

.result-actions { margin-top: var(--space-4); }
.action-full { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
.action-full + .action-full { margin-top: var(--space-3); }

/* ── Error ── */
.preview-error { text-align: center; }
.err-icon { width: 64px; height: 64px; background: #fef2f2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); border-radius: 50%; }
.preview-error h3 { font-size: var(--text-xl); margin-bottom: var(--space-2); }
.preview-error p { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4); }
</style>
