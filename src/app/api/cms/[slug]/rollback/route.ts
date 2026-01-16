
import { NextRequest, NextResponse } from 'next/server';
import { CmsHelper } from '@/lib/cms-helper';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const body = await request.json();
    const { versionNum, userId } = body;

    if (!versionNum) {
      return NextResponse.json(
        { error: 'Version number is required' },
        { status: 400 }
      );
    }

    await CmsHelper.rollbackToVersion(slug, versionNum, userId || 'admin');

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to version ${versionNum}`,
    });
  } catch (error) {
    console.error(`Failed to rollback:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
