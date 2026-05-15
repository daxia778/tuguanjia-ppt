/**
 * psd-export.js - PSD and PNG export using ag-psd
 */

import { writePsd } from 'ag-psd';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

/**
 * Export layers as a PSD file
 * @param {Array} layers - array of {name, canvas, visible, opacity}
 * @param {number} width - document width
 * @param {number} height - document height
 * @param {HTMLCanvasElement} compositeCanvas - flattened preview
 */
export function exportPSD(layers, width, height, compositeCanvas) {
  const psd = {
    width,
    height,
    canvas: compositeCanvas,
    children: layers.filter(l => l.canvas).map(layer => ({
      name: layer.name,
      canvas: layer.canvas,
      hidden: !layer.visible,
      opacity: Math.round((layer.opacity ?? 1) * 255),
    })),
  };

  const buffer = writePsd(psd);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `LayerCraft_${timestamp}.psd`);
}

/**
 * Export a single layer as PNG
 */
export function exportLayerPNG(layer) {
  const canvas = layer.canvas;
  canvas.toBlob((blob) => {
    saveAs(blob, `${layer.name}.png`);
  }, 'image/png');
}

/**
 * Export all layers as a ZIP of PNGs
 */
export async function exportAllPNG(layers) {
  const zip = new JSZip();

  for (const layer of layers) {
    if (!layer.canvas) continue;
    const blob = await new Promise(resolve => {
      layer.canvas.toBlob(resolve, 'image/png');
    });
    zip.file(`${layer.name}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(zipBlob, `LayerCraft_${timestamp}_layers.zip`);
}
