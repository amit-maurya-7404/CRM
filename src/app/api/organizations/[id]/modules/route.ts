import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const org = await DataService.getOrganizationById(id);
    if (!org) {
      return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: org.modules || [] });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch modules' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === 'create_module') {
      const { name, icon, description, fields } = body;
      if (!name) {
        return NextResponse.json({ success: false, error: 'Module name is required' }, { status: 400 });
      }
      const updatedOrg = await DataService.createCustomModule(id, {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        icon: icon || 'Layers',
        description: description || '',
        fields: fields || [],
        records: [],
      });
      return NextResponse.json({ success: true, data: updatedOrg?.modules || [] });
    }

    if (action === 'update_layout') {
      const { moduleSlug, fields } = body;
      if (!moduleSlug || !fields) {
        return NextResponse.json({ success: false, error: 'Module slug and fields are required' }, { status: 400 });
      }
      const updatedOrg = await DataService.updateCustomModuleLayout(id, moduleSlug, fields);
      return NextResponse.json({ success: true, data: updatedOrg?.modules || [] });
    }

    if (action === 'add_record') {
      const { moduleSlug, recordData } = body;
      if (!moduleSlug || !recordData) {
        return NextResponse.json({ success: false, error: 'Module slug and record data are required' }, { status: 400 });
      }
      const updatedOrg = await DataService.addCustomModuleRecord(id, moduleSlug, recordData);
      return NextResponse.json({ success: true, data: updatedOrg?.modules || [] });
    }

    if (action === 'delete_record') {
      const { moduleSlug, recordId } = body;
      if (!moduleSlug || !recordId) {
        return NextResponse.json({ success: false, error: 'Module slug and record id are required' }, { status: 400 });
      }
      const updatedOrg = await DataService.deleteCustomModuleRecord(id, moduleSlug, recordId);
      return NextResponse.json({ success: true, data: updatedOrg?.modules || [] });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling module action:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
