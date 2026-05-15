# AI PPT 设计系统规范 v1.0

> 本文档是用户端前端的权威设计参考，覆盖色彩、字体、组件、页面布局、动画、后台管理端对比等全部维度。
> 所有新增页面与组件必须严格遵循本规范。

---

## 1. 设计哲学

| 维度 | 定义 |
|------|------|
| **品牌调性** | Brave Browser 风格 — 橙红渐变 + 深色科技感 + 极简克制 |
| **核心原则** | Premium SaaS 质感，不做"模板站"，做"产品级"体验 |
| **设计语言** | Apple HIG 式留白 × Material 式层级阴影 × Vercel 式极简排版 |
| **目标用户** | 职场商务人士 / 讲师 / 创业者 — 追求效率与专业感 |

---

## 2. 色彩系统 (Color Tokens)

### 2.1 品牌色

```css
--brand-orange: #fb542b;          /* 主品牌色 — Brave 橙 */
--brand-red: #ff151f;             /* 辅助品牌色 — Brave 红 */
--gradient-brave: linear-gradient(135deg, #fb542b 0%, #ff151f 100%);
--gradient-brave-hover: linear-gradient(135deg, #ff6b46 0%, #ff333a 100%);
```

用途规则：
- `--brand-orange` → 链接高亮、选中态、badge、图标背景
- `--gradient-brave` → CTA 按钮、品牌 Logo 背景、Avatar 默认色
- 禁止将品牌色用于大面积背景（仅用于 CTA 区域的渐变底板）

### 2.2 中性色 (Slate 色系)

```css
/* 背景 */
--bg-primary: #ffffff;            /* 页面主背景 */
--bg-secondary: #f9fafb;         /* 卡片内次级背景 / 预览面板 */
--bg-tertiary: #f3f4f6;          /* 认证页面背景 / 输入框 hover */

/* 文字 */
--text-primary: #111827;          /* 标题 / 强调文字 */
--text-secondary: #6b7280;        /* 正文描述 / 副标题 */
--text-muted: #9ca3af;            /* 占位符 / 禁用文字 / 时间戳 */

/* 边框 */
--border-color: #e5e7eb;          /* 通用边框 */
```

### 2.3 语义色

| Token | 色值 | 用途 |
|-------|------|------|
| 成功 | `#059669` / bg `#ecfdf5` | 生成完成、兑换成功、积分收入 |
| 警告 | `#d97706` / bg `#fffbeb` | 待生成、生成中、过期提醒 |
| 错误 | `#ef4444` / bg `#fef2f2` | 生成失败、兑换失败、退出按钮 |
| 信息 | `#3b82f6` / bg `#eff6ff` | 商务风格标识、默认选中态 |
| 紫色 | `#8b5cf6` / bg `#faf5ff` | 炫彩科技风格标识 |

### 2.4 阴影系统

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
--shadow-brave: 0 8px 20px -4px rgba(251, 84, 43, 0.3);  /* CTA 按钮 hover 专用 */
```

---

## 3. 字体系统 (Typography)

### 3.1 字体族

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-display: 'Outfit', 'Inter', sans-serif;
```

- **Inter** → 正文、表单、描述文字（Google Fonts, weight 300-900）
- **Outfit** → 标题、品牌 Logo、大数字展示（Google Fonts, weight 400-800）
- 加载方式：`index.html` 中 `<link>` 预连接 + 交换模式

### 3.2 字号阶梯

| Token | 值 | 用途 |
|-------|-----|------|
| `--text-xs` | 0.75rem (12px) | 时间戳、版权、badge 内文字 |
| `--text-sm` | 0.875rem (14px) | 表单 label、导航链接、描述 |
| `--text-base` | 1rem (16px) | 正文基础 |
| `--text-lg` | 1.125rem (18px) | 页面副标题、Hero 描述 |
| `--text-xl` | 1.25rem (20px) | 卡片标题、Logo 文字 |
| `--text-2xl` | 1.5rem (24px) | 表单页面标题 |
| `--text-3xl` | 1.875rem (30px) | Section 标题 |
| `--text-4xl` | 2.25rem (36px) | 页面 H1、CTA 标题 |
| `--text-5xl` | 3rem (48px) | Hero 主标题 |
| `--text-6xl` | 3.75rem (60px) | 超大展示数字 |

### 3.3 标题规范

```
H1 — font-display, 800, -1px letter-spacing, line-height 1.2
     Hero: clamp(2.5rem, 6vw, 4.5rem)
     页面: text-4xl (2.25rem)

H2 — font-display, 700-800, -0.5~-1px letter-spacing
     Section: text-3xl ~ text-4xl

H3 — font-display, 700, text-xl (1.25rem)
     卡片标题 / 结果标题
```

---

## 4. 间距系统 (Spacing)

```css
--space-1: 4px;    --space-2: 8px;    --space-3: 12px;
--space-4: 16px;   --space-5: 20px;   --space-6: 24px;
--space-8: 32px;   --space-10: 40px;  --space-12: 48px;
--space-16: 64px;  --space-20: 80px;  --space-24: 96px;
```

使用规范：
- 元素内部间距（padding）：`space-4` ~ `space-8`
- 卡片之间间距（gap）：`space-6` ~ `space-8`
- Section 之间间距：`space-12` ~ `space-24`
- 表单元素间距：`space-5` ~ `space-6`

---

## 5. 圆角系统 (Border Radius)

```css
--radius-pill: 9999px;   /* 按钮、badge、输入框选中态 */
--radius-lg: 16px;       /* 主卡片、弹窗、Hero Mock */
--radius-md: 12px;       /* 输入框、二级卡片 */
--radius-sm: 8px;        /* Tag、小图标容器、Dropdown item */
```

---

## 6. 布局系统 (Layout)

### 6.1 全局布局

```
┌─────────────────────────────────────────────┐
│  Header (固定顶部, 72px, 毛玻璃背景)          │
├─────────────────────────────────────────────┤
│                                             │
│  Main Content (min-height: 100vh - 72px)    │
│  padding-top: 72px (header高度)              │
│                                             │
├─────────────────────────────────────────────┤
│  Footer (深色 #0f172a, 4列网格)              │
└─────────────────────────────────────────────┘
```

### 6.2 容器

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px; /* space-6 */
}
```

### 6.3 Header

```
高度: 72px (--header-height)
背景: rgba(255, 255, 255, 0.8) + backdrop-filter: blur(12px)
滚动后: rgba(255, 255, 255, 0.95) + border-bottom + shadow-sm
布局: Logo(左) | Nav(居中绝对定位) | Actions(右)
z-index: 100 (--z-header)
```

### 6.4 响应式断点

| 断点 | 宽度 | 调整 |
|------|------|------|
| Desktop | > 1024px | 默认双列布局 |
| Tablet | ≤ 1024px | 单列堆叠、Grid 缩减 |
| Mobile | ≤ 768px | Auth 卡片纵向、Footer 单列 |
| Small | ≤ 640px | 表单行单列、Footer 垂直 |

---

## 7. 组件库 (Component Library)

### 7.1 按钮 (Buttons)

所有按钮为 **药丸形** (`border-radius: 9999px`)。

| 变体 | 样式 | 使用场景 |
|------|------|---------|
| `btn-primary` | 橙红渐变背景，白色文字，shadow-md | 主 CTA：立即生成、免费注册、下载 |
| `btn-secondary` | bg-secondary + border，深色文字 | 次要操作：下载、探索功能 |
| `btn-ghost` | 透明背景，灰色文字 | 辅助操作：登录、创建新文稿 |

尺寸：
- 默认：`padding: 10px 20px; font-size: 14px`
- `btn-lg`：`padding: 14px 28px; font-size: 16px`
- `btn-full`：`width: 100%`

交互状态：
```
hover:   translateY(-1px) + shadow-brave (primary) 或 bg 加深
active:  translateY(1px)
disabled: bg-tertiary + text-muted + 无阴影 + cursor: not-allowed
loading: spinner SVG 旋转动画 + "生成中..." 文字
```

### 7.2 输入框 (Input Fields)

```css
.input-field {
  padding: 12px 16px;
  font-size: 14px;
  background: var(--bg-primary);        /* 白色背景 */
  border: 1px solid var(--border-color); /* #e5e7eb */
  border-radius: 12px;                  /* radius-md */
  transition: all 0.15s;
}

/* Focus 态 */
.input-field:focus {
  border-color: var(--brand-orange);
  box-shadow: 0 0 0 3px rgba(251, 84, 43, 0.1); /* 橙色光晕 */
}
```

### 7.3 卡片 (Cards)

```css
.modern-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;    /* radius-lg */
  box-shadow: shadow-sm;
  transition: box-shadow 0.25s;
}
.modern-card:hover {
  box-shadow: shadow-md;
}
```

### 7.4 Badge / Tag

```css
.badge {
  padding: 4px 12px;
  border-radius: 9999px;  /* 药丸 */
  font-size: 12px;
  font-weight: 600;
}
```

| 变体 | 样式 |
|------|------|
| `badge-brand` | bg: rgba(251,84,43,0.1), color: brand-orange, border: rgba(251,84,43,0.2) |
| `badge-success` | bg: #ecfdf5, color: #059669, border: #d1fae5 |

### 7.5 Dropdown Menu

```
位置: 绝对定位，top: calc(100% + 12px), right: 0
宽度: 220px
背景: modern-card
动画: GSAP fromTo — y:-10 → y:0, opacity:0 → 1, duration 0.3s
```

### 7.6 用户头像 (Avatar)

```css
.user-avatar {
  width: 36px; height: 36px;          /* Header 默认 */
  /* width: 80px; height: 80px; */    /* Profile 页大号 */
  border-radius: 50%;
  background: var(--gradient-brave);   /* 橙红渐变 */
  color: white;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
```

显示内容：昵称首字母大写。

### 7.7 Toast / 错误提示

```css
.error-toast {
  padding: 10px 14px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 14px; font-weight: 500;
  /* 带 ✕ SVG 图标 */
}
```

### 7.8 Loading Spinner

```css
.spinner {
  animation: spin 1s linear infinite;
}
/* SVG: M21 12a9 9 0 1 1-6.219-8.56 (Lucide loader arc) */
```

### 7.9 Progress Bar (生成进度)

```css
.loading-smooth-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 9999px;
}
.bar-fill {
  height: 100%;
  background: var(--gradient-brave); /* 橙红渐变填充 */
  border-radius: 9999px;
  /* 宽度由 GSAP 驱动 0% → 85% → 100% */
}
```

---

## 8. 图标系统 (Icons)

### 8.1 图标源

- **用户端**：手写 inline SVG（源自 Lucide icon set）
- **后台管理端**：Element Plus 图标 (`ep:xxx`)
- 图标库页面参考：https://lucide.dev/icons/

### 8.2 SVG 规范

```html
<svg xmlns="http://www.w3.org/2000/svg"
  width="SIZE" height="SIZE"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"        <!-- 正文图标 -->
  stroke-width="2.5"      <!-- 强调图标(按钮内/导航) -->
  stroke-width="1.5"      <!-- 装饰图标(大尺寸) -->
  stroke-linecap="round"
  stroke-linejoin="round">
```

### 8.3 常用图标映射

| 功能 | 图标 Path | 尺寸 |
|------|----------|------|
| 积分 | `M12 2v20M17 5H9.5a3.5...` (dollar-sign) | 14px |
| 下载 | `M21 15v4...polyline 7 10 12 15 17 10` | 18px |
| 搜索 | `circle cx=11 r=8, line 21 21 16.65 16.65` | 16px |
| 箭头 | `polyline 9 18 15 12 9 6` / `15 18 9 12 15 6` | 16px |
| 勾选 | `polyline 20 6 9 17 4 12` | 14-16px |
| 关闭 | `line 18 6 6 18, line 6 6 18 18` | 14px |
| 布局 | `rect 3 3 18 18 rx=2, path 3 9h18, path 9 21V9` | 24-48px |

---

## 9. 页面设计规范 (Page Specs)

### 9.1 首页 (Home)

```
路由: /
认证: 不需要
结构:
  ┌─ Hero Section ─────────────────────┐
  │  Badge("全新 AI 引擎 v2.0 发布")    │
  │  H1: "定义下一代演示文稿 AI 生产力标准"│
  │  描述文字(2行)                       │
  │  [免费开始创建] [探索核心功能]         │
  │  Mock UI 卡片(浮动动画)              │
  ├─ Stats Section ────────────────────┤
  │  4列网格: 30s / 10W+ / 500+ / 100% │
  ├─ Features Section ─────────────────┤
  │  标题 + 3列 Feature Card            │
  ├─ Workflow Section ─────────────────┤
  │  3步流程: 输入 → 选择 → 导出         │
  ├─ Integration Section ──────────────┤
  │  左文右图: PPTX 导出特性              │
  ├─ Testimonials Section ─────────────┤
  │  3列用户评价卡片                     │
  ├─ CTA Section ──────────────────────┤
  │  "准备好节省80%的工作时间了吗？"       │
  └────────────────────────────────────┘
```

背景细节：
- Hero 区域有 **点阵网格背景** (radial-gradient 1px dots, 24px间距)
- Hero 区域有品牌色 **模糊光晕** (800×600px, blur 150px, opacity 0.08)
- Mock UI 卡片有 **持续浮动动画** (GSAP y: -10, 3s, yoyo)
- Mock UI 两侧有 **装饰浮动元素** (star + info icons)

### 9.2 生成页 (Generate) — ⚡ 核心页面

```
路由: /generate
认证: 需要登录
布局: 左右双列 (flex, gap: 32px)

左面板(form-panel, modern-card):
  ┌─────────────────────────────────┐
  │ 演示主题 *                       │
  │ [输入框: 例如2026年AI行业发展...]   │
  │                                 │
  │ 内容描述（选填）                   │
  │ [文本域: 描述核心观点...]          │
  │                                 │
  │ ┌ 视觉风格 ────┐ ┌ 页数 ──────┐  │
  │ │ ●极简 ●暗黑   │ │ 5 10 15 20│  │
  │ │ ●炫彩         │ │           │  │
  │ └──────────────┘ └───────────┘  │
  │                                 │
  │ ── 分割线 ──                      │
  │ 💰 本次消耗 30 积分  余额: xxx     │
  │ [■■■■ 立即生成 ■■■■]              │
  └─────────────────────────────────┘

右面板(preview-panel):
  ┌─────────────────────────────────┐
  │                                 │
  │  空状态: 图标 + "准备就绪"         │
  │  --或--                          │
  │  加载中: 进度条 + "AI引擎运行中"    │
  │  --或--                          │
  │  完成: 幻灯片预览器               │
  │    ┌─────────────────────┐      │
  │    │  幻灯片画布(16:10)    │      │
  │    │  (图片模式/文字模式)    │      │
  │    └─────────────────────┘      │
  │    ◄ ● ● ● ● ● ►              │
  │    [■■ 下载 PPTX 文件 ■■]        │
  │    [创建新文稿]                   │
  └─────────────────────────────────┘
```

风格选择器交互：
- 每个选项有 **色点** (12px圆形) + 文字
- 选中态: border-orange, bg-secondary, color-orange, font-weight 600
- 药丸形按钮排列

预览面板状态切换：
- `is-loading`: border变为 `rgba(251,84,43,0.3)` + 内阴影
- `is-done`: 显示结果区域
- 幻灯片画布支持3种主题色背景 (`theme-modern`/`theme-dark`/`theme-vibrant`)

### 9.3 登录页 (Login)

```
路由: /login
认证: guest only (已登录跳转首页)
背景: var(--bg-tertiary) 全屏
布局: 居中卡片(900px), 左右分栏

左侧(auth-brand):
  背景: var(--text-primary) 深色 #111827
  内容: Logo + "欢迎回到你的智能工作台。" + 描述
  圆角: 左侧 16px, 右侧 0

右侧(auth-form-wrapper):
  标题: "账号登录"
  表单: 邮箱 + 密码(含显隐切换) + 记住我 + 忘记密码
  提交: "登 录" (全宽 primary btn)
  底部: "还没有账号？免费注册"
```

### 9.4 注册页 (Register)

```
路由: /register
布局: 与 Login 共享 auth-page 结构

左侧特殊内容:
  标题: "免费创建你的全新账号。"
  3个 Feature Item (绿色勾 + 描述):
    ✓ 注册即赠 30 个生成积分
    ✓ 解锁全部 500+ 高级版式
    ✓ 永久免费导出原生 PPTX

右侧表单:
  昵称 + 邮箱 + 密码(含强度条) + 同意条款 + "免费注册"
  密码强度: weak(红33%) / medium(黄66%) / strong(绿100%)
```

### 9.5 历史页 (History)

```
路由: /history
认证: 需要登录
布局: 垂直列表 (max-width: 900px)

每条记录:
  ┌─────────────────────────────────────┐
  │ [预览色块] │ 标题              │ [下载] │
  │  64×48px  │ ●已完成 • 10页 •  │ [···]  │
  │  风格配色  │ 极简商务 • 3分钟前 │        │
  └─────────────────────────────────────┘

状态指示:
  success: 绿色(#10b981) + 圆点
  pending: 黄色(#f59e0b) + 脉冲动画圆点

空状态: 时钟图标 + "暂无生成记录" + [前往创建]
```

### 9.6 个人中心 (Profile)

```
路由: /profile
认证: 需要登录
布局: 2列网格 (1fr 2fr)

grid-template-areas:
  "user   points"
  "user   stats"
  "flow   flow"

用户卡片(user): 头像(80px) + 昵称 + 邮箱 + [编辑资料]
积分卡片(points): 大号积分数字(3.5rem, text-gradient) + 兑换码输入
统计卡片(stats): 2×2网格 — 已生成/已消耗/已获赠/已用兑换码
流水卡片(flow): 垂直列表 — 收入↑绿 / 支出↓灰
```

---

## 10. 动画系统 (Animation — GSAP)

### 10.1 技术栈

- **GSAP v3** (`gsap` npm package)
- **ScrollTrigger** 插件（首页滚动触发）
- **Vue Transition** + GSAP JS hooks（页面转场 + Dropdown）

### 10.2 页面转场

```typescript
// AppLayout.vue — 所有页面切换
function pageEnter(el, done) {
  gsap.fromTo(el,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', onComplete: done }
  )
}
function pageLeave(el, done) {
  gsap.to(el, { y: -10, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done })
}
```

### 10.3 入场动画模式

| 模式 | 参数 | 使用场景 |
|------|------|---------|
| 向上淡入 | `y: 20~40, opacity: 0, duration: 0.6~0.8` | 标题、卡片、Section |
| 向左淡入 | `x: -15~-20, opacity: 0` | 品牌区域、Feature列表 |
| 交错入场 | `stagger: 0.05~0.15` | 多卡片、表单项、统计项 |
| 缩放+透视 | `scale: 0.95~0.98, rotationX: 10` | Hero Mock UI |
| 数字递增 | `gsap.to({ val: 0 }, { val: target })` | 积分显示 |

### 10.4 持续动画

| 动画 | 参数 | 使用 |
|------|------|------|
| 浮动 | `y: -10~-15, duration: 3~5s, yoyo, repeat: -1` | Hero Mock、装饰图标 |
| 脉冲 | CSS `@keyframes pulse` | Mock Slide、Pending 状态点 |
| 旋转 | CSS `@keyframes spin 1s linear` | Loading spinner |
| 进度 | GSAP `value: 0→85→100` | Generate 进度条 |

### 10.5 最佳实践

```typescript
// 1. 使用 gsap.context() 绑定组件作用域
let ctx: gsap.Context
onMounted(() => {
  ctx = gsap.context(() => { /* animations */ })
})
onUnmounted(() => { ctx?.revert() })

// 2. 避免动画导致元素不可见的 Bug
//    - 不要对包含交互元素的面板做 opacity: 0 入场
//    - form-stagger 用于表单子项，不要用于面板容器

// 3. ScrollTrigger 仅在首页使用，其他页面用 timeline
```

---

## 11. 后台管理端设计对比 (Admin vs User)

> 后台管理系统（ruoyi-vue-pro）与用户端是**完全独立**的两套前端，但共享底层色彩哲学。

### 11.1 技术栈差异

| 维度 | 用户端 | 后台管理端 |
|------|--------|-----------|
| 框架 | Vue3 + Vite (纯净) | Vue3 + Element Plus (ruoyi-vue-pro) |
| 样式 | Vanilla CSS + CSS Variables | SCSS + Element Plus 主题覆写 |
| 图标 | Inline SVG (Lucide) | Element Plus Icons (`ep:xxx`) |
| 动画 | GSAP | 无 (Element Plus 自带 transition) |
| 状态管理 | Pinia (单 store) | Pinia (ruoyi 多模块 store) |
| 路由 | vue-router (5个页面) | vue-router (动态菜单) |
| 组件库 | 自建 .modern-card/.btn 等 | Element Plus 组件 |

### 11.2 共享设计语言

两端虽然技术栈不同，但在视觉上保持以下一致性：

```
字体: 'Inter', system-ui  (两端都用)
卡片: 白色背景 + border #f1f5f9 + radius 20px + subtle shadow
统计卡: icon-wrap(48px, 14px radius) + 大数字(32px, 800) + label(14px, 500)
表格: header-bg #f8fafc, border #f1f5f9, row-hover #f8fafc
按钮: primary → #3b82f6 (管理端) 或 gradient-brave (用户端)
```

### 11.3 后台管理端色板

```css
/* 管理端无品牌橙色，使用蓝色系 */
主色: #3b82f6 (blue-500)    /* 主操作按钮、选中态 */
成功: #10b981 (emerald-500) /* 导出、已使用状态 */
紫色: #8b5cf6 (violet-500)  /* 生成次数图表 */
黄色: #f59e0b (amber-500)   /* 积分、警告 */
粉色: #ec4899 (pink-500)    /* 积分剩余总量 */
青色: #06b6d4 (cyan-500)    /* 兑换码使用 */
红色: #ef4444 (red-500)     /* 错误、作废 */

/* 管理端侧边栏 */
背景: #1e293b (slate-800)
激活: rgba(59, 130, 246, 0.15)
文字: #94a3b8 (slate-400) → 激活 #60a5fa (blue-400)
```

### 11.4 后台管理端已有页面

| 路径 | 组件名 | 功能 | API |
|------|--------|------|-----|
| `/ppt/dashboard` | PptDashboard | 6 张统计卡 + 趋势折线图 + 兑换码饼图 | `/admin-api/ppt/dashboard/*` |
| `/ppt/redeem` | PptRedeem | 兑换码 CRUD + 批量生成 + 统计 + 导出 | `/admin-api/ppt/redeem-code/*` |
| `/ppt/points` | PptPoints | 积分流水分页 + 用户积分调整 + 导出 | `/admin-api/ppt/points-flow/*` |
| `/ppt/task` | PptTask | PPT 任务列表 + 状态筛选 + 重试 | `/admin-api/ppt/task/*` |
| `/ppt/ai-config` | PptAiConfig | AI 模型/Key/开关/积分配置 | `/admin-api/ppt/ai-config/*` |

### 11.5 后台管理端 Controller

后端 `PptController.java` (819行) 提供了完整的管理端 + 用户侧 API：

**管理端 `/admin-api/ppt/`：**
- `GET /redeem-code/page` — 兑换码分页
- `POST /redeem-code/generate` — 批量生成兑换码
- `PUT /redeem-code/invalidate` — 作废兑换码
- `GET /redeem-code/statistics` — 统计
- `GET /points-flow/page` — 积分流水分页
- `GET /user-points/page` — 用户积分列表
- `PUT /user-points/adjust` — 调整积分
- `GET /task/page` — 任务分页
- `GET /dashboard/summary` — 仪表盘汇总
- `GET /dashboard/trend` — 趋势图数据

**用户侧（已有但尚未对接前端）：**
- `POST /redeem-code/use` — 使用兑换码 ✅
- `POST /task/create` — 创建 PPT 任务 ✅
- `GET /user-points/balance` — 查询积分余额 ✅

---

## 12. 新功能设计规范 (Planned Features)

### 12.1 文档导入功能 — Generate 页面增强

根据产品需求，Generate 页面需要增加**文档导入**模式：

```
左面板顶部新增模式切换 Tab:
  ┌──────────────────────────────────┐
  │ [AI 创作]        [文档导入]       │ ← Tab 切换
  │  (下划线激活)     (下划线激活)      │
  ├──────────────────────────────────┤
  │                                  │
  │  === AI 创作模式（现有功能） ===    │
  │  演示主题 + 描述 + 风格 + 页数     │
  │                                  │
  │  === 文档导入模式（新功能） ===     │
  │  ┌────────────────────────────┐  │
  │  │  📄 拖拽文件到此处           │  │
  │  │  或 点击选择文件             │  │
  │  │                            │  │
  │  │  支持 .txt .pdf .pptx       │  │
  │  │  最大 20MB                  │  │
  │  └────────────────────────────┘  │
  │                                  │
  │  已上传文件:                      │
  │  ┌────────────────────────────┐  │
  │  │ 📄 report.pdf    2.3MB  ✕  │  │
  │  └────────────────────────────┘  │
  │                                  │
  │  额外提示词（选填）               │
  │  [文本域: 请帮我美化排版...]       │
  │                                  │
  │  视觉风格: [极简] [暗黑] [炫彩]   │
  │                                  │
  │  ── 分割线 ──                     │
  │  💰 本次消耗 30 积分              │
  │  [■■■■ 开始生成 ■■■■]            │
  └──────────────────────────────────┘
```

#### 文件上传区设计规范

```css
.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);    /* 16px */
  padding: var(--space-10) var(--space-8); /* 40px 32px */
  text-align: center;
  background: var(--bg-secondary);
  transition: all 0.2s;
  cursor: pointer;
}

/* 拖拽悬浮态 */
.upload-zone.dragover {
  border-color: var(--brand-orange);
  background: rgba(251, 84, 43, 0.04);
}

/* 文件类型图标 */
.file-icon-pdf  { color: #ef4444; }  /* 红色 */
.file-icon-pptx { color: #f59e0b; }  /* 黄色 */
.file-icon-txt  { color: #6b7280; }  /* 灰色 */
```

#### Tab 切换设计

```css
.mode-tabs {
  display: flex;
  gap: var(--space-8);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-6);
}

.mode-tab {
  padding: var(--space-3) 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  position: relative;
  cursor: pointer;
}

.mode-tab.active {
  color: var(--brand-orange);
}

/* 激活指示器 — 橙色底线 */
.mode-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0; right: 0;
  height: 2px;
  background: var(--brand-orange);
  border-radius: 1px;
}
```

### 12.2 PPT 页数固定为 5 页

根据需求，每次生成固定输出 5 页：
- 移除页数选择器 (`pageOptions`)
- 固定 `pages = 5`
- 积分消耗固定为 30（5页 ≤ 10 的阈值）

### 12.3 核心生成流程（依赖 Layer Studio）

```
用户端前端                    Spring Boot 后端               Layer Studio
     │                              │                          │
     │  POST /app-api/ppt/task/create│                          │
     │  {title, inputText, style,   │                          │
     │   pages:5, fileUrl?}         │                          │
     │──────────────────────────────>│                          │
     │                              │  1. 校验积分              │
     │                              │  2. 扣减积分              │
     │                              │  3. 创建 ppt_task         │
     │                              │  4. 异步调用 ─────────────>│
     │  { taskNo, status: 0 }       │                          │
     │<──────────────────────────────│  5. 7层级联分离           │
     │                              │     + PPTX 组装           │
     │  GET /app-api/ppt/task/get    │                          │
     │  (轮询, 每2秒)                │  6. 回调更新 status=2     │
     │──────────────────────────────>│<─────────────────────────│
     │  { status:2, slides, pptxUrl }│                          │
     │<──────────────────────────────│                          │
     │                              │                          │
     │  下载 PPTX (前端生成或后端URL)  │                          │
```

---

## 13. 项目文件清单 (File Inventory)

### 13.1 用户端 (`AI PPT 用户端/`)

```
src/
├── main.ts                    # 入口：createApp + Pinia + Router + CSS
├── App.vue                    # 根组件：router-view + page transition
├── api/
│   ├── request.ts             # Axios 实例：baseURL=/app-api, JWT, 401处理
│   ├── auth.ts                # 登录/注册/登出/获取用户信息
│   └── ppt.ts                 # PPT任务/积分/兑换码 接口定义
├── store/
│   └── user.ts                # Pinia: token/userInfo/points/login/register
├── router/
│   └── index.ts               # 5条路由 + beforeEach 鉴权守卫
├── layout/
│   └── AppLayout.vue          # Header(毛玻璃) + Main + Footer(深色4列)
├── views/
│   ├── Home/index.vue         # 首页(810行): 7个Section + GSAP ScrollTrigger
│   ├── Generate/index.vue     # 生成页(530行): 双列表单+预览 + 轮询+pptxgenjs
│   ├── Login/index.vue        # 登录页(449行): 左品牌+右表单
│   ├── Login/Register.vue     # 注册页(509行): 左features+右表单+密码强度
│   ├── History/index.vue      # 历史页(219行): 任务列表+状态+下载
│   └── Profile/index.vue      # 个人中心(309行): 4卡片网格+兑换码+流水
├── utils/
│   └── pptx.ts                # pptxgenjs封装: 3主题 + 图片/文字双模式
├── styles/
│   └── index.css              # 全局设计Token + Reset + 通用组件类
├── components/                # (空 — 暂无公共组件抽取)
└── assets/                    # (空 — 暂无静态资源)
```

### 13.2 后台管理端关键文件

```
frontend/src/views/ppt/
├── dashboard/index.vue        # 仪表盘(356行): 6统计卡 + ECharts
├── redeem/index.vue           # 兑换码管理(434行): CRUD + 统计 + 导出
├── points/index.vue           # 积分流水: 分页 + 调整 + 导出
├── task/index.vue             # 生成记录: 列表 + 重试
└── aiConfig/index.vue         # AI配置: 模型/Key/开关/积分

framework/.../PptController.java  # 后端 Controller (819行, 纯JDBC)
sql/aippt_mvp.sql                 # 数据库DDL
sql/fix_menu.sql                  # 菜单插入SQL
```

---

## 14. API 接口约定 (API Contract)

### 14.1 用户端 API 前缀

```
用户端: /app-api/...      (Vite proxy → localhost:48080)
管理端: /admin-api/...    (ruoyi-vue-pro 前端 → localhost:48080)
```

### 14.2 响应格式 (ruoyi-vue-pro 标准)

```json
{
  "code": 0,       // 0=成功, 非0=失败
  "data": { ... }, // 业务数据
  "msg": ""        // 错误信息
}
```

### 14.3 用户端接口清单

| 方法 | 路径 | 前端文件 | 后端状态 |
|------|------|---------|---------|
| POST | `/app-api/member/auth/login` | `api/auth.ts` | ✅ 框架自带 |
| POST | `/app-api/member/auth/register` | `api/auth.ts` | ✅ 框架自带 |
| POST | `/app-api/member/auth/logout` | `api/auth.ts` | ✅ 框架自带 |
| GET | `/app-api/member/user/get` | `api/auth.ts` | ✅ 框架自带 |
| POST | `/app-api/ppt/task/create` | `api/ppt.ts` | ✅ PptController |
| GET | `/app-api/ppt/task/get` | `api/ppt.ts` | ⚠️ 需要适配路径 |
| GET | `/app-api/ppt/task/list` | `api/ppt.ts` | ⚠️ 需要新增 |
| GET | `/app-api/ppt/points/balance` | `api/ppt.ts` | ✅ PptController |
| GET | `/app-api/ppt/points/flow` | `api/ppt.ts` | ⚠️ 需要新增 |
| POST | `/app-api/ppt/redeem/use` | `api/ppt.ts` | ✅ PptController |

> ⚠️ 标记的接口表示后端 Controller 已有类似功能但在 `/admin-api` 下，需要在 `/app-api` 下新增对应的用户侧版本。

---

## 15. 设计 Checklist

新增任何页面或组件时，按此清单逐项检查：

- [ ] 使用 `index.css` 中定义的 CSS Variables（禁止 hardcode 色值）
- [ ] 字体使用 `--font-sans`（正文）或 `--font-display`（标题）
- [ ] 按钮使用 `.btn` + 变体类（`.btn-primary`/`.btn-secondary`/`.btn-ghost`）
- [ ] 卡片使用 `.modern-card` 基类
- [ ] 输入框使用 `.input-field` 基类
- [ ] 圆角使用 CSS Variable（`--radius-*`）
- [ ] 间距使用 CSS Variable（`--space-*`）
- [ ] 图标使用 Lucide inline SVG，遵循 stroke-width 规范
- [ ] 入场动画使用 GSAP `gsap.context()` + `onUnmounted revert`
- [ ] 响应式适配 ≤ 1024px / ≤ 768px / ≤ 640px 三档
- [ ] 所有交互元素有 `id` 属性（用于测试）
- [ ] 页面 `<title>` 通过 router meta.title 自动设置
