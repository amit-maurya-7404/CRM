import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const stage = searchParams.get('stage') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'orgId is required' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const leads = await DataService.getLeads(orgId, { stage, priority, search });
    return NextResponse.json(
      { success: true, data: leads },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.orgId || !body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'orgId, name, and phone are required fields' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const newLead = await DataService.createLead(body);
    return NextResponse.json(
      { success: true, data: newLead },
      { status: 201, headers: noCacheHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create lead' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
