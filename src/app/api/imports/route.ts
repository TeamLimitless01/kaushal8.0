import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { deleteImport } from '@/server/services/importService';

export async function GET() {
  try {
    const imports = await prisma.import.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { name: true, email: true } },
        _count: { select: { resourceUsages: true } },
      },
    });

    const formattedImports = imports.map((imp) => {
      const summary = (imp.summary as { inserted?: number; updated?: number; skipped?: number } | null) || {};
      return {
        id: imp.id,
        fileName: imp.fileName,
        createdAt: imp.createdAt.toISOString(),
        dateFrom: imp.dateFrom ? imp.dateFrom.toISOString().split('T')[0] : null,
        dateTo: imp.dateTo ? imp.dateTo.toISOString().split('T')[0] : null,
        rowCount: imp.rowCount,
        validRowCount: imp.validRowCount,
        invalidRowCount: imp.invalidRowCount,
        insertedCount: summary.inserted ?? imp.validRowCount,
        updatedCount: summary.updated ?? 0,
        skippedCount: summary.skipped ?? 0,
        status: imp.status,
        cloudinaryUrl: imp.cloudinaryUrl,
        publicId: imp.publicId,
        uploadedBy: imp.uploadedBy?.name || imp.uploadedBy?.email || 'Administrator',
        usagesLinked: imp._count.resourceUsages,
      };
    });

    return NextResponse.json({ imports: formattedImports });
  } catch (err: unknown) {
    console.error('Error fetching imports:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch imports' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Import ID is required' }, { status: 400 });
    }

    const result = await deleteImport(id);

    return NextResponse.json({
      success: true,
      message: `Import and ${result.deletedUsagesCount} associated records safely deleted`,
    });
  } catch (err: unknown) {
    console.error('Error deleting import:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete import' },
      { status: 500 }
    );
  }
}
