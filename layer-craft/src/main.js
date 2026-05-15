/**
 * main.js - LayerCraft Application Entry
 * AI Image Layer Separator - 智能图像分层工具
 */

import './index.css';
import { loadConfig, saveConfig, generateColorBlockMap, extractBackground, testConnection, loadImageToCanvas } from './api.js';
import { floodFillSelect, extractLayerFromMask, autoSegment } from './magic-wand.js';
import { LayerManager } from './layer-manager.js';
import { CanvasEditor } from './canvas-editor.js';
import { exportPSD, exportLayerPNG, exportAllPNG } from './psd-export.js';
import { exportPPTX } from './ppt-export.js';

// ===== STATE =====
const state = {
  originalCanvas: null,   // original uploaded image as canvas
  colormapCanvas: null,    // AI-generated color block map
  backgroundCanvas: null,  // AI-extracted background
  currentMask: null,
  imageWidth: 0,
  imageHeight: 0,
};

const layerManager = new LayerManager();
let editor = null;

// ===== DOM ELEMENTS =====
const $ = (id) => document.getElementById(id);

const dom = {
  uploadZone: $('uploadZone'),
  canvasContainer: $('canvasContainer'),
  mainCanvas: $('mainCanvas'),
  selectionCanvas: $('selectionCanvas'),
  fileInput: $('fileInput'),
  btnUpload: $('btnUpload'),
  zoomControls: $('zoomControls'),
  zoomLevel: $('zoomLevel'),
  // Tools
  toolMagicWand: $('toolMagicWand'),
  toolPan: $('toolPan'),
  toleranceSlider: $('toleranceSlider'),
  toleranceValue: $('toleranceValue'),
  // AI Actions
  btnGenColormap: $('btnGenColormap'),
  btnExtractBg: $('btnExtractBg'),
  btnAutoLayer: $('btnAutoLayer'),
  // Operations
  btnUndo: $('btnUndo'),
  btnRedo: $('btnRedo'),
  // View
  viewSwitcher: $('viewSwitcher'),
  btnViewOriginal: $('btnViewOriginal'),
  btnViewColormap: $('btnViewColormap'),
  btnViewLayers: $('btnViewLayers'),
  // Layers
  layerList: $('layerList'),
  layerCount: $('layerCount'),
  // Export
  btnExportPSD: $('btnExportPSD'),
  btnExportPPT: $('btnExportPPT'),
  btnExportPNG: $('btnExportPNG'),
  // Status
  imageInfo: $('imageInfo'),
  progressBar: $('progressBar'),
  progressFill: $('progressFill'),
  progressText: $('progressText'),
  apiStatus: $('apiStatus'),
  // Settings
  btnSettings: $('btnSettings'),
  settingsModal: $('settingsModal'),
  btnCloseSettings: $('btnCloseSettings'),
  btnCancelSettings: $('btnCancelSettings'),
  btnSaveSettings: $('btnSaveSettings'),
  btnTestApi: $('btnTestApi'),
  apiBaseUrl: $('apiBaseUrl'),
  apiKey: $('apiKey'),
  modelSelect: $('modelSelect'),
  apiMode: $('apiMode'),
  imageSize: $('imageSize'),
  btnToggleKey: $('btnToggleKey'),
  testResult: $('testResult'),
};

// ===== TOAST SYSTEM =====
function showToast(message, type = 'info') {
  const container = $('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== PROGRESS =====
function showProgress(text, percent) {
  dom.progressBar.style.display = '';
  dom.progressText.textContent = text;
  if (percent !== undefined) {
    dom.progressFill.style.width = `${percent}%`;
  } else {
    // Indeterminate
    dom.progressFill.style.width = '100%';
    dom.progressFill.style.animation = 'progressPulse 2s ease infinite';
  }
}

function hideProgress() {
  dom.progressBar.style.display = 'none';
  dom.progressFill.style.animation = '';
  dom.progressFill.style.width = '0%';
}

// ===== API STATUS =====
function updateApiStatus() {
  const config = loadConfig();
  const dot = dom.apiStatus.querySelector('.status-dot');
  const text = dom.apiStatus.querySelector('.status-text');

  if (config.apiKey) {
    dot.className = 'status-dot online';
    text.textContent = config.model;
  } else {
    dot.className = 'status-dot offline';
    text.textContent = '未配置 API';
  }
}

// ===== FILE UPLOAD =====
function initUpload() {
  dom.btnUpload.addEventListener('click', () => dom.fileInput.click());
  dom.uploadZone.addEventListener('click', (e) => {
    if (e.target === dom.uploadZone || e.target.closest('.upload-content')) {
      dom.fileInput.click();
    }
  });

  dom.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  // Drag & drop
  dom.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dom.uploadZone.classList.add('drag-over');
  });
  dom.uploadZone.addEventListener('dragleave', () => {
    dom.uploadZone.classList.remove('drag-over');
  });
  dom.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dom.uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
}

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('请上传图片文件', 'error');
    return;
  }

  showProgress('加载图片...');

  const url = URL.createObjectURL(file);
  try {
    const canvas = await loadImageToCanvas(url);
    state.originalCanvas = canvas;
    state.imageWidth = canvas.width;
    state.imageHeight = canvas.height;
    state.colormapCanvas = null;
    state.backgroundCanvas = null;

    // Switch to canvas view
    dom.uploadZone.style.display = 'none';
    dom.canvasContainer.style.display = '';
    dom.zoomControls.style.display = '';

    // Init editor
    if (!editor) {
      editor = new CanvasEditor(dom.mainCanvas, dom.selectionCanvas, dom.canvasContainer);
      editor.onMagicWandClick = handleMagicWandClick;
      editor.onZoomChange = (z) => {
        dom.zoomLevel.textContent = `${Math.round(z * 100)}%`;
      };
    }

    editor.setImage(canvas);
    editor.setTool('magicWand');
    editor.fitToView();

    // Enable AI buttons
    const config = loadConfig();
    const hasApi = !!config.apiKey;
    dom.btnGenColormap.disabled = !hasApi;
    dom.btnExtractBg.disabled = !hasApi;
    dom.btnAutoLayer.disabled = true; // needs colormap first

    dom.imageInfo.textContent = `${file.name} · ${canvas.width}×${canvas.height} · ${(file.size / 1024).toFixed(0)}KB`;
    hideProgress();
    showToast('图片加载成功', 'success');
  } catch (err) {
    hideProgress();
    showToast('图片加载失败: ' + err.message, 'error');
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ===== MAGIC WAND =====
function handleMagicWandClick(x, y) {
  const viewCanvas = editor.currentView === 'colormap' && state.colormapCanvas
    ? state.colormapCanvas
    : state.originalCanvas;

  if (!viewCanvas) return;

  const tolerance = parseInt(dom.toleranceSlider.value);
  const ctx = viewCanvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, viewCanvas.width, viewCanvas.height);

  // Perform selection on the visible image (colormap preferred)
  const mask = floodFillSelect(imageData, x, y, tolerance, true);

  state.currentMask = mask;
  editor.setSelection(mask);

  // Count selected pixels
  let count = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] === 255) count++;
  dom.imageInfo.textContent = `选区: ${count.toLocaleString()} 像素 · 按 Enter 提取为图层`;
}

function extractSelectionAsLayer() {
  if (!state.currentMask || !state.originalCanvas) return;

  const srcCtx = state.originalCanvas.getContext('2d');
  const srcData = srcCtx.getImageData(0, 0, state.imageWidth, state.imageHeight);

  const layerCanvas = extractLayerFromMask(srcData, state.currentMask, state.imageWidth, state.imageHeight);
  layerManager.addLayer(layerCanvas);

  // Clear selection
  state.currentMask = null;
  editor.setSelection(null);
  showToast('图层已提取', 'success');
  updateExportButtons();
}

// ===== AI ACTIONS =====
async function handleGenColormap() {
  if (!state.originalCanvas) return;
  const config = loadConfig();
  if (!config.apiKey) {
    showToast('请先配置 API', 'error');
    return;
  }

  dom.btnGenColormap.disabled = true;
  showProgress('AI 生成色块图中...', undefined);

  try {
    const resultUrl = await generateColorBlockMap(state.originalCanvas, (msg) => {
      dom.progressText.textContent = msg;
    });

    const canvas = await loadImageToCanvas(resultUrl);
    state.colormapCanvas = canvas;
    editor.setColormapImage(canvas);

    // Switch to colormap view
    switchView('colormap');
    dom.btnAutoLayer.disabled = false;

    hideProgress();
    showToast('色块图生成成功！现在可以用魔棒选取元素', 'success');
  } catch (err) {
    hideProgress();
    showToast('色块图生成失败: ' + err.message, 'error');
  } finally {
    dom.btnGenColormap.disabled = false;
  }
}

async function handleExtractBg() {
  if (!state.originalCanvas) return;
  const config = loadConfig();
  if (!config.apiKey) {
    showToast('请先配置 API', 'error');
    return;
  }

  dom.btnExtractBg.disabled = true;
  showProgress('AI 提取背景中...');

  try {
    const resultUrl = await extractBackground(state.originalCanvas, (msg) => {
      dom.progressText.textContent = msg;
    });

    const canvas = await loadImageToCanvas(resultUrl);
    state.backgroundCanvas = canvas;
    editor.setBackgroundImage(canvas);

    // Add background as a layer
    layerManager.addLayer(canvas, '背景');

    hideProgress();
    showToast('背景提取成功，已添加为图层', 'success');
    updateExportButtons();
  } catch (err) {
    hideProgress();
    showToast('背景提取失败: ' + err.message, 'error');
  } finally {
    dom.btnExtractBg.disabled = false;
  }
}

async function handleAutoLayer() {
  if (!state.colormapCanvas || !state.originalCanvas) {
    showToast('请先生成色块图', 'error');
    return;
  }

  dom.btnAutoLayer.disabled = true;
  showProgress('自动分层中...', 0);

  try {
    const cmCtx = state.colormapCanvas.getContext('2d');
    const cmData = cmCtx.getImageData(0, 0, state.imageWidth, state.imageHeight);
    const tolerance = parseInt(dom.toleranceSlider.value);
    const regions = autoSegment(cmData, tolerance, 500);

    const srcCtx = state.originalCanvas.getContext('2d');
    const srcData = srcCtx.getImageData(0, 0, state.imageWidth, state.imageHeight);

    let count = 0;
    for (const region of regions) {
      const layerCanvas = extractLayerFromMask(srcData, region.mask, state.imageWidth, state.imageHeight);
      const colorName = `#${region.color.r.toString(16).padStart(2, '0')}${region.color.g.toString(16).padStart(2, '0')}${region.color.b.toString(16).padStart(2, '0')}`;
      layerManager.addLayer(layerCanvas, `元素 ${count + 1} (${colorName})`);
      count++;
      showProgress(`自动分层中... ${count}/${regions.length}`, (count / regions.length) * 100);
    }

    hideProgress();
    switchView('layers');
    showToast(`自动分层完成，共 ${count} 个图层`, 'success');
    updateExportButtons();
  } catch (err) {
    hideProgress();
    showToast('自动分层失败: ' + err.message, 'error');
  } finally {
    dom.btnAutoLayer.disabled = false;
  }
}

// ===== VIEW SWITCHING =====
function switchView(view) {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  editor.setView(view);

  if (view === 'layers') {
    const composite = layerManager.composite(state.imageWidth, state.imageHeight);
    editor.renderLayers(composite);
  } else {
    editor.render();
  }
}

// ===== LAYER PANEL =====
function renderLayerPanel() {
  const layers = layerManager.layers;
  const activeIdx = layerManager.activeIndex;

  dom.layerCount.textContent = `${layers.length} 层`;

  if (layers.length === 0) {
    dom.layerList.innerHTML = `
      <div class="empty-layers">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 5l15 8-15 8L5 13l15-8z" fill="currentColor" opacity="0.1"/><path d="M5 20l15 8 15-8" stroke="currentColor" stroke-width="1.5" opacity="0.2"/><path d="M5 27l15 8 15-8" stroke="currentColor" stroke-width="1.5" opacity="0.15"/></svg>
        <p>暂无图层</p>
        <span>上传图片后使用魔棒工具<br/>从色块图中提取图层</span>
      </div>
    `;
    return;
  }

  dom.layerList.innerHTML = layers.map((layer, i) => {
    const thumb = layerManager.generateThumb(layer.canvas);
    return `
      <div class="layer-item ${i === activeIdx ? 'active' : ''}" data-index="${i}">
        <div class="layer-thumb" id="thumb_${layer.id}"></div>
        <div class="layer-info">
          <div class="layer-name" title="${layer.name}">${layer.name}</div>
          <div class="layer-size">${layer.canvas.width}×${layer.canvas.height}</div>
        </div>
        <div class="layer-actions">
          <button class="layer-action-btn ${layer.visible ? '' : 'hidden'}" data-action="toggle" data-index="${i}" title="${layer.visible ? '隐藏' : '显示'}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5S1 8 1 8z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
          </button>
          <button class="layer-action-btn" data-action="delete" data-index="${i}" title="删除">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Inject thumbnails
  layers.forEach((layer) => {
    const thumbEl = document.getElementById(`thumb_${layer.id}`);
    if (thumbEl) {
      const thumb = layerManager.generateThumb(layer.canvas);
      thumbEl.appendChild(thumb);
    }
  });

  // Layer item events
  dom.layerList.querySelectorAll('.layer-item').forEach(el => {
    el.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const idx = parseInt(actionBtn.dataset.index);
        if (actionBtn.dataset.action === 'toggle') {
          layerManager.toggleVisibility(idx);
        } else if (actionBtn.dataset.action === 'delete') {
          layerManager.removeLayer(idx);
          updateExportButtons();
        }
        return;
      }
      layerManager.setActive(parseInt(el.dataset.index));
    });
  });
}

function updateExportButtons() {
  const hasLayers = layerManager.layers.length > 0;
  dom.btnExportPSD.disabled = !hasLayers;
  dom.btnExportPPT.disabled = !hasLayers;
  dom.btnExportPNG.disabled = !hasLayers;
}

// ===== SETTINGS MODAL =====
function initSettings() {
  const openModal = () => {
    const config = loadConfig();
    dom.apiBaseUrl.value = config.baseUrl;
    dom.apiKey.value = config.apiKey;
    dom.modelSelect.value = config.model;
    dom.apiMode.value = config.mode || 'chat';
    dom.imageSize.value = config.size;
    dom.testResult.className = 'test-result';
    dom.testResult.style.display = 'none';
    dom.settingsModal.classList.add('show');
  };

  const closeModal = () => {
    dom.settingsModal.classList.remove('show');
  };

  dom.btnSettings.addEventListener('click', openModal);
  dom.btnCloseSettings.addEventListener('click', closeModal);
  dom.btnCancelSettings.addEventListener('click', closeModal);
  dom.settingsModal.addEventListener('click', (e) => {
    if (e.target === dom.settingsModal) closeModal();
  });

  dom.btnToggleKey.addEventListener('click', () => {
    dom.apiKey.type = dom.apiKey.type === 'password' ? 'text' : 'password';
  });

  dom.btnTestApi.addEventListener('click', async () => {
    const config = {
      baseUrl: dom.apiBaseUrl.value,
      apiKey: dom.apiKey.value,
    };
    dom.btnTestApi.disabled = true;
    dom.btnTestApi.innerHTML = '<span class="spinner"></span> 测试中...';

    try {
      await testConnection(config);
      dom.testResult.className = 'test-result success';
      dom.testResult.textContent = '✓ 连接成功！';
      dom.testResult.style.display = 'block';
    } catch (err) {
      dom.testResult.className = 'test-result error';
      dom.testResult.textContent = '✗ ' + err.message;
      dom.testResult.style.display = 'block';
    } finally {
      dom.btnTestApi.disabled = false;
      dom.btnTestApi.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.4"/><rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/><rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4"/></svg> 测试连接`;
    }
  });

  dom.btnSaveSettings.addEventListener('click', () => {
    const config = {
      baseUrl: dom.apiBaseUrl.value.trim(),
      apiKey: dom.apiKey.value.trim(),
      model: dom.modelSelect.value,
      mode: dom.apiMode.value,
      size: dom.imageSize.value,
    };
    saveConfig(config);
    updateApiStatus();
    closeModal();
    showToast('设置已保存', 'success');

    // Update button states
    if (state.originalCanvas && config.apiKey) {
      dom.btnGenColormap.disabled = false;
      dom.btnExtractBg.disabled = false;
    }
  });
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboard() {
  window.addEventListener('keydown', (e) => {
    // Don't capture when in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case 'w':
        dom.toolMagicWand.click();
        break;
      case 'h':
        dom.toolPan.click();
        break;
      case 'enter':
        if (state.currentMask) extractSelectionAsLayer();
        break;
      case 'escape':
        state.currentMask = null;
        if (editor) editor.setSelection(null);
        break;
      case 'z':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          if (e.shiftKey) {
            layerManager.redo();
          } else {
            layerManager.undo();
          }
        }
        break;
      case '=':
      case '+':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          if (editor) editor.zoomIn();
        }
        break;
      case '-':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          if (editor) editor.zoomOut();
        }
        break;
    }
  });
}

// ===== INIT =====
function init() {
  updateApiStatus();
  initUpload();
  initSettings();
  initKeyboard();

  // Layer manager callback
  layerManager.onChange = () => {
    renderLayerPanel();
    dom.btnUndo.disabled = !layerManager.canUndo();
    dom.btnRedo.disabled = !layerManager.canRedo();

    // Update layers view if active
    if (editor && editor.currentView === 'layers') {
      const composite = layerManager.composite(state.imageWidth, state.imageHeight);
      editor.renderLayers(composite);
    }
  };

  // Tool buttons
  dom.toolMagicWand.addEventListener('click', () => {
    dom.toolMagicWand.classList.add('active');
    dom.toolPan.classList.remove('active');
    if (editor) editor.setTool('magicWand');
  });
  dom.toolPan.addEventListener('click', () => {
    dom.toolPan.classList.add('active');
    dom.toolMagicWand.classList.remove('active');
    if (editor) editor.setTool('pan');
  });

  // Tolerance
  dom.toleranceSlider.addEventListener('input', () => {
    dom.toleranceValue.textContent = dom.toleranceSlider.value;
  });

  // View switching
  dom.viewSwitcher.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-btn');
    if (btn && btn.dataset.view) {
      if (btn.dataset.view === 'colormap' && !state.colormapCanvas) {
        showToast('请先生成色块图', 'info');
        return;
      }
      if (btn.dataset.view === 'layers' && layerManager.layers.length === 0) {
        showToast('暂无图层', 'info');
        return;
      }
      switchView(btn.dataset.view);
    }
  });

  // AI actions
  dom.btnGenColormap.addEventListener('click', handleGenColormap);
  dom.btnExtractBg.addEventListener('click', handleExtractBg);
  dom.btnAutoLayer.addEventListener('click', handleAutoLayer);

  // Undo/Redo
  dom.btnUndo.addEventListener('click', () => layerManager.undo());
  dom.btnRedo.addEventListener('click', () => layerManager.redo());

  // Zoom
  $('btnZoomIn').addEventListener('click', () => editor?.zoomIn());
  $('btnZoomOut').addEventListener('click', () => editor?.zoomOut());
  $('btnZoomFit').addEventListener('click', () => editor?.fitToView());

  // Export
  dom.btnExportPSD.addEventListener('click', () => {
    if (layerManager.layers.length === 0) return;
    try {
      const composite = layerManager.composite(state.imageWidth, state.imageHeight);
      exportPSD(layerManager.layers, state.imageWidth, state.imageHeight, composite);
      showToast('PSD 导出成功', 'success');
    } catch (err) {
      showToast('PSD 导出失败: ' + err.message, 'error');
    }
  });

  dom.btnExportPNG.addEventListener('click', async () => {
    if (layerManager.layers.length === 0) return;
    try {
      await exportAllPNG(layerManager.layers);
      showToast('PNG 导出成功', 'success');
    } catch (err) {
      showToast('PNG 导出失败: ' + err.message, 'error');
    }
  });

  dom.btnExportPPT.addEventListener('click', async () => {
    if (layerManager.layers.length === 0) return;
    try {
      showProgress('导出 PPTX...'); 
      await exportPPTX(layerManager.layers, state.imageWidth, state.imageHeight, {
        slideSize: 'WIDE_16x9',
        backgroundCanvas: state.backgroundCanvas,
      });
      hideProgress();
      showToast('PPTX 导出成功', 'success');
    } catch (err) {
      hideProgress();
      showToast('PPTX 导出失败: ' + err.message, 'error');
    }
  });

  // Check if API key exists, if not, show hint
  const config = loadConfig();
  if (!config.apiKey) {
    setTimeout(() => showToast('请先点击右上角设置按钮配置 API', 'info'), 1000);
  }
}

// Start
init();
