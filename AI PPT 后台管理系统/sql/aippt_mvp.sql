-- =====================================================
-- AI PPT 后台管理系统 — MVP 数据库初始化脚本
-- 数据库: ruoyi-vue-pro
-- 日期: 2026-04-30
-- =====================================================

USE `ruoyi-vue-pro`;

-- ----------------------------
-- 1. 兑换码表 redeem_code
-- ----------------------------
DROP TABLE IF EXISTS `ppt_redeem_code`;
CREATE TABLE `ppt_redeem_code` (
  `id`            bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `code`          varchar(20) NOT NULL COMMENT '兑换码 PPT-XXXX-XXXX',
  `points`        int NOT NULL COMMENT '积分面额',
  `batch_no`      varchar(32) DEFAULT NULL COMMENT '批次号',
  `status`        tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0=未使用 1=已使用 2=已过期 3=已作废',
  `used_by`       bigint DEFAULT NULL COMMENT '使用者用户ID',
  `used_time`     datetime DEFAULT NULL COMMENT '使用时间',
  `expire_time`   datetime DEFAULT NULL COMMENT '过期时间，NULL=永久有效',
  `remark`        varchar(255) DEFAULT '' COMMENT '备注',
  `creator`       varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`       varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`       bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`     bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_batch_no` (`batch_no`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='PPT兑换码表';

-- ----------------------------
-- 2. 用户积分账户表 ppt_user_points
-- ----------------------------
DROP TABLE IF EXISTS `ppt_user_points`;
CREATE TABLE `ppt_user_points` (
  `id`            bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id`       bigint NOT NULL COMMENT '用户ID',
  `balance`       int NOT NULL DEFAULT 0 COMMENT '当前积分余额',
  `total_earned`  int NOT NULL DEFAULT 0 COMMENT '累计获得积分',
  `total_spent`   int NOT NULL DEFAULT 0 COMMENT '累计消耗积分',
  `version`       int NOT NULL DEFAULT 1 COMMENT '乐观锁版本号',
  `creator`       varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`       varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`       bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`     bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分账户表';

-- ----------------------------
-- 3. 积分流水表 ppt_points_flow
-- ----------------------------
DROP TABLE IF EXISTS `ppt_points_flow`;
CREATE TABLE `ppt_points_flow` (
  `id`            bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id`       bigint NOT NULL COMMENT '用户ID',
  `user_nickname` varchar(64) DEFAULT '' COMMENT '用户昵称（冗余，避免关联查询）',
  `flow_type`     tinyint NOT NULL COMMENT '流水类型: 1=收入 2=支出',
  `biz_type`      varchar(32) NOT NULL COMMENT '业务类型: REDEEM=兑换码 GENERATE=生成消耗 REGISTER=注册赠送 ADMIN=管理员调整',
  `biz_id`        varchar(64) DEFAULT NULL COMMENT '关联业务ID（兑换码/任务ID等）',
  `amount`        int NOT NULL COMMENT '变动积分数（正数）',
  `balance_after` int NOT NULL COMMENT '变动后余额',
  `operator`      varchar(64) DEFAULT '' COMMENT '操作人',
  `remark`        varchar(255) DEFAULT '' COMMENT '备注说明',
  `creator`       varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`       varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`       bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`     bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`user_id`, `create_time`),
  KEY `idx_biz` (`biz_type`, `biz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分流水表';

-- ----------------------------
-- 4. PPT生成任务表 ppt_task
-- ----------------------------
DROP TABLE IF EXISTS `ppt_task`;
CREATE TABLE `ppt_task` (
  `id`            bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `task_no`       varchar(32) NOT NULL COMMENT '任务编号',
  `user_id`       bigint NOT NULL COMMENT '用户ID',
  `title`         varchar(200) DEFAULT '' COMMENT 'PPT标题',
  `input_text`    text COMMENT '用户输入的内容描述',
  `style`         varchar(32) DEFAULT '' COMMENT '风格: tech=科技感 business=商务 minimal=极简',
  `page_count`    int DEFAULT 10 COMMENT '页数',
  `points_cost`   int DEFAULT 0 COMMENT '消耗积分',
  `status`        tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0=待生成 1=生成中 2=成功 3=失败',
  `result_url`    varchar(500) DEFAULT '' COMMENT '生成结果文件URL',
  `error_msg`     varchar(500) DEFAULT '' COMMENT '失败原因',
  `ai_model`      varchar(64) DEFAULT '' COMMENT '使用的AI模型',
  `generate_duration` int DEFAULT NULL COMMENT '生成耗时（秒）',
  `download_count` int NOT NULL DEFAULT 0 COMMENT '下载次数',
  `creator`       varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`       varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`       bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`     bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='PPT生成任务表';

-- ----------------------------
-- 5. AI配置表 ppt_ai_config
-- ----------------------------
DROP TABLE IF EXISTS `ppt_ai_config`;
CREATE TABLE `ppt_ai_config` (
  `id`            bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `config_key`    varchar(64) NOT NULL COMMENT '配置键',
  `config_value`  text COMMENT '配置值',
  `config_type`   varchar(32) DEFAULT 'STRING' COMMENT '类型: STRING/NUMBER/JSON/BOOLEAN',
  `remark`        varchar(255) DEFAULT '' COMMENT '说明',
  `creator`       varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater`       varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`       bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id`     bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI配置表';

-- ----------------------------
-- 初始化数据
-- ----------------------------

-- AI配置初始数据
INSERT INTO `ppt_ai_config` (`config_key`, `config_value`, `config_type`, `remark`) VALUES
('ai_api_url', 'http://127.0.0.1:3000/v1/chat/completions', 'STRING', 'AI文本生成接口地址（AIClient-2-API）'),
('ai_api_key', 'lc-image-2026', 'STRING', 'AI接口密钥'),
('ai_model', 'gpt-4o', 'STRING', '当前使用的AI模型'),
('image_api_url', 'http://127.0.0.1:8200/v1/images/generations', 'STRING', 'AI图片生成接口地址（chatgpt2api）'),
('image_api_key', 'lc-image-2026', 'STRING', '图片生成接口密钥'),
('points_per_ppt_small', '30', 'NUMBER', '成套PPT(≤10页)消耗积分'),
('points_per_ppt_large', '50', 'NUMBER', '成套PPT(11-20页)消耗积分'),
('register_bonus_points', '30', 'NUMBER', '新用户注册赠送积分'),
('enable_register', 'true', 'BOOLEAN', '是否开放注册'),
('enable_generate', 'true', 'BOOLEAN', '是否开放PPT生成');

-- 测试兑换码（每个 30 积分）
INSERT INTO `ppt_redeem_code` (`code`, `points`, `batch_no`, `status`, `remark`, `creator`) VALUES
('PPT-TEST-0001', 30, 'BATCH-INIT-001', 0, '初始化测试码', 'admin'),
('PPT-TEST-0002', 30, 'BATCH-INIT-001', 0, '初始化测试码', 'admin'),
('PPT-TEST-0003', 50, 'BATCH-INIT-001', 0, '初始化测试码', 'admin'),
('PPT-TEST-0004', 100, 'BATCH-INIT-001', 0, '初始化测试码', 'admin'),
('PPT-TEST-0005', 30, 'BATCH-INIT-001', 0, '初始化测试码', 'admin');

-- 插入系统菜单（PPT管理）
-- 一级菜单
INSERT INTO `system_menu` (`name`, `permission`, `type`, `sort`, `parent_id`, `path`, `icon`, `component`, `component_name`, `status`, `visible`, `keep_alive`, `always_show`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
('PPT管理', '', 1, 5, 0, '/ppt', 'ep:document', NULL, NULL, 0, b'1', b'1', b'1', 'admin', NOW(), 'admin', NOW(), b'0');

-- 获取刚插入的菜单ID，用于子菜单
SET @ppt_menu_id = LAST_INSERT_ID();

-- 二级菜单
INSERT INTO `system_menu` (`name`, `permission`, `type`, `sort`, `parent_id`, `path`, `icon`, `component`, `component_name`, `status`, `visible`, `keep_alive`, `always_show`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
('数据仪表盘', '', 2, 1, @ppt_menu_id, 'dashboard', 'ep:data-analysis', 'ppt/dashboard/index', 'PptDashboard', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
('兑换码管理', '', 2, 2, @ppt_menu_id, 'redeem', 'ep:ticket', 'ppt/redeem/index', 'PptRedeem', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
('积分流水', '', 2, 3, @ppt_menu_id, 'points', 'ep:coin', 'ppt/points/index', 'PptPoints', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
('生成记录', '', 2, 4, @ppt_menu_id, 'task', 'ep:files', 'ppt/task/index', 'PptTask', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
('AI配置', '', 2, 5, @ppt_menu_id, 'ai-config', 'ep:setting', 'ppt/aiConfig/index', 'PptAiConfig', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0');
