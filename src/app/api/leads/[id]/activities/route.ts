import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activities = await DataService.getActivitiesByLead(id);
    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch activities' }, { status: 500 });
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
        { status: 400 }
      );
    }

    const activity = await DataService.addActivity({
      ...body,
      leadId: id,
    });
    return NextResponse.json({ success: true, data: activity }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add activity' }, { status: 500 });
  }
}
