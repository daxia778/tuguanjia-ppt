<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js" />
  <img src="https://img.shields.io/badge/Element_Plus-2.x-409EFF?style=flat-square&logo=element" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/Version-v0.2-blue?style=flat-square" />
</p>

# 🎯 AI PPT 后台管理系统

> 一套面向 **AI PPT 生成平台** 的运营后台，提供用户管理、生成监控、积分支付、AI 接口配置等一站式管理能力。  
> 基于 [ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro) 深度定制，采用 **Modern Blue Enterprise** 设计语言。

---

## ✨ 界面亮点

### 🏠 数据仪表盘
- **6 大核心指标卡片** — 今日收入、总用户、总生成、活跃用户、积分消耗、兑换码销售，带趋势百分比动画
- **收款流水趋势图** — 支持 7 天 / 30 天切换，ECharts 渐变面积图
- **PPT 风格分布** — 环形图实时展示各风格占比
- **最近收款记录** — 实时交易流水表格
- **系统状态面板** — 后端服务、AI 文本/图片接口、数据库健康度实时监测
- **快捷操作入口** — 一键跳转兑换码、生成记录、积分流水等核心模块

### 🎨 设计语言
| 特性 | 说明 |
|------|------|
| 主题 | Modern Blue Enterprise — 深蓝侧边栏 `#1e293b` + 品牌蓝 `#3b82f6` |
| Logo | Lucide 风格 SVG 线条图标 + 蓝紫渐变底色 |
| 布局 | 左侧深色导航 + 右侧白色内容区，经典企业后台架构 |
| 字体 | Inter / Outfit + 系统字体栈 |
| 圆角 | 全局 `8px` 圆角，卡片 `20px` 大圆角 |
| 交互 | CountTo 数字动画 + 状态脉冲指示器 + 悬浮高亮 |

---

## 📦 功能模块

```
📊 首页仪表盘          实时运营数据、趋势图表、系统状态监控
📝 PPT 管理
├── 生成记录           生成任务列表、状态追踪、详情查看
├── 积分流水           积分变动明细、类型筛选、批量导出
└── 兑换码管理         批量生成、状态管理、使用追踪
💰 支付管理
├── 支付订单           订单列表、退款管理
└── 退款记录           退款审批、进度追踪
⚙️ AI 配置
├── 文本接口           OpenAI 兼容接口配置 + 连接测试
├── 图片接口           图片生成 API 配置 + 连接测试
├── 积分规则           小型/大型 PPT 积分消耗、注册赠送
└── 功能开关           注册开关、生成开关
🔍 API 日志
├── 访问日志           接口调用记录
└── 错误日志           异常追踪与排查
👥 系统管理
├── 用户管理           账号管理、角色分配
├── 角色管理           RBAC 权限控制
├── 部门管理           组织架构
└── 字典管理           数据字典维护
```

---

## 🛠 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| **前端框架** | Vue 3 + TypeScript | 3.x |
| **UI 组件库** | Element Plus | 2.x |
| **构建工具** | Vite | 5.x |
| **图表** | ECharts | 5.x |
| **状态管理** | Pinia | 2.x |
| **后端框架** | Spring Boot | 3.x |
| **数据库** | MySQL | 8.0 |
| **缓存** | Redis | 7.x |
| **ORM** | MyBatis Plus | — |

---

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18
- JDK ≥ 17
- MySQL 8.0
- Redis 7.x
- Docker（推荐）

### 启动步骤

```bash
# 1. 克隆仓库
git clone https://github.com/daxia778/ai-ppt-admin.git
cd ai-ppt-admin

# 2. 启动基础设施（MySQL + Redis）
cd framework/sql/tools
docker-compose up -d

# 3. 导入数据库
# 将 framework/sql/*.sql 导入 MySQL

# 4. 启动后端
cd framework/yudao-server
mvn spring-boot:run

# 5. 启动前端
cd frontend
npm install
npm run dev
```

访问 `http://localhost:81`，默认账号 `admin / admin123`

---

## 📐 项目结构

```
ai-ppt-admin/
├── frontend/                    # 前端 (Vue3 + Element Plus)
│   ├── src/
│   │   ├── views/
│   │   │   ├── Home/            # 数据仪表盘
│   │   │   ├── ppt/             # PPT 业务模块
│   │   │   │   ├── aiConfig/    # AI 接口配置
│   │   │   │   ├── dashboard/   # PPT 数据看板
│   │   │   │   ├── points/      # 积分流水
│   │   │   │   ├── redeem/      # 兑换码管理
│   │   │   │   └── task/        # 生成任务
│   │   │   ├── pay/             # 支付管理
│   │   │   ├── system/          # 系统管理
│   │   │   └── Profile/         # 个人中心
│   │   ├── layout/              # 布局组件
│   │   ├── store/               # Pinia 状态管理
│   │   └── styles/              # 全局样式 & 主题
│   └── package.json
├── framework/                   # 后端 (Spring Boot)
│   ├── yudao-server/            # 启动模块
│   ├── yudao-module-system/     # 系统管理模块
│   ├── yudao-module-pay/        # 支付模块
│   └── sql/                     # 数据库脚本
└── docs/                        # 产品文档
    └── MVP_PRD.md               # MVP 产品需求文档
```

---

## 📊 版本历史

### v0.2 — Admin UI 优化（当前）
- 🎨 深色海军蓝侧边栏主题
- 🧹 移除冗余模块与 UI 组件（搜索、语言切换、设置齿轮、社交绑定等）
- 📐 全站表单对齐优化（个人中心、AI 配置）
- 🔕 过滤后端模块禁用通知
- 📝 菜单重排：系统管理归底

### v0.1 — 基础搭建
- ✅ 基于 ruoyi-vue-pro 初始化项目
- ✅ 新增 PPT 管理模块（生成记录、积分流水、兑换码）
- ✅ 新增 AI 配置页面（文本/图片接口、积分规则、功能开关）
- ✅ 自定义数据仪表盘首页
- ✅ 登录页 Neo-Brutalism 风格重设计

---

## 🗺 Roadmap

- [x] Admin 后台 UI 现代化
- [x] AI 接口配置管理
- [x] 兑换码 & 积分系统
- [ ] **用户端前台界面开发**（参考 [花卷 AIPPT](https://ai.pptcool.com) 交互设计）
- [ ] AI PPT 生成引擎对接
- [ ] 微信支付 / 支付宝集成
- [ ] PPT 模板市场
- [ ] 内容安全审核

---

## 📄 License

MIT License © 2026

---

<p align="center">
  <sub>Built with ❤️ for AI-powered presentation generation</sub>
</p>
