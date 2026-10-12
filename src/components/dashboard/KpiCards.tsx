'use client';

import React from 'react';
import {
  Zap,
  Droplets,
  Trash2,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  CloudFog,
} from 'lucide-react';
import { KpiCardData } from '@/server/services/analyticsService';

interface KpiCardsProps {
  energy: KpiCardData;
  water: KpiCardData;
  waste: KpiCardData;
  cost: KpiCardData;
  sustainabilityScore: number;
  potentialSavingsInr: number;
  co2EmissionsKg: number;
}

export default function KpiCards({
  energy,
  water,
  waste,
  cost,
  sustainabilityScore,
  potentialSavingsInr,
  co2EmissionsKg,
}: KpiCardsProps) {
  // Score badge classification
  let scoreTier = 'Developing';
  let scoreBadgeBg = 'bg-slate-100 text-slate-700';
  let scoreGlow = 'border-slate-200';

  if (sustainabilityScore >= 80) {
    scoreTier = 'Gold Standard';
    scoreBadgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    scoreGlow = 'border-emerald-200 shadow-emerald-500/10 shadow-lg';
  } else if (sustainabilityScore >= 65) {
    scoreTier = 'Silver Standard';
    scoreBadgeBg = 'bg-blue-100 text-blue-800 border-blue-300';
    scoreGlow = 'border-blue-200';
  } else if (sustainabilityScore > 0) {
    scoreTier = 'Bronze Standard';
    scoreBadgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    scoreGlow = 'border-amber-200';
  }

  return (
    <div className="space-y-4">
      {/* Top Banner: Sustainability Score & High-Level Impact */}
      <div className={`p-6 bg-white rounded-2xl border ${scoreGlow} flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden`}>
        <div className="flex items-center gap-5">
          {/* Circular Score Badge */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
            <span className="text-2xl font-black leading-none">{sustainabilityScore}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Campus Sustainability Score
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${scoreBadgeBg}`}>
                {scoreTier}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Derived from resource efficiency indices across SVVV buildings, normalized per operating hour and penalizing detected consumption anomalies.
            </p>
          </div>
        </div>

        {/* Impact Highlights */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              Potential Savings
            </p>
            <p className="text-base font-bold text-emerald-900 flex items-center">
              <span>₹{potentialSavingsInr.toLocaleString('en-IN')}</span>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Total CO₂ Impact
            </p>
            <p className="text-base font-bold text-slate-900 flex items-center gap-1">
              <CloudFog className="w-4 h-4 text-slate-500" />
              <span>{co2EmissionsKg.toLocaleString('en-IN')} kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 4 Core Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Energy */}
        <ResourceCard
          title="Total Energy"
          value={`${energy.formattedValue} ${energy.unit}`}
          icon={Zap}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trendPercentage={energy.trendPercentage}
          trendDirection={energy.trendDirection}
          baselineStatus={energy.baselineStatus}
          isPositive={energy.isPositive}
        />

        {/* Card 2: Water */}
        <ResourceCard
          title="Water Consumption"
          value={`${water.formattedValue} ${water.unit}`}
          icon={Droplets}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
          trendPercentage={water.trendPercentage}
          trendDirection={water.trendDirection}
          baselineStatus={water.baselineStatus}
          isPositive={water.isPositive}
        />

        {/* Card 3: Waste */}
        <ResourceCard
          title="Waste Generated"
          value={`${waste.formattedValue} ${waste.unit}`}
          icon={Trash2}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trendPercentage={waste.trendPercentage}
          trendDirection={waste.trendDirection}
          baselineStatus={waste.baselineStatus}
          isPositive={waste.isPositive}
        />

        {/* Card 4: Cost */}
        <ResourceCard
          title="Estimated Utility Cost"
          value={cost.formattedValue}
          icon={IndianRupee}
          iconColor="text-slate-700"
          iconBg="bg-slate-100"
          trendPercentage={cost.trendPercentage}
          trendDirection={cost.trendDirection}
          baselineStatus={cost.baselineStatus}
          isPositive={cost.isPositive}
        />
      </div>
    </div>
  );
}

function ResourceCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trendPercentage,
  trendDirection,
  baselineStatus,
  isPositive,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  trendPercentage: number | null;
  trendDirection: 'up' | 'down' | 'neutral';
  baselineStatus: string;
  isPositive: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trendPercentage !== null ? (
          <div className="flex items-center gap-1.5 font-medium">
            {trendDirection === 'down' ? (
              <TrendingDown
                className={`w-3.5 h-3.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              />
            ) : (
              <TrendingUp
                className={`w-3.5 h-3.5 ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}
              />
            )}
            <span
              className={
                isPositive ? 'text-emerald-800' : 'text-amber-700'
              }
            >
              {trendDirection === 'up' ? '+' : '-'}
              {trendPercentage}%
            </span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded-md">
            {baselineStatus}
          </span>
        )}
      </div>
    </div>
  );
}
