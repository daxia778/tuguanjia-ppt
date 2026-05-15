SET NAMES utf8mb4;
USE `ruoyi-vue-pro`;

-- 一级菜单：PPT管理
INSERT INTO `system_menu` (`id`, `name`, `permission`, `type`, `sort`, `parent_id`, `path`, `icon`, `component`, `component_name`, `status`, `visible`, `keep_alive`, `always_show`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
(5986, 'PPT管理', '', 1, 1, 0, '/ppt', 'ep:document', NULL, NULL, 0, b'1', b'1', b'1', 'admin', NOW(), 'admin', NOW(), b'0');

-- 二级菜单
INSERT INTO `system_menu` (`id`, `name`, `permission`, `type`, `sort`, `parent_id`, `path`, `icon`, `component`, `component_name`, `status`, `visible`, `keep_alive`, `always_show`, `creator`, `create_time`, `updater`, `update_time`, `deleted`) VALUES
(5987, '数据仪表盘', '', 2, 1, 5986, 'dashboard', 'ep:data-analysis', 'ppt/dashboard/index', 'PptDashboard', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
(5988, '兑换码管理', '', 2, 2, 5986, 'redeem', 'ep:ticket', 'ppt/redeem/index', 'PptRedeem', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
(5989, '积分流水', '', 2, 3, 5986, 'points', 'ep:coin', 'ppt/points/index', 'PptPoints', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
(5990, '生成记录', '', 2, 4, 5986, 'task', 'ep:files', 'ppt/task/index', 'PptTask', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0'),
(5991, 'AI配置', '', 2, 5, 5986, 'ai-config', 'ep:setting', 'ppt/aiConfig/index', 'PptAiConfig', 0, b'1', b'1', b'0', 'admin', NOW(), 'admin', NOW(), b'0');
