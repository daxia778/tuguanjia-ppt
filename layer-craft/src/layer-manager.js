/**
 * layer-manager.js - Layer management with undo/redo
 */

export class LayerManager {
  constructor() {
    this.layers = [];
    this.activeIndex = -1;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 30;
    this.onChange = null; // callback
  }

  _snapshot() {
    // Save a snapshot for undo (layer metadata, not pixel data)
    const snap = this.layers.map(l => ({
      id: l.id, name: l.name, visible: l.visible,
      opacity: l.opacity, locked: l.locked,
      canvas: l.canvas, // reference (canvases are immutable once created)
    }));
    // Trim future history
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ layers: snap, activeIndex: this.activeIndex });
    if (this.history.length > this.maxHistory) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  _notify() {
    if (this.onChange) this.onChange(this.layers, this.activeIndex);
  }

  addLayer(canvas, name) {
    this._snapshot();
    const id = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const layer = {
      id,
      name: name || `图层 ${this.layers.length + 1}`,
      canvas,
      visible: true,
      opacity: 1,
      locked: false,
    };
    this.layers.unshift(layer); // add on top
    this.activeIndex = 0;
    this._notify();
    return layer;
  }

  removeLayer(index) {
    if (index < 0 || index >= this.layers.length) return;
    this._snapshot();
    this.layers.splice(index, 1);
    if (this.activeIndex >= this.layers.length) {
      this.activeIndex = this.layers.length - 1;
    }
    this._notify();
  }

  setActive(index) {
    if (index < 0 || index >= this.layers.length) return;
    this.activeIndex = index;
    this._notify();
  }

  toggleVisibility(index) {
    if (index < 0 || index >= this.layers.length) return;
    this._snapshot();
    this.layers[index].visible = !this.layers[index].visible;
    this._notify();
  }

  renameLayer(index, name) {
    if (index < 0 || index >= this.layers.length) return;
    this._snapshot();
    this.layers[index].name = name;
    this._notify();
  }

  moveLayer(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= this.layers.length) return;
    if (toIndex < 0 || toIndex >= this.layers.length) return;
    this._snapshot();
    const [layer] = this.layers.splice(fromIndex, 1);
    this.layers.splice(toIndex, 0, layer);
    this.activeIndex = toIndex;
    this._notify();
  }

  undo() {
    if (this.historyIndex <= 0) return false;
    this.historyIndex--;
    const snap = this.history[this.historyIndex];
    this.layers = snap.layers.map(l => ({ ...l }));
    this.activeIndex = snap.activeIndex;
    this._notify();
    return true;
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return false;
    this.historyIndex++;
    const snap = this.history[this.historyIndex];
    this.layers = snap.layers.map(l => ({ ...l }));
    this.activeIndex = snap.activeIndex;
    this._notify();
    return true;
  }

  canUndo() { return this.historyIndex > 0; }
  canRedo() { return this.historyIndex < this.history.length - 1; }

  /**
   * Composite all visible layers onto a single canvas
   */
  composite(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw from bottom to top
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(layer.canvas, 0, 0);
    }
    ctx.globalAlpha = 1;
    return canvas;
  }

  /**
   * Generate a thumbnail for a layer
   */
  generateThumb(canvas, size = 36) {
    const thumb = document.createElement('canvas');
    thumb.width = size;
    thumb.height = size;
    const ctx = thumb.getContext('2d');
    const scale = Math.min(size / canvas.width, size / canvas.height);
    const w = canvas.width * scale;
    const h = canvas.height * scale;
    ctx.drawImage(canvas, (size - w) / 2, (size - h) / 2, w, h);
    return thumb;
  }
}
