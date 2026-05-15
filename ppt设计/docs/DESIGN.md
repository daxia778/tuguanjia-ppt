# SlideForge 设计文档 (Design Document)

> **版本**: v1.0.0  
> **更新日期**: 2026-04-27  
> **作者**: SlideForge Team  

---

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      客户端浏览器                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐              │
│  │ LandingPage│  │CreatePage│  │  (其他)   │  ← React SPA│
│  └─────┬─────┘  └────┬─────┘  └──────────┘              │
│        │              │                                   │
│  ┌─────▼──────────────▼──────────────────┐               │
│  │          React Router (v7)             │               │
│  └─────────────────┬─────────────────────┘               │
│                    │                                      │
│  ┌─────────────────▼─────────────────────┐               │
│  │         Animation Layer                │               │
│  │  • GSAP 3.15 + ScrollTrigger          │               │
│  │  • Lenis 平滑滚动                      │               │
│  │  • useGSAP React Hook                 │               │
│  └───────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
                        │ HTTP
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway (待实现)                     │
│  • Go HTTP Server                                        │
│  • 请求转发 & 鉴权                                        │
│  • 速率限制 & 并发控制                                     │
│  • PPTX 文件封装                                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│               第三方中转 API                               │
│  • OpenAI GPT Image-2                                    │
│  • 未来: 视频模型 / 对话模型                                │
└─────────────────────────────────────────────────────────┘
```

### 1.2 前端架构

```
src/
├── main.jsx                 # 应用入口，配置 BrowserRouter
├── App.jsx                  # 根组件，路由定义 + 全局背景动效
├── index.css                # 全局设计系统（变量、重置、工具类）
├── components/
│   └── CardIllustrations.jsx # SVG 线条插画组件（5套）
├── pages/
│   ├── LandingPage.jsx      # 首页（滚动动画驱动）
│   ├── LandingPage.css      # 首页样式
│   ├── CreatePage.jsx       # 创作页（状态机驱动）
│   └── CreatePage.css       # 创作页样式
└── assets/                  # 静态资源
```

---

## 2. 核心模块设计

### 2.1 路由设计

| 路径 | 组件 | 描述 |
|------|------|------|
| `/` | `LandingPage` | 产品首页、展示页 |
| `/create` | `CreatePage` | PPT 创作工作台 |

### 2.2 LandingPage 设计

#### 2.2.1 页面分区

```
┌─────────────────────────┐
│     Navigation Bar       │  固定顶部导航
├─────────────────────────┤
│                          │
│      Hero Section        │  标题动画 + CTA + 统计数据
│                          │
├─────────────────────────┤
│                          │
│   Showcase Section       │  5张PPT案例卡片翻页展示
│   (ScrollTrigger Pin)    │  滚动驱动的翻页动画
│                          │
├─────────────────────────┤
│                          │
│   Features Section       │  4个核心能力卡片
│                          │
├─────────────────────────┤
│                          │
│   Workflow Section       │  3步工作流程时间线
│                          │
├─────────────────────────┤
│      CTA Section         │  底部行动号召
├─────────────────────────┤
│      Footer              │  页脚
└─────────────────────────┘
```

#### 2.2.2 Showcase 卡片翻页动画（核心动效）

**实现原理：**

```
滚动进度:  0%          20%         40%         60%         80%        100%
           ├──── 卡片1 ────┤──── 卡片2 ────┤──── 卡片3 ────┤──── 卡片4 ────┤
           
每个卡片段内分两阶段:
  Phase 1 (前50%): 当前卡片 → 向上滑出 + 淡出 + 缩小
  Phase 2 (后50%): 下一卡片 → 从下方微缩淡入

关键: display: none/block 严格控制，确保同一时间仅一张卡片可见
```

**技术细节：**
- **容器**: `.showcase-stack` 使用 `overflow: hidden` + `aspect-ratio: 16/9`
- **Pin**: `.showcase-pin` 被 ScrollTrigger 固定，持续 `5 × 100vh` 的滚动距离
- **卡片堆叠**: 所有卡片 `position: absolute; top:0; left:0; width:100%; height:100%`
- **防渗透**: 非激活卡片强制 `display: none`，杜绝文字渗出
- **退出动画**: `yPercent: -30`, `opacity: 0`, `scale: 0.97`
- **进入动画**: `yPercent: 10→0`, `opacity: 0→1`, `scale: 0.97→1`

#### 2.2.3 SVG 插画系统

5套线条插画对应5张展示卡片：

| 序号 | 主题 | SVG 元素 |
|------|------|---------|
| 01 | 科技发布会 | 电路板连线、节点、数据面板 |
| 02 | 年度报告 | 柱状图、折线图、饼图 |
| 03 | 产品介绍 | 手机框架、横线、连接点 |
| 04 | 市场分析 | 折线趋势图、数据点、悬停卡片 |
| 05 | 商业计划 | 金字塔层级、路线节点 |

所有SVG使用 `stroke-only` 风格，颜色为 `rgba(255,255,255,0.15-0.25)`。

### 2.3 CreatePage 设计

#### 2.3.1 状态机

```
                    ┌──────────┐
                    │  input   │  输入阶段
                    └────┬─────┘
                         │ startGeneration()
                         ▼
                    ┌──────────┐
                    │ preview  │  预览阶段
                    └────┬─────┘
                         │ goBack()
                         ▼
                    ┌──────────┐
                    │  input   │  返回输入
                    └──────────┘
```

#### 2.3.2 数据模型

```javascript
// 幻灯片状态
interface Slide {
  id: number
  type: 'cover' | 'toc' | 'content' | 'data' | 'ending'
  title: string
  status: 'pending' | 'generating' | 'done'
}

// 全局状态
phase: 'input' | 'preview'
prompt: string
selectedStyle: string   // 'tech' | 'minimal' | 'business' | ...
slideCount: number      // 3-20
currentSlide: number    // 当前预览的页面索引
slides: Slide[]
```

---

## 3. 动画设计规范

### 3.1 全局动效

| 动效 | 触发 | 参数 |
|------|------|------|
| 背景光球浮动 | 自动循环 | `duration: 8-12s`, `yoyo: true`, `sine.inOut` |
| 网格背景 | 静态 | `radial-gradient` 虚线网格 |

### 3.2 首页动效

| 动效 | 区域 | 实现 |
|------|------|------|
| Hero入场 | 标题/副标题 | `fromTo` y:80→0, stagger:0.15 |
| Hero视差 | 滚动时 | `y:-100, opacity:0`, scrub |
| 卡片翻页 | Showcase | Sequential display toggle + transform |
| 功能卡片 | Features | `y:80→0, scale:0.92→1`, stagger |
| 流程展示 | Workflow | `x:-60→0` + 连接线 scaleY 生长 |
| CTA显现 | 底部 | `y:60→0, scale:0.95→1` |

### 3.3 创作页动效

| 动效 | 区域 | 实现 |
|------|------|------|
| 页面入场 | Header | `y:-20→0` |
| 输入区入场 | 表单 | `y:40→0, scale:0.98→1` |
| 风格选项 | 按钮 | `y:20→0, scale:0.9→1`, stagger:0.06 |
| 阶段切换 | Input→Preview | Input淡出后Preview淡入 |
| 重新生成 | 卡片 | `scale:0.95↔1, opacity:0.5↔1` |

---

## 4. CSS 设计系统

### 4.1 CSS 变量 (index.css)

```css
:root {
  /* 颜色 */
  --bg-primary: #07080a;
  --bg-card: rgba(255,255,255,0.04);
  --bg-card-hover: rgba(255,255,255,0.08);
  --border-subtle: rgba(255,255,255,0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.7);
  --text-muted: rgba(255,255,255,0.4);
  --accent-gradient: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6);
  
  /* 字体 */
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 999px;
  
  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 4.2 Glassmorphism 样式

```css
/* 标准玻璃 */
.glass {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
}

/* 强化玻璃 */
.glass-strong {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(24px);
}
```

---

## 5. API 设计 (待实现)

### 5.1 核心接口

#### POST `/api/generate`
生成 PPT 结构

```json
// Request
{
  "prompt": "帮我做一份新能源汽车市场分析报告",
  "style": "tech",
  "slideCount": 8
}

// Response
{
  "taskId": "uuid",
  "slides": [
    { "id": 1, "type": "cover", "title": "封面", "prompt": "..." },
    { "id": 2, "type": "toc", "title": "目录", "prompt": "..." }
  ]
}
```

#### GET `/api/task/:taskId/status`
查询生成进度

```json
{
  "taskId": "uuid",
  "status": "generating",
  "progress": 3,
  "total": 8,
  "slides": [
    { "id": 1, "status": "done", "imageUrl": "/api/image/xxx" },
    { "id": 2, "status": "done", "imageUrl": "/api/image/xxx" },
    { "id": 3, "status": "generating" },
    { "id": 4, "status": "pending" }
  ]
}
```

#### POST `/api/slide/:slideId/regenerate`
重新生成单页

#### GET `/api/task/:taskId/export`
导出 PPTX 文件

### 5.2 中转 API 调用

```
前端 → API Gateway (localhost:8111/api/*) → 中转站 → OpenAI GPT Image-2
```

- API Gateway 持有中转站 API Key
- 前端不直接访问中转站
- Gateway 负责速率限制、错误重试、日志记录

---

## 6. 部署方案

### 6.1 开发环境

```bash
# 项目路径
~/Desktop/ppt设计/

# 启动开发服务器
cd ~/Desktop/ppt设计 && npm run dev
# → http://localhost:8111

# 构建生产版本
npm run build
```

### 6.2 生产部署

```
┌─────────────┐     ┌──────────────┐
│   Nginx      │────▶│ Vite Build   │  ← 静态文件
│   :80/:443   │     │  /dist/      │
│              │────▶│ API Gateway  │  ← 反向代理
└─────────────┘     │  :8111       │
                    └──────────────┘
```

---

## 7. 安全设计

| 措施 | 描述 |
|------|------|
| API Key 保护 | Key 仅存储在后端 Gateway |
| 速率限制 | 单用户限制 10 req/min |
| 内网部署 | 仅团队内网可访问 |
| CORS 配置 | 限制允许的 Origin |
| 输入校验 | Prompt 长度限制、XSS 过滤 |
