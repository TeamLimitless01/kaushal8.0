import { prisma } from '@/lib/db/prisma';
import { ValidResourceRow } from '@/lib/csv/parser';
import { ImportStatus } from '@prisma/client';

export interface ProcessImportParams {
  campusId?: string;
  userId?: string;
  fileName: string;
  cloudinaryUrl?: string;
  publicId?: string;
  validRows: ValidResourceRow[];
  totalCsvRows: number;
}

export interface ImportExecutionResult {
  importId: string;
  fileName: string;
  totalRows: number;
  validRowCount: number;
  invalidRowCount: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  dateFrom: string | null;
  dateTo: string | null;
  status: ImportStatus;
}

export async function processAndStoreImport(
  params: ProcessImportParams
): Promise<ImportExecutionResult> {
  const {
    fileName,
    cloudinaryUrl,
    publicId,
    validRows,
    totalCsvRows,
    userId,
  } = params;

  // 1. Ensure campus exists
  let campus = await prisma.campus.findFirst({
    where: { name: 'SVVV Campus' },
  });
  if (!campus) {
    campus = await prisma.campus.create({
      data: {
        name: 'SVVV Campus',
        location: 'Indore, Madhya Pradesh',
      },
    });
  }

  const campusId = campus.id;

  // Compute date range
  let minDateStr: string | null = null;
  let maxDateStr: string | null = null;
  for (const r of validRows) {
    if (!minDateStr || r.date < minDateStr) minDateStr = r.date;
    if (!maxDateStr || r.date > maxDateStr) maxDateStr = r.date;
  }

  // 2. Create Import record with PROCESSING status
  const importRecord = await prisma.import.create({
    data: {
      campusId,
      uploadedById: userId || null,
      fileName,
      cloudinaryUrl: cloudinaryUrl || null,
      publicId: publicId || null,
      rowCount: totalCsvRows,
      validRowCount: validRows.length,
      invalidRowCount: totalCsvRows - validRows.length,
      dateFrom: minDateStr ? new Date(`${minDateStr}T00:00:00.000Z`) : null,
      dateTo: maxDateStr ? new Date(`${maxDateStr}T00:00:00.000Z`) : null,
      status: ImportStatus.PROCESSING,
    },
  });

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  try {
    // Cache buildings and rooms to minimize DB roundtrips
    const existingBuildings = await prisma.building.findMany({
      where: { campusId },
      include: { rooms: true },
    });

    const buildingMap = new Map<string, string>(); // name.toLowerCase() -> building.id
    const roomMap = new Map<string, string>(); // `${buildingId}_${roomName.toLowerCase()}` -> room.id

    for (const b of existingBuildings) {
      buildingMap.set(b.name.toLowerCase(), b.id);
      for (const r of b.rooms) {
        roomMap.set(`${b.id}_${r.name.toLowerCase()}`, r.id);
      }
    }

    // Upsert any missing buildings first
    const uniqueBuildingsInCsv = Array.from(
      new Set(validRows.map((r) => r.building.trim()))
    );

    for (const bName of uniqueBuildingsInCsv) {
      const lower = bName.toLowerCase();
      if (!buildingMap.has(lower)) {
        const createdB = await prisma.building.upsert({
          where: { campusId_name: { campusId, name: bName } },
          update: {},
          create: { campusId, name: bName },
        });
        buildingMap.set(lower, createdB.id);
      }
    }

    // Upsert any missing rooms
    for (const r of validRows) {
      const bId = buildingMap.get(r.building.trim().toLowerCase())!;
      const rName = r.room.trim() || 'General';
      const roomKey = `${bId}_${rName.toLowerCase()}`;

      if (!roomMap.has(roomKey)) {
        const createdRoom = await prisma.room.upsert({
          where: { buildingId_name: { buildingId: bId, name: rName } },
          update: {},
          create: { buildingId: bId, name: rName },
        });
        roomMap.set(roomKey, createdRoom.id);
      }
    }

    // Process rows in chunks of 50 to maintain clean transactions
    const CHUNK_SIZE = 50;
    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      const chunk = validRows.slice(i, i + CHUNK_SIZE);

      await prisma.$transaction(async (tx) => {
        for (const row of chunk) {
          const buildingId = buildingMap.get(row.building.trim().toLowerCase())!;
          const roomId = roomMap.get(`${buildingId}_${row.room.trim().toLowerCase()}`) ||
                         roomMap.get(`${buildingId}_general`)!;
          const recordedDate = new Date(`${row.date}T00:00:00.000Z`);

          // Check if record exists
          const existing = await tx.resourceUsage.findUnique({
            where: {
              campusId_buildingId_roomId_resourceType_recordedDate: {
                campusId,
                buildingId,
                roomId,
                resourceType: row.resource,
                recordedDate,
              },
            },
          });

          if (existing) {
            // If identical usage, record as skipped or update import link
            if (
              existing.usage === row.usage &&
              existing.operatingHours === row.operatingHours
            ) {
              skippedCount++;
            } else {
              // Update with newest reading
              await tx.resourceUsage.update({
                where: { id: existing.id },
                data: {
                  usage: row.usage,
                  unit: row.unit,
                  operatingHours: row.operatingHours,
                  importId: importRecord.id,
                },
              });
              updatedCount++;
            }
          } else {
            // Insert new record
            await tx.resourceUsage.create({
              data: {
                campusId,
                buildingId,
                roomId,
                resourceType: row.resource,
                usage: row.usage,
                unit: row.unit,
                operatingHours: row.operatingHours,
                recordedDate,
                importId: importRecord.id,
              },
            });
            insertedCount++;
          }
        }
      });
    }

    // Mark import COMPLETED
    const finalStatus =
      errorsOrWarningsPresent(validRows.length, totalCsvRows)
        ? ImportStatus.PARTIAL
        : ImportStatus.COMPLETED;

    const summaryData = {
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount,
      totalProcessed: validRows.length,
    };

    await prisma.import.update({
      where: { id: importRecord.id },
      data: {
        status: finalStatus,
        summary: summaryData,
      },
    });

    return {
      importId: importRecord.id,
      fileName,
      totalRows: totalCsvRows,
      validRowCount: validRows.length,
      invalidRowCount: totalCsvRows - validRows.length,
      insertedCount,
      updatedCount,
      skippedCount,
      dateFrom: minDateStr,
      dateTo: maxDateStr,
      status: finalStatus,
    };
  } catch (error) {
    console.error('Import processing failed:', error);
    await prisma.import.update({
      where: { id: importRecord.id },
      data: { status: ImportStatus.FAILED },
    });
    throw error;
  }
}

function errorsOrWarningsPresent(validCount: number, totalCount: number): boolean {
  return validCount < totalCount;
}

export async function deleteImport(importId: string) {
  return prisma.$transaction(async (tx) => {
    // Delete resource usages created by this import
    const deletedUsages = await tx.resourceUsage.deleteMany({
      where: { importId },
    });

    // Delete the import record
    const deletedImport = await tx.import.delete({
      where: { id: importId },
    });

    return {
      deletedUsagesCount: deletedUsages.count,
      deletedImport,
    };
  });
}
