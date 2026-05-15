# AI PPT 后台管理系统 — MVP 版 PRD

> 版本：v0.1 (MVP)  
> 日期：2026-04-30  
> 策略：先跑通核心链路，验证市场 → 再逐步加重

---

## 一、MVP 目标

**一句话**：用户注册登录 → 兑换码获取积分 → 用积分生成PPT → 下载使用

**砍掉的**：在线支付、退款、财务报表、邀请活动、内容安全审核、站内通知  
**保留的**：用户体系 + 兑换码 + 积分 + PPT生成 + 后台管理

---

## 二、用户端功能

### 2.1 注册 / 登录

| 功能 | 说明 |
|------|------|
| 注册方式 | 邮箱 + 密码（邮箱验证码可选） |
| 登录方式 | 邮箱 + 密码 |
| 忘记密码 | 通过邮箱重置 |
| 登录态 | JWT Token，7 天过期 |

**UI 要求**：
- 简洁的登录/注册页面
- 有品牌感（Logo + 品牌色 + 背景）
- 移动端适配

### 2.2 兑换码功能

| 功能 | 说明 |
|------|------|
| 兑换入口 | 登录后首页或个人中心的"兑换码"输入框 |
| 兑换流程 | 输入码 → 校验 → 积分到账 → 提示"恭喜获得XX积分" |
| 码规则 | 格式 `PPT-XXXX-XXXX`（8位字母数字） |
| 使用限制 | 每个码只能使用一次 |
| 错误提示 | "兑换码无效" / "已被使用" / "已过期" |

### 2.3 积分系统（用户侧）

| 功能 | 说明 |
|------|------|
| 积分余额 | 首页 / 个人中心 显著展示当前积分 |
| 消耗记录 | 列表展示：时间 + 类型 + 变动数 + 余额 |
| 余额不足 | 生成前检查，不足时提示"积分不足，请兑换" |

### 2.4 PPT 生成

| 功能 | 说明 |
|------|------|
| 输入方式 | 文本描述（主题 + 内容要点） |
| 风格选择 | 下拉选择风格（一期 3 种：科技感/商务/极简） |
| 页数选择 | 用户选择页数范围（5/10/15/20 页） |
| 生成按钮 | 点击后扣积分 → 调 AI → 生成中... → 完成 |
| 生成中 | 进度提示 / 等待动画 |
| 预览 | 生成完成后在线预览 |
| 下载 | 下载 .pptx 文件 |
| 历史记录 | 用户可查看/重新下载之前生成的 PPT |

**积分消耗规则**（暂定）：

| 操作 | 消耗积分 |
|------|---------|
| 成套 PPT（≤10 页） | 30 积分 |
| 成套 PPT（11-20 页） | 50 积分 |
| 注册赠送 | +30 积分（免费体验 1 次） |

---

## 三、管理后台功能（基于 ruoyi-vue-pro）

### 3.1 仪表盘（简版）

| 数据 | 说明 |
|------|------|
| 今日新增用户 | 实时统计 |
| 总用户数 | 累计 |
| 今日生成次数 | PPT 生成任务数 |
| 总积分消耗 | 累计消耗积分 |
| 今日兑换码使用数 | 今天兑换了多少码 |
| 积分剩余总量 | 全平台未消耗积分 |

### 3.2 用户管理

| 功能 | 说明 |
|------|------|
| 用户列表 | 搜索（邮箱/ID）+ 筛选（注册时间/状态）+ 分页 |
| 用户详情 | 基本信息 + 积分余额 + 消耗记录 + 生成记录 |
| 封禁/解封 | 一键操作 + 原因 |
| 手动调整积分 | 加减积分 + 原因（审计） |

### 3.3 兑换码管理（核心新增模块）

#### 3.3.1 生成兑换码

| 功能 | 说明 |
|------|------|
| 批量生成 | 选择数量（10/50/100/自定义） |
| 积分面额 | 每个码对应的积分数量（30/50/100/自定义） |
| 有效期 | 可选：永久有效 / 指定截止日期 |
| 备注 | 标记这批码的用途（如"测试用"、"宣发活动"） |
| 生成结果 | 弹窗展示 + 一键复制全部 + 导出 Excel |

#### 3.3.2 兑换码列表

| 字段 | 说明 |
|------|------|
| 兑换码 | `PPT-XXXX-XXXX` |
| 积分面额 | 30 / 50 / 100... |
| 状态 | 未使用 / 已使用 / 已过期 / 已作废 |
| 使用者 | 兑换用户信息（邮箱/ID） |
| 兑换时间 | 使用时间 |
| 创建时间 | 生成时间 |
| 备注 | 用途标记 |
| 操作 | 作废（未使用的可手动作废） |

#### 3.3.3 兑换统计

| 数据 | 说明 |
|------|------|
| 总生成数 | 累计生成了多少码 |
| 已使用数 | 兑换了多少 |
| 使用率 | 已使用 / 总生成 |
| 按批次统计 | 每批次的使用情况 |

### 3.4 PPT 生成记录

| 功能 | 说明 |
|------|------|
| 任务列表 | 搜索（用户/标题）+ 筛选（时间/状态）+ 分页 |
| 任务详情 | 用户输入 + AI 输出 + 生成结果 + 消耗积分 |
| 状态 | 生成中 / 成功 / 失败 |
| 失败原因 | AI 报错信息展示 |
| 管理员重试 | 不扣积分的手动重试按钮 |

### 3.5 积分流水

| 功能 | 说明 |
|------|------|
| 全局流水 | 全部用户的积分变动记录 |
| 筛选 | 按类型（兑换/生成/注册/管理员调整）+ 时间范围 |
| 导出 | Excel 导出 |

### 3.6 AI 配置（简版）

| 功能 | 说明 |
|------|------|
| 模型选择 | 当前使用的 AI 模型配置 |
| 积分消耗配置 | 各操作消耗积分数 |
| 注册赠送积分 | 新用户赠送数量 |
| 功能开关 | 开启/关闭注册、开启/关闭生成 |

### 3.7 系统配置（框架自带）

- RBAC 权限管理（2种角色：超管 + 运营）
- 操作日志（自动记录）
- 管理员账号管理

---

## 四、数据库新增表设计

### 兑换码表 `redeem_code`

```sql
CREATE TABLE `redeem_code` (
  `id`            bigint PRIMARY KEY AUTO_INCREMENT,
  `code`          varchar(20) UNIQUE NOT NULL COMMENT '兑换码 PPT-XXXX-XXXX',
  `points`        int NOT NULL COMMENT '积分面额',
  `batch_no`      varchar(32) COMMENT '批次号',
  `status`        tinyint DEFAULT 0 COMMENT '0=未使用 1=已使用 2=已过期 3=已作废',
  `used_by`       bigint COMMENT '使用者用户ID',
  `used_time`     datetime COMMENT '使用时间',
  `expire_time`   datetime COMMENT '过期时间，NULL=永久',
  `remark`        varchar(255) COMMENT '备注',
  `creator`       varchar(64) COMMENT '创建人',
  `create_time`   datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time`   datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (`code`),
  INDEX idx_batch (`batch_no`),
  INDEX idx_status (`status`)
) COMMENT '兑换码';
```

### 积分账户表 `user_points`

```sql
CREATE TABLE `user_points` (
  `id`            bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id`       bigint UNIQUE NOT NULL COMMENT '用户ID',
  `balance`       int DEFAULT 0 COMMENT '当前积分余额',
  `total_earned`  int DEFAULT 0 COMMENT '累计获得',
  `total_spent`   int DEFAULT 0 COMMENT '累计消耗',
  `version`       int DEFAULT 1 COMMENT '乐观锁',
  `create_time`   datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time`   datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '用户积分账户';
```

### 积分流水表 `points_flow`

```sql
CREATE TABLE `points_flow` (
  `id`            bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id`       bigint NOT NULL,
  `flow_type`     tinyint NOT NULL COMMENT '1=收入 2=支出',
  `biz_type`      varchar(32) NOT NULL COMMENT 'REDEEM/GENERATE/REGISTER/ADMIN',
  `biz_id`        varchar(64) COMMENT '关联ID（兑换码/任务ID等）',
  `amount`        int NOT NULL COMMENT '变动积分数',
  `balance_after` int NOT NULL COMMENT '变动后余额',
  `operator`      varchar(64) COMMENT '操作人',
  `remark`        varchar(255),
  `create_time`   datetime DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_time (`user_id`, `create_time`),
  INDEX idx_biz (`biz_type`, `biz_id`)
) COMMENT '积分流水';
```

### PPT 生成任务表 `ppt_task`

```sql
CREATE TABLE `ppt_task` (
  `id`            bigint PRIMARY KEY AUTO_INCREMENT,
  `task_no`       varchar(32) UNIQUE NOT NULL COMMENT '任务编号',
  `user_id`       bigint NOT NULL,
  `title`         varchar(200) COMMENT 'PPT 标题',
  `input_text`    text COMMENT '用户输入的内容描述',
  `style`         varchar(32) COMMENT '风格：tech/business/minimal',
  `page_count`    int COMMENT '页数',
  `points_cost`   int COMMENT '消耗积分',
  `status`        tinyint DEFAULT 0 COMMENT '0=待生成 1=生成中 2=成功 3=失败',
  `result_url`    varchar(500) COMMENT '生成结果文件URL',
  `error_msg`     varchar(500) COMMENT '失败原因',
  `ai_model`      varchar(64) COMMENT '使用的AI模型',
  `generate_time` int COMMENT '生成耗时(秒)',
  `create_time`   datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time`   datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (`user_id`),
  INDEX idx_status (`status`),
  INDEX idx_create_time (`create_time`)
) COMMENT 'PPT生成任务';
```

---

## 五、核心流程图

### 用户生成 PPT 流程

```
用户输入主题+选风格+选页数
        ↓
   检查积分余额 ≥ 消耗量？
    ↓ 是              ↓ 否
  创建任务          提示"积分不足"
  扣减积分          引导兑换
    ↓
  调用 AI 接口
    ↓
  生成中（轮询状态）
    ↓
  成功 → 展示预览 + 下载按钮
  失败 → 退还积分 + 提示重试
```

### 兑换码使用流程

```
用户输入兑换码
      ↓
  查询 redeem_code 表
      ↓
  校验：码存在？ 未使用？ 未过期？
   ↓ 通过              ↓ 不通过
 事务执行：            返回错误提示
  1. 更新码状态=已使用
  2. user_points 加积分
  3. 写 points_flow 流水
      ↓
 提示 "恭喜获得 XX 积分"
```

---

## 六、MVP 开发计划

| 周 | 任务 | 产出 |
|----|------|------|
| **W1** | 后端：兑换码模块 + 积分模块 + 数据库表 | API 可调 |
| **W1** | 后端：PPT 任务表 + 简版仪表盘 API | 管理端数据 |
| **W2** | 后端：PPT 生成接口对接 AI | 核心链路打通 |
| **W2** | 前端：用户登录/注册页 + 兑换码页 | 用户端可用 |
| **W3** | 前端：PPT 生成页 + 历史记录 + 下载 | 完整用户流程 |
| **W3** | 后台前端：兑换码管理 + 用户管理 + 积分流水 | 后台可管理 |
| **W4** | 联调测试 + 打磨 + 部署 | **MVP 上线** |

**总计：4 周（20 个工作日）**

---

## 七、后续迭代方向（不在 MVP 范围）

| 阶段 | 功能 | 触发条件 |
|------|------|---------|
| v0.2 | 在线支付（微信/支付宝） | 用户量破 200 |
| v0.3 | 邀请码系统 | 需要拉新 |
| v0.4 | 模板管理 + 风格库 | 需要差异化 |
| v0.5 | 财务统计 + 报表 | 有收入后 |
| v1.0 | 完整 15 模块 | 业务稳定后 |
