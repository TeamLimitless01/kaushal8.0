import { NextRequest, NextResponse } from 'next/server';
import { getCampusWasteRules } from '@/server/services/wasteService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const bin = searchParams.get('bin') || undefined;

    const rules = await getCampusWasteRules(search, category, bin);
    return NextResponse.json({ success: true, count: rules.length, rules });
  } catch (error: any) {
    console.error('Rules query error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve rules.' },
      { status: 500 }
    );
  }
}
