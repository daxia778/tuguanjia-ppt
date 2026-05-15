#!/usr/bin/env node
/**
 * LayerCraft E2E Test v2 - Optimized for ~5 layers
 * Uses existing colormap, optimized tolerance + merge
 */
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import PptxGenJS from 'pptxgenjs';

const API_BASE = 'http://localhost:8200';
const API_KEY = 'lc-image-2026';
const TEST_IMAGE = './test_poster.png';
const OUTPUT_DIR = './test_output_v2';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function log(step, msg) {
  console.log(`\n[${'='.repeat(3)} ${step} ${'='.repeat(3)}] ${msg}`);
}

// Color distance (Euclidean)
function colorDist(a, b) {
  return Math.sqrt((a.r-b.r)**2 + (a.g-b.g)**2 + (a.b-b.b)**2);
}

// Step 1: Use existing colormap or generate new one
async function getColormap() {
  const existing = './test_output/colormap.png';
  if (fs.existsSync(existing)) {
    log('STEP 1', `使用已有色块图: ${existing}`);
    return existing;
  }
  
  log('STEP 1', '调用 chatgpt2api 生成色块图...');
  const imageBuffer = fs.readFileSync(TEST_IMAGE);
  const formData = new FormData();
  formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'image.png');
  formData.append('model', 'gpt-image-2');
  formData.append('n', '1');
  formData.append('response_format', 'b64_json');
  formData.append('prompt', `将图中所有元素替换为纯色色块。每个主要元素一个纯色，保持轮廓和位置不变，硬边填充。`);

  const t = Date.now();
  const resp = await fetch(`${API_BASE}/v1/images/edits`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },
    body: formData,
  });
  const data = await resp.json();
  const buf = Buffer.from(data.data[0].b64_json, 'base64');
  const out = path.join(OUTPUT_DIR, 'colormap.png');
  fs.writeFileSync(out, buf);
  console.log(`  ✅ 色块图生成 (${((Date.now()-t)/1000).toFixed(1)}s) → ${out}`);
  return out;
}

// Step 2: Smart Segmentation with merge
function smartSegment(imageData, width, height) {
  log('STEP 2', `智能分割 (${width}x${height})...`);
  
  const pixels = imageData.data;
  const visited = new Uint8Array(width * height);
  const tolerance = 45; // Higher tolerance to merge similar colors
  const minPixels = 2000; // Larger minimum to skip tiny fragments
  
  const rawRegions = [];
  
  // Phase 1: Flood fill with higher tolerance
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;
      
      const pi = idx * 4;
      const seedR = pixels[pi], seedG = pixels[pi+1], seedB = pixels[pi+2];
      
      const mask = new Uint8Array(width * height);
      const queue = [idx];
      visited[idx] = 1;
      mask[idx] = 255;
      let count = 0;
      let sumR = 0, sumG = 0, sumB = 0;
      
      while (queue.length > 0) {
        const ci = queue.pop();
        count++;
        const cpi = ci * 4;
        sumR += pixels[cpi]; sumG += pixels[cpi+1]; sumB += pixels[cpi+2];
        
        const cx = ci % width, cy = (ci - cx) / width;
        const neighbors = [];
        if (cx > 0) neighbors.push(ci - 1);
        if (cx < width - 1) neighbors.push(ci + 1);
        if (cy > 0) neighbors.push(ci - width);
        if (cy < height - 1) neighbors.push(ci + width);
        
        for (const ni of neighbors) {
          if (visited[ni]) continue;
          const npi = ni * 4;
          const dr = Math.abs(pixels[npi] - seedR);
          const dg = Math.abs(pixels[npi+1] - seedG);
          const db = Math.abs(pixels[npi+2] - seedB);
          if (dr <= tolerance && dg <= tolerance && db <= tolerance) {
            visited[ni] = 1;
            mask[ni] = 255;
            queue.push(ni);
          }
        }
      }
      
      if (count >= minPixels) {
        rawRegions.push({
          color: { r: Math.round(sumR/count), g: Math.round(sumG/count), b: Math.round(sumB/count) },
          mask, pixelCount: count,
        });
      }
    }
  }
  
  console.log(`  初步: ${rawRegions.length} 个区域`);
  
  // Phase 2: Merge regions with similar colors (< 60 distance)
  const mergeThreshold = 60;
  const merged = [];
  const used = new Set();
  
  // Sort by pixel count (largest first)
  rawRegions.sort((a, b) => b.pixelCount - a.pixelCount);
  
  for (let i = 0; i < rawRegions.length; i++) {
    if (used.has(i)) continue;
    
    const base = rawRegions[i];
    const combinedMask = new Uint8Array(base.mask);
    let totalPixels = base.pixelCount;
    
    for (let j = i + 1; j < rawRegions.length; j++) {
      if (used.has(j)) continue;
      if (colorDist(base.color, rawRegions[j].color) < mergeThreshold) {
        // Merge
        for (let k = 0; k < combinedMask.length; k++) {
          if (rawRegions[j].mask[k] === 255) combinedMask[k] = 255;
        }
        totalPixels += rawRegions[j].pixelCount;
        used.add(j);
      }
    }
    used.add(i);
    merged.push({ color: base.color, mask: combinedMask, pixelCount: totalPixels });
  }
  
  // Phase 3: Name regions intelligently based on position/color
  const named = merged.map((r, i) => {
    const { color: c } = r;
    let name;
    // Find centroid
    let cx = 0, cy = 0, cnt = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (r.mask[y * width + x] === 255) { cx += x; cy += y; cnt++; }
      }
    }
    cx = Math.round(cx / cnt);
    cy = Math.round(cy / cnt);
    
    const brightness = (c.r + c.g + c.b) / 3;
    
    if (c.r > 180 && c.g < 80 && c.b < 80) name = '太阳';
    else if (c.r < 50 && c.g < 80 && c.b > 120) name = '山脉';
    else if (c.r < 80 && c.g > 100 && c.b < 100) name = '树木';
    else if (c.r > 200 && c.g > 200 && c.b < 100) name = '文字';
    else if (brightness > 220) name = cy < height * 0.3 ? '云朵' : '边框';
    else if (c.b > 150 && c.r < 150 && c.g > 150) name = '天空';
    else if (brightness > 180 && c.b > c.r) name = '天空/背景';
    else name = `元素_${i+1}`;
    
    return { ...r, name, centroid: { x: cx, y: cy } };
  });
  
  console.log(`  ✅ 合并后: ${named.length} 个图层`);
  named.forEach((r, i) => {
    const hex = `#${r.color.r.toString(16).padStart(2,'0')}${r.color.g.toString(16).padStart(2,'0')}${r.color.b.toString(16).padStart(2,'0')}`;
    console.log(`     [${i}] ${r.name.padEnd(10)} ${hex} - ${r.pixelCount.toLocaleString()} px (center: ${r.centroid.x},${r.centroid.y})`);
  });
  
  return named;
}

// Step 3: Extract layers
function extractLayers(srcImageData, regions, width, height) {
  log('STEP 3', `提取 ${regions.length} 个图层...`);
  
  const layers = [];
  const srcPx = srcImageData.data;
  
  for (const region of regions) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const ld = ctx.createImageData(width, height);
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (region.mask[idx] === 255) {
          const pi = idx * 4;
          ld.data[pi] = srcPx[pi]; ld.data[pi+1] = srcPx[pi+1];
          ld.data[pi+2] = srcPx[pi+2]; ld.data[pi+3] = 255;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    ctx.putImageData(ld, 0, 0);
    
    const fileName = `${region.name}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), canvas.toBuffer('image/png'));
    
    layers.push({
      name: region.name,
      canvas,
      bounds: { x: minX, y: minY, w: maxX-minX+1, h: maxY-minY+1 },
      visible: true,
    });
    console.log(`  ✅ ${region.name} (${maxX-minX+1}x${maxY-minY+1} @ ${minX},${minY}) → ${fileName}`);
  }
  return layers;
}

// Step 4: Export PPTX
async function exportPPTX(layers, docWidth, docHeight, origCanvas) {
  log('STEP 4', `导出 PPTX (${layers.length} 图层)...`);
  
  const pptx = new PptxGenJS();
  const aspect = docWidth / docHeight;
  const slideW = aspect >= 1 ? 13.33 : 7.5 * aspect;
  const slideH = aspect >= 1 ? 13.33 / aspect : 7.5;
  
  pptx.defineLayout({ name: 'CUSTOM', width: slideW, height: slideH });
  pptx.layout = 'CUSTOM';
  pptx.title = 'LayerCraft - AI 智能分层';
  pptx.author = 'LayerCraft AI';
  
  const scale = Math.min(slideW / docWidth, slideH / docHeight);
  const offX = (slideW - docWidth * scale) / 2;
  const offY = (slideH - docHeight * scale) / 2;
  
  // Slide 1: Editable composite (each layer independently selectable)
  const s1 = pptx.addSlide();
  s1.background = { fill: 'FFFFFF' };
  for (let i = layers.length - 1; i >= 0; i--) {
    s1.addImage({
      data: layers[i].canvas.toDataURL('image/png'),
      x: offX, y: offY, w: docWidth * scale, h: docHeight * scale,
    });
  }
  s1.addText('LayerCraft - 可编辑分层合成', {
    x: 0.2, y: slideH - 0.45, w: 5, h: 0.3,
    fontSize: 10, color: '999999', fontFace: 'Arial',
  });
  
  // Slide 2-N: Individual layers
  for (const layer of layers) {
    const s = pptx.addSlide();
    s.background = { fill: '1a1b25' };
    s.addImage({
      data: layer.canvas.toDataURL('image/png'),
      x: offX, y: offY, w: docWidth * scale, h: docHeight * scale,
    });
    s.addText(layer.name, {
      x: 0.2, y: slideH - 0.45, w: 4, h: 0.3,
      fontSize: 12, color: 'FFFFFF', bold: true, fontFace: 'Arial',
      shadow: { type: 'outer', blur: 3, offset: 1, color: '000000' },
    });
  }
  
  // Last slide: Original
  const sOrig = pptx.addSlide();
  sOrig.addImage({
    data: origCanvas.toDataURL('image/png'),
    x: offX, y: offY, w: docWidth * scale, h: docHeight * scale,
  });
  sOrig.addText('原图参考', {
    x: 0.2, y: slideH - 0.45, w: 3, h: 0.3,
    fontSize: 11, color: '666666', fontFace: 'Arial',
  });
  
  const outPath = path.join(OUTPUT_DIR, 'LayerCraft_output.pptx');
  await pptx.writeFile({ fileName: outPath });
  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`  ✅ PPTX → ${outPath} (${size}KB)`);
  console.log(`     Slide 1: 可编辑合成 (${layers.length} 个可独立拖动的图层)`);
  console.log(`     Slide 2-${layers.length+1}: 各图层独立展示`);
  console.log(`     Slide ${layers.length+2}: 原图参考`);
  
  // Also copy to Desktop
  fs.copyFileSync(outPath, '/Users/admin/Desktop/LayerCraft_output.pptx');
  console.log(`  📁 已复制到桌面: ~/Desktop/LayerCraft_output.pptx`);
  
  return outPath;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  LayerCraft 全流程测试 v2 (优化: 5-8 主要图层)  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  
  const origImg = await loadImage(TEST_IMAGE);
  const W = origImg.width, H = origImg.height;
  console.log(`\n原图: ${TEST_IMAGE} (${W}x${H})`);
  
  // Step 1: Get colormap
  const cmPath = await getColormap();
  const cmImg = await loadImage(cmPath);
  const cmW = cmImg.width, cmH = cmImg.height;
  const cmCanvas = createCanvas(cmW, cmH);
  const cmCtx = cmCanvas.getContext('2d');
  cmCtx.drawImage(cmImg, 0, 0);
  const cmData = cmCtx.getImageData(0, 0, cmW, cmH);
  
  // Step 2: Smart segment
  const regions = smartSegment(cmData, cmW, cmH);
  
  // Step 3: Extract layers using original image (resized to match colormap)
  const srcCanvas = createCanvas(cmW, cmH);
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.drawImage(origImg, 0, 0, cmW, cmH);
  const srcData = srcCtx.getImageData(0, 0, cmW, cmH);
  
  const layers = extractLayers(srcData, regions, cmW, cmH);
  
  // Step 4: PPTX
  await exportPPTX(layers, cmW, cmH, srcCanvas);
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('  ✅ 全流程测试完成!');
  console.log(`  图层数: ${layers.length}`);
  console.log(`  文件: ${OUTPUT_DIR}/`);
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(f => {
    const s = (fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024).toFixed(0);
    console.log(`    ${f.padEnd(35)} ${s}KB`);
  });
  console.log('═'.repeat(50));
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
