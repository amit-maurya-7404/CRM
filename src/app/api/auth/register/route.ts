import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgName, industry, ownerName, email, password, phone, currency, currencySymbol, plan } = body;

    if (!orgName || !ownerName || !email) {
      return NextResponse.json(
        { success: false, error: 'Company Name, Owner Name, and Email are required.' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const result = await DataService.registerBusinessAccount({
      orgName: orgName.trim(),
      industry: industry?.trim() || 'General Business',
      ownerName: ownerName.trim(),
      email: email.trim(),
      password: password || 'password123',
      phone: phone?.trim() || '+919876543210',
      currency: currency || 'INR',
      currencySymbol: currencySymbol || '₹',
      ...(plan ? { plan } : {}),
    } as any);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to register business account.' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    // Security: Never leak passwords to the frontend
    const safeUser: any = result.user ? { ...result.user } : null;
    if (safeUser) delete safeUser.password;

    const safeOrg: any = result.org ? { ...result.org } : null;
    if (safeOrg) delete safeOrg.adminPassword;

    return NextResponse.json(
      {
        success: true,
        message: 'Business account successfully created!',
        data: {
          user: safeUser,
          organization: safeOrg,
        },
      },
      { status: 201, headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during registration.' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
