-- 可视化页面版本历史表
-- 用于"存档"。当用户点击"发布"或"保存版本"时，将主表的 draft_content 复制一份到这里

CREATE TABLE `cms_page_version` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `page_id` BIGINT(20) NOT NULL COMMENT '关联主表ID',
  
  -- 版本控制
  `version_num` INT(11) NOT NULL COMMENT '版本号(如: 1, 2, 3)',
  `version_name` VARCHAR(50) DEFAULT NULL COMMENT '版本别名(如: 双11大促版)',
  
  -- 固化的数据
  `content` JSON NOT NULL COMMENT '该版本固化的JSON数据',
  
  -- 审计
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '版本备注/提交日志',
  `created_by` VARCHAR(64) DEFAULT NULL COMMENT '版本创建人',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_page_id` (`page_id`),
  UNIQUE KEY `uk_page_version` (`page_id`, `version_num`) -- 保证同一个页面版本号不重复
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='可视化页面版本历史表';
