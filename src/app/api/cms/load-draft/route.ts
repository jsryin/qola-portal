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
    const country = searchParams.get('country') || 'glo';

    // 验证参数
    if (!slug) {
      return NextResponse.json(
        { error: '页面标识不能为空' },
        { status: 400 }
      );
    }

    // 获取页面信息
    const page = await cmsPageRepository.findOne({
      slug,
      country_code: country,
      is_deleted: 0,
    });

    if (!page) {
      return NextResponse.json(
        { error: '页面不存在' },
        { status: 404 }
      );
    }

    // 加载草稿内容
    const content = await CmsHelper.getDraftContent(slug, country);

    // 如果草稿内容存在，将 title 和 slug 注入到 root.props 中
    if (content) {
      if (!content.root) {
        content.root = { props: {} };
      }
      if (!content.root.props) {
        content.root.props = {};
      }
      // 从数据库中获取的 title 和 slug 优先级更高
      let dbTitle = page.title || '';

      // 如果 title 是 JSON 字符串，尝试解析它
      if (typeof dbTitle === 'string' && dbTitle.startsWith('{')) {
        try {
          dbTitle = JSON.parse(dbTitle);
        } catch (e) {
          // 解析失败，保持为字符串
        }
      }

      content.root.props.pageTitle = dbTitle;

      // 为 Puck 提供一个字符串类型的 title，防止其内部渲染对象导致崩溃
      if (typeof dbTitle === 'string') {
        content.root.props.title = dbTitle;
      } else if (dbTitle && typeof dbTitle === 'object') {
        const titleObj = dbTitle as any;
        content.root.props.title = titleObj.en || titleObj.ar || Object.values(titleObj)[0] || '';
      } else {
        content.root.props.title = '';
      }

      content.root.props.slug = page.slug || '';
      // Ensure country/language in props match
      (content.root.props as any).country = page.country_code || country;
      (content.root.props as any).language = (content.root.props as any).language || 'en';
    }

    return NextResponse.json({
      success: true,
      content,
      pageInfo: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        country: page.country_code,
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
