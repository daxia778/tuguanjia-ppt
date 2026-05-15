<template>
  <div class="file-upload" :class="{ dragover: isDrag, uploaded: !!file }">
    <input ref="inp" type="file" accept=".pptx,.ppt,.pdf" hidden @change="onSelect" />

    <!-- Empty -->
    <template v-if="!file">
      <div class="fu-body" @dragover.prevent="isDrag=true" @dragleave.prevent="isDrag=false" @drop.prevent="onDrop" @click="inp?.click()">
        <div class="fu-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
        </div>
        <p class="fu-title">上传 PPT 或 PDF 文件</p>
        <p class="fu-sub">拖拽文件到此处，或 <span class="fu-link">点击选择</span></p>
        <p class="fu-hint">支持 .pptx .pdf，最大 50MB</p>
      </div>
    </template>

    <!-- Uploaded -->
    <template v-else>
      <div class="fu-file">
        <div class="fu-file-icon" :class="fileExt">
          {{ fileExt.toUpperCase() }}
        </div>
        <div class="fu-file-info">
          <span class="fu-file-name">{{ file.name }}</span>
          <span class="fu-file-size">{{ formatSize(file.size) }}</span>
        </div>
        <button class="fu-remove" @click="removeFile" title="移除文件">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const emit = defineEmits<{ (e: 'change', f: File | null): void }>()
const inp = ref<HTMLInputElement|null>(null)
const isDrag = ref(false)
const file = ref<File|null>(null)

const fileExt = computed(() => {
  if (!file.value) return ''
  const n = file.value.name.toLowerCase()
  if (n.endsWith('.pdf')) return 'pdf'
  return 'pptx'
})

function formatSize(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(1) + ' MB'
}

function setFile(f: File) {
  if (f.size > 50*1024*1024) { alert('文件不能超过 50MB'); return }
  file.value = f
  emit('change', f)
}

function onSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) setFile(f)
  if (inp.value) inp.value.value = ''
}
function onDrop(e: DragEvent) {
  isDrag.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) setFile(f)
}
function removeFile() { file.value = null; emit('change', null) }
</script>

<style scoped>
.file-upload { border: 2px dashed var(--border-color); border-radius: var(--radius-lg); transition: all 0.2s; }
.file-upload.dragover { border-color: var(--brand-orange); background: rgba(251,84,43,0.04); }
.file-upload.uploaded { border-style: solid; background: var(--bg-primary); }

.fu-body { padding: var(--space-8) var(--space-6); text-align: center; cursor: pointer; }
.fu-body:hover { background: var(--bg-secondary); }
.fu-icon { width: 48px; height: 48px; margin: 0 auto var(--space-3); background: white; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--text-muted); box-shadow: var(--shadow-sm); }
.fu-title { font-weight: 600; margin-bottom: 4px; }
.fu-sub { font-size: var(--text-sm); color: var(--text-secondary); }
.fu-link { color: var(--brand-orange); font-weight: 600; }
.fu-hint { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-2); }

.fu-file { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-5); }
.fu-file-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
.fu-file-icon.pdf { background: #fef2f2; color: #ef4444; }
.fu-file-icon.pptx { background: #fff7ed; color: #f59e0b; }
.fu-file-info { flex: 1; display: flex; flex-direction: column; }
.fu-file-name { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.fu-file-size { font-size: var(--text-xs); color: var(--text-muted); }
.fu-remove { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all 0.15s; }
.fu-remove:hover { background: #fef2f2; color: #ef4444; }
</style>
