import { NextRequest, NextResponse } from 'next/server';
import { resolveScanClarification } from '@/server/services/wasteService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scanId, optionId } = body;

    if (!scanId || !optionId) {
      return NextResponse.json(
        { error: 'scanId and optionId are required.' },
        { status: 400 }
      );
    }

    const result = await resolveScanClarification(scanId, optionId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Clarification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update clarification.' },
      { status: 500 }
    );
  }
}
