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
   */
  static async saveDraft(params: {
    slug: string;
    country: string;
    content: PuckData;
    userId?: string;
    title?: string;
    originalSlug?: string;
    originalCountry?: string;
  }): Promise<void> {
    const {
      slug, country, content, userId, title,
      originalSlug, originalCountry
    } = params;

    // 查找原有页面
    const searchSlug = originalSlug || slug;
    const searchCountry = originalCountry || country;

    const page = await cmsPageRepository.findOne({
      slug: searchSlug,
      country_code: searchCountry,
    });

    if (!page) {
      // 如果页面不存在，检查目标 slug+country 是否已存在
      const existingPage = await cmsPageRepository.findOne({
        slug,
        country_code: country,
      });

      if (existingPage) {
        throw new Error(`该国家下已存在相同的 Slug: ${country}/${slug}`);
      }

      // 创建新页面
      await cmsPageRepository.create({
        slug,
        country_code: country,
        title: title || slug,
        draft_content: JSON.stringify(content),
        created_by: userId,
        updated_by: userId,
        version_counter: 1,
        is_deleted: 0,
      });
      return;
    }

    // 已存在页面，构建更新数据
    const updateData: Partial<CmsPage> = {
      draft_content: JSON.stringify(content),
      updated_by: userId,
      updated_time: new Date(),
    };

    if (title !== undefined) updateData.title = title;

    // 检查是否需要更新元数据 (slug/country)
    if (slug !== page.slug || country !== page.country_code) {
      // 检查目标组合是否已被占用
      const existingPage = await cmsPageRepository.findOne({
        slug,
        country_code: country,
      });

      if (existingPage && existingPage.id !== page.id) {
        throw new Error(`目标页面已存在: ${country}/${slug}`);
      }

      updateData.slug = slug;
      updateData.country_code = country;
    }

    await cmsPageRepository.update(
      { id: page.id },
      updateData
    );
  }

  /**
   * 发布页面
   */
  static async publishPage(
    slug: string,
    country: string = 'glo',
    userId?: string,
    remark?: string
  ): Promise<number> {
    const page = await cmsPageRepository.findOne({
      slug,
      country_code: country,
    });

    if (!page) {
      throw new Error(`页面不存在: ${country}/${slug}`);
    }

    if (!page.draft_content) {
      throw new Error('草稿内容为空，无法发布');
    }

    // 1. 创建新版本
    const newVersion: Omit<CmsPageVersion, 'id' | 'created_at' | 'updated_at'> = {
      page_id: page.id!,
      country_code: country,
      version_num: page.version_counter || 1,
      content: typeof page.draft_content === 'string'
        ? page.draft_content
        : JSON.stringify(page.draft_content) || '',
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
   */
  static async rollbackToVersion(
    slug: string,
    versionNum: number,
    country: string = 'glo',
    userId?: string
  ): Promise<void> {
    const page = await cmsPageRepository.findOne({
      slug,
      country_code: country,
    });

    if (!page) {
      throw new Error(`页面不存在: ${country}/${slug}`);
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
        draft_content: typeof version.content === 'string'
          ? version.content
          : JSON.stringify(version.content),
        updated_by: userId,
        updated_time: new Date(),
      }
    );
  }

  /**
   * 获取页面的版本历史
   */
  static async getVersionHistory(
    slug: string,
    country: string = 'glo',
    includeDeleted = false
  ): Promise<CmsPageVersion[]> {
    const page = await cmsPageRepository.findOne({ slug, country_code: country });

    if (!page) {
      throw new Error(`页面不存在: ${slug}`);
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
   */
  static async deletePage(slug: string, country: string = 'glo', userId?: string): Promise<void> {
    const page = await cmsPageRepository.findOne({ slug, country_code: country });

    if (!page) {
      throw new Error(`页面不存在: ${slug}`);
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
   */
  static async restorePage(slug: string, country: string = 'glo', userId?: string): Promise<void> {
    const page = await cmsPageRepository.findOne({ slug, country_code: country });

    if (!page) {
      throw new Error(`页面不存在: ${slug}`);
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
   */
  static async deleteVersion(
    slug: string,
    versionNum: number,
    country: string = 'glo',
    userId?: string
  ): Promise<void> {
    const page = await cmsPageRepository.findOne({ slug, country_code: country });

    if (!page) {
      throw new Error(`页面不存在: ${slug}`);
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
   */
  static async getPublishedContent(
    slug: string,
    country: string = 'glo',
  ): Promise<PuckData | null> {
    const page = await cmsPageRepository.findOne({
      slug,
      country_code: country,
      is_deleted: 0,
    });

    if (!page || !page.published_version_id) {
      return null;
    }

    const version = await cmsPageVersionRepository.findOne({
      id: page.published_version_id,
      is_deleted: 0,
    });

    if (!version || !version.content) {
      return null;
    }

    if (typeof version.content === 'string') {
      try {
        return JSON.parse(version.content) as PuckData;
      } catch (e) {
        console.error('Failed to parse published content:', e);
        return null;
      }
    }

    return version.content as PuckData;
  }

  /**
   * 获取草稿内容
   */
  static async getDraftContent(
    slug: string,
    country: string = 'glo',
  ): Promise<PuckData | null> {
    const page = await cmsPageRepository.findOne({
      slug,
      country_code: country,
      is_deleted: 0,
    });

    if (!page || !page.draft_content) {
      return null;
    }

    if (typeof page.draft_content === 'string') {
      try {
        return JSON.parse(page.draft_content) as PuckData;
      } catch (e) {
        console.error('Failed to parse draft content:', e);
        return null;
      }
    }

    return page.draft_content as PuckData;
  }

  /**
   * 搜索页面
   */
  static async searchPages(
    keyword: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    data: CmsPage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    let whereClause = "WHERE is_deleted = 0";
    const params: unknown[] = [];

    if (keyword) {
      whereClause += " AND (title LIKE ? OR slug LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const offset = (page - 1) * pageSize;

    // Count
    const countSql = `SELECT COUNT(*) as total FROM cms_page ${whereClause}`;
    const countResult = await cmsPageRepository.rawQuery<({ total: number } & import('@/lib/db/connection').RowDataPacket)[]>(countSql, params);
    const total = countResult[0]?.total || 0;

    // Data
    const dataSql = `SELECT * FROM cms_page ${whereClause} ORDER BY updated_time DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, pageSize, offset];

    const data = await cmsPageRepository.rawQuery<(CmsPage & import('@/lib/db/connection').RowDataPacket)[]>(dataSql, dataParams);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
