import { prisma } from '@/lib/db/prisma';
import { ResourceType, Prisma } from '@prisma/client';
import {
  calculateEstimatedCost,
  calculateEstimatedCo2,
  calculateSustainabilityScore,
  DEFAULT_SUSTAINABILITY_CONFIG,
} from '@/lib/sustainability/constants';
import { detectAnomalies, AnomalyReport, UsageObservation } from '@/lib/anomaly/engine';

export interface DashboardFilterParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  buildingId?: string;
  resourceType?: ResourceType;
  roomId?: string;
}

export interface KpiCardData {
  title: string;
  value: number;
  formattedValue: string;
  unit: string;
  trendPercentage: number | null; // null means 'Baseline developing'
  trendDirection: 'up' | 'down' | 'neutral';
  isPositive: boolean; // whether the direction is good for sustainability
  baselineStatus: string;
}

export interface DailyTrendItem {
  date: string;
  electricity: number;
  water: number;
  waste: number;
  totalEquivalentCost: number;
}

export interface BuildingUsageItem {
  buildingId: string;
  buildingName: string;
  electricity: number;
  water: number;
  waste: number;
  totalCost: number;
}

export interface DashboardData {
  hasData: boolean;
  totalRecordsCount: number;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  kpis: {
    energy: KpiCardData;
    water: KpiCardData;
    waste: KpiCardData;
    cost: KpiCardData;
    sustainabilityScore: number;
    potentialSavingsInr: number;
    co2EmissionsKg: number;
  };
  charts: {
    consumptionOverTime: DailyTrendItem[];
    buildingComparison: BuildingUsageItem[];
    resourceDistribution: Array<{ name: string; value: number; color: string; unit: string }>;
    peakDays: Array<{ date: string; resource: string; usage: number; unit: string; building: string }>;
  };
  anomalies: AnomalyReport[];
  filterOptions: {
    buildings: Array<{ id: string; name: string }>;
    rooms: Array<{ id: string; name: string; buildingId: string }>;
    dateMin: string | null;
    dateMax: string | null;
  };
}

export async function getDashboardData(
  filters: DashboardFilterParams = {}
): Promise<DashboardData> {
  // Check total record count across campus
  const totalCount = await prisma.resourceUsage.count();

  if (totalCount === 0) {
    return {
      hasData: false,
      totalRecordsCount: 0,
      dateRange: { start: null, end: null },
      kpis: {
        energy: emptyKpi('Total Energy', 'kWh'),
        water: emptyKpi('Water Consumption', 'L'),
        waste: emptyKpi('Waste Generated', 'kg'),
        cost: emptyKpi('Estimated Cost', '₹'),
        sustainabilityScore: 0,
        potentialSavingsInr: 0,
        co2EmissionsKg: 0,
      },
      charts: {
        consumptionOverTime: [],
        buildingComparison: [],
        resourceDistribution: [],
        peakDays: [],
      },
      anomalies: [],
      filterOptions: {
        buildings: [],
        rooms: [],
        dateMin: null,
        dateMax: null,
      },
    };
  }

  // Build Prisma where clause
  const where: Prisma.ResourceUsageWhereInput = {};

  if (filters.buildingId) {
    where.buildingId = filters.buildingId;
  }
  if (filters.roomId) {
    where.roomId = filters.roomId;
  }
  if (filters.resourceType) {
    where.resourceType = filters.resourceType;
  }

  if (filters.startDate || filters.endDate) {
    where.recordedDate = {};
    if (filters.startDate) {
      where.recordedDate.gte = new Date(`${filters.startDate}T00:00:00.000Z`);
    }
    if (filters.endDate) {
      where.recordedDate.lte = new Date(`${filters.endDate}T00:00:00.000Z`);
    }
  }

  // Fetch filtered resource usages
  const records = await prisma.resourceUsage.findMany({
    where,
    include: {
      building: { select: { id: true, name: true } },
      room: { select: { id: true, name: true } },
    },
    orderBy: { recordedDate: 'asc' },
  });

  // Fetch filter options (buildings and rooms)
  const allBuildings = await prisma.building.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const allRooms = await prisma.room.findMany({
    select: { id: true, name: true, buildingId: true },
    orderBy: { name: 'asc' },
  });

  // Calculate aggregates
  let totalElectricity = 0;
  let totalWater = 0;
  let totalWaste = 0;

  const dailyMap = new Map<string, { electricity: number; water: number; waste: number }>();
  const buildingMap = new Map<string, { name: string; electricity: number; water: number; waste: number }>();

  const usageObservations: UsageObservation[] = [];

  let minDate = '';
  let maxDate = '';

  for (const r of records) {
    const dateStr = r.recordedDate.toISOString().split('T')[0];
    if (!minDate || dateStr < minDate) minDate = dateStr;
    if (!maxDate || dateStr > maxDate) maxDate = dateStr;

    // Daily buckets
    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, { electricity: 0, water: 0, waste: 0 });
    }
    const dayObj = dailyMap.get(dateStr)!;

    // Building buckets
    if (!buildingMap.has(r.buildingId)) {
      buildingMap.set(r.buildingId, {
        name: r.building.name,
        electricity: 0,
        water: 0,
        waste: 0,
      });
    }
    const bObj = buildingMap.get(r.buildingId)!;

    if (r.resourceType === ResourceType.ELECTRICITY) {
      totalElectricity += r.usage;
      dayObj.electricity += r.usage;
      bObj.electricity += r.usage;
    } else if (r.resourceType === ResourceType.WATER) {
      totalWater += r.usage;
      dayObj.water += r.usage;
      bObj.water += r.usage;
    } else if (r.resourceType === ResourceType.WASTE) {
      totalWaste += r.usage;
      dayObj.waste += r.usage;
      bObj.waste += r.usage;
    }

    usageObservations.push({
      id: r.id,
      buildingName: r.building.name,
      roomName: r.room.name,
      resourceType: r.resourceType,
      usage: r.usage,
      unit: r.unit,
      date: dateStr,
      operatingHours: r.operatingHours,
    });
  }

  // Detect statistical anomalies
  const detectedAnomalies = detectAnomalies(usageObservations);

  // Calculate total excess cost and potential savings from anomalies + optimization
  const anomalyExcessCost = detectedAnomalies.reduce(
    (sum, a) => sum + a.estimatedExcessCostInr,
    0
  );
  const potentialSavingsInr = Math.max(
    anomalyExcessCost,
    Math.round(totalElectricity * 0.12 * DEFAULT_SUSTAINABILITY_CONFIG.electricityRateInr)
  );

  const estimatedCostInr = calculateEstimatedCost({
    electricityKwh: totalElectricity,
    waterLiters: totalWater,
    wasteKg: totalWaste,
  });

  const estimatedCo2Kg = calculateEstimatedCo2({
    electricityKwh: totalElectricity,
    waterLiters: totalWater,
    wasteKg: totalWaste,
  });

  const sustainabilityScore = calculateSustainabilityScore(
    {
      electricityKwh: totalElectricity,
      waterLiters: totalWater,
      wasteKg: totalWaste,
    },
    detectedAnomalies.length,
    records.length
  );

  // Compute period comparison if enough days exist
  const uniqueDays = Array.from(dailyMap.keys()).sort();
  let electricityTrend: number | null = null;
  let waterTrend: number | null = null;
  let wasteTrend: number | null = null;
  let costTrend: number | null = null;

  if (uniqueDays.length >= 14) {
    const half = Math.floor(uniqueDays.length / 2);
    const firstHalfDays = new Set(uniqueDays.slice(0, half));
    const secondHalfDays = new Set(uniqueDays.slice(half));

    let h1Elec = 0, h2Elec = 0;
    let h1Water = 0, h2Water = 0;
    let h1Waste = 0, h2Waste = 0;

    for (const r of records) {
      const d = r.recordedDate.toISOString().split('T')[0];
      if (firstHalfDays.has(d)) {
        if (r.resourceType === ResourceType.ELECTRICITY) h1Elec += r.usage;
        if (r.resourceType === ResourceType.WATER) h1Water += r.usage;
        if (r.resourceType === ResourceType.WASTE) h1Waste += r.usage;
      } else if (secondHalfDays.has(d)) {
        if (r.resourceType === ResourceType.ELECTRICITY) h2Elec += r.usage;
        if (r.resourceType === ResourceType.WATER) h2Water += r.usage;
        if (r.resourceType === ResourceType.WASTE) h2Waste += r.usage;
      }
    }

    if (h1Elec > 0) electricityTrend = parseFloat((((h2Elec - h1Elec) / h1Elec) * 100).toFixed(1));
    if (h1Water > 0) waterTrend = parseFloat((((h2Water - h1Water) / h1Water) * 100).toFixed(1));
    if (h1Waste > 0) wasteTrend = parseFloat((((h2Waste - h1Waste) / h1Waste) * 100).toFixed(1));

    const h1Cost = calculateEstimatedCost({ electricityKwh: h1Elec, waterLiters: h1Water, wasteKg: h1Waste });
    const h2Cost = calculateEstimatedCost({ electricityKwh: h2Elec, waterLiters: h2Water, wasteKg: h2Waste });
    if (h1Cost > 0) costTrend = parseFloat((((h2Cost - h1Cost) / h1Cost) * 100).toFixed(1));
  }

  // Consumption over time chart data
  const consumptionOverTime: DailyTrendItem[] = uniqueDays.map((date) => {
    const d = dailyMap.get(date)!;
    const totalEquivalentCost = calculateEstimatedCost({
      electricityKwh: d.electricity,
      waterLiters: d.water,
      wasteKg: d.waste,
    });
    return {
      date,
      electricity: parseFloat(d.electricity.toFixed(1)),
      water: parseFloat(d.water.toFixed(1)),
      waste: parseFloat(d.waste.toFixed(1)),
      totalEquivalentCost: Math.round(totalEquivalentCost),
    };
  });

  // Building comparison chart data
  const buildingComparison: BuildingUsageItem[] = Array.from(buildingMap.entries()).map(
    ([bId, data]) => ({
      buildingId: bId,
      buildingName: data.name,
      electricity: parseFloat(data.electricity.toFixed(1)),
      water: parseFloat(data.water.toFixed(1)),
      waste: parseFloat(data.waste.toFixed(1)),
      totalCost: Math.round(
        calculateEstimatedCost({
          electricityKwh: data.electricity,
          waterLiters: data.water,
          wasteKg: data.waste,
        })
      ),
    })
  ).sort((a, b) => b.totalCost - a.totalCost);

  // Resource distribution chart data
  const resourceDistribution = [
    {
      name: 'Electricity',
      value: Math.round(totalElectricity * DEFAULT_SUSTAINABILITY_CONFIG.electricityRateInr),
      color: '#10b981', // Emerald
      unit: 'kWh',
    },
    {
      name: 'Water',
      value: Math.round(totalWater * DEFAULT_SUSTAINABILITY_CONFIG.waterRateInr),
      color: '#06b6d4', // Cyan
      unit: 'L',
    },
    {
      name: 'Waste Management',
      value: Math.round(totalWaste * DEFAULT_SUSTAINABILITY_CONFIG.wasteRateInr),
      color: '#f59e0b', // Amber
      unit: 'kg',
    },
  ];

  // Peak usage days
  const peakDays = usageObservations
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 5)
    .map((o) => ({
      date: o.date,
      resource: o.resourceType.toLowerCase(),
      usage: o.usage,
      unit: o.unit,
      building: o.buildingName,
    }));

  return {
    hasData: true,
    totalRecordsCount: records.length,
    dateRange: {
      start: minDate || null,
      end: maxDate || null,
    },
    kpis: {
      energy: formatKpi(
        'Total Energy',
        totalElectricity,
        'kWh',
        electricityTrend,
        electricityTrend !== null && electricityTrend <= 0 // lower energy is positive
      ),
      water: formatKpi(
        'Water Consumption',
        totalWater,
        'L',
        waterTrend,
        waterTrend !== null && waterTrend <= 0
      ),
      waste: formatKpi(
        'Waste Generated',
        totalWaste,
        'kg',
        wasteTrend,
        wasteTrend !== null && wasteTrend <= 0
      ),
      cost: formatKpi(
        'Estimated Cost',
        estimatedCostInr,
        '₹',
        costTrend,
        costTrend !== null && costTrend <= 0
      ),
      sustainabilityScore,
      potentialSavingsInr,
      co2EmissionsKg: Math.round(estimatedCo2Kg),
    },
    charts: {
      consumptionOverTime,
      buildingComparison,
      resourceDistribution,
      peakDays,
    },
    anomalies: detectedAnomalies.slice(0, 8),
    filterOptions: {
      buildings: allBuildings,
      rooms: allRooms,
      dateMin: minDate || null,
      dateMax: maxDate || null,
    },
  };
}

function emptyKpi(title: string, unit: string): KpiCardData {
  return {
    title,
    value: 0,
    formattedValue: '0',
    unit,
    trendPercentage: null,
    trendDirection: 'neutral',
    isPositive: true,
    baselineStatus: 'No data available',
  };
}

function formatKpi(
  title: string,
  val: number,
  unit: string,
  trend: number | null,
  isPositive: boolean
): KpiCardData {
  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (trend !== null) {
    if (trend > 0) direction = 'up';
    else if (trend < 0) direction = 'down';
  }

  let formatted = val.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  if (unit === '₹') {
    formatted = `₹${Math.round(val).toLocaleString('en-IN')}`;
  }

  return {
    title,
    value: val,
    formattedValue: formatted,
    unit,
    trendPercentage: trend !== null ? Math.abs(trend) : null,
    trendDirection: direction,
    isPositive,
    baselineStatus:
      trend === null ? 'Baseline developing' : `${trend > 0 ? '+' : '-'}${Math.abs(trend)}% vs prev period`,
  };
}
