import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { reviewWasteReport } from '@/server/services/gamificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;

    // Only administrators can approve or reject student reports
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, action, points, adminNote } = body;

    if (!reportId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid reportId and action (APPROVE or REJECT) are required.' },
        { status: 400 }
      );
    }

    const result = await reviewWasteReport({
      reportId,
      action,
      points: typeof points === 'number' ? points : undefined,
      adminNote,
    });

    return NextResponse.json({ ...result });
  } catch (error: any) {
    console.error('Admin review action error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process report action.' },
      { status: 500 }
    );
  }
}
