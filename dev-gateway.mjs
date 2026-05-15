#!/usr/bin/env node
/**
 * AI PPT 本地开发网关 v2 — 含 Mock Auth + AI PPT 生成桥接
 * 统一入口 :81，按路径分流到各服务
 *
 * 路由规则：
 *   /app-api/ppt/*     → 内置 PPT 业务 API（mock auth + AI 桥接）
 *   /app-api/member/*  → 内置 Mock 认证 API
 *   /admin-api/*       → Spring Boot 后端 (:48080)
 *   /app-api/*         → Spring Boot 后端 (:48080)（其他 app-api）
 *   /admin/*           → 管理面板 Vite (:8181)
 *   /*                 → 用户前台 Vite (:3002)
 *
 * 启动方式：node dev-gateway.mjs
 */

import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'
import crypto from 'node:crypto'

const GATEWAY_PORT = 81

// ═══════════════════════════════════════════════════════════
// AI 配置（chatgpt2api 桥接）
// ═══════════════════════════════════════════════════════════
const AI_CONFIG = {
  apiUrl: 'http://127.0.0.1:8200/v1/chat/completions',
  apiKey: 'lc-image-2026',
  model: 'gpt-5-3',
  imageApiUrl: 'http://127.0.0.1:8200/v1/images/generations',
  imageModel: 'gpt-image-2',
  imageSize: '1792x1024',
}

// ═══════════════════════════════════════════════════════════
// 内存数据存储（MVP 内测用）
// ═══════════════════════════════════════════════════════════
const users = new Map()      // email → { id, email, nickname, password, points, totalEarned, totalSpent }
const tokens = new Map()     // token → userId
const tasks = new Map()      // taskNo → task object
const pointsFlows = []       // { userId, flowType, bizType, amount, balanceAfter, remark, createTime }

// 预置内测用户
const testUser = {
  id: 1001, email: 'test@aippt.com', nickname: '内测用户',
  password: 'test123', points: 130, totalEarned: 130, totalSpent: 0
}
users.set(testUser.email, testUser)
pointsFlows.push({
  id: 1, userId: testUser.id, flowType: 1, bizType: 'REGISTER',
  amount: 30, balanceAfter: 30, remark: '新用户注册赠送', createTime: new Date().toISOString()
})
pointsFlows.push({
  id: 2, userId: testUser.id, flowType: 1, bizType: 'REDEEM',
  bizId: 'PPT-TEST-0001', amount: 100, balanceAfter: 130, remark: '兑换码 PPT-TEST-0001', createTime: new Date().toISOString()
})

// 预置兑换码
const redeemCodes = new Map([
  ['PPT-TEST-0001', { points: 30, status: 1, usedBy: testUser.id }],
  ['PPT-TEST-0002', { points: 30, status: 0 }],
  ['PPT-TEST-0003', { points: 50, status: 0 }],
  ['PPT-TEST-0004', { points: 100, status: 0 }],
  ['PPT-TEST-0005', { points: 30, status: 0 }],
])

let nextTaskId = 1
let nextFlowId = 3

// ═══════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════
function jsonResponse(res, code, data, msg = '') {
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
  })
  res.end(JSON.stringify({ code, data, msg }))
}

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())) }
      catch { resolve({}) }
    })
  })
}

function getAuthUserId(req) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  return tokens.get(token) || null
}

function getUserById(id) {
  for (const u of users.values()) {
    if (u.id === id) return u
  }
  return null
}

function generateToken() {
  return 'aippt-' + crypto.randomBytes(24).toString('hex')
}

function generateTaskNo() {
  const ts = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PPT-${ts}-${r}`
}

// ═══════════════════════════════════════════════════════════
// AI 调用 — 桥接 chatgpt2api
// ═══════════════════════════════════════════════════════════
function callAI(messages, maxTokens = 4096) {
  return new Promise((resolve, reject) => {
    const url = new URL(AI_CONFIG.apiUrl)
    const payload = JSON.stringify({
      model: AI_CONFIG.model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    })

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    }

    const client = url.protocol === 'https:' ? https : http
    const req = client.request(options, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString())
          if (data.choices && data.choices[0]) {
            resolve(data.choices[0].message.content)
          } else if (data.error) {
            reject(new Error(data.error.message || 'AI API error'))
          } else {
            resolve(JSON.stringify(data))
          }
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('AI request timeout')) })
    req.write(payload)
    req.end()
  })
}

// ═══════════════════════════════════════════════════════════
// 图片生成 — 桥接 chatgpt2api gpt-image-2
// ═══════════════════════════════════════════════════════════
function callImageAI(prompt) {
  return new Promise((resolve, reject) => {
    const url = new URL(AI_CONFIG.imageApiUrl)
    const payload = JSON.stringify({
      model: AI_CONFIG.imageModel,
      prompt,
      n: 1,
      size: AI_CONFIG.imageSize,
    })

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    }

    const client = url.protocol === 'https:' ? https : http
    const req = client.request(options, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString())
          if (data.data && data.data[0]) {
            resolve(data.data[0].url || data.data[0].b64_json)
          } else if (data.error) {
            reject(new Error(data.error.message || 'Image API error'))
          } else {
            reject(new Error('No image data returned'))
          }
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.setTimeout(180000, () => { req.destroy(); reject(new Error('Image generation timeout')) })
    req.write(payload)
    req.end()
  })
}

/**
 * 为单页幻灯片构建高品质图片生成 prompt
 */
function buildSlideImagePrompt(slide, totalTitle, styleName, isFirst, isLast, pageNum, totalPages) {
  // 极致细化的风格描述
  const styleDesc = {
    modern: `Ultra-premium minimalist corporate design. Background: soft white-to-light-gray gradient with subtle geometric mesh pattern at 10% opacity. Accent color: sophisticated royal blue (#2563eb). Typography: bold sans-serif (similar to Inter or SF Pro), title in deep charcoal (#1e293b), body text in slate gray (#475569). Decorative elements: thin accent lines, subtle drop shadows, frosted glass cards for content blocks. Layout uses generous whitespace and golden ratio proportions. Bottom-right corner has a thin blue accent bar.`,
    dark: `Luxury dark-mode executive design. Background: deep rich gradient from #0f172a to #1e1b4b with subtle constellation dot pattern at 5% opacity. Accent color: warm amber-gold (#f59e0b) and soft coral (#fb7185). Typography: premium weight sans-serif, titles in crisp white, body in cool silver (#cbd5e1). Decorative elements: glassmorphism content cards with subtle border glow, ambient light spots in corners, thin gold divider lines. Feels like a premium Apple keynote.`,
    vibrant: `Bold futuristic tech design. Background: rich diagonal gradient from deep coral (#fb542b) through magenta (#ec4899) to electric purple (#8b5cf6). Typography: extra-bold white sans-serif titles with subtle text-shadow, body in white at 90% opacity. Decorative elements: floating geometric shapes (circles, hexagons) at low opacity, neon-glow accent lines, glassmorphism cards with white border. Feels like a cutting-edge startup pitch deck.`,
  }
  const sd = styleDesc[styleName] || styleDesc.modern

  const commonRules = `CRITICAL RULES:
- This is a REAL presentation slide, NOT clipart or cartoon
- All text must be rendered in crisp, professional typography - CLEARLY READABLE
- Chinese text must be rendered correctly and beautifully
- NO human figures, NO photos of people, NO cartoon characters, NO emoji icons
- NO cheap clipart icons - use only abstract geometric shapes or subtle line-art if needed
- Aspect ratio must be exactly 16:9
- The slide must look like it was designed by a top-tier design agency
- Use depth, shadows, and layering to create visual richness`

  if (isFirst) {
    return `Design a stunning, high-end presentation COVER SLIDE. ${sd}

CONTENT TO DISPLAY:
- Main title: "${slide.title}" (rendered large and prominent, centered or left-aligned)
- Subtitle: "${(slide.content || []).join(' · ')}" (smaller, below the title)

DESIGN DIRECTION:
- The title should be the hero element, taking 40% of the visual weight
- Add sophisticated decorative elements: gradient orbs, subtle grid lines, or floating geometric shapes
- Include a thin accent bar or divider between title and subtitle
- Bottom area: small "AIPPT" watermark text at 30% opacity
${commonRules}`
  }

  if (isLast) {
    return `Design a stunning, high-end presentation CLOSING/THANK-YOU SLIDE. ${sd}

CONTENT TO DISPLAY:
- Main text: "${slide.title}" (large, centered, impactful)
- Key takeaways: ${(slide.content || []).map(c => `"${c}"`).join(', ')}

DESIGN DIRECTION:
- Centered, powerful layout with the thank-you message as the hero
- Add elegant decorative flourishes: gradient orbs, subtle particle effects, or radial light
- The key takeaways should be in a smaller font below, or arranged as elegant tags
- Feel ceremonial and conclusive - this is the final impression
${commonRules}`
  }

  const bullets = (slide.content || []).map((c, i) => `• ${c}`).join('\n')
  return `Design a stunning, high-end presentation CONTENT SLIDE (page ${pageNum} of ${totalPages}). ${sd}

CONTENT TO DISPLAY:
- Section title: "${slide.title}" (prominent, at the top-left area)
- Key points (render as elegant bullet list or content cards):
${bullets}

DESIGN DIRECTION:
- Title at top with a bold accent underline or left border bar
- Content organized in clean rows - either as styled bullet points with accent markers, or as individual glassmorphism cards
- Each bullet point should have visual breathing room (generous line-height)
- Add subtle page indicator "${pageNum}/${totalPages}" in top-right or bottom-right corner
- Use visual hierarchy: title > bullets > decorative elements
- The overall feel should be PREMIUM and SOPHISTICATED, not basic or template-like
${commonRules}`
}

// ═══════════════════════════════════════════════════════════
// PPT 生成 Prompt（文字大纲）
// ═══════════════════════════════════════════════════════════
function buildPptPrompt(title, description, style, pageCount) {
  const styleNames = { modern: '极简商务', dark: '深邃暗黑', vibrant: '炫彩科技' }
  const styleName = styleNames[style] || '极简商务'

  return `你是一位顶尖的演示文稿策划专家。请为以下主题生成一份 ${pageCount} 页的 PPT 大纲。

## 主题
${title}

${description ? `## 补充说明\n${description}` : ''}

## 设计风格
${styleName}

## 要求
1. 严格输出 JSON 格式，不要任何多余文字
2. 每页包含 title（标题）、content（3-5 个要点，数组格式）、notes（演讲者备注）
3. 第 1 页为封面，最后一页为"谢谢"或总结页
4. 内容要专业、有深度、有数据支撑
5. 确保逻辑递进，结构清晰

## 输出格式
\`\`\`json
{
  "title": "总标题",
  "style": "${style}",
  "slides": [
    {
      "page": 1,
      "title": "封面标题",
      "content": ["副标题或描述"],
      "notes": "开场白建议"
    }
  ]
}
\`\`\`

请直接输出 JSON，不要包含 markdown 代码块标记。`
}

// ═══════════════════════════════════════════════════════════
// 内置 API 路由处理
// ═══════════════════════════════════════════════════════════
async function handleBuiltinApi(req, res, pathname) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Max-Age': '86400',
    })
    res.end()
    return true
  }

  // ─────────── AUTH ───────────
  if (pathname === '/app-api/member/auth/login' && req.method === 'POST') {
    const body = await parseBody(req)
    const email = body.email || body.mobile || ''
    const password = body.password || ''

    const user = users.get(email)
    if (!user || user.password !== password) {
      return jsonResponse(res, 401, null, '邮箱或密码错误')
    }

    const token = generateToken()
    tokens.set(token, user.id)

    return jsonResponse(res, 0, {
      userId: user.id,
      accessToken: token,
      refreshToken: 'refresh-' + token,
      expiresTime: new Date(Date.now() + 7 * 86400000).toISOString(),
    })
  }

  if (pathname === '/app-api/member/auth/register' && req.method === 'POST') {
    const body = await parseBody(req)
    const email = body.email || ''
    const password = body.password || ''

    if (users.has(email)) {
      return jsonResponse(res, 400, null, '该邮箱已注册')
    }

    const newUser = {
      id: 1000 + users.size + 1,
      email,
      nickname: email.split('@')[0],
      password,
      points: 30,
      totalEarned: 30,
      totalSpent: 0,
    }
    users.set(email, newUser)

    const token = generateToken()
    tokens.set(token, newUser.id)

    // 注册赠送积分流水
    pointsFlows.push({
      id: ++nextFlowId, userId: newUser.id, flowType: 1, bizType: 'REGISTER',
      amount: 30, balanceAfter: 30, remark: '新用户注册赠送', createTime: new Date().toISOString()
    })

    return jsonResponse(res, 0, {
      userId: newUser.id,
      accessToken: token,
      refreshToken: 'refresh-' + token,
      expiresTime: new Date(Date.now() + 7 * 86400000).toISOString(),
    })
  }

  if (pathname === '/app-api/member/auth/logout' && req.method === 'POST') {
    const auth = (req.headers.authorization || '').replace('Bearer ', '')
    tokens.delete(auth)
    return jsonResponse(res, 0, true)
  }

  // ─────────── USER INFO ───────────
  if (pathname === '/app-api/member/user/get' && req.method === 'GET') {
    const userId = getAuthUserId(req)
    if (!userId) return jsonResponse(res, 401, null, '未登录')
    const user = getUserById(userId)
    if (!user) return jsonResponse(res, 401, null, '用户不存在')
    return jsonResponse(res, 0, {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      points: user.points,
      totalEarned: user.totalEarned,
      totalSpent: user.totalSpent,
    })
  }

  // ─────────── REDEEM CODE ───────────
  if (pathname === '/app-api/ppt/redeem/use' && req.method === 'POST') {
    const userId = getAuthUserId(req)
    if (!userId) return jsonResponse(res, 401, null, '未登录')
    const user = getUserById(userId)
    if (!user) return jsonResponse(res, 401, null, '用户不存在')

    const body = await parseBody(req)
    const code = (body.code || '').toUpperCase().trim()
    const redeemInfo = redeemCodes.get(code)

    if (!redeemInfo) return jsonResponse(res, 400, null, '兑换码无效')
    if (redeemInfo.status !== 0) return jsonResponse(res, 400, null, '兑换码已被使用')

    // 执行兑换
    redeemInfo.status = 1
    redeemInfo.usedBy = userId
    user.points += redeemInfo.points
    user.totalEarned += redeemInfo.points

    pointsFlows.push({
      id: ++nextFlowId, userId, flowType: 1, bizType: 'REDEEM',
      bizId: code, amount: redeemInfo.points, balanceAfter: user.points,
      remark: `兑换码 ${code}`, createTime: new Date().toISOString()
    })

    return jsonResponse(res, 0, { points: redeemInfo.points, balance: user.points })
  }

  // ─────────── POINTS ───────────
  if (pathname === '/app-api/ppt/points/balance' && req.method === 'GET') {
    const userId = getAuthUserId(req)
    if (!userId) return jsonResponse(res, 401, null, '未登录')
    const user = getUserById(userId)
    return jsonResponse(res, 0, {
      balance: user.points,
      totalEarned: user.totalEarned,
      totalSpent: user.totalSpent,
    })
  }

  if (pathname === '/app-api/ppt/points/flow' && req.method === 'GET') {
    const userId = getAuthUserId(req)
    if (!userId) return jsonResponse(res, 401, null, '未登录')
    const myFlows = pointsFlows.filter(f => f.userId === userId).reverse()
    return jsonResponse(res, 0, myFlows)
  }

  // ─────────── PPT TASK CREATE ───────────
  if (pathname === '/app-api/ppt/task/create' && req.method === 'POST') {
    const userId = getAuthUserId(req)
    if (!userId) return jsonResponse(res, 401, null, '未登录')
    const user = getUserById(userId)
    if (!user) return jsonResponse(res, 401, null, '用户不存在')

    const body = await parseBody(req)
    const { title, description, style, pages } = body
    if (!title) return jsonResponse(res, 400, null, '请输入演示主题')

    const pageCount = parseInt(pages) || 10
    const pointsCost = pageCount <= 10 ? 30 : 50

    if (user.points < pointsCost) {
      return jsonResponse(res, 400, null, `积分不足，需要 ${pointsCost} 积分，当前余额 ${user.points}`)
    }

    // 预扣积分
    user.points -= pointsCost
    user.totalSpent += pointsCost

    const taskNo = generateTaskNo()
    const task = {
      id: ++nextTaskId,
      taskNo,
      userId,
      title,
      inputText: description || '',
      style: style || 'modern',
      pageCount,
      pointsCost,
      status: 1, // 生成中
      resultUrl: '',
      errorMsg: '',
      aiModel: AI_CONFIG.model,
      generateDuration: null,
      slides: null,
      createTime: new Date().toISOString(),
    }
    tasks.set(taskNo, task)

    // 积分流水
    pointsFlows.push({
      id: ++nextFlowId, userId, flowType: 2, bizType: 'GENERATE',
      bizId: taskNo, amount: pointsCost, balanceAfter: user.points,
      remark: `生成 PPT: ${title}`, createTime: new Date().toISOString()
    })

    // ═══ 两阶段异步生成管线 ═══
    const startTime = Date.now()
    ;(async () => {
      try {
        // ── 阶段 1：生成文字大纲 ──
        console.log(`  🔄 [${taskNo}] 阶段1: 生成文字大纲...`)
        const aiResult = await callAI([
          { role: 'system', content: '你是一位专业的演示文稿策划师，擅长设计结构清晰、内容专业的 PPT 大纲。只输出 JSON。' },
          { role: 'user', content: buildPptPrompt(title, description, style, pageCount) },
        ])

        let slides
        try {
          let cleaned = aiResult.trim()
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '')
          }
          slides = JSON.parse(cleaned)
        } catch {
          slides = { title, style, slides: [{ page: 1, title, content: ['内容生成中'], notes: '' }] }
        }
        console.log(`  ✅ [${taskNo}] 大纲完成 (${slides.slides?.length || 0} 页)`)

        // ── 阶段 2：并发图片生成（限速安全模式）──
        const totalSlides = slides.slides.length
        const CONCURRENCY = 2   // 2路并发（避免429限速）
        const MAX_RETRIES = 3   // 失败最多重试 3 次
        const BATCH_COOLDOWN = 2000 // 批次间冷却 2 秒
        let completed = 0

        console.log(`  🎨 [${taskNo}] 阶段2: 图片生成 (${totalSlides}页, ${CONCURRENCY}路并发)...`)

        // 带指数退避重试的单页图片生成
        async function generateSlideImage(idx) {
          const s = slides.slides[idx]
          const isFirst = idx === 0
          const isLast = idx === totalSlides - 1
          const prompt = buildSlideImagePrompt(s, slides.title, style, isFirst, isLast, idx + 1, totalSlides)

          for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            try {
              const label = attempt > 1 ? ` (重试${attempt - 1})` : ''
              console.log(`    🖼  [${taskNo}] 第 ${idx + 1}/${totalSlides} 页${label}...`)
              const rawImageUrl = await callImageAI(prompt)
              s.imageUrl = rawImageUrl.replace(/^https?:\/\/[^\/]+/, '')
              completed++
              task.imageProgress = { current: completed, total: totalSlides }
              task.slides = slides
              console.log(`    ✅ [${taskNo}] 第 ${idx + 1} 页完成 (${completed}/${totalSlides})`)
              return
            } catch (imgErr) {
              const is429 = imgErr.message.includes('429') || imgErr.message.includes('Too many')
              if (attempt <= MAX_RETRIES) {
                // 指数退避：429 用更长等待 (10s, 20s, 30s)，其他错误用 5s
                const waitSec = is429 ? 10 * attempt : 5
                console.warn(`    ⚠️ [${taskNo}] 第 ${idx + 1} 页失败: ${imgErr.message.slice(0, 60)}, ${waitSec}s后重试...`)
                await new Promise(r => setTimeout(r, waitSec * 1000))
              } else {
                console.error(`    ❌ [${taskNo}] 第 ${idx + 1} 页最终失败: ${imgErr.message.slice(0, 60)}`)
                s.imageUrl = null
                completed++
                task.imageProgress = { current: completed, total: totalSlides }
                task.slides = slides
              }
            }
          }
        }

        // 并发控制器：按批次执行 + 批次间冷却
        for (let batch = 0; batch < totalSlides; batch += CONCURRENCY) {
          if (batch > 0) {
            // 批次间冷却，避免触发速率限制
            await new Promise(r => setTimeout(r, BATCH_COOLDOWN))
          }
          const batchEnd = Math.min(batch + CONCURRENCY, totalSlides)
          const batchJobs = []
          for (let i = batch; i < batchEnd; i++) {
            batchJobs.push(generateSlideImage(i))
          }
          await Promise.all(batchJobs)
        }

        // ── 完成 ──
        task.slides = slides
        task.status = 2
        task.generateDuration = Math.round((Date.now() - startTime) / 1000)
        task.resultUrl = `/app-api/ppt/task/download?taskNo=${taskNo}`
        console.log(`  🎉 [${taskNo}] 全部完成! (${task.generateDuration}s)`)
      } catch (err) {
        task.status = 3
        task.errorMsg = err.message
        task.generateDuration = Math.round((Date.now() - startTime) / 1000)
        // 退还积分
        user.points += pointsCost
        user.totalSpent -= pointsCost
        pointsFlows.push({
          id: ++nextFlowId, userId, flowType: 1, bizType: 'REFUND',
          bizId: taskNo, amount: pointsCost, balanceAfter: user.points,
          remark: `生成失败退还: ${title}`, createTime: new Date().toISOString()
        })
        console.error(`  ❌ [${taskNo}] 生成失败: ${err.message}`)
      }
    })()

    return jsonResponse(res, 0, { taskNo, pointsCost, balanceAfter: user.points })
  }

  // ─────────── PPT TASK STATUS ───────────
  if (pathname === '/app-api/ppt/task/get' && req.method === 'GET') {
    const urlObj = new URL(req.url, `http://${req.headers.host}`)
    const taskNo = urlObj.searchParams.get('taskNo')
    const task = tasks.get(taskNo)
    if (!task) return jsonResponse(res, 404, null, '任务不存在')
    return jsonResponse(res, 0, {
      taskNo: task.taskNo,
      title: task.title,
      style: task.style,
      pageCount: task.pageCount,
      pointsCost: task.pointsCost,
      status: task.status,
      errorMsg: task.errorMsg,
      aiModel: task.aiModel,
      generateDuration: task.generateDuration,
      slides: task.slides,
      imageProgress: task.imageProgress || null,
      createTime: task.createTime,
    })
  }

  // ─────────── PPT TASK LIST ───────────
  if (pathname === '/app-api/ppt/task/list' && req.method === 'GET') {
    const userId = getAuthUserId(req)
    if (!userId) return jsonResponse(res, 401, null, '未登录')
    const myTasks = Array.from(tasks.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .map(t => ({
        taskNo: t.taskNo, title: t.title, style: t.style,
        pageCount: t.pageCount, pointsCost: t.pointsCost,
        status: t.status, errorMsg: t.errorMsg,
        generateDuration: t.generateDuration,
        createTime: t.createTime,
      }))
    return jsonResponse(res, 0, myTasks)
  }

  return false // 不是内置路由
}

// ═══════════════════════════════════════════════════════════
// 外部服务代理路由
// ═══════════════════════════════════════════════════════════
const ROUTES = [
  { prefix: '/admin-api', target: 'http://127.0.0.1:48080', label: '后端 API (admin)' },
  { prefix: '/app-api',   target: 'http://127.0.0.1:48080', label: '后端 API (app)' },
  { prefix: '/images/',   target: 'http://127.0.0.1:8200',  label: 'AI 图片服务' },
  { prefix: '/admin',     target: 'http://127.0.0.1:8181',  label: '管理面板 Vite' },
  { prefix: '/',          target: 'http://127.0.0.1:3002',  label: '用户前台 Vite' },
]

function findRoute(path) {
  for (const route of ROUTES) {
    if (path.startsWith(route.prefix)) return route
  }
  return ROUTES[ROUTES.length - 1]
}

function proxy(req, res) {
  const route = findRoute(req.url)
  const targetUrl = new URL(req.url, route.target)

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: { ...req.headers, host: targetUrl.host },
  }

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res, { end: true })
  })

  proxyReq.on('error', (err) => {
    const msg = `⚠ ${route.label} (${route.target}) 未启动`
    console.error(`  ${msg}: ${err.message}`)
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<h2>502 Bad Gateway</h2><p>${msg}</p><p>请先启动对应服务</p>`)
  })

  req.pipe(proxyReq, { end: true })
}

// WebSocket 代理（Vite HMR 需要）
function proxyWebSocket(req, socket, head) {
  const route = findRoute(req.url)
  const targetUrl = new URL(req.url, route.target)

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: { ...req.headers, host: targetUrl.host },
  }

  const proxyReq = http.request(options)
  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n'
    )
    if (proxyHead.length) proxySocket.unshift(proxyHead)
    proxySocket.pipe(socket)
    socket.pipe(proxySocket)
  })

  proxyReq.on('error', (err) => {
    console.error(`  WS 代理失败 (${route.label}): ${err.message}`)
    socket.destroy()
  })

  proxyReq.end()
}

// ═══════════════════════════════════════════════════════════
// 主服务器
// ═══════════════════════════════════════════════════════════
const server = http.createServer(async (req, res) => {
  const pathname = req.url.split('?')[0]

  // 1. 尝试内置 API 路由（mock auth + ppt 业务）
  if (pathname.startsWith('/app-api/member/auth/') ||
      pathname.startsWith('/app-api/member/user/') ||
      pathname.startsWith('/app-api/ppt/')) {
    const handled = await handleBuiltinApi(req, res, pathname)
    if (handled !== false) return
  }

  // 2. 代理到外部服务
  proxy(req, res)
})

server.on('upgrade', proxyWebSocket)

server.listen(GATEWAY_PORT, '0.0.0.0', () => {
  console.log('')
  console.log('  ╔══════════════════════════════════════════════════════════╗')
  console.log('  ║       AI PPT 本地开发网关 v2 已启动                      ║')
  console.log(`  ║       http://localhost:${GATEWAY_PORT}                                  ║`)
  console.log('  ╠══════════════════════════════════════════════════════════╣')
  console.log('  ║  路由规则：                                              ║')
  console.log('  ║  /              → :3002  用户前台                        ║')
  console.log('  ║  /admin/        → :8181  管理面板                        ║')
  console.log('  ║  /admin-api/    → :48080 后端 API                        ║')
  console.log('  ║  /app-api/ppt/  → 内置   PPT 业务 (chatgpt2api 桥接)     ║')
  console.log('  ║  /app-api/member/auth/  → 内置 Mock 认证                 ║')
  console.log('  ╠══════════════════════════════════════════════════════════╣')
  console.log('  ║  内测账号：test@aippt.com / test123 (130 积分)           ║')
  console.log('  ║  AI 引擎：chatgpt2api :8200 (gpt-5-3)                   ║')
  console.log('  ╚══════════════════════════════════════════════════════════╝')
  console.log('')
})
