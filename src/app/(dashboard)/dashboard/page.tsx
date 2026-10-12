import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import WasteScannerPage from '@/app/(dashboard)/scan/page';
import { getDashboardData } from '@/server/services/analyticsService';
import OnboardingEmptyState from '@/components/dashboard/OnboardingEmptyState';
import KpiCards from '@/components/dashboard/KpiCards';
import FilterBar from '@/components/dashboard/FilterBar';
import AnomalySection from '@/components/dashboard/AnomalySection';
import WhatIfSimulator from '@/components/dashboard/WhatIfSimulator';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import Link from 'next/link';
import {
  UploadCloud,
  Calendar,
  Database,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  Download,
  Building,
} from 'lucide-react';
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
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role;

  // For Student login, exclusively render the AI Waste Classifier on the dashboard
  if (userRole === 'STUDENT') {
    return (
      <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading AI Waste Classifier...</div>}>
        <WasteScannerPage />
      </Suspense>
    );
  }

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

  // If no campus data exists, show the polished Onboarding Empty State
  if (!data.hasData) {
    return <OnboardingEmptyState />;
  }

  return (
    <div className="space-y-7 pb-10">
      {/* Top Header & Telemetry Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              SVVV Indore • Real-Time Telemetry Stream
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Campus Sustainability Intelligence
          </h2>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Main Campus (Ujjain Road, Indore)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {data.dateRange.start} → {data.dateRange.end}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              {data.totalRecordsCount.toLocaleString()} normalized observations
            </span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <Link
            href="/data"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition shadow-xs cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Data Explorer</span>
          </Link>

          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Dataset</span>
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

      {/* CHARTS AND GRAPHS MOVED TO TOP SIDE */}
      {/* Dynamic Visualizations: Temporal Trajectory, Expenditure Share, Building Hierarchy & Peak Spikes */}
      <DashboardCharts
        consumptionOverTime={data.charts.consumptionOverTime}
        buildingComparison={data.charts.buildingComparison}
        resourceDistribution={data.charts.resourceDistribution}
        peakDays={data.charts.peakDays}
      />

      {/* Primary KPI & Campus Sustainability Score Section */}
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
    </div>
  );
}
