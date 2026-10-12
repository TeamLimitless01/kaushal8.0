import { ResourceType } from '@prisma/client';
import { DEFAULT_SUSTAINABILITY_CONFIG, SustainabilityConfig } from '../sustainability/constants';

export interface UsageObservation {
  id: string;
  buildingName: string;
  roomName: string;
  resourceType: ResourceType;
  usage: number;
  unit: string;
  date: string; // YYYY-MM-DD
  operatingHours?: number | null;
}

export type AnomalySeverity = 'HIGH' | 'MODERATE' | 'LOW';

export interface AnomalyReport {
  id: string;
  recordId: string;
  buildingName: string;
  roomName: string;
  resourceType: ResourceType;
  date: string;
  actualUsage: number;
  expectedUsage: number;
  deviationPercent: number;
  excessUsage: number;
  unit: string;
  severity: AnomalySeverity;
  statusLabel: string;
  estimatedExcessCostInr: number;
  estimatedExcessCo2Kg: number;
  observationsCount: number;
  aiExplanation: {
    summary: string;
    possibleCauses: string[];
    recommendedAction: string;
    potentialMonthlySavingInr: number;
    potentialMonthlyCo2SavingKg: number;
  };
}

export const MIN_HISTORICAL_OBSERVATIONS = 7;

/**
 * Detects anomalies using robust statistical baselines (mean + standard deviation).
 */
export function detectAnomalies(
  records: UsageObservation[],
  config: SustainabilityConfig = DEFAULT_SUSTAINABILITY_CONFIG
): AnomalyReport[] {
  // Group records by building and resourceType
  const groups = new Map<string, UsageObservation[]>();

  for (const r of records) {
    const key = `${r.buildingName}__${r.resourceType}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  const detectedAnomalies: AnomalyReport[] = [];

  for (const [key, groupRecords] of groups.entries()) {
    // Only compute anomalies if we have at least 7 historical readings
    if (groupRecords.length < MIN_HISTORICAL_OBSERVATIONS) {
      continue;
    }

    // Sort chronologically
    groupRecords.sort((a, b) => a.date.localeCompare(b.date));

    const usages = groupRecords.map((r) => r.usage);
    const sum = usages.reduce((acc, val) => acc + val, 0);
    const mean = sum / usages.length;

    // Calculate sample standard deviation
    const variance =
      usages.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (usages.length - 1);
    const stdDev = Math.sqrt(variance);

    // Dynamic threshold: 1.8 * stdDev or 30% above mean
    const thresholdHigh = mean + Math.max(1.75 * stdDev, mean * 0.35);
    const thresholdModerate = mean + Math.max(1.2 * stdDev, mean * 0.2);

    for (const record of groupRecords) {
      if (record.usage > thresholdModerate) {
        const excess = record.usage - mean;
        const deviationPercent = Math.round(((record.usage - mean) / mean) * 100);
        const isHigh = record.usage >= thresholdHigh;

        // Calculate cost & CO2 impact of excess
        let rate = config.electricityRateInr;
        let emissionFactor = config.emissionFactorElectricity;
        if (record.resourceType === ResourceType.WATER) {
          rate = config.waterRateInr;
          emissionFactor = config.emissionFactorWater;
        } else if (record.resourceType === ResourceType.WASTE) {
          rate = config.wasteRateInr;
          emissionFactor = config.emissionFactorWaste;
        }

        const excessCost = Math.round(excess * rate);
        const excessCo2 = parseFloat((excess * emissionFactor).toFixed(1));

        const ai = generateAiRecommendation(
          record.buildingName,
          record.roomName,
          record.resourceType,
          deviationPercent,
          excess,
          record.unit,
          excessCost,
          excessCo2
        );

        detectedAnomalies.push({
          id: `anomaly-${record.id}`,
          recordId: record.id,
          buildingName: record.buildingName,
          roomName: record.roomName,
          resourceType: record.resourceType,
          date: record.date,
          actualUsage: parseFloat(record.usage.toFixed(1)),
          expectedUsage: parseFloat(mean.toFixed(1)),
          deviationPercent,
          excessUsage: parseFloat(excess.toFixed(1)),
          unit: record.unit,
          severity: isHigh ? 'HIGH' : 'MODERATE',
          statusLabel: isHigh ? 'CRITICAL ANOMALY' : 'MODERATE DEVIATION',
          estimatedExcessCostInr: excessCost,
          estimatedExcessCo2Kg: excessCo2,
          observationsCount: groupRecords.length,
          aiExplanation: ai,
        });
      }
    }
  }

  // Sort highest deviation first
  return detectedAnomalies.sort((a, b) => b.deviationPercent - a.deviationPercent);
}

function generateAiRecommendation(
  building: string,
  room: string,
  resource: ResourceType,
  deviationPercent: number,
  excess: number,
  unit: string,
  excessCost: number,
  excessCo2: number
) {
  let summary = '';
  let possibleCauses: string[] = [];
  let recommendedAction = '';

  const monthlyProjectedCostSaving = excessCost * 22; // ~22 operational days/month
  const monthlyProjectedCo2Saving = parseFloat((excessCo2 * 22).toFixed(1));

  if (resource === ResourceType.ELECTRICITY) {
    summary = `${building} (${room}) recorded electricity consumption ${deviationPercent}% above its historical baseline. Potential excess energy consumed is ${excess.toFixed(1)} ${unit}.`;
    possibleCauses = [
      'HVAC / Central AC units operating outside scheduled college hours',
      'Laboratory equipment, heavy compute clusters or lasers left running overnight',
      'Faulty power capacitor bank or malfunctioning compressor circuit',
      'Lighting and projector equipment in lecture halls left powered after evening shift',
    ];
    recommendedAction = `Review sub-meter loggers and conduct a physical inspection of ${room} between 6:00 PM and 9:00 PM. Implement automated smart power shutoffs for non-critical lab equipment.`;
  } else if (resource === ResourceType.WATER) {
    summary = `${building} experienced an abnormal water surge of ${deviationPercent}% above standard usage (${excess.toFixed(1)} ${unit} excess).`;
    possibleCauses = [
      'Unattended flush valve or continuous overhead tank overflow',
      'Subsurface pipe rupture or hairline fracture along the main supply conduit',
      'Hostel mess kitchen or washroom tap left running overnight',
      'Landscape sprinkler system stuck in manual bypass mode',
    ];
    recommendedAction = `Immediate facilities alert: Dispatch maintenance plumbing crew to inspect storage tanks, booster pumps, and washroom supply valves in ${building}.`;
  } else {
    summary = `${building} generated ${deviationPercent}% more solid waste than the normal operational baseline.`;
    possibleCauses = [
      'End-of-term laboratory clearing or packaging material disposal',
      'Campus festival, seminar, or cafeteria single-use container surge',
      'Unsegregated municipal waste mixed with recyclable material',
    ];
    recommendedAction = `Schedule an on-site waste segregation audit and ensure separate bins for dry packaging versus organic canteen waste are deployed.`;
  }

  return {
    summary,
    possibleCauses,
    recommendedAction,
    potentialMonthlySavingInr: monthlyProjectedCostSaving,
    potentialMonthlyCo2SavingKg: monthlyProjectedCo2Saving,
  };
}
