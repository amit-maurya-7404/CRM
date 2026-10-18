import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  try {
    const orgs = await DataService.getOrganizations();
    return NextResponse.json(
      { success: true, data: orgs },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Error in GET /api/organizations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400, headers: noCacheHeaders }
      );
    }
    const newOrg = await DataService.createOrganization(body);
    return NextResponse.json(
      { success: true, data: newOrg },
      { status: 201, headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Error in POST /api/organizations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create organization' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
