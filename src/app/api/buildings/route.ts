import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { prisma } from '@/lib/db/prisma';

// GET /api/buildings - list all campus buildings
export async function GET(req: NextRequest) {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        _count: {
          select: {
            rooms: true,
            resourceUsages: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      buildings: buildings.map((b) => ({
        id: b.id,
        name: b.name,
        campusId: b.campusId,
        roomCount: b._count.rooms,
        usageCount: b._count.resourceUsages,
        createdAt: b.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch campus buildings' },
      { status: 500 }
    );
  }
}

// POST /api/buildings - Admin creates a new building
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only administrators can add campus buildings.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = body.name?.trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Building name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // Find or ensure a default campus exists
    let campus = await prisma.campus.findFirst();
    if (!campus) {
      campus = await prisma.campus.create({
        data: {
          id: 'svvv-main-campus',
          name: 'SVVV Campus',
          location: 'Indore, Madhya Pradesh',
        },
      });
    }

    // Check if building already exists in this campus
    const existing = await prisma.building.findFirst({
      where: {
        campusId: campus.id,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Building "${name}" already exists.` },
        { status: 409 }
      );
    }

    const building = await prisma.building.create({
      data: {
        name,
        campusId: campus.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Building "${building.name}" created successfully.`,
        building,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating building:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create building.' },
      { status: 500 }
    );
  }
}

// PUT /api/buildings - Admin renames / edits an existing building
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only administrators can edit campus buildings.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const id = body.id;
    const name = body.name?.trim();

    if (!id || !name || name.length < 2) {
      return NextResponse.json(
        { error: 'Valid building ID and a name with at least 2 characters are required.' },
        { status: 400 }
      );
    }

    // Verify building exists
    const existing = await prisma.building.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Building not found.' }, { status: 404 });
    }

    // Check for duplicate name in the same campus
    const duplicate = await prisma.building.findFirst({
      where: {
        campusId: existing.campusId,
        name: { equals: name, mode: 'insensitive' },
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: `Another building named "${name}" already exists.` },
        { status: 409 }
      );
    }

    const updated = await prisma.building.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      message: `Building renamed to "${updated.name}" successfully.`,
      building: updated,
    });
  } catch (error: any) {
    console.error('Error updating building:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update building.' },
      { status: 500 }
    );
  }
}

// DELETE /api/buildings - Admin deletes a building
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only administrators can delete campus buildings.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // query param fallback
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Building ID is required.' }, { status: 400 });
    }

    const building = await prisma.building.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found.' }, { status: 404 });
    }

    await prisma.building.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Building "${building.name}" was deleted successfully.`,
      deletedId: id,
    });
  } catch (error: any) {
    console.error('Error deleting building:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete building.' },
      { status: 500 }
    );
  }
}
