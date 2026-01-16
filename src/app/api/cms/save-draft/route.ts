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
    const { slug: originalSlug, content, userId } = body;

    // 验证参数
    if (!originalSlug || typeof originalSlug !== 'string') {
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

    // 从 Puck 数据中提取 title 和 slug (新 slug)
    const rootProps = content.root?.props as Record<string, unknown> | undefined;
    const title = (rootProps?.title as string) || '';
    const newSlug = (rootProps?.slug as string) || '';

    // 验证 newSlug 是必填的
    if (!newSlug) {
      return NextResponse.json(
        { error: 'Slug 是必填字段，请在页面设置中填写 Slug' },
        { status: 400 }
      );
    }

    // 保存草稿，同时更新 title 和 slug
    await CmsHelper.saveDraft(originalSlug, content, userId, title, newSlug);

    return NextResponse.json({
      success: true,
      message: '草稿保存成功',
      slug: newSlug, // 返回最新的 slug
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
