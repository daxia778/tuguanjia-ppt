/**
 * canvas-editor.js - Canvas interaction controller
 * Handles zoom, pan, and tool interactions
 */

export class CanvasEditor {
  constructor(mainCanvas, selectionCanvas, container) {
    this.mainCanvas = mainCanvas;
    this.selectionCanvas = selectionCanvas;
    this.container = container;
    this.ctx = mainCanvas.getContext('2d');
    this.selCtx = selectionCanvas.getContext('2d');

    // Image state
    this.originalImage = null;   // HTMLCanvasElement
    this.colormapImage = null;
    this.backgroundImage = null;
    this.currentView = 'original'; // original | colormap | layers

    // Transform
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.minZoom = 0.1;
    this.maxZoom = 10;

    // Interaction
    this.tool = 'magicWand'; // magicWand | pan
    this.isPanning = false;
    this.lastMouse = { x: 0, y: 0 };

    // Selection
    this.currentMask = null;
    this.marchOffset = 0;
    this.marchAnimId = null;

    // Callbacks
    this.onMagicWandClick = null;
    this.onZoomChange = null;

    this._initEvents();
  }

  _initEvents() {
    const c = this.container;

    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this._zoomAt(mx, my, delta);
    }, { passive: false });

    c.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && (this.tool === 'pan' || e.spaceKey))) {
        this.isPanning = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        c.style.cursor = 'grabbing';
        return;
      }

      if (e.button === 0 && this.tool === 'magicWand') {
        const pos = this._screenToImage(e.clientX, e.clientY);
        if (pos && this.onMagicWandClick) {
          this.onMagicWandClick(pos.x, pos.y);
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.panX += e.clientX - this.lastMouse.x;
        this.panY += e.clientY - this.lastMouse.y;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        this.render();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        c.style.cursor = this.tool === 'pan' ? 'grab' : 'crosshair';
      }
    });

    // Space key for temp pan
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.spaceKey = true;
        c.style.cursor = 'grab';
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        c.style.cursor = this.tool === 'pan' ? 'grab' : 'crosshair';
      }
    });
  }

  _screenToImage(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const img = this._getCurrentImage();
    if (!img) return null;

    // Calculate image position on screen
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    const cx = cw / 2 + this.panX;
    const cy = ch / 2 + this.panY;
    const iw = img.width * this.zoom;
    const ih = img.height * this.zoom;
    const ix = cx - iw / 2;
    const iy = cy - ih / 2;

    const x = Math.floor((mx - ix) / this.zoom);
    const y = Math.floor((my - iy) / this.zoom);

    if (x < 0 || x >= img.width || y < 0 || y >= img.height) return null;
    return { x, y };
  }

  _zoomAt(screenX, screenY, factor) {
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));
    if (newZoom === this.zoom) return;

    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    const cx = cw / 2 + this.panX;
    const cy = ch / 2 + this.panY;

    this.panX = screenX - (screenX - this.panX - cw / 2) * (newZoom / this.zoom) - cw / 2;
    this.panY = screenY - (screenY - this.panY - ch / 2) * (newZoom / this.zoom) - ch / 2;
    this.zoom = newZoom;

    this.render();
    if (this.onZoomChange) this.onZoomChange(this.zoom);
  }

  _getCurrentImage() {
    if (this.currentView === 'colormap' && this.colormapImage) return this.colormapImage;
    return this.originalImage;
  }

  setImage(canvas) {
    this.originalImage = canvas;
    this.fitToView();
  }

  setColormapImage(canvas) {
    this.colormapImage = canvas;
  }

  setBackgroundImage(canvas) {
    this.backgroundImage = canvas;
  }

  setView(view) {
    this.currentView = view;
    this.render();
  }

  setTool(tool) {
    this.tool = tool;
    this.container.style.cursor = tool === 'pan' ? 'grab' : 'crosshair';
  }

  fitToView() {
    const img = this._getCurrentImage();
    if (!img) return;
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    const padding = 40;
    this.zoom = Math.min((cw - padding * 2) / img.width, (ch - padding * 2) / img.height, 1);
    this.panX = 0;
    this.panY = 0;
    this.render();
    if (this.onZoomChange) this.onZoomChange(this.zoom);
  }

  zoomIn() { this._zoomAt(this.container.clientWidth / 2, this.container.clientHeight / 2, 1.25); }
  zoomOut() { this._zoomAt(this.container.clientWidth / 2, this.container.clientHeight / 2, 0.8); }

  setSelection(mask) {
    this.currentMask = mask;
    if (mask) {
      this._startMarchingAnts();
    } else {
      this._stopMarchingAnts();
      this.selCtx.clearRect(0, 0, this.selectionCanvas.width, this.selectionCanvas.height);
    }
  }

  _startMarchingAnts() {
    this._stopMarchingAnts();
    const animate = () => {
      this.marchOffset = (this.marchOffset + 0.5) % 16;
      this._renderSelection();
      this.marchAnimId = requestAnimationFrame(animate);
    };
    animate();
  }

  _stopMarchingAnts() {
    if (this.marchAnimId) {
      cancelAnimationFrame(this.marchAnimId);
      this.marchAnimId = null;
    }
  }

  _renderSelection() {
    if (!this.currentMask) return;
    const img = this._getCurrentImage();
    if (!img) return;

    const { width, height } = img;
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;

    this.selectionCanvas.width = cw;
    this.selectionCanvas.height = ch;
    this.selCtx.clearRect(0, 0, cw, ch);

    const cx = cw / 2 + this.panX;
    const cy = ch / 2 + this.panY;
    const iw = width * this.zoom;
    const ih = height * this.zoom;
    const ix = cx - iw / 2;
    const iy = cy - ih / 2;

    this.selCtx.save();
    this.selCtx.translate(ix, iy);
    this.selCtx.scale(this.zoom, this.zoom);

    // Import and call renderSelectionOutline
    const mask = this.currentMask;
    const ctx = this.selCtx;
    const offset = this.marchOffset;

    ctx.setLineDash([4 / this.zoom, 4 / this.zoom]);
    ctx.lineWidth = 1.5 / this.zoom;

    // White pass
    ctx.lineDashOffset = -offset / this.zoom;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    this._traceMaskBorder(ctx, mask, width, height);
    ctx.stroke();

    // Black pass
    ctx.lineDashOffset = -(offset + 4) / this.zoom;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    this._traceMaskBorder(ctx, mask, width, height);
    ctx.stroke();

    ctx.setLineDash([]);
    this.selCtx.restore();
  }

  _traceMaskBorder(ctx, mask, width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (mask[i] !== 255) continue;
        if (x === 0 || mask[i - 1] !== 255) { ctx.moveTo(x, y); ctx.lineTo(x, y + 1); }
        if (x === width - 1 || mask[i + 1] !== 255) { ctx.moveTo(x + 1, y); ctx.lineTo(x + 1, y + 1); }
        if (y === 0 || mask[i - width] !== 255) { ctx.moveTo(x, y); ctx.lineTo(x + 1, y); }
        if (y === height - 1 || mask[i + width] !== 255) { ctx.moveTo(x, y + 1); ctx.lineTo(x + 1, y + 1); }
      }
    }
  }

  /**
   * Render composite layers view
   */
  renderLayers(compositeCanvas) {
    if (!compositeCanvas) return;
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    this.mainCanvas.width = cw;
    this.mainCanvas.height = ch;

    this.ctx.clearRect(0, 0, cw, ch);
    this._drawCheckerboard();

    const cx = cw / 2 + this.panX;
    const cy = ch / 2 + this.panY;
    const iw = compositeCanvas.width * this.zoom;
    const ih = compositeCanvas.height * this.zoom;

    this.ctx.imageSmoothingEnabled = this.zoom < 2;
    this.ctx.drawImage(compositeCanvas, cx - iw / 2, cy - ih / 2, iw, ih);
  }

  _drawCheckerboard() {
    const cw = this.mainCanvas.width;
    const ch = this.mainCanvas.height;
    const size = 12;
    const color1 = '#1a1b25';
    const color2 = '#15161f';

    for (let y = 0; y < ch; y += size) {
      for (let x = 0; x < cw; x += size) {
        this.ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? color1 : color2;
        this.ctx.fillRect(x, y, size, size);
      }
    }
  }

  render() {
    const img = this._getCurrentImage();
    if (!img) return;

    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;

    this.mainCanvas.width = cw;
    this.mainCanvas.height = ch;

    this.ctx.clearRect(0, 0, cw, ch);
    this._drawCheckerboard();

    const cx = cw / 2 + this.panX;
    const cy = ch / 2 + this.panY;
    const iw = img.width * this.zoom;
    const ih = img.height * this.zoom;

    this.ctx.imageSmoothingEnabled = this.zoom < 2;
    this.ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
  }

  destroy() {
    this._stopMarchingAnts();
  }
}
