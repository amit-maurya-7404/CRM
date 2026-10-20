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
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const result = await DataService.authenticateUser(email, password);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid email or password.' },
        { status: 401, headers: noCacheHeaders }
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
        data: {
          user: safeUser,
          organization: safeOrg,
        },
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during login.' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
