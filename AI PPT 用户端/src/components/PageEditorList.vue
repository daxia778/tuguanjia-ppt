<template>
  <div class="page-editor-list">
    <div class="pe-header">
      <h3>页面编辑 <span class="pe-count">共 {{ pages.length }} 页</span></h3>
      <p class="pe-tip">左右滑动浏览，为每页添加 AI 二创指令。</p>
    </div>

    <!-- Horizontal scroll strip -->
    <div class="pe-strip" ref="strip">
      <div class="pe-card" v-for="(page, i) in pages" :key="i">
        <!-- Header -->
        <div class="pe-head">
          <span class="pe-badge">{{ i + 1 }}</span>
          <span class="pe-title">{{ titles?.[i] || '第 ' + (i+1) + ' 页' }}</span>
        </div>

        <!-- Original Preview -->
        <div class="pe-section">
          <div class="pe-label">原始页面</div>
          <div class="pe-img-wrap">
            <img :src="page.previewUrl" alt="" />
          </div>
        </div>

        <!-- Annotation -->
        <div class="pe-section">
          <div class="pe-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z"/></svg>
            AI 指令
          </div>
          <textarea
            v-model="page.annotation"
            class="input-field pe-note"
            placeholder="输入处理指令..."
            rows="2"
          ></textarea>
        </div>

        <!-- Output Snapshot -->
        <div class="pe-section pe-output-section">
          <div class="pe-label" :class="{ success: !!page.outputUrl }">
            <template v-if="page.outputUrl">✓ 输出结果</template>
            <template v-else>输出结果</template>
          </div>
          <div class="pe-img-wrap pe-out-wrap" v-if="page.outputUrl">
            <img :src="page.outputUrl" alt="" />
          </div>
          <div class="pe-out-empty" v-else-if="showOutput">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></svg>
            <span>等待生成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator dots -->
    <div class="pe-dots">
      <span v-for="(_, i) in pages" :key="i" class="pe-dot" :class="{ active: i === activeDot }" @click="scrollTo(i)"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface PageItem {
  previewUrl: string
  annotation: string
  outputUrl: string
}

defineProps<{
  pages: PageItem[]
  titles?: string[]
  showOutput?: boolean
}>()

const strip = ref<HTMLElement | null>(null)
const activeDot = ref(0)
let scrollHandler: (() => void) | null = null

onMounted(() => {
  if (!strip.value) return
  scrollHandler = () => {
    const el = strip.value!
    const cardW = el.scrollWidth / (el.children.length || 1)
    activeDot.value = Math.round(el.scrollLeft / cardW)
  }
  strip.value.addEventListener('scroll', scrollHandler, { passive: true })
})

onUnmounted(() => {
  if (strip.value && scrollHandler) strip.value.removeEventListener('scroll', scrollHandler)
})

function scrollTo(i: number) {
  if (!strip.value) return
  const card = strip.value.children[i] as HTMLElement
  if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
}
</script>

<style scoped>
.pe-header { margin-bottom: var(--space-4); }
.pe-header h3 { font-size: var(--text-lg); display: flex; align-items: center; gap: var(--space-2); }
.pe-count { font-size: var(--text-xs); font-weight: 700; color: var(--brand-orange); background: rgba(251,84,43,0.1); padding: 2px 10px; border-radius: 9999px; }
.pe-tip { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px; }

/* Horizontal Strip */
.pe-strip {
  display: flex;
  gap: var(--space-5);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 0;
  padding-bottom: var(--space-4);
  -webkit-overflow-scrolling: touch;
}
.pe-strip::-webkit-scrollbar { height: 6px; }
.pe-strip::-webkit-scrollbar-track { background: transparent; }
.pe-strip::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
.pe-strip::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Card */
.pe-card {
  flex: 0 0 280px;
  scroll-snap-align: start;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: box-shadow 0.2s, border-color 0.2s;
}
.pe-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(251, 84, 43, 0.2);
}

/* Head */
.pe-head { display: flex; align-items: center; gap: var(--space-2); }
.pe-badge {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--gradient-brave); color: white;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.pe-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }

/* Sections */
.pe-section { display: flex; flex-direction: column; gap: 6px; }
.pe-label {
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; gap: 4px;
}
.pe-label.success { color: #059669; }

/* Image */
.pe-img-wrap {
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.pe-img-wrap img {
  width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block;
}

/* Annotation */
.pe-note {
  resize: none; min-height: 52px; font-size: var(--text-xs); line-height: 1.5;
}

/* Output */
.pe-out-wrap { position: relative; }
.pe-out-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 6px; padding: var(--space-4) 0;
  color: var(--text-muted); font-size: var(--text-xs);
  border: 1px dashed var(--border-color); border-radius: var(--radius-sm);
  aspect-ratio: 16/10;
}

/* Dots */
.pe-dots {
  display: flex; justify-content: center; gap: 8px;
  margin-top: var(--space-2);
}
.pe-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--border-color); cursor: pointer;
  transition: all 0.2s;
}
.pe-dot.active { background: var(--brand-orange); transform: scale(1.3); }
.pe-dot:hover:not(.active) { background: var(--text-muted); }

@media (max-width: 640px) {
  .pe-card { flex: 0 0 240px; }
}
</style>
