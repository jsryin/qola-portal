/**
 * CMS 页面辅助工具类
 * 提供常用的 CMS 页面操作方法
 */

import { cmsPageRepository, cmsPageVersionRepository } from '@/models';
import type { CmsPage, CmsPageVersion } from '@/models';
import type { PuckData } from '@/types/puck';

/**
 * CMS 页面辅助类
 */
export class CmsHelper {
  /**
   * 判断页面是否已发布
   */
  static isPublished(page: CmsPage): boolean {
    return page.published_version_id !== null && page.published_version_id !== undefined;
  }

  /**
   * 判断页面是否为草稿状态
   */
  static isDraft(page: CmsPage): boolean {
    return !this.isPublished(page);
  }

  /**
   * 判断页面是否已删除
   */
  static isDeleted(page: CmsPage): boolean {
    return page.is_deleted === 1;
  }

  /**
   * 判断版本是否已发布
   */
  static isVersionPublished(version: CmsPageVersion): boolean {
    return version.is_published === 1;
  }

  /**
   * 判断版本是否已删除
   */
  static isVersionDeleted(version: CmsPageVersion): boolean {
    return version.is_deleted === 1;
  }

  /**
   * 保存草稿
   * @param pageKey 页面唯一标识
   * @param content Puck JSON 数据
   * @param userId 用户ID
   */
  static async saveDraft(
    pageKey: string,
    content: PuckData,
    userId?: string
  ): Promise<void> {
    const page = await cmsPageRepository.findOne({ page_key: pageKey });
    
    if (!page) {
      throw new Error(`页面不存在: ${pageKey}`);
    }

    await cmsPageRepository.update(
      { id: page.id },
      {
        draft_content: content,
        updated_by: userId,
        updated_time: new Date(),
      }
    );
  }

  /**
   * 发布页面
   * @param pageKey 页面唯一标识
   * @param userId 用户ID
   * @param remark 版本备注
   */
  static async publishPage(
    pageKey: string,
    userId?: string,
    remark?: string
  ): Promise<number> {
    const page = await cmsPageRepository.findOne({ page_key: pageKey });
    
    if (!page) {
      throw new Error(`页面不存在: ${pageKey}`);
    }

    if (!page.draft_content) {
      throw new Error('草稿内容为空，无法发布');
    }

    // 1. 创建新版本
    const newVersion = {
      page_id: page.id!,
      version_num: page.version_counter || 1,
      content: page.draft_content as Record<string, unknown>,
      is_published: 1,
      published_time: new Date(),
      created_by: userId,
      remark,
    };

    const versionId = await cmsPageVersionRepository.create(newVersion);

    // 2. 将旧版本标记为未发布
    if (page.published_version_id) {
      await cmsPageVersionRepository.update(
        { page_id: page.id!, is_published: 1 },
        { is_published: 0 }
      );
    }

    // 3. 更新主表的发布指针
    await cmsPageRepository.update(
      { id: page.id },
      {
        published_version_id: versionId,
        published_time: new Date(),
        version_counter: (page.version_counter || 1) + 1,
        updated_by: userId,
      }
    );

    return versionId;
  }

  /**
   * 回滚到指定版本
   * @param pageKey 页面唯一标识
   * @param versionNum 版本号
   * @param userId 用户ID
   */
  static async rollbackToVersion(
    pageKey: string,
    versionNum: number,
    userId?: string
  ): Promise<void> {
    const page = await cmsPageRepository.findOne({ page_key: pageKey });
    
    if (!page) {
      throw new Error(`页面不存在: ${pageKey}`);
    }

    const version = await cmsPageVersionRepository.findOne({
      page_id: page.id!,
      version_num: versionNum,
    });

    if (!version) {
      throw new Error(`版本不存在: ${versionNum}`);
    }

    // 更新草稿为历史版本内容
    await cmsPageRepository.update(
      { id: page.id },
      {
        draft_content: version.content,
        updated_by: userId,
        updated_time: new Date(),
      }
    );
  }

  /**
   * 获取页面的版本历史
   * @param pageKey 页面唯一标识
   * @param includeDeleted 是否包含已删除的版本
   */
  static async getVersionHistory(
    pageKey: string,
    includeDeleted = false
  ): Promise<CmsPageVersion[]> {
    const page = await cmsPageRepository.findOne({ page_key: pageKey });
    
    if (!page) {
      throw new Error(`页面不存在: ${pageKey}`);
    }

    const where: Partial<CmsPageVersion> = { page_id: page.id! };
    
    if (!includeDeleted) {
      where.is_deleted = 0;
    }

    const versions = await cmsPageVersionRepository.findMany(where);
    
    // 按版本号降序排列
    return versions.sort((a: CmsPageVersion, b: CmsPageVersion) => (b.version_num || 0) - (a.version_num || 0));
  }

  /**
   * 软删除页面
   * @param pageKey 页面唯一标识
   * @param userId 用户ID
   */
  static async deletePage(pageKey: string, userId?: string): Promise<void> {
    const page = await cmsPageRepository.findOne({ page_key: pageKey });
    
    if (!page) {
      throw new Error(`页面不存在: ${pageKey}`);
    }

    await cmsPageRepository.update(
      { id: page.id },
      {
        is_deleted: 1,
        updated_by: userId,
        updated_time: new Date(),
      }
    );
  }

  /**
   * 恢复已删除的页面
   * @param pageKey 页面唯一标识
   * @param userId 用户ID
   */
  static async restorePage(pageKey: string, userId?: string): Promise<void> {
    const page = await cmsPageRepository.findOne({ page_key: pageKey });
    
    if (!page) {
      throw new Error(`页面不存在: ${pageKey}`);
    }

    await cmsPageRepository.update(
      { id: page.id },
      {
        is_deleted: 0,
        updated_by: userId,
        updated_time: new Date(),
      }
    );
  }

  /**
   * 软删除版本
   * @param pageKey 页面唯一标识
   * @param versionNum 版本号
   * @param userId 用户ID
   */
  static async deleteVersion(
    pageKey: string,
    versionNum: number,
    userId?: string
  ): Promise<void> {
    const page = await cmsPageRepository.findOne({ page_key: pageKey });
    
    if (!page) {
      throw new Error(`页面不存在: ${pageKey}`);
    }

    const version = await cmsPageVersionRepository.findOne({
      page_id: page.id!,
      version_num: versionNum,
    });

    if (!version) {
      throw new Error(`版本不存在: ${versionNum}`);
    }

    // 不允许删除当前发布的版本
    if (version.is_published === 1) {
      throw new Error('不能删除当前发布的版本');
    }

    await cmsPageVersionRepository.update(
      { id: version.id },
      {
        is_deleted: 1,
        updated_by: userId,
        updated_time: new Date(),
      }
    );
  }

  /**
   * 获取已发布的页面内容
   * @param pageKey 页面唯一标识
   */
  static async getPublishedContent(
    pageKey: string
  ): Promise<PuckData | null> {
    const page = await cmsPageRepository.findOne({ 
      page_key: pageKey,
      is_deleted: 0,
    });
    
    if (!page || !page.published_version_id) {
      return null;
    }

    const version = await cmsPageVersionRepository.findOne({
      id: page.published_version_id,
      is_deleted: 0,
    });

    return (version?.content as PuckData) || null;
  }

  /**
   * 获取草稿内容
   * @param pageKey 页面唯一标识
   */
  static async getDraftContent(
    pageKey: string
  ): Promise<PuckData | null> {
    const page = await cmsPageRepository.findOne({ 
      page_key: pageKey,
      is_deleted: 0,
    });
    
    return (page?.draft_content as PuckData) || null;
  }
}
