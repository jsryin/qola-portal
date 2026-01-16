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
  /** 该版本固化的JSON数据 */
  content: Record<string, unknown>;
  /** 是否为已发布版本: 0-否, 1-是 */
  is_published?: number;
  /** 发布时间 */
  published_time?: Date | null;
  /** 是否删除: 0-否, 1-是 */
  is_deleted?: number;
  /** 版本备注/提交日志 */
  remark?: string | null;
  /** 版本创建人 */
  created_by?: string | null;
  /** 创建时间 */
  created_time?: Date;
  /** 更新人 */
  updated_by?: string | null;
  /** 更新时间 */
  updated_time?: Date;
}

/**
 * CMS 页面版本仓库实例
 */
export const cmsPageVersionRepository = createRepository<CmsPageVersion>('cms_page_version');
