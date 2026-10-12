'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  IndianRupee,
  CloudFog,
  Sparkles,
  X,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Radio,
  Send,
  Building2,
  Wrench,
} from 'lucide-react';
import { AnomalyReport } from '@/lib/anomaly/engine';
import { ResourceType } from '@prisma/client';

export default function AnomalySection({
  anomalies,
}: {
  anomalies: AnomalyReport[];
}) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyReport | null>(null);
  const [ticketDispatched, setTicketDispatched] = useState(false);

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200/90 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                Statistical Anomaly Radar: All Clear
              </h4>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Campus resource consumption across all SVVV facilities is currently within standard ±2σ historical distribution thresholds.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-white text-emerald-800 border border-emerald-200 rounded-xl shadow-xs self-start sm:self-auto">
          ✓ Baseline Synchronized
        </span>
      </div>
    );
  }

  // Highlight top critical anomaly
  const topAnomaly = anomalies[0];

  return (
    <div className="space-y-4">
      {/* Featured Primary Anomaly Alert Card */}
      <div className="bg-gradient-to-br from-red-50/90 via-white to-amber-50/40 border border-red-200/90 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        {/* Subtle red indicator glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md shadow-red-600/20 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  Statistical Anomaly Flagged
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {topAnomaly.date}
                </span>
              </div>

              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {topAnomaly.buildingName} — {topAnomaly.roomName} ({topAnomaly.resourceType.toLowerCase()})
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Consumption spiked <strong className="text-red-700">+{topAnomaly.deviationPercent}%</strong> above normalized historical baseline ({topAnomaly.actualUsage} {topAnomaly.unit} vs expected {topAnomaly.expectedUsage} {topAnomaly.unit}).
              </p>

              {/* Key Quick Metrics Strip */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 font-medium">
                  Expected: <strong>{topAnomaly.expectedUsage} {topAnomaly.unit}</strong>
                </span>
                <span className="bg-red-100/80 border border-red-200 px-2.5 py-1 rounded-xl text-red-800 font-bold">
                  Actual: <strong>{topAnomaly.actualUsage} {topAnomaly.unit}</strong>
                </span>
                <span className="bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-900 font-bold">
                  Excess: +{topAnomaly.excessUsage} {topAnomaly.unit}
                </span>
                <span className="bg-purple-100/80 border border-purple-200 px-2.5 py-1 rounded-xl text-purple-900 font-bold">
                  Excess Cost: ₹{topAnomaly.estimatedExcessCostInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex items-center justify-end">
            <button
              onClick={() => {
                setSelectedAnomaly(topAnomaly);
                setTicketDispatched(false);
              }}
              className="w-full lg:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-red-600/20 hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Investigate & AI Root Cause</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Detected Anomalies Grid */}
      {anomalies.length > 1 && (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-500" />
              <span>Active Secondary Signals ({anomalies.length - 1})</span>
            </h5>
            <span className="text-[11px] text-slate-600 font-medium">
              Click any signal to inspect
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {anomalies.slice(1).map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  setSelectedAnomaly(a);
                  setTicketDispatched(false);
                }}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-amber-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-800 transition">
                    {a.buildingName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {a.roomName} • {a.resourceType.toLowerCase()}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 font-mono">
                    {a.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg block">
                    +{a.deviationPercent}%
                  </span>
                  <span className="text-[10px] text-slate-600 mt-1 block">
                    +₹{a.estimatedExcessCostInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep Investigation Modal / Drawer */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 text-red-700 rounded-2xl">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      {selectedAnomaly.statusLabel}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {selectedAnomaly.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedAnomaly.buildingName} — {selectedAnomaly.roomName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Resource Metric: {selectedAnomaly.resourceType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnomaly(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Variance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-600 uppercase">Expected Baseline</p>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {selectedAnomaly.expectedUsage} {selectedAnomaly.unit}
                </p>
              </div>

              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-[10px] font-bold text-red-700 uppercase">Actual Measured</p>
                <p className="text-base font-black text-red-700 mt-0.5">
                  {selectedAnomaly.actualUsage} {selectedAnomaly.unit}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Deviation Factor</p>
                <p className="text-base font-black text-amber-800 mt-0.5">
                  +{selectedAnomaly.deviationPercent}%
                </p>
              </div>

              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
                <p className="text-[10px] font-bold text-purple-700 uppercase">Excess Cost</p>
                <p className="text-base font-black text-purple-900 mt-0.5">
                  ₹{selectedAnomaly.estimatedExcessCostInr.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* AI Insights & Root Cause Analysis */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Sustainability Intelligence & Diagnosis</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedAnomaly.aiExplanation.summary}
              </p>

              <div>
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Probable Root Causes:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedAnomaly.aiExplanation.possibleCauses.map((cause, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-emerald-200/60">
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Recommended Action:
                </p>
                <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-emerald-200 leading-relaxed">
                  {selectedAnomaly.aiExplanation.recommendedAction}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 pt-1">
                <span>Potential Monthly Remediated Savings:</span>
                <span className="text-sm font-black text-emerald-800">
                  ₹{selectedAnomaly.aiExplanation.potentialMonthlySavingInr.toLocaleString('en-IN')} / month
                </span>
              </div>
            </div>

            {/* Dispatched feedback or action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              {ticketDispatched ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Work Order #SVVV-{selectedAnomaly.id.slice(0, 6)} Dispatched to Facilities</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-600">
                  Facilities ticket will ping the SVVV Engineering team
                </span>
              )}

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  disabled={ticketDispatched}
                  onClick={() => setTicketDispatched(true)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{ticketDispatched ? 'Ticket Logged' : 'Dispatch Maintenance Ticket'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
