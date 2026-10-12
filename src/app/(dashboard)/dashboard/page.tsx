import React from 'react';
import { getDashboardData } from '@/server/services/analyticsService';
import OnboardingEmptyState from '@/components/dashboard/OnboardingEmptyState';
import KpiCards from '@/components/dashboard/KpiCards';
import FilterBar from '@/components/dashboard/FilterBar';
import AnomalySection from '@/components/dashboard/AnomalySection';
import WhatIfSimulator from '@/components/dashboard/WhatIfSimulator';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import Link from 'next/link';
import { UploadCloud, Calendar, Database, ShieldCheck } from 'lucide-react';
import { ResourceType } from '@prisma/client';


interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    buildingId?: string;
    roomId?: string;
    resourceType?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  let resourceType: ResourceType | undefined = undefined;
  if (
    resolvedParams.resourceType &&
    Object.values(ResourceType).includes(resolvedParams.resourceType as ResourceType)
  ) {
    resourceType = resolvedParams.resourceType as ResourceType;
  }

  const data = await getDashboardData({
    startDate: resolvedParams.startDate,
    endDate: resolvedParams.endDate,
    buildingId: resolvedParams.buildingId,
    roomId: resolvedParams.roomId,
    resourceType,
  });

  // If no campus data exists, show the polished Onboarding Empty State (Section 6)
  if (!data.hasData) {
    return <OnboardingEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Campus Sustainability Intelligence
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
            <span>SVVV Campus, Indore</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {data.dateRange.start} → {data.dateRange.end}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              {data.totalRecordsCount.toLocaleString()} normalized records
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload More Data</span>
          </Link>
        </div>
      </div>

      {/* Global Interactive Filter Bar */}
      <FilterBar
        buildings={data.filterOptions.buildings}
        rooms={data.filterOptions.rooms}
        dateMin={data.filterOptions.dateMin}
        dateMax={data.filterOptions.dateMax}
        currentFilters={{
          startDate: resolvedParams.startDate,
          endDate: resolvedParams.endDate,
          buildingId: resolvedParams.buildingId,
          roomId: resolvedParams.roomId,
          resourceType,
        }}
      />

      {/* Primary KPI & Sustainability Score Section */}
      <KpiCards
        energy={data.kpis.energy}
        water={data.kpis.water}
        waste={data.kpis.waste}
        cost={data.kpis.cost}
        sustainabilityScore={data.kpis.sustainabilityScore}
        potentialSavingsInr={data.kpis.potentialSavingsInr}
        co2EmissionsKg={data.kpis.co2EmissionsKg}
      />

      {/* Statistical Anomaly Detection & AI Diagnosis */}
      <AnomalySection anomalies={data.anomalies} />

      {/* Interactive 'What If?' Optimization Simulator */}
      <WhatIfSimulator baselineElectricityKwh={data.kpis.energy.value} />

      {/* Dynamic Visualizations: Timeline, Buildings, Expenditure Share */}
      <DashboardCharts
        consumptionOverTime={data.charts.consumptionOverTime}
        buildingComparison={data.charts.buildingComparison}
        resourceDistribution={data.charts.resourceDistribution}
        peakDays={data.charts.peakDays}
      />
    </div>
  );
}
