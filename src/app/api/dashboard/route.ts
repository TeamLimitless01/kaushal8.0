import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/server/services/analyticsService';
import { ResourceType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const buildingId = searchParams.get('buildingId') || undefined;
    const roomId = searchParams.get('roomId') || undefined;
    const resourceTypeParam = searchParams.get('resourceType') || undefined;

    let resourceType: ResourceType | undefined = undefined;
    if (
      resourceTypeParam &&
      Object.values(ResourceType).includes(resourceTypeParam as ResourceType)
    ) {
      resourceType = resourceTypeParam as ResourceType;
    }

    const data = await getDashboardData({
      startDate,
      endDate,
      buildingId,
      roomId,
      resourceType,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('Dashboard data error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
