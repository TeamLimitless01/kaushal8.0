export interface SustainabilityConfig {
  electricityRateInr: number; // ₹ per kWh
  waterRateInr: number; // ₹ per Liter
  wasteRateInr: number; // ₹ per kg
  emissionFactorElectricity: number; // kg CO2 / kWh
  emissionFactorWater: number; // kg CO2 / L
  emissionFactorWaste: number; // kg CO2 / kg
}

export const DEFAULT_SUSTAINABILITY_CONFIG: SustainabilityConfig = {
  electricityRateInr: 8.5,
  waterRateInr: 0.05,
  wasteRateInr: 12.0,
  emissionFactorElectricity: 0.82, // Central Electricity Authority (CEA) India baseline
  emissionFactorWater: 0.0003,
  emissionFactorWaste: 0.45,
};

export interface ResourceSummary {
  electricityKwh: number;
  waterLiters: number;
  wasteKg: number;
}

export interface ImpactEstimation {
  estimatedCostInr: number;
  estimatedCo2Kg: number;
  potentialSavingsInr: number;
  potentialCo2SavingsKg: number;
  sustainabilityScore: number;
}

export function calculateEstimatedCost(
  summary: ResourceSummary,
  config: SustainabilityConfig = DEFAULT_SUSTAINABILITY_CONFIG
): number {
  return (
    summary.electricityKwh * config.electricityRateInr +
    summary.waterLiters * config.waterRateInr +
    summary.wasteKg * config.wasteRateInr
  );
}

export function calculateEstimatedCo2(
  summary: ResourceSummary,
  config: SustainabilityConfig = DEFAULT_SUSTAINABILITY_CONFIG
): number {
  return (
    summary.electricityKwh * config.emissionFactorElectricity +
    summary.waterLiters * config.emissionFactorWater +
    summary.wasteKg * config.emissionFactorWaste
  );
}

export function calculateSustainabilityScore(
  totalUsage: ResourceSummary,
  anomalyCount: number,
  totalRecordsCount: number
): number {
  if (totalRecordsCount === 0) return 0;

  // Base score 88 out of 100
  let score = 88;

  // Anomaly penalty: Each high anomaly deducts 2.5 points (capped at 25 points)
  const anomalyPenalty = Math.min(25, anomalyCount * 2.5);
  score -= anomalyPenalty;

  // Average daily intensity deduction if excessive
  if (totalUsage.electricityKwh > 50000) {
    score -= 5;
  }

  // Ensure score stays in realistic [40, 96] range for a functioning campus
  return Math.max(45, Math.min(96, Math.round(score)));
}

export function calculateSimulatedSavings(
  currentMonthlyKwh: number,
  reductionPercent: number,
  config: SustainabilityConfig = DEFAULT_SUSTAINABILITY_CONFIG
) {
  const reductionRatio = Math.max(0, Math.min(0.5, reductionPercent / 100));
  const savedKwh = currentMonthlyKwh * reductionRatio;
  const projectedKwh = Math.max(0, currentMonthlyKwh - savedKwh);
  const financialSavingInr = savedKwh * config.electricityRateInr;
  const co2ReductionKg = savedKwh * config.emissionFactorElectricity;

  // Equivalent metrics
  const treesEquivalent = Math.round(co2ReductionKg / 21.7); // 1 tree absorbs ~21.7kg CO2/year
  const carKmEquivalent = Math.round(co2ReductionKg / 0.192); // ~192g CO2/km average car

  return {
    currentKwh: currentMonthlyKwh,
    reductionPercent,
    savedKwh,
    projectedKwh,
    financialSavingInr,
    co2ReductionKg,
    treesEquivalent,
    carKmEquivalent,
  };
}
