<template>
  <div
    class="upload-zone"
    :class="{ dragover: isDragover, 'has-files': files.length > 0 }"
    @dragover.prevent="isDragover = true"
    @dragleave.prevent="isDragover = false"
    @drop.prevent="handleDrop"
    @click="triggerInput"
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
        <div class="file-thumb" v-for="(f, i) in files" :key="i">
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

function triggerInput() { fileInput.value?.click() }

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
.upload-zone.has-files { padding: var(--space-4); text-align: left; }

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
}
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
  transition: all 0.15s;
}
.file-add:hover { border-color: var(--brand-orange); color: var(--brand-orange); }
</style>
