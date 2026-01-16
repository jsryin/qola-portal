import { NextRequest, NextResponse } from 'next/server';
import { CmsHelper } from '@/lib/cms-helper';
import { cmsPageRepository } from '@/models';

/**
 * 加载草稿内容 API
 * GET /api/cms/load-draft?slug=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // 验证参数
    if (!slug) {
      return NextResponse.json(
        { error: '页面标识不能为空' },
        { status: 400 }
      );
    }

    // 获取页面信息
    const page = await cmsPageRepository.findOne({ 
      slug: slug,
      is_deleted: 0,
    });

    if (!page) {
      return NextResponse.json(
        { error: '页面不存在' },
        { status: 404 }
      );
    }

    // 加载草稿内容
    const content = await CmsHelper.getDraftContent(slug);

    // 如果草稿内容存在，将 title 和 slug 注入到 root.props 中
    if (content) {
      if (!content.root) {
        content.root = { props: {} };
      }
      if (!content.root.props) {
        content.root.props = {};
      }
      // 从数据库中获取的 title 和 slug 优先级更高
      content.root.props.title = page.title || '';
      content.root.props.slug = page.slug || '';
    }

    return NextResponse.json({
      success: true,
      content,
      pageInfo: {
        id: page.id,
        title: page.title,
        slug: page.slug,
      },
    });
  } catch (error) {
    console.error('加载草稿失败:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '加载草稿失败',
        success: false,
      },
      { status: 500 }
    );
  }
}
