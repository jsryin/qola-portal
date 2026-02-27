/**
 * CMS 页面实体模型
 * 用于存储页面的基础信息、草稿状态和发布版本
 */

import { createRepository } from '@/lib/db';

/**
 * CMS 页面实体接口
 */
export interface CmsPage {
  id?: number;
  /** 页面唯一标识(URL路径或业务Key) */
  slug: string;
  /** 国家简称(如: ae, sa, cn, glo=global) */
  country_code?: string;
  /** 页面标题 */
  title: string;
  /** 当前编辑态的JSON数据(Puck Data) */
  draft_content?: Record<string, unknown> | string | null;
  /** 当前生效的线上版本ID(关联version表) */
  published_version_id?: number | null;
  /** 最近发布时间 */
  published_time?: Date | null;
  /** 版本号计数器(用于生成下个版本号) */
  version_counter?: number;
  /** 是否删除: 0-否, 1-是 */
  is_deleted?: number;
  /** 创建人 */
  created_by?: string | null;
  /** 更新人 */
  updated_by?: string | null;
  /** 创建时间 */
  created_time?: Date;
  /** 更新时间 */
  updated_time?: Date;
}

/**
 * CMS 页面仓库实例
 */
export const cmsPageRepository = createRepository<CmsPage>('cms_page');
