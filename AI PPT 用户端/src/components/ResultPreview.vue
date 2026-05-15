<template>
  <div class="result-preview">
    <!-- Empty State -->
    <div v-if="state === 'idle'" class="preview-empty">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
      </div>
      <h3>准备就绪</h3>
      <p>输入创作指令，AI 引擎将自动完成全套 PPT 生成流程。</p>
    </div>

    <!-- Loading State — 管线进度 -->
    <div v-else-if="state === 'loading'" class="preview-loading">
      <!-- 进度条 -->
      <div class="loading-bar"><div class="loading-bar-fill" :style="{ width: progress + '%' }"></div></div>

      <!-- 当前步骤 -->
      <h3 class="loading-title">{{ stepTitle || 'AI 引擎启动中' }}</h3>
      <p class="loading-sub">{{ stepDetail || progressText }}</p>

      <!-- 已用时间 -->
      <p class="loading-elapsed" v-if="elapsedSec > 0">已用时 {{ formatTime(elapsedSec) }}</p>

      <!-- 已完成图层缩略图 -->
      <div class="layer-thumbs" v-if="completedLayers.length">
        <div class="layer-thumb" v-for="(l, i) in completedLayers" :key="i">
          <img :src="l.url" :alt="l.label" />
          <span class="layer-label">{{ l.label }}</span>
        </div>
      </div>

      <!-- 日志流 -->
      <div class="log-stream" v-if="logMessages.length">
        <p v-for="(msg, i) in logMessages.slice(-4)" :key="i" class="log-line">{{ msg }}</p>
      </div>
    </div>

    <!-- Result State — PPTX 完成 -->
    <div v-else-if="state === 'done'" class="preview-done">
      <div class="result-header">
        <span class="badge-done"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 生成完成</span>
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
      <div class="layer-thumbs done-thumbs" v-if="completedLayers.length">
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
import { ref } from 'vue'

defineProps<{
  state: 'idle' | 'loading' | 'done' | 'error'
  progress?: number
  progressText?: string
  // 管线进度增强
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

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}

const current = ref(0)

defineExpose({ current })
</script>

<style scoped>
.result-preview {
  flex: 1; display: flex;
  align-items: center; justify-content: center;
  background: var(--bg-secondary); padding: var(--space-8);
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

/* Loading — 管线进度 */
.preview-loading { text-align: center; width: 100%; max-width: 440px; }
.loading-bar { height: 8px; background: var(--bg-tertiary); border-radius: 9999px; margin-bottom: var(--space-5); overflow: hidden; }
.loading-bar-fill { height: 100%; background: var(--gradient-brave); border-radius: 9999px; transition: width 0.4s ease; }
.loading-title { font-size: var(--text-lg); margin-bottom: var(--space-2); color: var(--text-primary); }
.loading-sub { font-size: var(--text-sm); color: var(--text-secondary); min-height: 20px; }
.loading-elapsed { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-2); }

/* 图层缩略图 */
.layer-thumbs {
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
  margin-top: var(--space-4); padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}
.layer-thumb {
  width: 56px; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.layer-thumb img {
  width: 56px; height: 36px; object-fit: cover; border-radius: 4px;
  border: 1px solid var(--border-color);
}
.layer-label { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
.done-thumbs { margin-top: var(--space-3); }

/* 日志流 */
.log-stream {
  margin-top: var(--space-3); padding: var(--space-3);
  background: rgba(0,0,0,0.03); border-radius: var(--radius-sm);
  text-align: left; max-height: 80px; overflow: hidden;
}
.log-line {
  font-size: 11px; color: var(--text-muted); line-height: 1.5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.log-line:last-child { color: var(--text-secondary); }

/* Done */
.preview-done { width: 100%; }
.result-header { margin-bottom: var(--space-4); }
.badge-done { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: var(--text-xs); font-weight: 600; border-radius: 9999px; margin-bottom: var(--space-2); }
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

/* Error */
.preview-error { text-align: center; }
.err-icon { width: 64px; height: 64px; background: #fef2f2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); border-radius: 50%; }
.preview-error h3 { font-size: var(--text-xl); margin-bottom: var(--space-2); }
.preview-error p { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4); }
</style>
