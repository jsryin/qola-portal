import { NextRequest, NextResponse } from 'next/server';
import { CmsHelper } from '@/lib/cms-helper';
import { isPuckData } from '@/types/puck';

/**
 * 保存草稿 API
 * POST /api/cms/save-draft
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug: originalSlug,
      country: originalCountry = 'glo',
      language: originalLanguage = 'en',
      slug, // target slug (may be same as originalSlug if not renaming)
      country, // target country
      language, // target language
      content,
      userId,
      // Fallback for older clients or if field names differ
      originalSlug: explicitOriginalSlug,
      originalCountry: explicitOriginalCountry,
      originalLanguage: explicitOriginalLanguage,
    } = body;

    // Use explicit original params if provided (from my updated frontend), otherwise fallback
    const effectiveOriginalSlug = explicitOriginalSlug || originalSlug;
    const effectiveOriginalCountry = explicitOriginalCountry || originalCountry;
    const effectiveOriginalLanguage = explicitOriginalLanguage || originalLanguage;

    // Target params, default to original if not provided
    const targetSlug = slug || effectiveOriginalSlug;
    const targetCountry = country || effectiveOriginalCountry;
    const targetLanguage = language || effectiveOriginalLanguage;

    // 验证参数
    if (!effectiveOriginalSlug || typeof effectiveOriginalSlug !== 'string') {
      return NextResponse.json(
        { error: '页面标识不能为空' },
        { status: 400 }
      );
    }

    if (!content || !isPuckData(content)) {
      return NextResponse.json(
        { error: '无效的内容格式' },
        { status: 400 }
      );
    }

    // 从 Puck 数据中提取 title
    const rootProps = content.root?.props as Record<string, unknown> | undefined;
    const title = (rootProps?.title as string) || '';

    // 验证 newSlug 是必填的
    if (!targetSlug) {
      return NextResponse.json(
        { error: 'Slug 是必填字段，请在页面设置中填写 Slug' },
        { status: 400 }
      );
    }

    // 保存草稿
    await CmsHelper.saveDraft({
      slug: targetSlug,
      country: targetCountry,
      language: targetLanguage,
      content,
      userId,
      title,
      originalSlug: effectiveOriginalSlug,
      originalCountry: effectiveOriginalCountry,
      originalLanguage: effectiveOriginalLanguage
    });

    return NextResponse.json({
      success: true,
      message: '草稿保存成功',
      slug: targetSlug,
      country: targetCountry,
      language: targetLanguage,
    });
  } catch (error) {
    console.error('保存草稿失败:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '保存草稿失败',
        success: false,
      },
      { status: 500 }
    );
  }
}
