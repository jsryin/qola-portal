import { NextRequest, NextResponse } from 'next/server';
import { CmsHelper } from '@/lib/cms-helper';

/**
 * 发布页面 API
 * POST /api/cms/publish
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, country, userId, remark } = body;

    // 验证参数
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: '页面标识不能为空' },
        { status: 400 }
      );
    }

    // 发布页面
    const versionId = await CmsHelper.publishPage(slug, country, userId, remark);

    return NextResponse.json({
      success: true,
      message: '页面发布成功',
      versionId,
    });
  } catch (error) {
    console.error('发布页面失败:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '发布页面失败',
        success: false,
      },
      { status: 500 }
    );
  }
}
