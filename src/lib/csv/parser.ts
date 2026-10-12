import Papa from 'papaparse';
import { ResourceType } from '@prisma/client';

export interface ValidResourceRow {
  rowNumber: number;
  date: string; // Canonical YYYY-MM-DD
  building: string;
  room: string;
  resource: ResourceType;
  usage: number;
  unit: string;
  operatingHours: number;
}

export interface CsvValidationError {
  rowNumber: number;
  column: string;
  value: string;
  message: string;
  suggestion?: string;
}

export interface CsvValidationWarning {
  rowNumber: number;
  column: string;
  message: string;
}

export interface CsvParseResult {
  fileName: string;
  totalRows: number;
  validRows: ValidResourceRow[];
  errors: CsvValidationError[];
  warnings: CsvValidationWarning[];
  summary: {
    totalRows: number;
    validCount: number;
    invalidCount: number;
    dateFrom: string | null;
    dateTo: string | null;
    buildingCount: number;
    buildings: string[];
    resourceTypes: string[];
  };
  previewRows: Array<Record<string, unknown>>;
}

/**
 * Normalizes date to canonical YYYY-MM-DD without timezone shifts
 */
export function normalizeDate(rawDateStr: string): string | null {
  if (!rawDateStr || typeof rawDateStr !== 'string') return null;

  const trimmed = rawDateStr.trim();
  if (!trimmed) return null;

  // 1. ISO YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (isValidDate(year, month, day)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
  }

  // 2. DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (isValidDate(year, month, day)) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
  }

  // 3. Fallback to JS Date parser if valid
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    const month = parsed.getUTCMonth() + 1;
    const day = parsed.getUTCDate();
    if (year >= 2000 && year <= 2100) {
      return `${year}-${padZero(month)}-${padZero(day)}`;
    }
  }

  return null;
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function normalizeResourceType(raw: string): { type: ResourceType | null; unitDefault: string } {
  if (!raw) return { type: null, unitDefault: 'kWh' };
  const lower = raw.trim().toLowerCase();

  if (['electricity', 'electric', 'power', 'energy', 'elec'].includes(lower)) {
    return { type: ResourceType.ELECTRICITY, unitDefault: 'kWh' };
  }
  if (['water', 'water_consumption', 'h2o'].includes(lower)) {
    return { type: ResourceType.WATER, unitDefault: 'L' };
  }
  if (['waste', 'solid_waste', 'garbage', 'refuse'].includes(lower)) {
    return { type: ResourceType.WASTE, unitDefault: 'kg' };
  }

  return { type: null, unitDefault: '' };
}

export function parseAndValidateCsv(csvText: string, fileName = 'uploaded.csv'): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase().replace(/[\s_-]+/g, '_'),
  });

  const rawRows = parsed.data;
  const validRows: ValidResourceRow[] = [];
  const errors: CsvValidationError[] = [];
  const warnings: CsvValidationWarning[] = [];
  const seenKeys = new Map<string, number>();

  const buildingsSet = new Set<string>();
  const resourceTypesSet = new Set<string>();
  let minDate: string | null = null;
  let maxDate: string | null = null;

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for header line

    // Resolve column headers flexibly
    const rawDate = row['date'] || row['recorded_date'] || row['timestamp'] || '';
    const rawBuilding = row['building'] || row['block'] || row['building_name'] || '';
    const rawRoom = row['room'] || row['room_no'] || row['room_number'] || 'General';
    const rawResource = row['resource'] || row['resource_type'] || row['type'] || '';
    const rawUsage = row['usage'] || row['consumption'] || row['value'] || row['reading'] || '';
    const rawUnit = row['unit'] || row['measurement_unit'] || '';
    const rawHours = row['operating_hours'] || row['operatinghours'] || row['hours'] || '8';

    let hasRowError = false;

    // 1. Date Validation
    const canonicalDate = normalizeDate(rawDate);
    if (!canonicalDate) {
      errors.push({
        rowNumber,
        column: 'date',
        value: rawDate || '(empty)',
        message: `Invalid date format: "${rawDate || ''}". Expected YYYY-MM-DD or DD-MM-YYYY`,
        suggestion: 'Use canonical YYYY-MM-DD',
      });
      hasRowError = true;
    }

    // 2. Building Validation
    const building = rawBuilding.trim();
    if (!building) {
      errors.push({
        rowNumber,
        column: 'building',
        value: rawBuilding || '(empty)',
        message: 'Building name cannot be empty',
      });
      hasRowError = true;
    }

    // 3. Room Validation
    const room = rawRoom.trim() || 'General';

    // 4. Resource Type Validation
    const { type: resourceType, unitDefault } = normalizeResourceType(rawResource);
    if (!resourceType) {
      errors.push({
        rowNumber,
        column: 'resource',
        value: rawResource || '(empty)',
        message: `Unknown resource: "${rawResource}". Expected electricity, water, or waste`,
        suggestion: 'Must be electricity | water | waste',
      });
      hasRowError = true;
    }

    // 5. Usage Validation
    const usageNum = parseFloat(rawUsage.replace(/,/g, ''));
    if (isNaN(usageNum) || usageNum < 0) {
      errors.push({
        rowNumber,
        column: 'usage',
        value: rawUsage || '(empty)',
        message: `Invalid usage value: "${rawUsage}". Expected a positive numeric value`,
        suggestion: 'Provide numeric consumption',
      });
      hasRowError = true;
    }

    // 6. Unit
    let unit = rawUnit.trim();
    if (!unit && unitDefault) {
      unit = unitDefault;
      warnings.push({
        rowNumber,
        column: 'unit',
        message: `Missing unit; defaulted to standard "${unitDefault}"`,
      });
    }

    // 7. Operating Hours
    let operatingHours = parseFloat(rawHours);
    if (isNaN(operatingHours) || operatingHours < 0 || operatingHours > 24) {
      operatingHours = 8;
      warnings.push({
        rowNumber,
        column: 'operating_hours',
        message: `Invalid operating hours "${rawHours}"; defaulted to 8 hours`,
      });
    }

    if (hasRowError || !canonicalDate || !resourceType) {
      return;
    }

    // Duplicate detection inside same CSV
    const duplicateKey = `${canonicalDate}_${building.toLowerCase()}_${room.toLowerCase()}_${resourceType}`;
    if (seenKeys.has(duplicateKey)) {
      const prevRow = seenKeys.get(duplicateKey);
      warnings.push({
        rowNumber,
        column: 'duplicate',
        message: `Duplicate reading for ${building} ${room} on ${canonicalDate}. Previous at row ${prevRow}. Last reading will take precedence.`,
      });
    }
    seenKeys.set(duplicateKey, rowNumber);

    // Track aggregates
    buildingsSet.add(building);
    resourceTypesSet.add(resourceType);
    if (!minDate || canonicalDate < minDate) minDate = canonicalDate;
    if (!maxDate || canonicalDate > maxDate) maxDate = canonicalDate;

    validRows.push({
      rowNumber,
      date: canonicalDate,
      building,
      room,
      resource: resourceType,
      usage: usageNum,
      unit,
      operatingHours,
    });
  });

  const previewRows = rawRows.slice(0, 50).map((r, i) => ({
    _rowNumber: i + 2,
    date: r['date'] || r['recorded_date'] || '',
    building: r['building'] || r['block'] || '',
    room: r['room'] || '',
    resource: r['resource'] || '',
    usage: r['usage'] || '',
    unit: r['unit'] || '',
    operating_hours: r['operating_hours'] || r['hours'] || '',
  }));

  return {
    fileName,
    totalRows: rawRows.length,
    validRows,
    errors,
    warnings,
    summary: {
      totalRows: rawRows.length,
      validCount: validRows.length,
      invalidCount: rawRows.length - validRows.length,
      dateFrom: minDate,
      dateTo: maxDate,
      buildingCount: buildingsSet.size,
      buildings: Array.from(buildingsSet).sort(),
      resourceTypes: Array.from(resourceTypesSet).sort(),
    },
    previewRows,
  };
}
