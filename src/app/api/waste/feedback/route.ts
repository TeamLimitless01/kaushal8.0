import { NextRequest, NextResponse } from 'next/server';
import { submitScanFeedback } from '@/server/services/wasteService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scanId, feedbackStatus, feedbackComment } = body;

    if (!scanId || !feedbackStatus) {
      return NextResponse.json(
        { error: 'scanId and feedbackStatus are required.' },
        { status: 400 }
      );
    }

    const updated = await submitScanFeedback(scanId, feedbackStatus, feedbackComment);
    return NextResponse.json({ success: true, scan: updated });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit feedback.' },
      { status: 500 }
    );
  }
}
