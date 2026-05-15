#!/usr/bin/env node
/**
 * LayerCraft End-to-End Workflow Test
 * Tests: Image → Color Block Map (AI) → Auto-Segment → Extract Layers → Export PPTX
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import PptxGenJS from 'pptxgenjs';

const API_BASE = 'http://localhost:8200';
const API_KEY = 'lc-image-2026';
const TEST_IMAGE = './test_poster.png';
const OUTPUT_DIR = './test_output';

// Ensure output directory
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function log(step, msg) {
  console.log(`\n[${'='.repeat(3)} ${step} ${'='.repeat(3)}] ${msg}`);
}

// ===== Step 1: Generate Color Block Map via AI =====
async function generateColorBlockMap(imagePath) {
  log('STEP 1', '调用 chatgpt2api 生成色块图...');
  
  const imageBuffer = fs.readFileSync(imagePath);
  const imageB64 = imageBuffer.toString('base64');
  
  // Try /v1/images/edits first with longer timeout, then fallback to /v1/chat/completions
  const formData = new FormData();
  formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'image.png');
  formData.append('model', 'gpt-image-2');
  formData.append('n', '1');
  formData.append('response_format', 'b64_json');
  formData.append('prompt', `将图中所有元素替换为纯色色块。太阳用红色、天空用浅蓝、山用深蓝、树用绿色、文字用黄色、云用白色。保持原位置和轮廓，硬边纯色填充。`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000); // 3 min timeout
  
  const startTime = Date.now();
  try {
    const response = await fetch(`${API_BASE}/v1/images/edits`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err.slice(0, 300)}`);
    }

    const data = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (!data.data || !data.data[0]) throw new Error('No image data returned');
    
    const item = data.data[0];
    if (item.b64_json) {
      const buf = Buffer.from(item.b64_json, 'base64');
      const colormapPath = path.join(OUTPUT_DIR, 'colormap.png');
      fs.writeFileSync(colormapPath, buf);
      console.log(`  ✅ 色块图生成成功 (${elapsed}s) → ${colormapPath} (${(buf.length/1024).toFixed(0)}KB)`);
      return `data:image/png;base64,${item.b64_json}`;
    }
    if (item.url) {
      const imgResp = await fetch(item.url);
      const buf = Buffer.from(await imgResp.arrayBuffer());
      fs.writeFileSync(path.join(OUTPUT_DIR, 'colormap.png'), buf);
      console.log(`  ✅ 色块图生成成功 (${elapsed}s) → colormap.png`);
      return `data:image/png;base64,${buf.toString('base64')}`;
    }
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.log(`  ⚠️ /v1/images/edits 超时(3min)，回退到 /v1/images/generations ...`);
    } else {
      console.log(`  ⚠️ /v1/images/edits 失败: ${err.message.slice(0,100)}, 回退...`);
    }
  }
  
  // Fallback: use /v1/images/generations (text-to-image)
  console.log('  → 使用 /v1/images/generations 生成色块图...');
  const startTime2 = Date.now();
  const genResp = await fetch(`${API_BASE}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt: `Create a flat color block segmentation map based on this description:
A poster with: light blue sky background, red circle sun in top right, white clouds, dark blue mountains at bottom, green pine trees in foreground, yellow "ADVENTURE" text in center.
Rules:
- Each element is a different FLAT SOLID COLOR with no gradients
- Hard edges only, no anti-aliasing
- Background: light blue (#87CEEB), Sun: red (#FF0000), Mountains: dark blue (#1a3a5c), Trees: green (#228B22), Text: yellow (#FFD700), Clouds: white (#FFFFFF)
- Keep exact same positions and shapes as described
- Output should look like a paint-by-numbers template`,
      n: 1,
      response_format: 'b64_json',
    }),
  });
  
  if (!genResp.ok) {
    const err = await genResp.text();
    throw new Error(`generations API error ${genResp.status}: ${err.slice(0, 300)}`);
  }
  
  const genData = await genResp.json();
  const elapsed2 = ((Date.now() - startTime2) / 1000).toFixed(1);
  
  const genItem = genData.data[0];
  if (genItem.b64_json) {
    const buf = Buffer.from(genItem.b64_json, 'base64');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'colormap.png'), buf);
    console.log(`  ✅ 色块图生成成功 (${elapsed2}s) → colormap.png (${(buf.length/1024).toFixed(0)}KB)`);
    return `data:image/png;base64,${genItem.b64_json}`;
  }
  if (genItem.url) {
    const imgResp = await fetch(genItem.url);
    const buf = Buffer.from(await imgResp.arrayBuffer());
    fs.writeFileSync(path.join(OUTPUT_DIR, 'colormap.png'), buf);
    console.log(`  ✅ 色块图生成成功 (${elapsed2}s) → colormap.png`);
    return `data:image/png;base64,${buf.toString('base64')}`;
  }
  
  throw new Error('No image data in generations response');
}

// ===== Step 2: Auto-Segment Color Block Map =====
function autoSegment(imageData, width, height, tolerance = 32, minPixels = 500) {
  log('STEP 2', `自动分割色块图 (${width}x${height}, tolerance=${tolerance}, minPixels=${minPixels})...`);
  
  const pixels = imageData.data;
  const visited = new Uint8Array(width * height);
  const regions = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;
      
      const pi = idx * 4;
      const seedR = pixels[pi], seedG = pixels[pi+1], seedB = pixels[pi+2];
      
      // Flood fill
      const mask = new Uint8Array(width * height);
      const queue = [idx];
      visited[idx] = 1;
      mask[idx] = 255;
      let count = 0;
      
      while (queue.length > 0) {
        const ci = queue.pop();
        count++;
        const cx = ci % width;
        const cy = (ci - cx) / width;
        
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
        regions.push({
          color: { r: seedR, g: seedG, b: seedB },
          mask,
          pixelCount: count,
        });
      }
    }
  }
  
  console.log(`  ✅ 找到 ${regions.length} 个色块区域`);
  regions.forEach((r, i) => {
    const hex = `#${r.color.r.toString(16).padStart(2,'0')}${r.color.g.toString(16).padStart(2,'0')}${r.color.b.toString(16).padStart(2,'0')}`;
    console.log(`     [${i}] ${hex} - ${r.pixelCount.toLocaleString()} px`);
  });
  
  return regions;
}

// ===== Step 3: Extract Layers =====
function extractLayers(originalImageData, regions, width, height) {
  log('STEP 3', `从原图提取 ${regions.length} 个图层...`);
  
  const layers = [];
  const srcPixels = originalImageData.data;
  
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const layerData = ctx.createImageData(width, height);
    const ld = layerData.data;
    
    // Find bounding box
    let minX = width, minY = height, maxX = 0, maxY = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (region.mask[idx] === 255) {
          const pi = idx * 4;
          ld[pi] = srcPixels[pi];
          ld[pi+1] = srcPixels[pi+1];
          ld[pi+2] = srcPixels[pi+2];
          ld[pi+3] = 255;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    ctx.putImageData(layerData, 0, 0);
    
    // Crop to bounding box for the file
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const croppedCanvas = createCanvas(cropW, cropH);
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    
    const hex = `#${region.color.r.toString(16).padStart(2,'0')}${region.color.g.toString(16).padStart(2,'0')}${region.color.b.toString(16).padStart(2,'0')}`;
    const name = `元素_${i+1}_${hex}`;
    
    // Save layer PNG
    const layerPath = path.join(OUTPUT_DIR, `layer_${i+1}.png`);
    fs.writeFileSync(layerPath, canvas.toBuffer('image/png'));
    
    layers.push({
      name,
      canvas,          // full-size canvas (for PPTX positioning)
      croppedCanvas,   // cropped canvas (for preview)
      bounds: { x: minX, y: minY, w: cropW, h: cropH },
      visible: true,
      opacity: 1,
    });
    
    console.log(`  ✅ 图层 ${i+1}: ${name} (${cropW}x${cropH} @ ${minX},${minY}) → ${layerPath}`);
  }
  
  return layers;
}

// ===== Step 4: Export PPTX =====
async function exportPPTX(layers, docWidth, docHeight, originalCanvas) {
  log('STEP 4', `导出 PPTX (${layers.length} 个图层, ${docWidth}x${docHeight})...`);
  
  const pptx = new PptxGenJS();
  
  // Match image aspect ratio
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
  pptx.title = 'LayerCraft Export';
  pptx.author = 'LayerCraft AI';
  
  const scaleX = slideW / docWidth;
  const scaleY = slideH / docHeight;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (slideW - docWidth * scale) / 2;
  const offsetY = (slideH - docHeight * scale) / 2;
  
  // Slide 1: All layers composed (editable - each layer is a separate image)
  const slide1 = pptx.addSlide();
  slide1.background = { fill: 'FFFFFF' };
  
  // Add each layer as a separate image element (bottom-to-top)
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    const imgData = layer.canvas.toDataURL('image/png');
    
    slide1.addImage({
      data: imgData,
      x: offsetX,
      y: offsetY,
      w: docWidth * scale,
      h: docHeight * scale,
    });
  }
  
  slide1.addText('LayerCraft - 分层合成', {
    x: 0.2, y: slideH - 0.5, w: 4, h: 0.35,
    fontSize: 11, color: '999999', fontFace: 'Arial',
  });
  
  // Slide 2+: Individual layers (one per slide)
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const slide = pptx.addSlide();
    slide.background = { fill: '1a1b25' };
    
    const imgData = layer.canvas.toDataURL('image/png');
    slide.addImage({
      data: imgData,
      x: offsetX,
      y: offsetY,
      w: docWidth * scale,
      h: docHeight * scale,
    });
    
    slide.addText(layer.name, {
      x: 0.2, y: slideH - 0.5, w: 5, h: 0.35,
      fontSize: 12, color: 'FFFFFF', bold: true, fontFace: 'Arial',
      shadow: { type: 'outer', blur: 3, offset: 1, color: '000000' },
    });
  }
  
  // Slide: Original image for reference
  const origSlide = pptx.addSlide();
  origSlide.background = { fill: 'FFFFFF' };
  origSlide.addImage({
    data: originalCanvas.toDataURL('image/png'),
    x: offsetX, y: offsetY,
    w: docWidth * scale, h: docHeight * scale,
  });
  origSlide.addText('原图参考', {
    x: 0.2, y: slideH - 0.5, w: 3, h: 0.35,
    fontSize: 12, color: '666666', fontFace: 'Arial',
  });
  
  const outputPath = path.join(OUTPUT_DIR, 'LayerCraft_output.pptx');
  await pptx.writeFile({ fileName: outputPath });
  
  const stat = fs.statSync(outputPath);
  console.log(`  ✅ PPTX 导出成功 → ${outputPath} (${(stat.size/1024).toFixed(0)}KB)`);
  console.log(`     - 幻灯片 1: 分层合成 (所有图层可独立移动/编辑)`);
  console.log(`     - 幻灯片 2-${layers.length+1}: 各图层独立展示`);
  console.log(`     - 幻灯片 ${layers.length+2}: 原图参考`);
  
  return outputPath;
}

// ===== Main Workflow =====
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║    LayerCraft 全流程测试 (5 张图层目标)      ║');
  console.log('╚══════════════════════════════════════════════╝');
  
  // Load original image
  const originalImage = await loadImage(TEST_IMAGE);
  const width = originalImage.width;
  const height = originalImage.height;
  console.log(`\n原图: ${TEST_IMAGE} (${width}x${height})`);
  
  const originalCanvas = createCanvas(width, height);
  const originalCtx = originalCanvas.getContext('2d');
  originalCtx.drawImage(originalImage, 0, 0);
  const originalImageData = originalCtx.getImageData(0, 0, width, height);
  
  // Step 1: Generate color block map via AI
  const colormapDataUri = await generateColorBlockMap(TEST_IMAGE);
  
  // Load colormap
  const colormapImage = await loadImage(colormapDataUri);
  const cmCanvas = createCanvas(colormapImage.width, colormapImage.height);
  const cmCtx = cmCanvas.getContext('2d');
  cmCtx.drawImage(colormapImage, 0, 0);
  const cmImageData = cmCtx.getImageData(0, 0, colormapImage.width, colormapImage.height);
  
  console.log(`  色块图尺寸: ${colormapImage.width}x${colormapImage.height}`);
  
  // Step 2: Auto-segment
  // Use the colormap dimensions (might differ from original)
  const regions = autoSegment(cmImageData, colormapImage.width, colormapImage.height, 32, 500);
  
  if (regions.length === 0) {
    console.error('❌ 未找到任何色块区域!');
    process.exit(1);
  }
  
  // Step 3: Extract layers from ORIGINAL image using colormap masks
  // If colormap size differs, we need to scale masks
  let extractWidth = width;
  let extractHeight = height;
  let extractImageData = originalImageData;
  
  if (colormapImage.width !== width || colormapImage.height !== height) {
    console.log(`  ⚠️ 色块图尺寸 (${colormapImage.width}x${colormapImage.height}) != 原图 (${width}x${height})`);
    console.log(`  使用色块图尺寸提取图层，原图缩放到匹配...`);
    // Resize original to match colormap
    const resizedCanvas = createCanvas(colormapImage.width, colormapImage.height);
    const resizedCtx = resizedCanvas.getContext('2d');
    resizedCtx.drawImage(originalImage, 0, 0, colormapImage.width, colormapImage.height);
    extractImageData = resizedCtx.getImageData(0, 0, colormapImage.width, colormapImage.height);
    extractWidth = colormapImage.width;
    extractHeight = colormapImage.height;
  }
  
  const layers = extractLayers(extractImageData, regions, extractWidth, extractHeight);
  
  // Step 4: Export PPTX
  // Use a canvas matching the extract dimensions for the original reference
  const refCanvas = createCanvas(extractWidth, extractHeight);
  const refCtx = refCanvas.getContext('2d');
  refCtx.drawImage(originalImage, 0, 0, extractWidth, extractHeight);
  
  const pptxPath = await exportPPTX(layers, extractWidth, extractHeight, refCanvas);
  
  // Summary
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║              测试结果汇总                     ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║ 原图:     ${TEST_IMAGE.padEnd(33)}║`);
  console.log(`║ 色块图:   test_output/colormap.png           ║`);
  console.log(`║ 图层数:   ${String(layers.length).padEnd(33)}║`);
  console.log(`║ PPTX:     ${pptxPath.padEnd(33)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  
  const files = fs.readdirSync(OUTPUT_DIR);
  console.log('║ 输出文件:                                    ║');
  files.forEach(f => {
    const stat = fs.statSync(path.join(OUTPUT_DIR, f));
    const size = `${(stat.size/1024).toFixed(0)}KB`;
    console.log(`║   ${f.padEnd(30)} ${size.padStart(8)} ║`);
  });
  console.log('╚══════════════════════════════════════════════╝');
}

main().catch(err => {
  console.error('\n❌ 测试失败:', err.message);
  console.error(err.stack);
  process.exit(1);
});
