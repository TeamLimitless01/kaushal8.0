import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ResourceType, Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get('pageSize') || '25', 10)));
    const search = searchParams.get('search') || '';
    const buildingId = searchParams.get('buildingId') || undefined;
    const resourceTypeParam = searchParams.get('resourceType') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const sortBy = searchParams.get('sortBy') || 'recordedDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Prisma.ResourceUsageWhereInput = {};

    if (buildingId) {
      where.buildingId = buildingId;
    }

    if (
      resourceTypeParam &&
      Object.values(ResourceType).includes(resourceTypeParam as ResourceType)
    ) {
      where.resourceType = resourceTypeParam as ResourceType;
    }

    if (startDate || endDate) {
      where.recordedDate = {};
      if (startDate) {
        where.recordedDate.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.recordedDate.lte = new Date(`${endDate}T00:00:00.000Z`);
      }
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { building: { name: { contains: q, mode: 'insensitive' } } },
        { room: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.ResourceUsageOrderByWithRelationInput = { recordedDate: sortOrder };
    if (sortBy === 'usage') {
      orderBy = { usage: sortOrder };
    } else if (sortBy === 'building') {
      orderBy = { building: { name: sortOrder } };
    }

    const [total, records] = await Promise.all([
      prisma.resourceUsage.count({ where }),
      prisma.resourceUsage.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          building: { select: { name: true } },
          room: { select: { name: true } },
          import: { select: { fileName: true } },
        },
      }),
    ]);

    const formattedRecords = records.map((r) => ({
      id: r.id,
      date: r.recordedDate.toISOString().split('T')[0],
      building: r.building.name,
      room: r.room.name,
      resource: r.resourceType,
      usage: r.usage,
      unit: r.unit,
      operatingHours: r.operatingHours,
      importFile: r.import?.fileName || 'Direct Ingestion',
    }));

    return NextResponse.json({
      records: formattedRecords,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err: unknown) {
    console.error('Data explorer API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to query resource records' },
      { status: 500 }
    );
  }
}
