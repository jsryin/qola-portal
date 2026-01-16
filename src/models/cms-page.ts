/**
 * CMS 页面实体模型
 * 用于存储页面的基础信息、草稿状态和发布版本
 */

import { createRepository } from '@/lib/db';

/**
 * 页面状态枚举
 */
export enum CmsPageStatus {
  /** 草稿 */
  DRAFT = 0,
  /** 已发布 */
  PUBLISHED = 1,
  /** 下架 */
  OFFLINE = 2,
}

/**
 * CMS 页面实体接口
 */
export interface CmsPage {
  id?: number;
  /** 页面唯一标识(URL路径或业务Key) */
  page_key: string;
  /** 页面标题 */
  title: string;
  /** 当前编辑态的JSON数据(Puck Data) */
  draft_content?: Record<string, unknown> | null;
  /** 当前生效的线上版本ID(关联version表) */
  published_version_id?: number | null;
  /** 状态: 0-草稿, 1-已发布, 2-下架 */
  status?: CmsPageStatus;
  /** 版本号计数器(用于生成下个版本号) */
  version_counter?: number;
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
