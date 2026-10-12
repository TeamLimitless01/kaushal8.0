import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'templates',
    'EcoCampus-resource-template.csv'
  );

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Template not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="EcoCampus-resource-template.csv"',
    },
  });
}
