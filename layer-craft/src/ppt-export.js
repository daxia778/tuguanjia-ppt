/**
 * ppt-export.js - Export layers as editable PPTX
 * Each layer becomes an independent, movable image element in PowerPoint
 */

import PptxGenJS from 'pptxgenjs';

/**
 * Convert canvas to base64 data URI (PNG)
 */
function canvasToBase64(canvas) {
  return canvas.toDataURL('image/png');
}

/**
 * Export layers as an editable PPTX file
 * Each layer is placed as a separate image element, preserving original position
 * 
 * @param {Array} layers - array of {name, canvas, visible, opacity}
 * @param {number} docWidth - original image width in pixels
 * @param {number} docHeight - original image height in pixels
 * @param {Object} options - export options
 * @param {string} options.slideSize - 'WIDE_16x9' | 'STANDARD_4x3' | 'CUSTOM'
 * @param {boolean} options.includeHidden - include hidden layers
 * @param {HTMLCanvasElement} options.backgroundCanvas - optional background image
 */
export async function exportPPTX(layers, docWidth, docHeight, options = {}) {
  const {
    slideSize = 'WIDE_16x9',
    includeHidden = false,
    backgroundCanvas = null,
  } = options;

  const pptx = new PptxGenJS();

  // Configure slide dimensions
  if (slideSize === 'WIDE_16x9') {
    pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
    pptx.layout = 'WIDE';
  } else if (slideSize === 'STANDARD_4x3') {
    pptx.defineLayout({ name: 'STD', width: 10, height: 7.5 });
    pptx.layout = 'STD';
  } else {
    // Custom: match image aspect ratio, fit to reasonable slide size
    const aspect = docWidth / docHeight;
    let slideW, slideH;
    if (aspect >= 1) {
      slideW = 13.33;
      slideH = slideW / aspect;
    } else {
      slideH = 7.5;
      slideW = slideH * aspect;
    }
    pptx.defineLayout({ name: 'CUSTOM', width: slideW, height: slideH });
    pptx.layout = 'CUSTOM';
  }

  pptx.title = 'LayerCraft Export';
  pptx.author = 'LayerCraft AI';

  const slide = pptx.addSlide();

  // Get actual slide dimensions in inches
  const layout = pptx.presLayout;
  const slideWidthInch = layout.width;
  const slideHeightInch = layout.height;

  // Calculate scale: fit the original image into the slide
  const scaleX = slideWidthInch / docWidth;
  const scaleY = slideHeightInch / docHeight;
  const scale = Math.min(scaleX, scaleY);

  // Center offset
  const offsetX = (slideWidthInch - docWidth * scale) / 2;
  const offsetY = (slideHeightInch - docHeight * scale) / 2;

  // Add background if provided
  if (backgroundCanvas) {
    const bgData = canvasToBase64(backgroundCanvas);
    slide.addImage({
      data: bgData,
      x: offsetX,
      y: offsetY,
      w: docWidth * scale,
      h: docHeight * scale,
    });
  }

  // Add layers from bottom to top (reverse order since layers[0] is top)
  const layersToExport = layers.filter(l => includeHidden || l.visible);

  for (let i = layersToExport.length - 1; i >= 0; i--) {
    const layer = layersToExport[i];
    if (!layer.canvas) continue;

    const imgData = canvasToBase64(layer.canvas);

    // If the layer has bounding box info, use it for precise positioning
    const bounds = layer.canvas._bounds;
    if (bounds) {
      slide.addImage({
        data: imgData,
        x: offsetX + bounds.x * scale,
        y: offsetY + bounds.y * scale,
        w: bounds.w * scale,
        h: bounds.h * scale,
      });
    } else {
      // Full canvas layer
      slide.addImage({
        data: imgData,
        x: offsetX,
        y: offsetY,
        w: docWidth * scale,
        h: docHeight * scale,
      });
    }
  }

  // Generate and download
  const timestamp = new Date().toISOString().slice(0, 10);
  await pptx.writeFile({ fileName: `LayerCraft_${timestamp}.pptx` });
}

/**
 * Export layers as multi-slide PPTX (one layer per slide)
 * Useful for presentations showing layer breakdown
 */
export async function exportPPTXMultiSlide(layers, docWidth, docHeight, compositeCanvas) {
  const pptx = new PptxGenJS();

  const aspect = docWidth / docHeight;
  let slideW, slideH;
  if (aspect >= 1) {
    slideW = 13.33;
    slideH = slideW / aspect;
  } else {
    slideH = 7.5;
    slideW = slideH * aspect;
  }
  pptx.defineLayout({ name: 'CUSTOM', width: slideW, height: slideH });
  pptx.layout = 'CUSTOM';
  pptx.title = 'LayerCraft Layer Breakdown';
  pptx.author = 'LayerCraft AI';

  // Slide 1: Full composite
  if (compositeCanvas) {
    const slide = pptx.addSlide();
    slide.addImage({
      data: canvasToBase64(compositeCanvas),
      x: 0, y: 0, w: slideW, h: slideH,
    });
    slide.addText('完整合成图', {
      x: 0.3, y: slideH - 0.6, w: 3, h: 0.4,
      fontSize: 14, color: 'FFFFFF', bold: true,
      shadow: { type: 'outer', blur: 3, offset: 1, color: '000000' },
    });
  }

  // One slide per layer
  for (const layer of layers) {
    if (!layer.canvas || !layer.visible) continue;
    const slide = pptx.addSlide();
    slide.background = { fill: '1a1b25' };
    slide.addImage({
      data: canvasToBase64(layer.canvas),
      x: 0, y: 0, w: slideW, h: slideH,
    });
    slide.addText(layer.name, {
      x: 0.3, y: slideH - 0.6, w: 4, h: 0.4,
      fontSize: 14, color: 'FFFFFF', bold: true,
      shadow: { type: 'outer', blur: 3, offset: 1, color: '000000' },
    });
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  await pptx.writeFile({ fileName: `LayerCraft_${timestamp}_breakdown.pptx` });
}
