<template>
  <div class="workbench">
    <!-- Sidebar: PPT-style -->
    <aside class="wb-side">
      <div class="side-scroll" ref="scrollEl">
        <template v-if="pages.length">
          <div v-for="(p, i) in pages" :key="i" :ref="el => thumbRefs[i] = el as HTMLElement"
            class="s-row" :class="{ active: i === current }" @click="goTo(i)">
            <span class="s-num">{{ i + 1 }}</span>
            <div class="s-card">
              <img :src="p.previewUrl" alt="" />
              <span v-if="p.outputUrl" class="s-check">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="s-row s-ghost" v-for="n in 5" :key="n">
            <span class="s-num s-num-ghost">{{ n }}</span>
            <div class="s-card s-card-ghost">
              <div class="sg-l sg-w1"></div>
              <div class="sg-l sg-w2"></div>
              <div class="sg-l sg-w3"></div>
            </div>
          </div>
        </template>
      </div>
    </aside>

    <!-- Main -->
    <main class="wb-body">
      <!-- Empty -->
      <div v-if="!pages.length" class="empty" @click="triggerUpload">
        <input ref="fileInput" type="file" accept=".pptx,.ppt,.pdf,.png,.jpg,.jpeg,.webp" hidden @change="onFileSelect" />
        <div class="empty-ring">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        </div>
        <p class="empty-t">上传文件开始创作</p>
        <p class="empty-s">PPT · PDF · 图片 &nbsp;|&nbsp; 最大 50MB</p>
      </div>

      <!-- Editor -->
      <div v-else class="editor" ref="editorEl">
        <header class="ed-top">
          <div class="ed-tag"><span class="ed-dot"></span>第 {{ current + 1 }} 页</div>
          <h2 class="ed-title">{{ titles?.[current] || '' }}</h2>
          <nav class="ed-nav">
            <button :disabled="current === 0" @click="goTo(current - 1)" class="nb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="nc">{{ current + 1 }} / {{ pages.length }}</span>
            <button :disabled="current >= pages.length - 1" @click="goTo(current + 1)" class="nb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </nav>
        </header>

        <section class="compare">
          <div class="cmp-col">
            <div class="cmp-label"><i class="dot dot-src"></i>原始</div>
            <div class="frm"><img :src="pages[current]?.previewUrl" /></div>
          </div>
          <div class="cmp-flow">
            <svg class="flow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 18 13 12 7 6"/><polyline points="13 18 19 12 13 6"/></svg>
          </div>
          <div class="cmp-col">
            <div class="cmp-label" :class="{ ok: !!pages[current]?.outputUrl }">
              <i class="dot" :class="pages[current]?.outputUrl ? 'dot-out' : 'dot-wait'"></i>
              {{ pages[current]?.outputUrl ? '生成结果' : '待生成' }}
            </div>
            <div class="frm" v-if="pages[current]?.outputUrl"><img :src="pages[current].outputUrl" /></div>
            <div class="frm frm-empty" v-else>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m3 16 5-5c.928-.893 2.072-.893 3 0l5 5"/></svg>
              <span>等待生成</span>
            </div>
          </div>
        </section>

        <section class="inst">
          <label class="inst-lb">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/></svg>
            创作指令
          </label>
          <textarea v-model="pages[current].annotation" class="input-field inst-ta" placeholder="描述优化要求，如：保留布局，替换配色为深蓝渐变..." rows="2"></textarea>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

export interface PageItem { previewUrl: string; annotation: string; outputUrl: string }

const props = defineProps<{ pages: PageItem[]; titles?: string[] }>()
const emit = defineEmits<{ (e: 'requestUpload'): void; (e: 'fileSelected', f: File): void }>()

const current = ref(0)
const scrollEl = ref<HTMLElement | null>(null)
const editorEl = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const thumbRefs = ref<(HTMLElement | null)[]>([])

// ── GSAP: Smooth scroll to active thumb ──
function goTo(i: number) {
  if (i < 0 || i >= props.pages.length) return
  const prev = current.value
  current.value = i

  nextTick(() => {
    const thumb = thumbRefs.value[i]
    const container = scrollEl.value
    if (!thumb || !container) return

    // Scroll sidebar smoothly
    const thumbTop = thumb.offsetTop - container.offsetTop
    const thumbH = thumb.offsetHeight
    const scrollTop = container.scrollTop
    const containerH = container.clientHeight

    if (thumbTop < scrollTop || thumbTop + thumbH > scrollTop + containerH) {
      gsap.to(container, {
        scrollTop: thumbTop - containerH / 2 + thumbH / 2,
        duration: 0.4, ease: 'power2.out'
      })
    }

    // Animate the card pop
    const card = thumb.querySelector('.s-card') as HTMLElement
    if (card) {
      gsap.fromTo(card, { scale: 0.95 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' })
    }

    // Animate editor content swap
    if (editorEl.value && prev !== i) {
      const dir = i > prev ? 1 : -1
      gsap.fromTo(editorEl.value,
        { opacity: 0.4, y: dir * 12 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      )
    }
  })
}

// ── GSAP: Entrance animation ──
onMounted(() => {
  if (scrollEl.value && props.pages.length) {
    gsap.from(scrollEl.value.children, {
      opacity: 0, x: -10, stagger: 0.04, duration: 0.35, ease: 'power2.out'
    })
  }
})

function triggerUpload() { fileInput.value?.click(); emit('requestUpload') }
function onFileSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) emit('fileSelected', f)
  if (fileInput.value) fileInput.value.value = ''
}

// Re-animate when pages change
watch(() => props.pages.length, (n, o) => {
  if (n > 0 && o === 0) {
    nextTick(() => {
      if (scrollEl.value) {
        gsap.from(scrollEl.value.children, {
          opacity: 0, x: -10, stagger: 0.05, duration: 0.35, ease: 'power2.out'
        })
      }
    })
  }
})

defineExpose({ current })
</script>

<style scoped>
.workbench {
  display: flex; border: 1px solid #e8ecf0; border-radius: 14px;
  overflow: hidden; background: #fff; min-height: 540px;
  box-shadow: 0 1px 2px rgba(0,0,0,.03), 0 4px 16px rgba(0,0,0,.025);
}

/* ━━━ Sidebar (PPT-native) ━━━ */
.wb-side {
  width: 148px; flex-shrink: 0;
  background: #f0f1f3;
  border-right: 1px solid #dcdfe3;
  display: flex; flex-direction: column;
}
.side-scroll {
  flex: 1; overflow-y: auto;
  padding: 8px 10px 8px 0;
  display: flex; flex-direction: column; gap: 6px;
}
.side-scroll::-webkit-scrollbar { width: 3px; }
.side-scroll::-webkit-scrollbar-track { background: transparent; }
.side-scroll::-webkit-scrollbar-thumb { background: #c0c4cc; border-radius: 1px; }

/* Slide row */
.s-row {
  display: flex; align-items: center; gap: 0;
  padding: 3px 4px 3px 0;
  cursor: pointer; position: relative;
}
.s-row:hover .s-card { border-color: #b0b6c0; }

/* Page number */
.s-num {
  width: 28px; flex-shrink: 0;
  text-align: right; padding-right: 6px;
  font-size: 10px; font-weight: 600;
  color: #8b95a5;
  font-variant-numeric: tabular-nums;
}
.s-row.active .s-num { color: var(--brand-orange); font-weight: 700; }

/* Slide card — looks like a real paper/slide */
.s-card {
  flex: 1; position: relative;
  border-radius: 1px;
  overflow: hidden;
  background: #fff;
  /* Paper-like shadow: offset to bottom-right */
  border: 1px solid #c8ccd3;
  box-shadow:
    1px 1px 0 0 rgba(0,0,0,.04),
    2px 2px 4px 0 rgba(0,0,0,.06),
    0 0 0 0 transparent;
  transition: border-color .12s, box-shadow .12s;
}
/* Selected: thick colored border like PPT */
.s-row.active .s-card {
  border: 2px solid var(--brand-orange);
  box-shadow:
    0 1px 3px 0 rgba(251,84,43,.1),
    2px 2px 6px 0 rgba(0,0,0,.06);
}
.s-row:hover:not(.active) .s-card {
  box-shadow:
    1px 1px 0 0 rgba(0,0,0,.05),
    2px 3px 8px 0 rgba(0,0,0,.09);
}

.s-card img {
  width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block;
}

/* Check badge */
.s-check {
  position: absolute; top: 3px; right: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #10b981;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
}

/* Ghost */
.s-ghost { pointer-events: none; opacity: .3; }
.s-num-ghost { color: #bfc6cf; }
.s-card-ghost {
  aspect-ratio: 16/9;
  background: #fff;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 5px; padding: 12px;
}
.sg-l { height: 2px; border-radius: 0; background: #dde1e7; }
.sg-l.sg-w1 { width: 65%; } .sg-l.sg-w2 { width: 42%; } .sg-l.sg-w3 { width: 55%; }

/* ━━━ Main ━━━ */
.wb-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }

/* Empty */
.empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; cursor: pointer;
  background: linear-gradient(160deg, #fcfcfd, #f8f9fb); transition: background .3s;
}
.empty:hover { background: linear-gradient(160deg, #fff8f6, #fef4f1); }
.empty-ring {
  width: 68px; height: 68px; border-radius: 50%;
  border: 2px dashed #d1d5db; color: #9ca3af;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px; transition: all .25s;
}
.empty:hover .empty-ring {
  border-color: var(--brand-orange); color: var(--brand-orange);
  transform: scale(1.05); box-shadow: 0 0 0 6px rgba(251,84,43,.06);
}
.empty-t { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 3px; }
.empty-s { font-size: 12px; color: #94a3b8; }

/* ━━━ Editor ━━━ */
.editor { flex: 1; display: flex; flex-direction: column; padding: 18px 22px 14px; gap: 14px; }
.ed-top { display: flex; align-items: center; gap: 8px; }
.ed-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 99px;
  background: linear-gradient(135deg, #fb542b, #ff6f47);
  color: #fff; font-size: 11px; font-weight: 700;
}
.ed-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,.45); }
.ed-title { font-size: 16px; font-weight: 700; color: #1e293b; flex: 1; }
.ed-nav { display: flex; align-items: center; gap: 3px; }
.nb {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; transition: all .12s;
}
.nb:hover:not(:disabled) { background: #e2e8f0; color: #334155; }
.nb:disabled { opacity: .2; cursor: not-allowed; }
.nc { font-size: 11px; font-weight: 700; color: #94a3b8; min-width: 30px; text-align: center; }

/* Compare */
.compare { display: flex; gap: 0; align-items: stretch; flex: 1; min-height: 0; }
.cmp-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.cmp-label {
  font-size: 13px; font-weight: 800; color: #1e293b;
  letter-spacing: .5px; text-transform: uppercase;
  margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 5px;
}
.cmp-label.ok { color: #059669; }
.dot { width: 5px; height: 5px; border-radius: 50%; }
.dot-src { background: #94a3b8; }
.dot-out { background: #10b981; }
.dot-wait { background: #d1d5db; }

.frm {
  border-radius: 7px; overflow: hidden; border: 1px solid #e8ecf0;
  box-shadow: 0 1px 3px rgba(0,0,0,.03); transition: box-shadow .2s;
  flex: 1;
}
.frm:hover { box-shadow: 0 3px 12px rgba(0,0,0,.06); }
.frm img { width: 100%; height: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
.frm-empty {
  aspect-ratio: 16/9; background: linear-gradient(145deg, #f8fafb, #f0f3f6);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px; color: #c8cfd8;
}
.frm-empty span { font-size: 10px; color: #a8b3c0; }

/* Flow arrow */
.cmp-flow {
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; width: 48px;
  padding-top: 18px;
}
.flow-icon { color: #10b981; }

/* Instruction */
.inst-lb {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 5px;
}
.inst-lb svg { color: var(--brand-orange); }
.inst-ta { resize: vertical; min-height: 56px; font-size: 12px; line-height: 1.65; }
.inst-ta:focus { border-color: var(--brand-orange); box-shadow: 0 0 0 3px rgba(251,84,43,.06); }

@media (max-width: 768px) {
  .workbench { flex-direction: column; min-height: auto; }
  .wb-side { width: 100%; border-right: none; border-bottom: 1px solid #eef0f4; }
  .side-scroll { flex-direction: row; overflow-x: auto; overflow-y: hidden; padding: 8px; }
  .s-row { flex: 0 0 80px; border-left: none; border-bottom: 3px solid transparent; flex-direction: column; padding: 0; }
  .s-row.active { border-bottom-color: var(--brand-orange); }
  .s-num { width: auto; }
  .compare { flex-direction: column; }
  .cmp-arrow { flex-direction: row; padding: 4px 0; }
  .arr-l { width: 10px; height: 1px; }
}
</style>
