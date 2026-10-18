import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await DataService.regenerateApiKey(id);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Organization not found to regenerate API key.' },
        { status: 404, headers: noCacheHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'New API Key generated successfully.',
        data: {
          apiKey: updated.apiKey,
          apiKeyCreatedAt: updated.apiKeyCreatedAt,
          organization: updated,
        },
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Error regenerating API key:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to regenerate API key.' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
