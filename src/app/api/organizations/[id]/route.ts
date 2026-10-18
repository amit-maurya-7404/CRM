import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const org = await DataService.getOrganizationById(id);
    if (!org) {
      return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: org });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch organization' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update organization' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Organization not found or could not be deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete organization' }, { status: 500 });
  }
}
