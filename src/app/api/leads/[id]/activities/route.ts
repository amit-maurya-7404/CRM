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
    const activities = await DataService.getActivitiesByLead(id);
    return NextResponse.json(
      { success: true, data: activities },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.content || !body.type || !body.orgId) {
      return NextResponse.json(
        { success: false, error: 'content, type, and orgId are required' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const activity = await DataService.addActivity({
      ...body,
      leadId: id,
    });
    return NextResponse.json(
      { success: true, data: activity },
      { status: 201, headers: noCacheHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add activity' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
