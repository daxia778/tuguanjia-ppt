/**
 * magic-wand.js - BFS flood fill selection tool
 * Core algorithm for selecting regions from color block map
 */

/**
 * Calculate color distance between two RGBA pixels
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  // Weighted Euclidean distance (human perception)
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
}

/**
 * Perform BFS flood fill to create a selection mask
 * @param {ImageData} imageData - pixel data from canvas
 * @param {number} startX - click x coordinate
 * @param {number} startY - click y coordinate
 * @param {number} tolerance - color match tolerance (0-255)
 * @param {boolean} contiguous - if true, only select connected pixels
 * @returns {Uint8Array} mask (0 = not selected, 255 = selected)
 */
export function floodFillSelect(imageData, startX, startY, tolerance, contiguous = true) {
  const { data, width, height } = imageData;
  const mask = new Uint8Array(width * height);
  const totalPixels = width * height;

  // Get target color at start position
  const startIdx = (startY * width + startX) * 4;
  const tr = data[startIdx];
  const tg = data[startIdx + 1];
  const tb = data[startIdx + 2];

  if (contiguous) {
    // BFS flood fill for connected region
    const visited = new Uint8Array(totalPixels);
    const queue = [startX + startY * width];
    visited[startX + startY * width] = 1;

    while (queue.length > 0) {
      const pos = queue.shift();
      const x = pos % width;
      const y = (pos - x) / width;
      const idx = pos * 4;

      const dist = colorDistance(data[idx], data[idx + 1], data[idx + 2], tr, tg, tb);
      if (dist <= tolerance) {
        mask[pos] = 255;

        // Check 4-connected neighbors
        const neighbors = [];
        if (x > 0) neighbors.push(pos - 1);
        if (x < width - 1) neighbors.push(pos + 1);
        if (y > 0) neighbors.push(pos - width);
        if (y < height - 1) neighbors.push(pos + width);

        for (const npos of neighbors) {
          if (!visited[npos]) {
            visited[npos] = 1;
            queue.push(npos);
          }
        }
      }
    }
  } else {
    // Non-contiguous: select all pixels with matching color
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const dist = colorDistance(data[idx], data[idx + 1], data[idx + 2], tr, tg, tb);
      if (dist <= tolerance) {
        mask[i] = 255;
      }
    }
  }

  return mask;
}

/**
 * Apply selection mask to source image, extracting selected pixels
 * @param {ImageData} sourceImageData - original image pixels
 * @param {Uint8Array} mask - selection mask
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement} canvas with extracted pixels (transparent background)
 */
export function extractLayerFromMask(sourceImageData, mask, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const output = ctx.createImageData(width, height);
  const src = sourceImageData.data;
  const dst = output.data;

  // Find bounding box of selection for metadata
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let hasPixels = false;

  for (let i = 0; i < width * height; i++) {
    if (mask[i] === 255) {
      const idx = i * 4;
      dst[idx] = src[idx];
      dst[idx + 1] = src[idx + 1];
      dst[idx + 2] = src[idx + 2];
      dst[idx + 3] = src[idx + 3];

      const x = i % width;
      const y = (i - x) / width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      hasPixels = true;
    }
  }

  ctx.putImageData(output, 0, 0);

  // Attach bounding box info
  canvas._bounds = hasPixels ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null;

  return canvas;
}

/**
 * Render selection outline (marching ants) on a canvas
 * @param {CanvasRenderingContext2D} ctx - selection overlay canvas context
 * @param {Uint8Array} mask - selection mask
 * @param {number} width
 * @param {number} height
 * @param {number} offset - animation offset for marching ants
 */
export function renderSelectionOutline(ctx, mask, width, height, offset = 0) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Find border pixels (pixels in mask that have a neighbor not in mask)
  const borderPixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (mask[i] !== 255) continue;

      const hasOutsideNeighbor =
        x === 0 || x === width - 1 || y === 0 || y === height - 1 ||
        mask[i - 1] !== 255 || mask[i + 1] !== 255 ||
        mask[i - width] !== 255 || mask[i + width] !== 255;

      if (hasOutsideNeighbor) {
        borderPixels.push({ x, y });
      }
    }
  }

  if (borderPixels.length === 0) return;

  // Draw marching ants
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -offset;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;

  // Draw outline as individual pixel borders
  ctx.beginPath();
  for (const { x, y } of borderPixels) {
    const i = y * width + x;
    // Draw edges where neighbor is outside
    if (x === 0 || mask[i - 1] !== 255) {
      ctx.moveTo(x, y); ctx.lineTo(x, y + 1);
    }
    if (x === width - 1 || mask[i + 1] !== 255) {
      ctx.moveTo(x + 1, y); ctx.lineTo(x + 1, y + 1);
    }
    if (y === 0 || mask[i - width] !== 255) {
      ctx.moveTo(x, y); ctx.lineTo(x + 1, y);
    }
    if (y === height - 1 || mask[i + width] !== 255) {
      ctx.moveTo(x, y + 1); ctx.lineTo(x + 1, y + 1);
    }
  }
  ctx.stroke();

  // Second pass with black offset for visibility
  ctx.lineDashOffset = -(offset + 4);
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  for (const { x, y } of borderPixels) {
    const i = y * width + x;
    if (x === 0 || mask[i - 1] !== 255) {
      ctx.moveTo(x, y); ctx.lineTo(x, y + 1);
    }
    if (x === width - 1 || mask[i + 1] !== 255) {
      ctx.moveTo(x + 1, y); ctx.lineTo(x + 1, y + 1);
    }
    if (y === 0 || mask[i - width] !== 255) {
      ctx.moveTo(x, y); ctx.lineTo(x + 1, y);
    }
    if (y === height - 1 || mask[i + width] !== 255) {
      ctx.moveTo(x, y + 1); ctx.lineTo(x + 1, y + 1);
    }
  }
  ctx.stroke();

  ctx.setLineDash([]);
}

/**
 * Auto-segment color block map into individual masks
 * Scans the image for distinct color regions and returns an array of masks
 * @param {ImageData} imageData - color block map pixel data
 * @param {number} tolerance - color match tolerance
 * @param {number} minArea - minimum pixel count for a valid region
 * @returns {Array<{mask: Uint8Array, color: {r,g,b}, area: number}>}
 */
export function autoSegment(imageData, tolerance = 20, minArea = 500) {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const assigned = new Uint8Array(totalPixels); // which pixels are already assigned
  const regions = [];

  for (let i = 0; i < totalPixels; i++) {
    if (assigned[i]) continue;

    const idx = i * 4;
    const tr = data[idx];
    const tg = data[idx + 1];
    const tb = data[idx + 2];

    // BFS from this pixel
    const mask = new Uint8Array(totalPixels);
    const visited = new Uint8Array(totalPixels);
    const queue = [i];
    visited[i] = 1;
    let area = 0;

    while (queue.length > 0) {
      const pos = queue.shift();
      const pidx = pos * 4;
      const dist = colorDistance(data[pidx], data[pidx + 1], data[pidx + 2], tr, tg, tb);

      if (dist <= tolerance) {
        mask[pos] = 255;
        assigned[pos] = 1;
        area++;

        const x = pos % width;
        const y = (pos - x) / width;
        const neighbors = [];
        if (x > 0) neighbors.push(pos - 1);
        if (x < width - 1) neighbors.push(pos + 1);
        if (y > 0) neighbors.push(pos - width);
        if (y < height - 1) neighbors.push(pos + width);

        for (const npos of neighbors) {
          if (!visited[npos] && !assigned[npos]) {
            visited[npos] = 1;
            queue.push(npos);
          }
        }
      }
    }

    if (area >= minArea) {
      regions.push({ mask, color: { r: tr, g: tg, b: tb }, area });
    }
  }

  return regions;
}
