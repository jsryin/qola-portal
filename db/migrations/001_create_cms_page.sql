-- 可视化页面元数据表
-- 用于存储页面的基础信息、当前的草稿状态以及"线上正在跑"的是哪个版本

CREATE TABLE `cms_page` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `page_key` VARCHAR(64) NOT NULL COMMENT '页面唯一标识(URL路径或业务Key)',
  `title` VARCHAR(100) NOT NULL COMMENT '页面标题',
  
  -- 核心字段：热草稿
  -- 编辑器每次保存都更新此字段，不产生新行
  `draft_content` JSON DEFAULT NULL COMMENT '当前编辑态的JSON数据(Puck Data)',
  
  -- 状态控制
  `published_version_id` BIGINT(20) DEFAULT NULL COMMENT '当前生效的线上版本ID(关联version表)',
  `status` TINYINT(4) DEFAULT 0 COMMENT '状态: 0-草稿, 1-已发布, 2-下架',
  
  -- 乐观锁与审计
  `version_counter` INT(11) DEFAULT 1 COMMENT '版本号计数器(用于生成下个版本号)',
  `created_by` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  `updated_by` VARCHAR(64) DEFAULT NULL COMMENT '更新人',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_key` (`page_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='可视化页面元数据表';
