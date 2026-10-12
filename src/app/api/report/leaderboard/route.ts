import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getLeaderboardAndStats } from '@/server/services/gamificationService';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as { id?: string }).id : undefined;

    const data = await getLeaderboardAndStats(userId);

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch leaderboard data.' },
      { status: 500 }
    );
  }
}
