import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const stage = searchParams.get('stage') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'orgId is required' }, { status: 400 });
    }

    const leads = await DataService.getLeads(orgId, { stage, priority, search });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.orgId || !body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'orgId, name, and phone are required fields' },
        { status: 400 }
      );
    }

    const newLead = await DataService.createLead(body);
    return NextResponse.json({ success: true, data: newLead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}
