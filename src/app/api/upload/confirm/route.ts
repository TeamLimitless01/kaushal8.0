import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { processAndStoreImport } from '@/server/services/importService';
import { uploadCsvToCloudinary } from '@/lib/cloudinary/upload';
import { ValidResourceRow } from '@/lib/csv/parser';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    const body = await req.json();
    const { fileName, validRows, totalRows, csvContent } = body as {
      fileName: string;
      validRows: ValidResourceRow[];
      totalRows: number;
      csvContent?: string;
    };

    if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows provided for import' },
        { status: 400 }
      );
    }

    // Upload original file to Cloudinary
    let cloudinaryUrl = '';
    let publicId = '';

    try {
      const buffer = csvContent
        ? Buffer.from(csvContent, 'utf-8')
        : Buffer.from(JSON.stringify(validRows.slice(0, 50)), 'utf-8');

      const uploadRes = await uploadCsvToCloudinary(buffer, fileName);
      cloudinaryUrl = uploadRes.url;
      publicId = uploadRes.publicId;
    } catch (cErr) {
      console.warn('Cloudinary upload warning:', cErr);
    }

    // Execute database transaction with deduplication & normalization
    const result = await processAndStoreImport({
      fileName,
      cloudinaryUrl,
      publicId,
      validRows,
      totalCsvRows: totalRows || validRows.length,
      userId,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: unknown) {
    console.error('Error confirming import:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to import dataset' },
      { status: 500 }
    );
  }
}
