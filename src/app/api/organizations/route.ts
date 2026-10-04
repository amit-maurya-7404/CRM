import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET() {
  try {
    const orgs = await DataService.getOrganizations();
    return NextResponse.json({ success: true, data: orgs });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Organization name is required' }, { status: 400 });
    }
    const newOrg = await DataService.createOrganization(body);
    return NextResponse.json({ success: true, data: newOrg }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create organization' }, { status: 500 });
  }
}
