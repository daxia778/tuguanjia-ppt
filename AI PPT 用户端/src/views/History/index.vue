<template>
  <div class="history-page">
    <div class="container">
      <div class="page-header" ref="header">
        <h1>生成历史</h1>
        <p>管理并下载你过去生成的所有演示文稿。</p>
      </div>

      <div class="history-list">
        <div class="history-item modern-card" v-for="(item, index) in historyItems" :key="item.id" ref="historyCards">
          <div class="item-preview" :style="{ background: item.previewBg }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="{ color: item.iconColor }"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </div>
          <div class="item-info">
            <h3>{{ item.title }}</h3>
            <div class="item-meta">
              <span class="status-indicator" :class="item.statusType">
                <span class="status-dot"></span> {{ item.status }}
              </span>
              <span class="meta-divider">•</span>
              <span class="meta-text">{{ item.pages }} 页</span>
              <span class="meta-divider">•</span>
              <span class="meta-text">{{ item.style }}</span>
              <span class="meta-divider">•</span>
              <span class="meta-time">{{ item.time }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-secondary" v-if="item.statusType === 'success'" @click="handleDownload(item.id)">
              下 载
            </button>
            <button class="btn btn-ghost" v-else disabled>
              处理中...
            </button>
            <button class="action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>

        <div v-if="!historyItems.length" class="empty-state modern-card" ref="emptyState">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3>暂无生成记录</h3>
          <p>开始创建你的第一份 AI 演示文稿，记录将显示在这里。</p>
          <router-link to="/generate" class="btn btn-primary mt-4">前往创建</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as pptApi from '@/api/ppt'
import { generatePptx } from '@/utils/pptx'
import gsap from 'gsap'

const header = ref(null)
const historyCards = ref([])
const emptyState = ref(null)
let ctx: gsap.Context

/** 下载 PPTX */
async function handleDownload(taskNo: string) {
  try {
    const task = await pptApi.getTaskStatus(taskNo)
    if (!task.slides) {
      alert('该任务暂无可下载内容')
      return
    }
    generatePptx(task.slides, task.style || 'modern')
  } catch (err: any) {
    console.error('[History] 下载失败:', err)
    alert('下载失败: ' + (err?.message || '未知错误'))
  }
}

interface HistoryItem {
  id: string
  title: string
  pages: number
  style: string
  status: string
  statusType: string
  time: string
  previewBg: string
  iconColor: string
}

const historyItems = ref<HistoryItem[]>([])
const loading = ref(true)

const styleMap: Record<string, { label: string; bg: string; color: string }> = {
  modern: { label: '极简商务', bg: '#eff6ff', color: '#3b82f6' },
  dark: { label: '深邃暗黑', bg: '#f3f4f6', color: '#111827' },
  vibrant: { label: '炫彩科技', bg: '#fff1f2', color: '#ff151f' },
}

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待生成', type: 'pending' },
  1: { label: '生成中', type: 'pending' },
  2: { label: '已完成', type: 'success' },
  3: { label: '失败', type: 'failed' },
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

async function fetchHistory() {
  loading.value = true
  try {
    const tasks = await pptApi.getTaskList()
    historyItems.value = tasks.map(t => {
      const s = styleMap[t.style] || styleMap.modern
      const st = statusMap[t.status] || statusMap[0]
      return {
        id: t.taskNo,
        title: t.title,
        pages: t.pageCount,
        style: s.label,
        status: st.label,
        statusType: st.type,
        time: relativeTime(t.createTime),
        previewBg: s.bg,
        iconColor: s.color,
      }
    })
  } catch {
    // Empty state
  }
  loading.value = false
}

onMounted(async () => {
  await fetchHistory()

  ctx = gsap.context(() => {
    const tl = gsap.timeline()
    
    tl.from(header.value, { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
    
    if (historyItems.value.length > 0) {
      tl.from(historyCards.value, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      }, "-=0.3")
    } else if (emptyState.value) {
      tl.from(emptyState.value, {
        y: 20, opacity: 0, duration: 0.6, ease: 'power2.out'
      }, "-=0.3")
    }
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.history-page { padding: var(--space-8) 0 var(--space-24); }

.page-header { margin-bottom: var(--space-10); }
.page-header h1 { font-size: var(--text-4xl); margin-bottom: var(--space-2); letter-spacing: -1px; }
.page-header p { font-size: var(--text-lg); color: var(--text-secondary); }

.history-list { display: flex; flex-direction: column; gap: var(--space-4); max-width: 900px; }

.history-item {
  display: flex; align-items: center; gap: var(--space-6); padding: var(--space-4) var(--space-6);
}

.item-preview {
  width: 64px; height: 48px; border-radius: var(--radius-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

.item-info { flex: 1; }
.item-info h3 { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-1); }
.item-meta { display: flex; align-items: center; flex-wrap: wrap; font-size: var(--text-sm); color: var(--text-secondary); }

.meta-divider { margin: 0 var(--space-2); color: var(--border-color); }
.meta-time { color: var(--text-muted); }

.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-weight: 500; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-indicator.success { color: #059669; }
.status-indicator.success .status-dot { background: #10b981; }
.status-indicator.pending { color: #d97706; }
.status-indicator.pending .status-dot { background: #f59e0b; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

.item-actions { flex-shrink: 0; display: flex; align-items: center; gap: var(--space-2); }
.action-icon { padding: 8px; color: var(--text-muted); border-radius: var(--radius-sm); transition: background 0.2s, color 0.2s; }
.action-icon:hover { background: var(--bg-secondary); color: var(--text-primary); }

.empty-state { text-align: center; padding: var(--space-20) 0; }
.empty-icon { width: 64px; height: 64px; background: var(--bg-secondary); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-6); border-radius: var(--radius-full); }
.empty-state h3 { font-size: var(--text-2xl); margin-bottom: var(--space-2); }
.empty-state p { color: var(--text-secondary); }
.mt-4 { margin-top: var(--space-4); }

@media (max-width: 768px) {
  .history-item { flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  .item-actions { width: 100%; justify-content: space-between; }
}
</style>
