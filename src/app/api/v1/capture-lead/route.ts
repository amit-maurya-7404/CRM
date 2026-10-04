import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

// Allow any external website (WordPress, Shopify, Webflow, Custom HTML) to post leads via CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Zyntex-Org',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    let redirectUrl: string | null = null;

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
      redirectUrl = body._redirect || body.redirect_url || null;
    } else {
      try {
        body = await req.json();
      } catch {
        const text = await req.text();
        const params = new URLSearchParams(text);
        params.forEach((value, key) => {
          body[key] = value;
        });
      }
    }

    // Identify target company (by orgId or slug)
    const orgIdentifier = body.orgId || body.org_id || body.slug || body.company_slug || 'org_travel';
    const org = await DataService.getOrganizationById(orgIdentifier);

    if (!org) {
      return NextResponse.json(
        { success: false, error: `Organization '${orgIdentifier}' not found in Zyntex CRM.` },
        { status: 404, headers: corsHeaders }
      );
    }

    // Validate minimum lead data
    const name = body.name || body.full_name || body.customer_name || 'Website Visitor';
    const phone = body.phone || body.mobile || body.contact_number || body.whatsapp || 'Not provided';
    const email = body.email || body.email_address || '';
    const companyName = body.company || body.business_name || '';
    const estimatedValue = Number(body.value || body.budget || body.estimated_budget || 0);

    // Extract dynamic custom fields
    const customFields: Record<string, any> = {};
    const knownKeys = ['orgId', 'org_id', 'slug', 'company_slug', 'name', 'full_name', 'customer_name', 'phone', 'mobile', 'contact_number', 'whatsapp', 'email', 'email_address', 'company', 'business_name', 'value', 'budget', 'estimated_budget', '_redirect', 'redirect_url', 'source', 'utm_source', 'notes', 'message'];

    // Map org-defined custom fields
    if (org.customFields && org.customFields.length > 0) {
      for (const field of org.customFields) {
        if (body[field.key] !== undefined) {
          customFields[field.key] = body[field.key];
        } else if (body[field.id] !== undefined) {
          customFields[field.key] = body[field.id];
        }
      }
    }

    // Also include any other passed attributes
    Object.keys(body).forEach((key) => {
      if (!knownKeys.includes(key) && !customFields[key]) {
        customFields[key] = body[key];
      }
    });

    const source = body.utm_source ? 'google_ads' : (body.source || 'website');

    // Create lead in MongoDB Atlas
    const newLead = await DataService.createLead({
      orgId: org._id,
      name,
      phone,
      email,
      company: companyName,
      value: estimatedValue,
      stage: 'new',
      priority: 'high',
      source,
      customFields,
      nextFollowUp: new Date(Date.now() + 86400000).toISOString(), // Auto set follow-up in 24 hours
    });

    // Automatically log incoming website activity
    const messageOrNotes = body.message || body.notes || body.comment || null;
    await DataService.addActivity({
      orgId: org._id,
      leadId: newLead._id,
      type: 'note',
      user: { _id: 'u_system', name: 'Website Integration' },
      content: `⚡ Web-to-Lead Form Capture: Lead originated from external website form.${messageOrNotes ? ` Message: "${messageOrNotes}"` : ''}`,
    });

    // If submitted via regular HTML form with a redirect URL
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Lead successfully captured for ${org.name}!`,
        data: {
          leadId: newLead._id,
          orgName: org.name,
          name: newLead.name,
          phone: newLead.phone,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Web-to-Lead Capture API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error while capturing lead.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
