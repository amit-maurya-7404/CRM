import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgName, industry, ownerName, email, password, phone, currency, currencySymbol, plan } = body;

    if (!orgName || !ownerName || !email) {
      return NextResponse.json(
        { success: false, error: 'Company Name, Owner Name, and Email are required.' },
        { status: 400 }
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
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Business account successfully created!',
      data: {
        user: result.user,
        organization: result.org,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
