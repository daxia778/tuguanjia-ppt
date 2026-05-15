<template>
  <div
    class="upload-zone"
    :class="{ dragover: isDragover, 'has-files': files.length > 0 }"
    @dragover.prevent="isDragover = true"
    @dragleave.prevent="isDragover = false"
    @drop.prevent="handleDrop"
    @click="onZoneClick"
  >
    <input ref="fileInput" type="file" :accept="accept" multiple hidden @change="handleFileChange" />

    <template v-if="files.length === 0">
      <div class="upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
      </div>
      <p class="upload-title">拖拽图片到此处</p>
      <p class="upload-sub">或 <span class="upload-link">点击选择文件</span></p>
      <p class="upload-hint">支持 JPG / PNG / WebP，最大 10MB</p>
    </template>

    <template v-else>
      <div class="file-grid">
        <div class="file-thumb" v-for="(f, i) in files" :key="i" @click.stop="openPreview(i)">
          <img :src="f.preview" alt="" />
          <button class="file-remove" @click.stop="removeFile(i)" title="移除">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <button class="file-add" @click.stop="triggerInput" title="添加更多">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </template>
  </div>

  <!-- 图片预览 Lightbox -->
  <Teleport to="body">
    <transition name="lightbox-fade">
      <div v-if="previewIdx !== null" class="lightbox-overlay" @click="closePreview">
        <button class="lightbox-close" @click.stop="closePreview">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <!-- 左右切换 -->
        <button v-if="files.length > 1 && previewIdx > 0" class="lightbox-nav lightbox-prev" @click.stop="previewIdx!--">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <img :src="files[previewIdx!]?.preview" class="lightbox-img" @click.stop />
        <button v-if="files.length > 1 && previewIdx! < files.length - 1" class="lightbox-nav lightbox-next" @click.stop="previewIdx!++">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="lightbox-counter">{{ previewIdx! + 1 }} / {{ files.length }}</div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface UploadFile {
  file: File
  preview: string
}

const props = defineProps<{ accept?: string; maxSize?: number }>()
const emit = defineEmits<{ (e: 'update', files: File[]): void }>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const files = ref<UploadFile[]>([])
const previewIdx = ref<number | null>(null)

function triggerInput() { fileInput.value?.click() }

/** 点击容器：没有文件时打开文件选择器，有文件时不做任何事 */
function onZoneClick() {
  if (files.value.length === 0) {
    triggerInput()
  }
}

function openPreview(idx: number) {
  previewIdx.value = idx
}

function closePreview() {
  previewIdx.value = null
}

function addFiles(newFiles: FileList | null) {
  if (!newFiles) return
  const max = props.maxSize || 10 * 1024 * 1024
  for (const f of Array.from(newFiles)) {
    if (f.size > max) { alert(`文件 ${f.name} 超过大小限制`); continue }
    if (!f.type.startsWith('image/')) { alert(`仅支持图片文件`); continue }
    files.value.push({ file: f, preview: URL.createObjectURL(f) })
  }
  emit('update', files.value.map(f => f.file))
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  addFiles(e.dataTransfer?.files || null)
}

function handleFileChange(e: Event) {
  addFiles((e.target as HTMLInputElement).files)
  if (fileInput.value) fileInput.value.value = ''
}

function removeFile(idx: number) {
  URL.revokeObjectURL(files.value[idx].preview)
  files.value.splice(idx, 1)
  // 如果正在预览被删除的图片，关闭预览
  if (previewIdx.value !== null) {
    if (previewIdx.value >= files.value.length) {
      previewIdx.value = files.value.length > 0 ? files.value.length - 1 : null
    }
  }
  emit('update', files.value.map(f => f.file))
}

defineExpose({ files })
</script>

<style scoped>
.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.upload-zone:hover { border-color: var(--text-muted); }
.upload-zone.dragover {
  border-color: var(--brand-orange);
  background: rgba(251, 84, 43, 0.04);
}
.upload-zone.has-files { padding: var(--space-4); text-align: left; cursor: default; }

.upload-icon {
  width: 56px; height: 56px; margin: 0 auto var(--space-3);
  background: white; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); box-shadow: var(--shadow-sm);
}
.upload-title { font-size: var(--text-base); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.upload-sub { font-size: var(--text-sm); color: var(--text-secondary); }
.upload-link { color: var(--brand-orange); font-weight: 600; }
.upload-hint { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-2); }

.file-grid { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.file-thumb {
  width: 72px; height: 72px; border-radius: var(--radius-sm);
  overflow: hidden; position: relative; border: 1px solid var(--border-color);
  cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
}
.file-thumb:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.file-thumb img { width: 100%; height: 100%; object-fit: cover; }
.file-remove {
  position: absolute; top: 2px; right: 2px;
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(0,0,0,0.6); color: white;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.15s;
}
.file-thumb:hover .file-remove { opacity: 1; }
.file-add {
  width: 72px; height: 72px; border-radius: var(--radius-sm);
  border: 2px dashed var(--border-color); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; cursor: pointer;
}
.file-add:hover { border-color: var(--brand-orange); color: var(--brand-orange); }

/* ── Lightbox ── */
.lightbox-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  cursor: zoom-out;
}
.lightbox-img {
  max-width: 90vw; max-height: 85vh;
  object-fit: contain; border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  cursor: default;
}
.lightbox-close {
  position: absolute; top: 20px; right: 20px;
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,0.1); color: white;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: background 0.2s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.25); }
.lightbox-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.1); color: white;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: background 0.2s;
}
.lightbox-nav:hover { background: rgba(255,255,255,0.25); }
.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }
.lightbox-counter {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600;
}

.lightbox-fade-enter-active { transition: opacity 0.25s ease; }
.lightbox-fade-leave-active { transition: opacity 0.2s ease; }
.lightbox-fade-enter-from,
.lightbox-fade-leave-to { opacity: 0; }
</style>
