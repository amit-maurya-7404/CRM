import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

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
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'New API Key generated successfully.',
      data: {
        apiKey: updated.apiKey,
        apiKeyCreatedAt: updated.apiKeyCreatedAt,
        organization: updated,
      },
    });
  } catch (error: any) {
    console.error('Error regenerating API key:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to regenerate API key.' },
      { status: 500 }
    );
  }
}
