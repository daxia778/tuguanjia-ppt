/**
 * api.js - AI Image API integration
 * Uses chat completions with vision (for ChatGPT Plus reverse proxy)
 * Falls back to images/edits endpoint if configured
 */

const STORAGE_KEY = 'layercraft_api_config';

const DEFAULT_CONFIG = {
  baseUrl: '/proxy-api',
  apiKey: 'lc-image-2026',
  model: 'gpt-image-2',
  size: 'auto',
  mode: 'images', // 'chat' (ChatGPT proxy) or 'images' (OpenAI API / chatgpt2api)
};

export function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Convert canvas to base64 (just the data part, no prefix)
 */
function canvasToBase64Raw(canvas) {
  return canvas.toDataURL('image/png').split(',')[1];
}

/**
 * Convert canvas to data URI
 */
function canvasToDataURI(canvas) {
  return canvas.toDataURL('image/png');
}

// ===== Chat Completions Mode (for ChatGPT Plus proxy) =====

/**
 * Send image + text prompt via chat completions with vision
 * Returns the generated image as a data URI
 */
async function callChatWithImage(imageSource, prompt, config, onProgress) {
  const cfg = config || loadConfig();
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/chat/completions`;

  let imageBase64;
  if (imageSource instanceof HTMLCanvasElement || imageSource instanceof OffscreenCanvas) {
    imageBase64 = canvasToBase64Raw(imageSource);
  } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
    imageBase64 = imageSource.split(',')[1];
  }

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${imageBase64}`,
          },
        },
        {
          type: 'text',
          text: prompt + '\n\n请直接返回处理后的图片，不要返回文字说明。',
        },
      ],
    },
  ];

  if (onProgress) onProgress('正在调用 AI...');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    let msg = `API 错误 (${response.status})`;
    try {
      const errJson = JSON.parse(errBody);
      msg = errJson.error?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();

  // Extract image from response
  if (data.choices && data.choices.length > 0) {
    const message = data.choices[0].message;

    // Check for image in content (multimodal response)
    if (message.content && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image_url' || part.type === 'image') {
          const imgUrl = part.image_url?.url || part.url;
          if (imgUrl) return imgUrl;
        }
      }
    }

    // Some APIs return image as base64 in a special field
    if (message.image) {
      return `data:image/png;base64,${message.image}`;
    }

    // Check for inline base64 in text content
    const textContent = typeof message.content === 'string' ? message.content : '';
    const b64Match = textContent.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
    if (b64Match) {
      return b64Match[0];
    }

    // If the response is just text, the model couldn't generate an image
    if (textContent) {
      throw new Error('模型返回了文字而不是图片。你的反代可能不支持图像生成功能。返回内容: ' + textContent.slice(0, 200));
    }
  }

  throw new Error('API 返回了意外的格式，无法提取图像');
}

// ===== Images Edit Mode (for direct OpenAI API) =====

async function callImageEdit(imageSource, prompt, config, onProgress) {
  const cfg = config || loadConfig();
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/images/edits`;

  let blob;
  if (imageSource instanceof HTMLCanvasElement || imageSource instanceof OffscreenCanvas) {
    blob = await new Promise(resolve => imageSource.toBlob(resolve, 'image/png'));
  } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
    const res = await fetch(imageSource);
    blob = await res.blob();
  }

  const imageFile = new File([blob], 'image.png', { type: 'image/png' });
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('prompt', prompt);
  formData.append('model', cfg.model);
  formData.append('n', '1');
  formData.append('response_format', 'b64_json'); // Force base64 to avoid CORS on image URLs
  if (cfg.size !== 'auto') {
    formData.append('size', cfg.size);
  }

  if (onProgress) onProgress('正在调用 AI API...');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${cfg.apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text();
    let msg = `API 错误 (${response.status})`;
    try { msg = JSON.parse(errBody).error?.message || msg; } catch {}
    throw new Error(msg);
  }

  const data = await response.json();
  if (data.data && data.data.length > 0) {
    const item = data.data[0];
    if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
    if (item.url) return item.url;
  }
  throw new Error('API 返回了意外的格式');
}

// ===== Public API =====

/**
 * Route to the correct API mode
 */
async function callAI(imageSource, prompt, onProgress) {
  const cfg = loadConfig();
  if (cfg.mode === 'images') {
    return callImageEdit(imageSource, prompt, cfg, onProgress);
  }
  return callChatWithImage(imageSource, prompt, cfg, onProgress);
}

/**
 * Generate color block segmentation map
 */
export async function generateColorBlockMap(imageSource, onProgress) {
  const prompt = `请把这张图中的主要元素全部替换成不同的平面彩色色块。要求：
1. 每个主要元素用一个不同的纯色填充
2. 色块的轮廓形状必须和原图中对应元素的轮廓完全一致
3. 不用分的太细，每个主要视觉元素一个纯色即可
4. 色块边缘不要有白边或渐变，必须是纯色的硬边
5. 背景也用一个纯色填充
6. 不同元素之间的颜色差异要足够大，方便区分
7. 保持原图的构图和元素位置不变`;

  return callAI(imageSource, prompt, onProgress);
}

/**
 * Extract background layer
 */
export async function extractBackground(imageSource, onProgress) {
  const prompt = `提取这张图的画面背景。要求：
1. 移除画面中所有的前景元素（人物、文字、装饰物等）
2. 用合理的背景内容填充被前景元素遮挡的区域
3. 保持背景的整体风格、颜色和纹理的一致性
4. 最终输出一张完整的、没有前景元素的纯背景图`;

  return callAI(imageSource, prompt, onProgress);
}

/**
 * Test API connectivity
 */
export async function testConnection(config) {
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/models`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` },
  });

  if (!response.ok) throw new Error(`连接失败 (${response.status})`);

  const data = await response.json();
  const models = data.data || [];
  return { success: true, modelCount: models.length };
}

/**
 * Load an image URL/dataURI into a canvas
 */
export function loadImageToCanvas(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}
