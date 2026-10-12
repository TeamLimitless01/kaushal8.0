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
  Award,
  ArrowUpRight,
  Leaf,
  Target,
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
  let scoreBadgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
  let scoreStroke = '#94a3b8';
  let scoreGlow = 'border-slate-200 shadow-slate-100';

  if (sustainabilityScore >= 80) {
    scoreTier = 'Gold Standard';
    scoreBadgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    scoreStroke = '#10b981';
    scoreGlow = 'border-emerald-200 shadow-emerald-500/10 shadow-lg';
  } else if (sustainabilityScore >= 65) {
    scoreTier = 'Silver Standard';
    scoreBadgeBg = 'bg-cyan-100 text-cyan-800 border-cyan-300';
    scoreStroke = '#06b6d4';
    scoreGlow = 'border-cyan-200 shadow-cyan-500/10 shadow-lg';
  } else if (sustainabilityScore > 0) {
    scoreTier = 'Bronze Standard';
    scoreBadgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    scoreStroke = '#f59e0b';
    scoreGlow = 'border-amber-200 shadow-amber-500/10 shadow-lg';
  }

  // Circular progress calculation (r = 30 => circumference = 2 * PI * 30 ≈ 188.5)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (sustainabilityScore / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* Executive Command Banner: Sustainability Score & Climate Impact */}
      <div
        className={`p-6 sm:p-7 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 rounded-3xl border ${scoreGlow} relative overflow-hidden backdrop-blur-xs transition-all`}
      >
        {/* Subtle decorative background gradient blob */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Score Gauge & Description */}
          <div className="flex items-center gap-6">
            {/* SVG Circular Radial Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  stroke={scoreStroke}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {sustainabilityScore}
                </span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                  /100
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Campus Sustainability Index
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${scoreBadgeBg}`}
                >
                  <Award className="w-3 h-3" />
                  <span>{scoreTier}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Aggregated composite performance rating across SVVV buildings, computed against normal operating baselines and weighted for active anomaly penalties.
              </p>

              {/* Progress towards 2030 Campus Net-Zero target */}
              <div className="mt-3 flex items-center gap-3">
                <div className="w-48 h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, sustainabilityScore)}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-600" />
                  Net-Zero 2030 Roadmap
                </span>
              </div>
            </div>
          </div>

          {/* Right: Impact Callouts */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200/80">
            {/* Potential Savings */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3.5 min-w-[150px]">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                <span>Potential Savings</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-emerald-900 mt-1">
                ₹{potentialSavingsInr.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-800 font-medium mt-0.5 block">
                via anomaly remediation
              </span>
            </div>

            {/* Carbon Footprint Impact */}
            <div className="bg-slate-900 text-white rounded-2xl px-5 py-3.5 min-w-[150px] shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>CO₂ Impact</span>
                <CloudFog className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xl font-black text-white mt-1">
                {co2EmissionsKg.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-semibold text-slate-400">kg</span>
              </p>
              <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block flex items-center gap-1">
                <Leaf className="w-2.5 h-2.5" />
                SVVV Campus Footprint
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Core Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Energy */}
        <ModernResourceCard
          title="Campus Energy"
          value={`${energy.formattedValue} ${energy.unit}`}
          icon={Zap}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-200/60"
          accentColor="from-emerald-500/10 to-transparent"
          trendPercentage={energy.trendPercentage}
          trendDirection={energy.trendDirection}
          baselineStatus={energy.baselineStatus}
          isPositive={energy.isPositive}
          subtitle="HVAC, Labs, and Lighting Load"
        />

        {/* Card 2: Water */}
        <ModernResourceCard
          title="Water Influx"
          value={`${water.formattedValue} ${water.unit}`}
          icon={Droplets}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50 border-cyan-200/60"
          accentColor="from-cyan-500/10 to-transparent"
          trendPercentage={water.trendPercentage}
          trendDirection={water.trendDirection}
          baselineStatus={water.baselineStatus}
          isPositive={water.isPositive}
          subtitle="Campus Overhead Tanks & Labs"
        />

        {/* Card 3: Waste */}
        <ModernResourceCard
          title="Waste Managed"
          value={`${waste.formattedValue} ${waste.unit}`}
          icon={Trash2}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-200/60"
          accentColor="from-amber-500/10 to-transparent"
          trendPercentage={waste.trendPercentage}
          trendDirection={waste.trendDirection}
          baselineStatus={waste.baselineStatus}
          isPositive={waste.isPositive}
          subtitle="Segregated Dry & Wet Refuse"
        />

        {/* Card 4: Cost */}
        <ModernResourceCard
          title="Total Utility Cost"
          value={cost.formattedValue}
          icon={IndianRupee}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-200/60"
          accentColor="from-purple-500/10 to-transparent"
          trendPercentage={cost.trendPercentage}
          trendDirection={cost.trendDirection}
          baselineStatus={cost.baselineStatus}
          isPositive={cost.isPositive}
          subtitle="Electricity, Municipal & Waste"
        />
      </div>
    </div>
  );
}

function ModernResourceCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  accentColor,
  trendPercentage,
  trendDirection,
  baselineStatus,
  isPositive,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  trendPercentage: number | null;
  trendDirection: 'up' | 'down' | 'neutral';
  baselineStatus: string;
  isPositive: boolean;
  subtitle: string;
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
      {/* Subtle top accent gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl border ${iconBg} ${iconColor} transition-transform group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-black tracking-tight text-slate-900">
          {value}
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trendPercentage !== null ? (
          <div className="flex items-center gap-1.5 font-semibold">
            {trendDirection === 'down' ? (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] ${
                  isPositive ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                {trendPercentage}%
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] ${
                  isPositive ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                +{trendPercentage}%
              </span>
            )}
            <span className="text-slate-600 font-normal text-[11px]">vs prev period</span>
          </div>
        ) : (
          <span className="text-slate-600 text-[11px] font-medium bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {baselineStatus}
          </span>
        )}
      </div>
    </div>
  );
}
