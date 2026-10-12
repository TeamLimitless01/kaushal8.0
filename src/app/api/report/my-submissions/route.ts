import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getStudentSubmissions } from '@/server/services/gamificationService';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as { id?: string }).id : undefined;

    const submissions = await getStudentSubmissions(userId);
    return NextResponse.json({ success: true, submissions });
  } catch (error: any) {
    console.error('Fetch student submissions error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch student submissions.' },
      { status: 500 }
    );
  }
}
