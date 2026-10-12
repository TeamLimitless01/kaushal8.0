import { prisma } from '@/lib/db/prisma';
import { ValidResourceRow } from '@/lib/csv/parser';
import { ImportStatus, ResourceType } from '@prisma/client';

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
    // 3. Cache and resolve buildings
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

    // 4. Batch query existing records in date range to prevent slow roundtrips
    const existingRecords = await prisma.resourceUsage.findMany({
      where: {
        campusId,
        recordedDate: {
          gte: new Date(`${minDateStr}T00:00:00.000Z`),
          lte: new Date(`${maxDateStr}T00:00:00.000Z`),
        },
      },
    });

    // Map: `${buildingId}_${roomId}_${resourceType}_${dateStr}` -> record
    const existingMap = new Map<string, typeof existingRecords[0]>();
    for (const er of existingRecords) {
      const dateStr = er.recordedDate.toISOString().split('T')[0];
      const key = `${er.buildingId}_${er.roomId}_${er.resourceType}_${dateStr}`;
      existingMap.set(key, er);
    }

    const recordsToCreate: Array<{
      campusId: string;
      buildingId: string;
      roomId: string;
      resourceType: ResourceType;
      usage: number;
      unit: string;
      operatingHours: number | null;
      recordedDate: Date;
      importId: string;
    }> = [];

    const recordsToUpdate: Array<{
      id: string;
      usage: number;
      unit: string;
      operatingHours: number | null;
      importId: string;
    }> = [];

    // Deduplicate in-memory across the CSV rows
    const processedKeys = new Set<string>();

    for (const row of validRows) {
      const buildingId = buildingMap.get(row.building.trim().toLowerCase())!;
      const roomId =
        roomMap.get(`${buildingId}_${row.room.trim().toLowerCase()}`) ||
        roomMap.get(`${buildingId}_general`)!;
      const rowKey = `${buildingId}_${roomId}_${row.resource}_${row.date}`;

      if (processedKeys.has(rowKey)) {
        skippedCount++;
        continue;
      }
      processedKeys.add(rowKey);

      const existing = existingMap.get(rowKey);
      if (existing) {
        if (
          existing.usage === row.usage &&
          existing.operatingHours === row.operatingHours
        ) {
          skippedCount++;
        } else {
          recordsToUpdate.push({
            id: existing.id,
            usage: row.usage,
            unit: row.unit,
            operatingHours: row.operatingHours,
            importId: importRecord.id,
          });
          updatedCount++;
        }
      } else {
        recordsToCreate.push({
          campusId,
          buildingId,
          roomId,
          resourceType: row.resource,
          usage: row.usage,
          unit: row.unit,
          operatingHours: row.operatingHours,
          recordedDate: new Date(`${row.date}T00:00:00.000Z`),
          importId: importRecord.id,
        });
        insertedCount++;
      }
    }

    // 5. High-performance bulk insert for new records
    if (recordsToCreate.length > 0) {
      // Chunk bulk inserts into batches of 250
      const BATCH_SIZE = 250;
      for (let i = 0; i < recordsToCreate.length; i += BATCH_SIZE) {
        const batch = recordsToCreate.slice(i, i + BATCH_SIZE);
        await prisma.resourceUsage.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }
    }

    // 6. Update existing records
    if (recordsToUpdate.length > 0) {
      for (const item of recordsToUpdate) {
        await prisma.resourceUsage.update({
          where: { id: item.id },
          data: {
            usage: item.usage,
            unit: item.unit,
            operatingHours: item.operatingHours,
            importId: item.importId,
          },
        });
      }
    }

    // 7. Mark import COMPLETED
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
  // Delete resource usages associated with this import batch
  const deletedUsages = await prisma.resourceUsage.deleteMany({
    where: { importId },
  });

  // Delete the import record
  const deletedImport = await prisma.import.delete({
    where: { id: importId },
  });

  return {
    deletedUsagesCount: deletedUsages.count,
    deletedImport,
  };
}
