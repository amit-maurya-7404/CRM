import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const org = await DataService.getOrganizationById(id);
    if (!org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404, headers: noCacheHeaders }
      );
    }
    return NextResponse.json(
      { success: true, data: org },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await DataService.updateOrganization(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404, headers: noCacheHeaders }
      );
    }
    return NextResponse.json(
      { success: true, data: updated },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await DataService.deleteOrganization(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Organization not found or could not be deleted' },
        { status: 404, headers: noCacheHeaders }
      );
    }
    return NextResponse.json(
      { success: true, message: 'Organization deleted successfully' },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete organization' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
