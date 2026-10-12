import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { classifyWasteItem } from '@/server/services/wasteService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { imageBase64, itemHint, stationId, apiKey, fileName, visualCue } = body;

    if (!imageBase64 && !itemHint && !fileName && !visualCue) {
      return NextResponse.json(
        { error: 'Please provide either an image or an item hint.' },
        { status: 400 }
      );
    }

    const result = await classifyWasteItem({
      imageBase64,
      itemHint,
      stationId,
      apiKey,
      fileName,
      visualCue,
      userId: session?.user ? (session.user as any).id : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to classify waste item.' },
      { status: 500 }
    );
  }
}
