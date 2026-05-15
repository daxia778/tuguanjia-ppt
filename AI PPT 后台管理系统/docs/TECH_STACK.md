# 技术选型决策记录

> 每项选型附带决策理由和备选方案  
> 确认日期：2026-04-30

---

## 核心框架

### ✅ 选型：ruoyi-vue-pro（YunaiV 维护版）

| 维度 | 说明 |
|------|------|
| **GitHub** | https://github.com/YunaiV/ruoyi-vue-pro |
| **选择理由** | 自带支付系统+会员积分+订单+RBAC+操作日志，省 10-15 天 |
| **vs 基础 RuoYi** | 基础版只有后台管理，没有支付/积分/商城模块 |
| **vs Vue-Vben-Admin** | Vben 无后端，ruoyi-vue-pro 前后端一体 |
| **风险** | 框架约束，部分定制可能需要改框架源码 |

---

## 前端

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| **Vue 3** | 3.4+ | UI 框架 | ruoyi-vue-pro 默认，国内生态最强 |
| **Element Plus** | 2.x | UI 组件库 | 中文文档完善，RuoYi 集成 |
| **ECharts** | 5.x | 图表 | 国产，API 丰富，仪表盘核心 |
| **wangEditor** | 5.x | 富文本编辑 | 国产开源，中文支持最佳 |
| **pptx-preview** | latest | PPTX 预览 | 纯前端，免部署 LibreOffice |
| **vuedraggable** | latest | 拖拽排序 | 基于 sortablejs，Vue3 兼容 |
| **vue-qrcode** | — | 支付二维码 | 轻量 |

### 备选方案
- 图表：AntV G2（如 ECharts 不满足）
- 富文本：TinyMCE（如需更丰富功能）

---

## 后端

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| **Spring Boot** | 2.7+ | Web 框架 | ruoyi-vue-pro 默认，生态成熟 |
| **MyBatis Plus** | 3.5+ | ORM | RuoYi 默认，代码生成器依赖 |
| **Spring Security** | — | 认证授权 | 框架集成 |
| **JWT** | — | Token 管理 | 框架集成 |
| **Hutool** | 5.x | 工具库 | RuoYi 默认 |

### 支付 SDK

| 技术 | 用途 | 理由 |
|------|------|------|
| **weixin-java-pay** | 微信支付 | 社区最活跃（30k+ star），ruoyi-vue-pro 已集成 |
| **alipay-sdk-java** | 支付宝 | 官方 SDK |

---

## 数据库

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| **MySQL** | 8.0 | 主数据库 | RuoYi 默认，稳定 |
| **Redis** | 6.x+ | 缓存/锁/Session | 权限缓存+分布式锁+支付幂等 |

### 关键表设计

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| `user_points` | 积分账户 | user_id, balance, version(乐观锁) |
| `points_flow` | 积分流水 | user_id, biz_type, amount, balance_after |
| `trade_order` | 交易订单 | order_no, user_id, amount, status |
| `ppt_task` | 生成任务 | task_id, user_id, status, points_cost |
| `ppt_template` | PPT 模板 | style_id, page_type, file_url, status |
| `ppt_style` | 风格 | name, description, status |
| `sensitive_word` | 敏感词 | word, category |
| `content_review` | 审核队列 | user_id, trigger_word, review_status |

---

## 文件存储

| 技术 | 用途 | 理由 |
|------|------|------|
| **阿里云 OSS** | .pptx 模板 + 图片 + 生成结果 | 国内访问快，STS 前端直传 |

### 上传方案
- 前端通过 STS 临时凭证直传 OSS
- 后端只生成 STS Token，不经过后端中转
- 支持进度条 + 断点续传

---

## 内容安全

| 技术 | 用途 | 理由 |
|------|------|------|
| **ToolGood.Words** | 敏感词过滤引擎 | Java，高性能 DFA/AC 自动机 |
| **fwwdn/sensitive-stop-words** | 敏感词库 | 14w+ 词条，持续更新 |
| **腾讯云 TMS**（可选） | 云端内容审核 | 兜底方案，个人可开通 |

---

## Excel 导出

| 技术 | 用途 | 理由 |
|------|------|------|
| **EasyExcel** | 大数据量 Excel 导出 | 阿里出品，流式写入，100w+ 行不 OOM |

---

## 部署

| 维度 | 方案 |
|------|------|
| **服务器** | 阿里云 ECS 2核4G（杭州节点） |
| **容器化** | Docker + Docker Compose |
| **反向代理** | Nginx |
| **SSL** | Let's Encrypt（公网时） |
| **CI/CD** | GitHub Actions（后续） |

---

## 监控（后续）

| 技术 | 用途 |
|------|------|
| Spring Boot Actuator | 健康检查 |
| Prometheus + Grafana | 指标监控（后续） |
| ELK / Loki | 日志聚合（后续） |

---

## 决策变更记录

| 日期 | 变更内容 | 原因 |
|------|---------|------|
| 2026-04-30 | 选定 ruoyi-vue-pro 而非基础 RuoYi | 已内置支付模块，省 10-15 天 |
| 2026-04-30 | PPTX 预览选前端库而非 LibreOffice | 部署简单，Admin 端够用 |
| 2026-04-30 | 短信改为邮箱/TOTP | 腾讯云 2025.9 停止个人短信新增 |
