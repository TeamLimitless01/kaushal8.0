import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'october';

    const fileName =
      type === 'additional'
        ? 'svvv-campus-additional-records.csv'
        : 'svvv-campus-october-dataset.csv';

    const filePath = path.join(process.cwd(), 'public', 'samples', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Sample dataset not found' }, { status: 404 });
    }

    const csvContent = fs.readFileSync(filePath, 'utf-8');

    return NextResponse.json({
      fileName,
      csvContent,
    });
  } catch (err: unknown) {
    console.error('Error reading sample dataset:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load sample dataset' },
      { status: 500 }
    );
  }
}
