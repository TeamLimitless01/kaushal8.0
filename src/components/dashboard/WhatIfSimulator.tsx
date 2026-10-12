'use client';

import React, { useState } from 'react';
import { Sliders, Sparkles, TrendingDown, IndianRupee, CloudFog, Trees } from 'lucide-react';
import { calculateSimulatedSavings } from '@/lib/sustainability/constants';

export default function WhatIfSimulator({
  baselineElectricityKwh,
}: {
  baselineElectricityKwh: number;
}) {
  const [reductionPercent, setReductionPercent] = useState<number>(10);

  // Normalize to monthly equivalent if needed (default baseline or minimum 5000 for realistic campus demo)
  const monthlyKwh = Math.max(12000, Math.round(baselineElectricityKwh));
  const sim = calculateSimulatedSavings(monthlyKwh, reductionPercent);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
            <Sliders className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Optimization Simulator</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                What-If Engine
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate campus-wide load reduction through HVAC schedules, smart sub-meters, and equipment power-down policies.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500">Current Monthly Load:</span>
          <p className="text-sm font-bold text-slate-900">
            {monthlyKwh.toLocaleString('en-IN')} kWh
          </p>
        </div>
      </div>

      {/* Slider Control */}
      <div className="my-6 max-w-xl mx-auto text-center">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>0% (Status Quo)</span>
          <span className="text-base font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            Target Reduction: {reductionPercent}%
          </span>
          <span>30% (Aggressive Eco)</span>
        </div>

        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={reductionPercent}
          onChange={(e) => setReductionPercent(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
        />

        <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
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
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Projected Consumption
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {Math.round(sim.projectedKwh).toLocaleString('en-IN')} kWh
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Down from {monthlyKwh.toLocaleString('en-IN')} kWh
          </p>
        </div>

        {/* Energy Saved */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Estimated Energy Saved
          </p>
          <p className="text-xl font-bold text-emerald-900 mt-1">
            {Math.round(sim.savedKwh).toLocaleString('en-IN')} kWh
          </p>
          <p className="text-[11px] text-emerald-800 mt-1">
            Per month campus reduction
          </p>
        </div>

        {/* Financial Saving */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Financial Cost Saving
          </p>
          <p className="text-xl font-bold text-emerald-900 mt-1">
            ₹{Math.round(sim.financialSavingInr).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-800 mt-1">
            ₹{(Math.round(sim.financialSavingInr) * 12).toLocaleString('en-IN')} / year
          </p>
        </div>

        {/* Carbon Offset Equivalent */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Carbon (CO₂) Reduced
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {Math.round(sim.co2ReductionKg).toLocaleString('en-IN')} kg
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Trees className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>≈ {sim.treesEquivalent} mature trees planted</span>
          </p>
        </div>
      </div>
    </div>
  );
}
