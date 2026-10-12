import { NextRequest, NextResponse } from 'next/server';
import { parseAndValidateCsv } from '@/lib/csv/parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const fileName = file.name || 'uploaded.csv';
    if (!fileName.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a standard CSV file.' },
        { status: 400 }
      );
    }

    // Limit size to 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 15MB limit.' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const result = parseAndValidateCsv(text, fileName);

    return NextResponse.json({
      success: true,
      ...result,
      // For confirm step: return base64 or keep validRows in memory / response
      rawValidRows: result.validRows,
    });
  } catch (err: unknown) {
    console.error('Error in preview route:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to parse CSV file' },
      { status: 500 }
    );
  }
}
