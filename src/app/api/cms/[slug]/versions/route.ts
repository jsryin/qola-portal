
import { NextRequest, NextResponse } from 'next/server';
import { CmsHelper } from '@/lib/cms-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'glo';
    const slug = (await params).slug;
    const versions = await CmsHelper.getVersionHistory(slug, country);

    return NextResponse.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error(`Failed to get versions:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
