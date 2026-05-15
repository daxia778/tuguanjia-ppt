<template>
  <div class="generate-page">
    <div class="container">
      <div class="page-header" ref="header">
        <h1>创建演示文稿</h1>
        <p>上传参考素材或输入创作指令，AI 将为你智能生成专业 PPT。</p>
      </div>

      <!-- Mode Tabs -->
      <div class="mode-tabs" ref="modeTabs">
        <button class="mode-tab" :class="{ active: mode === 'single' }" @click="switchMode('single')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg>
          单页创建
        </button>
        <button class="mode-tab" :class="{ active: mode === 'full' }" @click="switchMode('full')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
          全套创建
        </button>
      </div>

      <!-- ═══════ SINGLE PAGE MODE ═══════ -->
      <div v-if="mode === 'single'" class="generate-layout">
        <div class="input-panel">
          <div class="modern-card input-card">
            <div class="card-label"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> 参考素材（选填）</div>
            <UploadZone ref="uploadRef" accept="image/*" @update="onImgUpdate" />
          </div>
          <div class="modern-card input-card">
            <div class="card-label"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 创作指令 <span class="required">*</span></div>
            <textarea v-model="prompt" class="input-field prompt-area" placeholder="描述这一页的内容，如：封面页，标题为2026年AI行业报告..." rows="5" id="ppt-prompt"></textarea>
            <div class="option-row">
              <label class="option-label">视觉风格</label>
              <div class="style-pills">
                <button v-for="s in styleOptions" :key="s.value" type="button" class="style-pill" :class="{ active: style === s.value }" @click="style = s.value">
                  <span class="style-dot" :style="{ background: s.color }"></span>{{ s.label }}
                </button>
              </div>
            </div>
            <div class="submit-row">
              <div class="cost-info"><span class="cost-badge"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 2v7.5"/><path d="m19 5-5.23 5.23"/></svg> 10 积分</span><span class="cost-balance">余额 {{ userStore.points }}</span></div>
              <button class="btn btn-primary btn-lg" :disabled="sGenerating || !prompt" @click="handleSingleGenerate" id="generate-submit">
                <svg v-if="sGenerating" class="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                {{ sGenerating ? '生成中...' : '立即生成' }}
              </button>
            </div>
          </div>
        </div>
        <div class="preview-col">
          <ResultPreview ref="sPreviewRef" :state="sPreviewState" :progress="sProgress" :progressText="sProgressText" :slides="sSlides" :resultTitle="prompt?.slice(0,30)" :styleName="currentStyleLabel" :theme="style" :errorMsg="sError" @download="handleSingleDownload" @reset="resetSingle" @retry="sError=''" />
        </div>
      </div>

      <!-- ═══════ FULL SET MODE ═══════ -->
      <div v-else class="full-layout">
        <!-- Workbench: Master-Detail Layout -->
        <SlideWorkbench
          ref="workbenchRef"
          :pages="fullPages"
          :titles="mockPageData.map(p => p.title)"
          @requestUpload="triggerFullUpload"
          @fileSelected="onFullFileSelected"
        />

        <!-- Bottom Action Bar -->
        <div class="full-actions" v-if="fullPages.length">
          <div class="full-actions-left">
            <div class="full-file-badge">
              <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:-2px;margin-right:3px"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>{{ fullFileName }}</span>
              <button class="ffb-clear" @click="clearFullPages">更换</button>
            </div>
            <div class="style-pills">
              <button v-for="s in styleOptions" :key="s.value" type="button" class="style-pill" :class="{ active: style === s.value }" @click="style = s.value">
                <span class="style-dot" :style="{ background: s.color }"></span>{{ s.label }}
              </button>
            </div>
          </div>
          <div class="full-actions-right">
            <span class="cost-badge"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 2v7.5"/><path d="m19 5-5.23 5.23"/></svg> {{ fullPages.length * 10 }} 积分</span>
            <button class="btn btn-primary btn-lg" :disabled="fullGenerating" @click="handleFullGenerate" id="full-generate-btn">
              <svg v-if="fullGenerating" class="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ fullGenerating ? `生成中 (${fullDoneCount}/${fullPages.length})...` : '全套生成' }}
            </button>
            <button v-if="fullGenerated" class="btn btn-primary btn-lg" @click="handleFullDownload">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              下载 PPTX
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { generatePptx } from '@/utils/pptx'
import gsap from 'gsap'
import UploadZone from '@/components/UploadZone.vue'
import ResultPreview from '@/components/ResultPreview.vue'
import SlideWorkbench from '@/components/SlideWorkbench.vue'
import type { PageItem } from '@/components/SlideWorkbench.vue'

const userStore = useUserStore()

// ── Shared ──
const mode = ref<'single'|'full'>('single')
const style = ref('modern')
const styleOptions = [
  { value: 'modern', label: '极简商务', color: '#3b82f6' },
  { value: 'dark', label: '深邃暗黑', color: '#111827' },
  { value: 'vibrant', label: '炫彩科技', color: '#fb542b' },
]
const currentStyleLabel = computed(() => styleOptions.find(s => s.value === style.value)?.label || '')

function switchMode(m: 'single'|'full') {
  mode.value = m
  // 切换到全套时预填充 5 页 mock 数据
  if (m === 'full' && !fullPages.value.length) {
    prefillMockPages()
  }
}

// ── GSAP ──
const header = ref(null); const modeTabs = ref(null)
let ctx: gsap.Context
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(header.value, { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
    gsap.from(modeTabs.value, { y: 10, opacity: 0, duration: 0.5, delay: 0.15, ease: 'power2.out' })
  })
})
onUnmounted(() => { ctx?.revert() })

// ═══════════════════════════════════
//  SINGLE PAGE MODE
// ═══════════════════════════════════
const prompt = ref('')
const sGenerating = ref(false); const sGenerated = ref(false)
const sProgress = ref(0); const sError = ref('')
const sTask = ref<any>(null)
const sPreviewRef = ref<any>(null)
const uploadRef = ref(null)
const uploadedImgs = ref<File[]>([])

const sSlides = computed(() => sTask.value?.slides?.slides || [])
const sProgressText = computed(() => `正在生成... ${Math.round(sProgress.value)}%`)
const sPreviewState = computed(() => {
  if (sGenerating.value) return 'loading'
  if (sGenerated.value && sSlides.value.length) return 'done'
  if (sError.value) return 'error'
  return 'idle'
})

function onImgUpdate(files: File[]) { uploadedImgs.value = files }

async function handleSingleGenerate() {
  if (!prompt.value) return
  sGenerating.value = true; sProgress.value = 0; sGenerated.value = false; sError.value = ''; sTask.value = null
  if (sPreviewRef.value) sPreviewRef.value.current = 0
  gsap.to(sProgress, { value: 100, duration: 3, ease: 'power1.inOut' })
  await new Promise(r => setTimeout(r, 2500))

  sTask.value = {
    slides: { title: prompt.value.slice(0,30), slides: [{
      title: prompt.value.slice(0,30),
      content: ['AI 驱动的智能内容生成','精准排版与配色优化','一键导出原生 PPTX 格式','支持多种视觉主题风格'],
      notes: '由 AI 自动生成'
    }]},
    pageCount: 1, style: style.value
  }
  sGenerating.value = false; sGenerated.value = true
}

function handleSingleDownload() {
  if (!sTask.value?.slides) return
  generatePptx(sTask.value.slides, style.value)
}
function resetSingle() { sGenerated.value = false; prompt.value = ''; sError.value = ''; sTask.value = null; sProgress.value = 0 }

// ═══════════════════════════════════
//  FULL SET MODE
// ═══════════════════════════════════
const fullPages = ref<PageItem[]>([])
const fullFileName = ref('')
const fullExtracting = ref(false)
const fullGenerating = ref(false)
const fullGenerated = ref(false)
const fullDoneCount = ref(0)
const workbenchRef = ref<any>(null)

function triggerFullUpload() {
  // Click the hidden file input inside SlideWorkbench
  workbenchRef.value?.$el?.querySelector('input[type=file]')?.click()
}
function onFullFileSelected(f: File) {
  onFileUpload(f)
}

const mockPageData = [
  { title: '封面页', color: '#e0e7ff', hint: '请保留主标题，优化背景配色为渐变蓝色' },
  { title: '目录页', color: '#fce7f3', hint: '调整为左右分栏布局，增加图标装饰' },
  { title: '数据分析', color: '#ecfdf5', hint: '将表格数据转换为可视化图表' },
  { title: '核心观点', color: '#fef3c7', hint: '突出关键数字，使用大号加粗字体' },
  { title: '总结页', color: '#f1f5f9', hint: '添加CTA行动号召和联系方式' },
]

function makeMockSvg(title: string, sub: string, bg: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" rx="4" fill="${bg}"/><text x="160" y="80" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="bold" fill="#334155">${title}</text><text x="160" y="108" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#64748b">${sub}</text></svg>`)}`
}

function makeOutputSvg(title: string, bg1: string, bg2: string, idx: number) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><defs><linearGradient id="og${idx}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="320" height="200" rx="4" fill="url(#og${idx})"/><text x="160" y="75" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="bold" fill="#0f172a">✓ ${title}</text><text x="160" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#475569">AI 优化完成 · ${currentStyleLabel.value}风格</text><rect x="60" y="120" width="200" height="4" rx="2" fill="#e2e8f0"/><rect x="60" y="120" width="200" height="4" rx="2" fill="#10b981"/><text x="160" y="148" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#94a3b8">排版 · 配色 · 字体 已全部优化</text></svg>`)}`
}

function prefillMockPages() {
  fullFileName.value = '2026年AI行业分析报告.pptx'
  const outColors = [['#dbeafe','#eff6ff'],['#fce7f3','#fff1f2'],['#d1fae5','#ecfdf5'],['#fef9c3','#fffbeb'],['#e2e8f0','#f8fafc']]
  fullPages.value = mockPageData.map((p, i) => ({
    previewUrl: makeMockSvg(p.title, `第 ${i+1} 页 · 原始内容`, p.color),
    annotation: p.hint,
    outputUrl: makeOutputSvg(p.title, outColors[i][0], outColors[i][1], i),
  }))
  fullGenerated.value = true
  fullDoneCount.value = 5
}

async function onFileUpload(f: File | null) {
  if (!f) return
  fullFileName.value = f.name
  fullExtracting.value = true
  await new Promise(r => setTimeout(r, 2000))
  const colors = ['#e0e7ff','#fce7f3','#ecfdf5','#fef3c7','#f1f5f9']
  fullPages.value = Array.from({ length: 5 }, (_, i) => ({
    previewUrl: makeMockSvg(`第 ${i+1} 页`, `从 ${f.name} 提取`, colors[i]),
    annotation: '',
    outputUrl: '',
  }))
  fullExtracting.value = false
  fullGenerated.value = false
}

async function handleFullGenerate() {
  fullGenerating.value = true; fullGenerated.value = false; fullDoneCount.value = 0
  const outColors = [['#dbeafe','#eff6ff'],['#fce7f3','#fff1f2'],['#d1fae5','#ecfdf5'],['#fef9c3','#fffbeb'],['#e2e8f0','#f8fafc']]
  for (let i = 0; i < fullPages.value.length; i++) {
    await new Promise(r => setTimeout(r, 1200))
    const title = mockPageData[i]?.title || `第 ${i+1} 页`
    fullPages.value[i].outputUrl = makeOutputSvg(title, outColors[i%5][0], outColors[i%5][1], i)
    fullDoneCount.value = i + 1
  }
  fullGenerating.value = false; fullGenerated.value = true
}

function handleFullDownload() {
  const slides = fullPages.value.map((p, i) => ({
    title: mockPageData[i]?.title || `第 ${i+1} 页`,
    content: [p.annotation || '由 AI 自动优化生成'],
    notes: p.annotation,
  }))
  generatePptx({ title: fullFileName.value.replace(/\.\w+$/,''), slides }, style.value)
}

function clearFullPages() {
  fullPages.value = []; fullFileName.value = ''; fullGenerated.value = false; fullDoneCount.value = 0
}
</script>

<style scoped>
.generate-page { padding: var(--space-8) 0 var(--space-24); }
.page-header { margin-bottom: var(--space-6); }
.page-header h1 { font-size: var(--text-4xl); margin-bottom: var(--space-2); letter-spacing: -1px; }
.page-header p { font-size: var(--text-lg); color: var(--text-secondary); }

/* Mode Tabs */
.mode-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-6); }
.mode-tab {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 10px 20px; font-size: var(--text-sm); font-weight: 600;
  color: var(--text-secondary); background: var(--bg-primary);
  border: 1px solid var(--border-color); border-radius: var(--radius-pill);
  transition: all 0.2s; cursor: pointer;
}
.mode-tab:hover { border-color: var(--text-muted); color: var(--text-primary); }
.mode-tab.active { background: var(--bg-secondary); border-color: var(--brand-orange); color: var(--brand-orange); }

/* ─── Single Mode ─── */
.generate-layout { display: flex; gap: var(--space-8); align-items: flex-start; }
.input-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-5); }
.preview-col { flex: 1; min-width: 0; position: sticky; top: calc(var(--header-height) + var(--space-6)); }
.input-card { padding: var(--space-6); }
.card-label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-3); }
.required { color: #ef4444; }
.prompt-area { resize: vertical; min-height: 120px; }
.option-row { margin-top: var(--space-4); }
.option-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-2); }
.style-pills { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.style-pill { padding: 6px 14px; font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-pill); background: var(--bg-primary); display: flex; align-items: center; gap: var(--space-2); transition: all 0.2s; cursor: pointer; }
.style-pill:hover { border-color: var(--text-muted); }
.style-pill.active { background: var(--bg-secondary); border-color: var(--brand-orange); color: var(--brand-orange); font-weight: 600; }
.style-dot { width: 10px; height: 10px; border-radius: 50%; }
.submit-row { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-5); padding-top: var(--space-5); border-top: 1px solid var(--border-color); }
.cost-info { display: flex; flex-direction: column; gap: 4px; }
.cost-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: rgba(251,84,43,0.1); color: var(--brand-orange); font-weight: 600; font-size: var(--text-xs); border-radius: var(--radius-sm); }
.cost-balance { font-size: var(--text-xs); color: var(--text-muted); }

/* ─── Full Set Mode ─── */
.full-layout { }
.full-actions {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: var(--space-4);
  margin-top: var(--space-5); padding: var(--space-4) var(--space-5);
  background: var(--bg-primary); border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}
.full-actions-left { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
.full-actions-right { display: flex; align-items: center; gap: var(--space-3); }
.full-file-badge { display: flex; align-items: center; gap: var(--space-2); padding: 6px 14px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-pill); font-size: var(--text-sm); font-weight: 600; }
.ffb-clear { margin-left: var(--space-2); font-size: var(--text-xs); color: var(--brand-orange); font-weight: 600; cursor: pointer; background: none; border: none; }
.ffb-clear:hover { text-decoration: underline; }

.spinner { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .generate-layout { flex-direction: column; }
  .preview-col { position: static; }
}
@media (max-width: 640px) {
  .submit-row, .full-submit { flex-direction: column; gap: var(--space-4); align-items: stretch; }
  .full-top-bar { flex-direction: column; align-items: flex-start; }
}
</style>
