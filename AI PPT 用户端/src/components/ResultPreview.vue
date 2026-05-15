<template>
  <div class="result-preview">
    <!-- Empty State -->
    <div v-if="state === 'idle'" class="preview-empty">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
      </div>
      <h3>准备就绪</h3>
      <p>在左侧上传素材或输入提示词以开始生成。</p>
    </div>

    <!-- Loading State -->
    <div v-else-if="state === 'loading'" class="preview-loading">
      <div class="loading-bar"><div class="loading-bar-fill" :style="{ width: progress + '%' }"></div></div>
      <h3 class="loading-title">AI 引擎正在运行</h3>
      <p class="loading-sub">{{ progressText }}</p>
    </div>

    <!-- Result State -->
    <div v-else-if="state === 'done' && slides.length" class="preview-done">
      <div class="result-header">
        <span class="badge-done"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 生成完成</span>
        <h3>{{ resultTitle }}</h3>
        <p class="result-meta">{{ slides.length }} 页 · {{ styleName }}</p>
      </div>

      <div class="slide-viewer">
        <div class="slide-canvas" :class="'theme-' + theme">
          <div class="slide-num">{{ current + 1 }} / {{ slides.length }}</div>
          <img v-if="slides[current]?.imageUrl" :src="slides[current].imageUrl" class="slide-img" />
          <template v-else>
            <h4 class="s-title">{{ slides[current]?.title }}</h4>
            <ul class="s-bullets" v-if="slides[current]?.content?.length">
              <li v-for="(b, i) in slides[current].content" :key="i">{{ b }}</li>
            </ul>
          </template>
        </div>
        <div class="slide-nav">
          <button class="nav-btn" :disabled="current === 0" @click="current--">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="nav-dots">
            <span v-for="(_, i) in slides" :key="i" class="dot" :class="{ active: i === current }" @click="current = i"></span>
          </div>
          <button class="nav-btn" :disabled="current >= slides.length - 1" @click="current++">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn btn-primary btn-lg action-full" @click="$emit('download')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          下载 PPTX
        </button>
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
  slides?: any[]
  resultTitle?: string
  styleName?: string
  theme?: string
  errorMsg?: string
}>()

defineEmits<{
  (e: 'download'): void
  (e: 'reset'): void
  (e: 'retry'): void
}>()

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

/* Loading */
.preview-loading { text-align: center; width: 100%; max-width: 400px; }
.loading-bar { height: 8px; background: var(--bg-tertiary); border-radius: 9999px; margin-bottom: var(--space-6); overflow: hidden; }
.loading-bar-fill { height: 100%; background: var(--gradient-brave); border-radius: 9999px; transition: width 0.3s; }
.loading-title { font-size: var(--text-lg); margin-bottom: var(--space-2); }
.loading-sub { font-size: var(--text-sm); color: var(--text-secondary); }

/* Done */
.preview-done { width: 100%; }
.result-header { margin-bottom: var(--space-4); }
.badge-done { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: var(--text-xs); font-weight: 600; border-radius: 9999px; margin-bottom: var(--space-2); }
.result-header h3 { font-size: var(--text-xl); line-height: 1.3; }
.result-meta { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }

/* Slide Viewer */
.slide-viewer { display: flex; flex-direction: column; gap: var(--space-3); }
.slide-canvas {
  border-radius: var(--radius-md); padding: var(--space-6);
  aspect-ratio: 16 / 10; display: flex; flex-direction: column;
  position: relative; overflow: hidden; border: 1px solid var(--border-color);
}
.slide-canvas:has(.slide-img) { padding: 0; }
.slide-img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md); }
.slide-canvas.theme-modern { background: #fafbfc; color: #1a1a2e; }
.slide-canvas.theme-dark { background: #1e1e2e; color: #e0e0e0; }
.slide-canvas.theme-vibrant { background: linear-gradient(135deg, #fff5f3 0%, #fff 100%); color: #111827; }

.slide-num {
  position: absolute; top: var(--space-3); right: var(--space-4);
  font-size: 11px; font-weight: 600; color: var(--text-muted);
  background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 9999px;
}
.s-title { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-3); padding-bottom: var(--space-2); border-bottom: 2px solid var(--brand-orange); display: inline-block; }
.s-bullets { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); padding: 0; }
.s-bullets li { font-size: var(--text-sm); line-height: 1.5; padding-left: 18px; position: relative; }
.s-bullets li::before { content: ''; position: absolute; left: 0; top: 7px; width: 6px; height: 6px; border-radius: 50%; background: var(--brand-orange); }

.slide-nav { display: flex; align-items: center; justify-content: center; gap: var(--space-3); }
.nav-btn {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  color: var(--text-secondary); transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) { background: var(--bg-tertiary); color: var(--text-primary); }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.nav-dots { display: flex; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-color); cursor: pointer; transition: all 0.2s; }
.dot.active { background: var(--brand-orange); transform: scale(1.3); }

.result-actions { margin-top: var(--space-4); }
.action-full { width: 100%; }
.action-full + .action-full { margin-top: var(--space-3); }

/* Error */
.preview-error { text-align: center; }
.err-icon { width: 64px; height: 64px; background: #fef2f2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-4); border-radius: 50%; }
.preview-error h3 { font-size: var(--text-xl); margin-bottom: var(--space-2); }
.preview-error p { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4); }
</style>
