'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingDown,
  IndianRupee,
  CloudFog,
  Trees,
  CheckCircle2,
  ArrowRight,
  Sun,
  Timer,
  PowerOff,
  Cpu,
} from 'lucide-react';
import { calculateSimulatedSavings } from '@/lib/sustainability/constants';

interface PresetScenario {
  label: string;
  percent: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    label: '5% LED & Sensor Tune',
    percent: 5,
    icon: Timer,
    description: 'Occupancy sensors & LED retrofit in hallways',
  },
  {
    label: '10% HVAC Scheduling',
    percent: 10,
    icon: Cpu,
    description: 'Optimized chiller setpoints & timetable off-cycles',
  },
  {
    label: '18% Rooftop Solar Shift',
    percent: 18,
    icon: Sun,
    description: 'Daytime grid substitution via rooftop solar array',
  },
  {
    label: '25% Deep Weekend Powerdown',
    percent: 25,
    icon: PowerOff,
    description: 'Automated idle equipment shutdown over weekends',
  },
];

export default function WhatIfSimulator({
  baselineElectricityKwh,
}: {
  baselineElectricityKwh: number;
}) {
  const [reductionPercent, setReductionPercent] = useState<number>(10);

  // Normalize to monthly equivalent if needed (default baseline or minimum 12,000 for realistic campus demo)
  const monthlyKwh = Math.max(12000, Math.round(baselineElectricityKwh));
  const sim = calculateSimulatedSavings(monthlyKwh, reductionPercent);

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-sm transition-all relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900">
                Interactive 'What-If?' Optimization Engine
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Predictive AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Model university-wide conservation strategies and quantify verified fiscal and carbon offsets.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Current Campus Baseline
          </span>
          <p className="text-sm font-black text-slate-900">
            {monthlyKwh.toLocaleString('en-IN')} kWh / month
          </p>
        </div>
      </div>

      {/* Preset Strategy Quick-Select Pills */}
      <div className="my-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
          Campus Policy Presets:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = reductionPercent === preset.percent;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setReductionPercent(preset.percent)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    -{preset.percent}%
                  </span>
                </div>
                <p className="text-xs font-bold mt-2 leading-tight">{preset.label}</p>
                <p className="text-[10px] text-slate-600 mt-1 line-clamp-1">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider Interactive Control */}
      <div className="my-6 max-w-2xl mx-auto text-center px-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5">
          <span className="text-slate-600">0% (Current Reality)</span>
          <span className="text-sm font-black text-emerald-800 bg-emerald-100/80 px-4 py-1.5 rounded-2xl border border-emerald-300 shadow-xs">
            Simulation Target: {reductionPercent}% Reduction
          </span>
          <span className="text-slate-600">30% (Aggressive Net-Zero)</span>
        </div>

        <div className="relative py-2">
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={reductionPercent}
            onChange={(e) => setReductionPercent(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-600 px-1">
          <span>0%</span>
          <span>5%</span>
          <span>10%</span>
          <span>15%</span>
          <span>20%</span>
          <span>25%</span>
          <span>30%</span>
        </div>
      </div>

      {/* Live Calculated Projections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Projected Load */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Projected Monthly Load
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {Math.round(sim.projectedKwh).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-600">kWh</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Down from {monthlyKwh.toLocaleString('en-IN')} kWh
          </p>
        </div>

        {/* Energy Saved */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-50 transition">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Monthly Energy Conserved
          </span>
          <p className="text-2xl font-black text-emerald-900 mt-1">
            {Math.round(sim.savedKwh).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-semibold text-emerald-800">kWh</span>
          </p>
          <p className="text-[11px] text-emerald-800 mt-1 font-medium">
            Campus-wide load trimmed
          </p>
        </div>

        {/* Financial Saving */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-50 transition">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Estimated Cost Savings
          </span>
          <p className="text-2xl font-black text-emerald-900 mt-1">
            ₹{Math.round(sim.financialSavingInr).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-800 mt-1 font-semibold">
            ₹{(Math.round(sim.financialSavingInr) * 12).toLocaleString('en-IN')} / year projected
          </p>
        </div>

        {/* Carbon Offset Equivalent */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            CO₂ Reduced & Offsets
          </span>
          <p className="text-2xl font-black text-white mt-1">
            {Math.round(sim.co2ReductionKg).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <Trees className="w-3.5 h-3.5 inline text-emerald-400" />
            <span>≈ {sim.treesEquivalent} mature trees planted</span>
          </p>
        </div>
      </div>
    </div>
  );
}
