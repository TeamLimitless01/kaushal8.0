import { NextResponse } from 'next/server';
import { getCampusWasteStations } from '@/server/services/wasteService';

export async function GET() {
  try {
    const stations = await getCampusWasteStations();
    return NextResponse.json({ success: true, count: stations.length, stations });
  } catch (error: any) {
    console.error('Stations query error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve waste stations.' },
      { status: 500 }
    );
  }
}
