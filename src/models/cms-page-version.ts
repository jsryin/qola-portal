/**
 * CMS 页面版本历史实体模型
 * 用于存储发布或保存的版本快照
 */

import { createRepository } from '@/lib/db';

/**
 * CMS 页面版本实体接口
 */
export interface CmsPageVersion {
  id?: number;
  /** 关联主表ID */
  page_id: number;
  /** 版本号(如: 1, 2, 3) */
  version_num: number;
  /** 版本别名(如: 双11大促版) */
  version_name?: string | null;
  /** 该版本固化的JSON数据 */
  content: Record<string, unknown>;
  /** 版本备注/提交日志 */
  remark?: string | null;
  /** 版本创建人 */
  created_by?: string | null;
  /** 创建时间 */
  created_time?: Date;
}

/**
 * CMS 页面版本仓库实例
 */
export const cmsPageVersionRepository = createRepository<CmsPageVersion>('cms_page_version');
