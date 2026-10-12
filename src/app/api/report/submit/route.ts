import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db/prisma';
import { submitWasteReport } from '@/server/services/gamificationService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { imageBase64, itemHint, location, notes, fileName, stationId } = body;

    if (!imageBase64 && !itemHint && !fileName) {
      return NextResponse.json(
        { error: 'Please provide a photo or description of the campus waste.' },
        { status: 400 }
      );
    }

    let userId = session?.user ? (session.user as { id?: string }).id : body.userId;
    if (!userId) {
      const studentUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      userId = studentUser?.id;
    }

    const result = await submitWasteReport({
      userId,
      imageBase64,
      itemHint,
      location,
      notes,
      fileName,
      stationId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Report submission error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit and verify waste report.' },
      { status: 500 }
    );
  }
}
