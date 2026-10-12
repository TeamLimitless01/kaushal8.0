import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getRecentScans } from '@/server/services/wasteService';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const userId = session?.user ? (session.user as any).id : undefined;
    const scans = await getRecentScans(userId, limit);

    return NextResponse.json({ success: true, count: scans.length, scans });
  } catch (error: any) {
    console.error('History query error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve scan history.' },
      { status: 500 }
    );
  }
}
