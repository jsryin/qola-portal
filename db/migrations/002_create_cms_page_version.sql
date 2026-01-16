-- 可视化页面版本历史表（改进版）
-- 用于"存档"。当用户点击"发布"或"保存版本"时，将主表的 draft_content 复制一份到这里

CREATE TABLE `cms_page_version` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `page_id` BIGINT NOT NULL COMMENT '关联主表ID',
  
  -- 版本控制
  `version_num` INT NOT NULL COMMENT '版本号(如: 1, 2, 3)',
  
  -- 固化的数据
  `content` JSON NOT NULL COMMENT '该版本固化的JSON数据',
  
  -- 发布状态
  `is_published` TINYINT(1) DEFAULT 0 COMMENT '是否为已发布版本: 0-否, 1-是',
  `published_time` DATETIME DEFAULT NULL COMMENT '发布时间',
  
  -- 软删除
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除: 0-否, 1-是',
  
  -- 审计
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '版本备注/提交日志',
  `created_by` VARCHAR(64) DEFAULT NULL COMMENT '版本创建人',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_by` VARCHAR(64) DEFAULT NULL COMMENT '更新人',
  `updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_is_published` (`is_published`),
  KEY `idx_is_deleted` (`is_deleted`),
  UNIQUE KEY `uk_page_version` (`page_id`, `version_num`) -- 保证同一个页面版本号不重复
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='可视化页面版本历史表';
