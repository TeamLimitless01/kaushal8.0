import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getAllAdminReports } from '@/server/services/gamificationService';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;

    // Only administrators can review student queries
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get('status') as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') || 'ALL';

    const reports = await getAllAdminReports(filter);
    const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
    const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;

    return NextResponse.json({
      success: true,
      reports,
      pendingCount,
      approvedCount,
      totalCount: reports.length,
    });
  } catch (error: any) {
    console.error('Fetch admin reports error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch student reports.' },
      { status: 500 }
    );
  }
}
